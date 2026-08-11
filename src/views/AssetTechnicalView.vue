<script setup lang="ts">
import type { EChartsCoreOption } from 'echarts/core'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import DataUpdateStatus from '@/components/DataUpdateStatus.vue'
import EChart from '@/components/EChart.vue'
import { useAuth } from '@/composables/use-auth'
import { useI18n } from '@/composables/use-i18n'
import technicalData from '@/data/asset-technical-signals.json'
import crossAssetData from '@/data/cross-asset.json'
import usStockTechnicalData from '@/data/us-stock-technical-signals.json'
import type {
  AssetTechnicalDataset,
  CrossAssetDataset,
  TechnicalAlertCondition,
  TechnicalAlertEvaluation,
  TechnicalAlertRule,
  TechnicalChartRange,
  TechnicalChartAsset,
  TechnicalIndicatorConfig,
  TechnicalSignalStatus,
} from '@/types'
import { technicalAlertApi } from '@/utils/technical-alert-api'
import { analyzeTechnicalSignals } from '@/utils/technical-analysis'
import { backtestTechnicalSignals } from '@/utils/technical-backtest'
import {
  defaultTechnicalIndicatorConfig,
  technicalConfigApi,
} from '@/utils/technical-config'
import { useTheme } from '@/utils/use-theme'

type RangeId = TechnicalChartRange
type ChartMode = 'line' | 'candle'
type ChainFilter = 'related' | 'strong'

const baseDataset = technicalData as AssetTechnicalDataset
const usStockDataset = usStockTechnicalData as AssetTechnicalDataset
const latestDatasetUpdate = [baseDataset.updatedAt, usStockDataset.updatedAt]
  .filter(Boolean)
  .reduce((latest, value) => (value > latest ? value : latest), baseDataset.updatedAt)
const dataset: AssetTechnicalDataset = {
  ...baseDataset,
  updatedAt: latestDatasetUpdate,
  source: [baseDataset.source, ...(usStockDataset.assets.length ? [usStockDataset.source] : [])].join(
    '；',
  ),
  limitations: [...baseDataset.limitations, ...usStockDataset.limitations],
  assets: [...baseDataset.assets, ...usStockDataset.assets],
}
const crossAsset = crossAssetData as CrossAssetDataset
const { locale, t } = useI18n()
const { theme } = useTheme()
const { can, restore } = useAuth()
const technicalConfig = ref<TechnicalIndicatorConfig>(
  structuredClone(defaultTechnicalIndicatorConfig),
)

const fallbackAsset = dataset.assets[0] as TechnicalChartAsset
const selectedId = ref(dataset.assets.find((asset) => asset.id === 'sp500')?.id ?? fallbackAsset.id)
const compareId = ref('')
const search = ref('')
const range = ref<RangeId>(technicalConfig.value.display.defaultRange)
const chartMode = ref<ChartMode>('line')
const chainFilter = ref<ChainFilter>('related')
const activeChainIndex = ref(0)
const carouselPlaying = ref(technicalConfig.value.display.carouselAutoPlay)
const selectedIndicators = ref(['ma20', 'ma60', 'bollinger'])
const chartRef = ref<InstanceType<typeof EChart> | null>(null)
const chartShell = ref<HTMLElement | null>(null)
const favorites = ref<string[]>([])
const alertRules = ref<TechnicalAlertRule[]>([])
const alertCondition = ref<TechnicalAlertCondition>('priceAbove')
const alertThreshold = ref<number | null>(null)
const alertsLoading = ref(false)
const alertBusyId = ref('')
const alertMessage = ref('')
let carouselTimer: number | null = null

const favoriteStorageKey = 'market-desk-technical-favorites-v1'
const rangeObservations: Record<RangeId, number> = {
  month: 21,
  quarter: 63,
  halfYear: 126,
  year: 252,
  threeYear: 756,
  fiveYear: 1260,
}
const overlayOptions = computed(() => [
  ...(technicalConfig.value.enabled.maShort ? ['ma20'] : []),
  ...(technicalConfig.value.enabled.maLong ? ['ma60'] : []),
  ...(technicalConfig.value.enabled.bollinger ? ['bollinger'] : []),
])

const selectedAsset = computed(
  () => dataset.assets.find((asset) => asset.id === selectedId.value) ?? fallbackAsset,
)
const compareAsset = computed(() => dataset.assets.find((asset) => asset.id === compareId.value))
const categoryOrder = ['stocks', 'bonds', 'fx', 'commodities', 'crypto'] as const
const visibleAssets = computed(() => {
  const query = search.value.trim().toLowerCase()
  return dataset.assets.filter(
    (asset) =>
      !query ||
      asset.name.toLowerCase().includes(query) ||
      asset.series.toLowerCase().includes(query),
  )
})
const groupedAssets = computed(() =>
  categoryOrder
    .map((category) => ({
      category,
      assets: visibleAssets.value.filter((asset) => asset.category === category),
    }))
    .filter((group) => group.assets.length),
)

const relevantChains = computed(() => {
  const related = crossAsset.transmissionChains.filter(
    (chain) => chain.left === selectedId.value || chain.right === selectedId.value,
  )
  const source =
    chainFilter.value === 'related'
      ? related
      : crossAsset.transmissionChains.filter(
          (chain) => chain.strength === 'strong' && chain.status !== 'dormant',
        )
  return source.length ? source : crossAsset.transmissionChains.slice(0, 5)
})
const selectedMarket = computed(() =>
  crossAsset.marketBrief.markets.find((market) => market.id === selectedId.value),
)
const activeChain = computed(
  () => relevantChains.value[activeChainIndex.value % relevantChains.value.length],
)
const marketDrivers = computed(
  () => selectedMarket.value?.drivers ?? [],
)
const resonanceEvaluation = computed(
  () => selectedMarket.value?.outlook.backtest.selectivity.driverAblation ?? null,
)
const crossAssetScore = computed(() => {
  if (!marketDrivers.value.length) return 0
  return Math.max(
    -100,
    Math.min(
      100,
      marketDrivers.value.reduce((sum, driver) => sum + driver.contribution * 35, 0),
    ),
  )
})
const analysis = computed(() =>
  analyzeTechnicalSignals(
    selectedAsset.value?.points ?? [],
    crossAssetScore.value,
    selectedAsset.value?.stale ?? true,
    technicalConfig.value,
  ),
)
const backtest = computed(() =>
  backtestTechnicalSignals(selectedAsset.value?.points ?? [], technicalConfig.value),
)
const currentAssetAlerts = computed(() =>
  alertRules.value.filter((rule) => rule.assetId === selectedAsset.value.id),
)
const displayedPoints = computed(() =>
  (selectedAsset.value?.points ?? []).slice(-rangeObservations[range.value]),
)
const displayedStartIndex = computed(() =>
  Math.max(0, (selectedAsset.value?.points.length ?? 0) - displayedPoints.value.length),
)

const cssColor = (name: string) => {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
const normalizedComparison = computed(() => {
  const asset = compareAsset.value
  if (!asset) return []
  const targetDates = new Set(displayedPoints.value.map((point) => point.date))
  const aligned = asset.points.filter((point) => targetDates.has(point.date))
  const base = aligned[0]?.close
  return base ? aligned.map((point) => [point.date, (point.close / base - 1) * 100]) : []
})

const chartOption = computed<EChartsCoreOption>(() => {
  const points = displayedPoints.value
  const dates = points.map((point) => point.date)
  const offset = displayedStartIndex.value
  const indicatorSlice = <T,>(values: T[]) => values.slice(offset)
  const ink = cssColor('--ink')
  const muted = cssColor('--muted')
  const border = cssColor('--border')
  const surface = cssColor('--surface')
  const positive = cssColor('--positive')
  const negative = cssColor('--negative')
  const accent = cssColor('--accent')
  const warning = cssColor('--warning')
  const series: Array<Record<string, unknown>> = []

  if (chartMode.value === 'candle' && selectedAsset.value?.dataShape === 'ohlcv') {
    series.push({
      name: selectedAsset.value.name,
      type: 'candlestick',
      data: points.map((point) => [point.open, point.close, point.low, point.high]),
      itemStyle: {
        color: positive,
        color0: negative,
        borderColor: positive,
        borderColor0: negative,
      },
    })
  } else {
    series.push({
      name: selectedAsset.value?.name,
      type: 'line',
      data: points.map((point) => point.close),
      showSymbol: false,
      smooth: false,
      lineStyle: { color: accent, width: 2 },
      areaStyle: { color: `${accent}18` },
      markLine: {
        silent: true,
        symbol: ['none', 'none'],
        label: { color: muted, fontSize: 9 },
        data: [
          {
            name: t('assetTechnical.support', {
              period: technicalConfig.value.parameters.supportResistanceWindow,
            }),
            yAxis: analysis.value.support,
            lineStyle: { color: negative, type: 'dashed' },
          },
          {
            name: t('assetTechnical.resistance', {
              period: technicalConfig.value.parameters.supportResistanceWindow,
            }),
            yAxis: analysis.value.resistance,
            lineStyle: { color: positive, type: 'dashed' },
          },
        ],
      },
    })
  }
  if (selectedIndicators.value.includes('ma20'))
    series.push({
      name: `MA${technicalConfig.value.parameters.maShortPeriod}`,
      type: 'line',
      data: indicatorSlice(analysis.value.ma20),
      showSymbol: false,
      lineStyle: { color: warning, width: 1.2 },
    })
  if (selectedIndicators.value.includes('ma60'))
    series.push({
      name: `MA${technicalConfig.value.parameters.maLongPeriod}`,
      type: 'line',
      data: indicatorSlice(analysis.value.ma60),
      showSymbol: false,
      lineStyle: { color: positive, width: 1.2 },
    })
  if (selectedIndicators.value.includes('bollinger')) {
    series.push({
      name: 'Bollinger +2σ',
      type: 'line',
      data: indicatorSlice(analysis.value.bollingerUpper),
      showSymbol: false,
      lineStyle: { color: muted, width: 1, type: 'dotted' },
    })
    series.push({
      name: 'Bollinger −2σ',
      type: 'line',
      data: indicatorSlice(analysis.value.bollingerLower),
      showSymbol: false,
      lineStyle: { color: muted, width: 1, type: 'dotted' },
    })
  }
  if (technicalConfig.value.enabled.rsi) series.push({
    name: `RSI ${technicalConfig.value.parameters.rsiPeriod}`,
    type: 'line',
    xAxisIndex: 1,
    yAxisIndex: 1,
    data: indicatorSlice(analysis.value.rsi14),
    showSymbol: false,
    lineStyle: { color: warning, width: 1.4 },
    markLine: {
      silent: true,
      symbol: ['none', 'none'],
      label: { show: false },
      data: [
        { yAxis: technicalConfig.value.parameters.rsiOverbought },
        { yAxis: technicalConfig.value.parameters.rsiOversold },
      ],
      lineStyle: { color: border, type: 'dashed' },
    },
  })
  if (normalizedComparison.value.length) {
    series.push({
      name: `${compareAsset.value?.name} %`,
      type: 'line',
      xAxisIndex: 0,
      yAxisIndex: 2,
      data: normalizedComparison.value,
      showSymbol: false,
      lineStyle: { color: positive, width: 1.4, type: 'dashed' },
    })
  }

  return {
    darkMode: theme.value === 'dark',
    animation: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    backgroundColor: 'transparent',
    textStyle: { color: ink, fontFamily: 'Inter, sans-serif' },
    legend: {
      top: 0,
      left: 4,
      textStyle: { color: muted, fontSize: 9 },
      itemWidth: 16,
      itemHeight: 7,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: surface,
      borderColor: border,
      textStyle: { color: ink, fontSize: 10 },
    },
    axisPointer: { link: [{ xAxisIndex: 'all' }] },
    grid: [
      { left: 54, right: normalizedComparison.value.length ? 58 : 24, top: 46, height: '61%' },
      { left: 54, right: normalizedComparison.value.length ? 58 : 24, top: '76%', height: '13%' },
    ],
    xAxis: [
      {
        type: 'category',
        data: dates,
        boundaryGap: chartMode.value === 'candle',
        axisLine: { lineStyle: { color: border } },
        axisLabel: { color: muted, fontSize: 9 },
        splitLine: { show: false },
      },
      {
        type: 'category',
        gridIndex: 1,
        data: dates,
        boundaryGap: false,
        axisLine: { lineStyle: { color: border } },
        axisLabel: { color: muted, fontSize: 9 },
        splitLine: { show: false },
      },
    ],
    yAxis: [
      {
        scale: true,
        axisLabel: { color: muted, fontSize: 9 },
        splitLine: { lineStyle: { color: border, opacity: 0.45 } },
      },
      {
        gridIndex: 1,
        min: 0,
        max: 100,
        interval: 50,
        axisLabel: { color: muted, fontSize: 9 },
        splitLine: { lineStyle: { color: border, opacity: 0.35 } },
      },
      {
        type: 'value',
        position: 'right',
        axisLabel: { color: positive, fontSize: 9, formatter: '{value}%' },
        splitLine: { show: false },
      },
    ],
    dataZoom: [
      { type: 'inside', xAxisIndex: [0, 1], filterMode: 'none' },
      {
        type: 'slider',
        xAxisIndex: [0, 1],
        bottom: 2,
        height: 18,
        borderColor: border,
        fillerColor: `${accent}22`,
        textStyle: { color: muted },
      },
    ],
    series,
  }
})

const assetLabel = (asset: TechnicalChartAsset) =>
  locale.value === 'en' ? asset.series : asset.name
const categoryLabel = (category: string) => t(`assetTechnical.category.${category}`)
const statusLabel = (status: TechnicalSignalStatus) => t(`assetTechnical.status.${status}`)
const formatValue = (value: number | null, digits = 2) =>
  value === null
    ? '—'
    : value.toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
        maximumFractionDigits: digits,
      })
const formatSigned = (value: number | null) =>
  value === null ? '—' : `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
const indicatorValue = (id: string, value: number | null) => {
  if (value === null) return '—'
  if (id === 'momentum') return `RSI ${value.toFixed(1)}`
  if (id === 'volatility') return `ATR ${value.toFixed(2)}%`
  if (id === 'crossAsset') return `${value > 0 ? '+' : ''}${value.toFixed(0)}`
  return formatValue(value)
}
const chainAssetName = (id: string) => {
  const asset = dataset.assets.find((item) => item.id === id)
  return asset ? assetLabel(asset) : id.toUpperCase()
}
const selectAsset = (id: string) => {
  selectedId.value = id
  activeChainIndex.value = 0
  if (compareId.value === id) compareId.value = ''
}

const latestFinite = (values: Array<number | null>) => {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index]
    if (typeof value === 'number') return value
  }
  return null
}
const previousFinite = (values: Array<number | null>) => {
  let seen = 0
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index]
    if (typeof value === 'number' && seen++ === 1) return value
  }
  return null
}
const evaluateAlert = (rule: TechnicalAlertRule): TechnicalAlertEvaluation => {
  const latestPrice = analysis.value.latest
  const latestRsi = latestFinite(analysis.value.rsi14)
  const macd = latestFinite(analysis.value.macd)
  const signal = latestFinite(analysis.value.macdSignal)
  const previousMacd = previousFinite(analysis.value.macd)
  const previousSignal = previousFinite(analysis.value.macdSignal)
  let triggered = false
  let currentValue: number | null = null
  if (rule.condition === 'priceAbove') {
    currentValue = latestPrice
    triggered = latestPrice !== null && rule.threshold !== null && latestPrice > rule.threshold
  } else if (rule.condition === 'priceBelow') {
    currentValue = latestPrice
    triggered = latestPrice !== null && rule.threshold !== null && latestPrice < rule.threshold
  } else if (rule.condition === 'rsiAbove') {
    currentValue = latestRsi
    triggered = latestRsi !== null && rule.threshold !== null && latestRsi > rule.threshold
  } else if (rule.condition === 'rsiBelow') {
    currentValue = latestRsi
    triggered = latestRsi !== null && rule.threshold !== null && latestRsi < rule.threshold
  } else {
    currentValue = macd === null || signal === null ? null : macd - signal
    const crossedUp =
      macd !== null &&
      signal !== null &&
      previousMacd !== null &&
      previousSignal !== null &&
      macd > signal &&
      previousMacd <= previousSignal
    const crossedDown =
      macd !== null &&
      signal !== null &&
      previousMacd !== null &&
      previousSignal !== null &&
      macd < signal &&
      previousMacd >= previousSignal
    triggered = rule.condition === 'macdBullishCross' ? crossedUp : crossedDown
  }
  return {
    triggered: rule.enabled && triggered,
    currentValue,
    explanation: t(`assetTechnical.alert.explanation.${rule.condition}`, {
      asset: assetLabel(selectedAsset.value),
      current: formatValue(currentValue),
      threshold: formatValue(rule.threshold),
    }),
  }
}
const defaultAlertThreshold = () => {
  if (alertCondition.value === 'priceAbove') return analysis.value.resistance
  if (alertCondition.value === 'priceBelow') return analysis.value.support
  if (alertCondition.value === 'rsiAbove') return technicalConfig.value.parameters.rsiOverbought
  if (alertCondition.value === 'rsiBelow') return technicalConfig.value.parameters.rsiOversold
  return null
}
const resetAlertThreshold = () => {
  alertThreshold.value = defaultAlertThreshold()
}
const loadAlerts = async () => {
  if (!can('technicalAlerts.manage')) return
  alertsLoading.value = true
  try {
    alertRules.value = await technicalAlertApi.list()
  } catch (error) {
    console.error('Technical alerts could not be loaded:', error)
    alertMessage.value = t('assetTechnical.alert.loadFailed')
  } finally {
    alertsLoading.value = false
  }
}
const loadTechnicalConfig = async () => {
  try {
    technicalConfig.value = await technicalConfigApi.publicConfig()
    range.value = technicalConfig.value.display.defaultRange
    carouselPlaying.value = technicalConfig.value.display.carouselAutoPlay
    selectedIndicators.value = [
      ...(technicalConfig.value.enabled.maShort ? ['ma20'] : []),
      ...(technicalConfig.value.enabled.maLong ? ['ma60'] : []),
      ...(technicalConfig.value.enabled.bollinger ? ['bollinger'] : []),
    ]
    resetAlertThreshold()
    resetCarousel()
  } catch (error) {
    console.warn('Technical configuration could not be loaded; defaults are active:', error)
  }
}
const createAlert = async () => {
  if (!can('technicalAlerts.manage') || alertsLoading.value) return
  alertsLoading.value = true
  alertMessage.value = ''
  try {
    const created = await technicalAlertApi.create({
      assetId: selectedAsset.value.id,
      assetName: selectedAsset.value.name,
      series: selectedAsset.value.series,
      condition: alertCondition.value,
      threshold: alertThreshold.value,
    })
    alertRules.value.unshift(created)
    alertMessage.value = t('assetTechnical.alert.created')
  } catch (error) {
    console.error('Technical alert could not be created:', error)
    alertMessage.value = error instanceof Error ? error.message : t('assetTechnical.alert.saveFailed')
  } finally {
    alertsLoading.value = false
  }
}
const toggleAlert = async (rule: TechnicalAlertRule) => {
  if (!can('technicalAlerts.manage')) return
  alertBusyId.value = rule.id
  try {
    await technicalAlertApi.setEnabled(rule, !rule.enabled)
    rule.enabled = !rule.enabled
  } catch (error) {
    console.error('Technical alert could not be updated:', error)
    alertMessage.value = t('assetTechnical.alert.saveFailed')
  } finally {
    alertBusyId.value = ''
  }
}
const removeAlert = async (rule: TechnicalAlertRule) => {
  if (!can('technicalAlerts.manage')) return
  alertBusyId.value = rule.id
  try {
    await technicalAlertApi.remove(rule)
    alertRules.value = alertRules.value.filter((item) => item.id !== rule.id)
  } catch (error) {
    console.error('Technical alert could not be removed:', error)
    alertMessage.value = t('assetTechnical.alert.saveFailed')
  } finally {
    alertBusyId.value = ''
  }
}
const toggleFavorite = (id: string) => {
  favorites.value = favorites.value.includes(id)
    ? favorites.value.filter((item) => item !== id)
    : [...favorites.value, id]
  localStorage.setItem(favoriteStorageKey, JSON.stringify(favorites.value))
}
const moveChain = (step: number) => {
  const length = relevantChains.value.length
  activeChainIndex.value = (activeChainIndex.value + step + length) % length
}
const resetCarousel = () => {
  if (carouselTimer !== null) window.clearInterval(carouselTimer)
  carouselTimer = null
  if (!carouselPlaying.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return
  carouselTimer = window.setInterval(
    () => moveChain(1),
    technicalConfig.value.display.carouselIntervalMs,
  )
}
const downloadChart = async () => {
  await nextTick()
  const url = chartRef.value?.getDataUrl()
  if (!url) return
  const link = document.createElement('a')
  link.href = url
  link.download = `${selectedId.value}-technical-chart.png`
  link.click()
}
const toggleFullscreen = async () => {
  if (!chartShell.value) return
  if (document.fullscreenElement) await document.exitFullscreen()
  else await chartShell.value.requestFullscreen()
}

watch([carouselPlaying, relevantChains], resetCarousel)
watch(selectedAsset, (asset) => {
  if (chartMode.value === 'candle' && asset.dataShape !== 'ohlcv') chartMode.value = 'line'
  resetAlertThreshold()
})
watch(alertCondition, resetAlertThreshold)
onMounted(() => {
  try {
    const stored = JSON.parse(localStorage.getItem(favoriteStorageKey) ?? '[]')
    favorites.value = Array.isArray(stored) ? stored : []
  } catch {
    favorites.value = []
  }
  void restore().then(loadAlerts)
  void loadTechnicalConfig()
  resetAlertThreshold()
  resetCarousel()
})
onBeforeUnmount(() => {
  if (carouselTimer !== null) window.clearInterval(carouselTimer)
})
</script>

<template>
  <main class="technical-page">
    <header class="page-heading">
      <div>
        <p>{{ t('assetTechnical.badge') }}</p>
        <h1>{{ t('assetTechnical.title') }}</h1>
        <span>{{ t('assetTechnical.intro') }}</span>
        <DataUpdateStatus :updated-at="dataset.updatedAt" schedule="crossAsset" />
      </div>
      <section class="headline-signal" :class="analysis.status">
        <span>{{ t('assetTechnical.currentState') }}</span>
        <strong>{{ statusLabel(analysis.status) }}</strong>
        <b>{{ analysis.score > 0 ? '+' : '' }}{{ analysis.score }}</b>
        <small>{{ t('assetTechnical.confidence', { value: analysis.confidence }) }}</small>
      </section>
    </header>

    <section class="chain-player" aria-live="polite">
      <div class="chain-meta">
        <span>{{ t('assetTechnical.chainPulse') }}</span>
        <div class="chain-filters" role="group" :aria-label="t('assetTechnical.chainFilter')">
          <button :class="{ active: chainFilter === 'related' }" @click="chainFilter = 'related'">
            {{ t('assetTechnical.related') }}
          </button>
          <button :class="{ active: chainFilter === 'strong' }" @click="chainFilter = 'strong'">
            {{ t('assetTechnical.highImpact') }}
          </button>
        </div>
      </div>
      <div v-if="activeChain" class="chain-content">
        <div class="chain-path">
          <i :class="activeChain.status"></i>
          <span v-for="(step, index) in activeChain.steps" :key="step">
            <b>{{ step }}</b
            ><em v-if="index < activeChain.steps.length - 1">→</em>
          </span>
        </div>
        <div class="chain-reading">
          <strong>{{ activeChain.title }}</strong>
          <span>{{ t(`assetTechnical.chainStatus.${activeChain.status}`) }}</span>
          <span>ρ {{ activeChain.signal?.toFixed(2) ?? '—' }}</span>
          <span>{{ t(`assetTechnical.evidence.${activeChain.evidence}`) }}</span>
          <small
            >{{ chainAssetName(activeChain.left) }} → {{ chainAssetName(activeChain.right) }}</small
          >
        </div>
      </div>
      <div class="chain-controls">
        <button :aria-label="t('assetTechnical.previous')" @click="moveChain(-1)">←</button>
        <button @click="carouselPlaying = !carouselPlaying">
          {{ carouselPlaying ? t('assetTechnical.pause') : t('assetTechnical.play') }}
        </button>
        <span>{{ activeChainIndex + 1 }} / {{ relevantChains.length }}</span>
        <button :aria-label="t('assetTechnical.next')" @click="moveChain(1)">→</button>
      </div>
    </section>

    <div class="research-layout">
      <aside class="asset-picker">
        <header>
          <b>{{ t('assetTechnical.assets') }}</b
          ><small>{{ dataset.assets.length }}</small>
        </header>
        <label
          ><span>{{ t('assetTechnical.search') }}</span
          ><input
            v-model="search"
            type="search"
            :placeholder="t('assetTechnical.searchPlaceholder')"
        /></label>
        <div v-if="favorites.length" class="favorite-strip">
          <span>{{ t('assetTechnical.favorites') }}</span>
          <button v-for="id in favorites" :key="id" @click="selectAsset(id)">
            {{ assetLabel(dataset.assets.find((asset) => asset.id === id)!) }}
          </button>
        </div>
        <section v-for="group in groupedAssets" :key="group.category">
          <h2>{{ categoryLabel(group.category) }}</h2>
          <div v-for="asset in group.assets" :key="asset.id" class="asset-row">
            <button
              class="asset-button"
              :class="{ active: selectedId === asset.id }"
              @click="selectAsset(asset.id)"
            >
              <span
                ><b>{{ assetLabel(asset) }}</b
                ><small>{{ asset.series }} · {{ asset.date }}</small></span
              >
            </button>
            <button
              class="favorite-button"
              :class="{ saved: favorites.includes(asset.id) }"
              :aria-label="t('assetTechnical.favorite')"
              @click="toggleFavorite(asset.id)"
            >
              ☆
            </button>
          </div>
        </section>
      </aside>

      <section class="chart-column">
        <div class="chart-toolbar">
          <div class="range-tabs" role="group" :aria-label="t('assetTechnical.range')">
            <button
              v-for="item in [
                'month',
                'quarter',
                'halfYear',
                'year',
                'threeYear',
                'fiveYear',
              ] as RangeId[]"
              :key="item"
              :class="{ active: range === item }"
              @click="range = item"
            >
              {{ t(`assetTechnical.rangeOption.${item}`) }}
            </button>
          </div>
          <div class="chart-actions">
            <select v-model="compareId" :aria-label="t('assetTechnical.compare')">
              <option value="">{{ t('assetTechnical.noCompare') }}</option>
              <option
                v-for="asset in dataset.assets.filter((item) => item.id !== selectedId)"
                :key="asset.id"
                :value="asset.id"
              >
                {{ assetLabel(asset) }}
              </option>
            </select>
            <button :class="{ active: chartMode === 'line' }" @click="chartMode = 'line'">
              {{ t('assetTechnical.line') }}
            </button>
            <button
              :disabled="selectedAsset.dataShape !== 'ohlcv'"
              :class="{ active: chartMode === 'candle' }"
              :title="
                selectedAsset.dataShape !== 'ohlcv' ? t('assetTechnical.ohlcUnavailable') : ''
              "
              @click="chartMode = 'candle'"
            >
              {{ t('assetTechnical.candle') }}
            </button>
            <button @click="toggleFullscreen">{{ t('assetTechnical.fullscreen') }}</button>
            <button @click="downloadChart">PNG</button>
          </div>
        </div>
        <div class="indicator-toggles" role="group" :aria-label="t('assetTechnical.overlays')">
          <label v-for="indicator in overlayOptions" :key="indicator"
            ><input v-model="selectedIndicators" type="checkbox" :value="indicator" />{{
              indicator === 'bollinger'
                ? 'Bollinger'
                : indicator === 'ma20'
                  ? `MA${technicalConfig.parameters.maShortPeriod}`
                  : `MA${technicalConfig.parameters.maLongPeriod}`
            }}</label
          >
        </div>
        <div ref="chartShell" class="chart-shell">
          <header>
            <div>
              <span>{{ assetLabel(selectedAsset) }}</span
              ><strong>{{ formatValue(analysis.latest) }} {{ selectedAsset.unit }}</strong>
            </div>
            <div>
              <small>{{
                t('assetTechnical.support', {
                  period: technicalConfig.parameters.supportResistanceWindow,
                })
              }}</small
              ><b>{{ formatValue(analysis.support) }}</b>
            </div>
            <div>
              <small>{{
                t('assetTechnical.resistance', {
                  period: technicalConfig.parameters.supportResistanceWindow,
                })
              }}</small
              ><b>{{ formatValue(analysis.resistance) }}</b>
            </div>
          </header>
          <EChart
            ref="chartRef"
            :option="chartOption"
            :label="t('assetTechnical.chartLabel', { asset: assetLabel(selectedAsset) })"
          />
        </div>
        <details class="methodology">
          <summary>{{ t('assetTechnical.methodology') }}</summary>
          <p>
            {{
              t('assetTechnical.formulaVersion', {
                formula: technicalConfig.formulaVersion,
                version: technicalConfig.version,
              })
            }}
          </p>
          <p v-for="limitation in dataset.limitations" :key="limitation">{{ limitation }}</p>
          <a :href="dataset.sourceUrl" target="_blank" rel="noopener noreferrer"
            >{{ dataset.source }} ↗</a
          >
        </details>
        <section class="backtest-panel">
          <header>
            <div>
              <span>{{ t('assetTechnical.backtest.eyebrow') }}</span>
              <b>{{ t('assetTechnical.backtest.title') }}</b>
            </div>
            <small>{{
              t('assetTechnical.backtest.holdout', {
                start: backtest.holdoutStartDate ?? '—',
                end: backtest.holdoutEndDate ?? '—',
              })
            }}</small>
          </header>
          <div class="backtest-summary">
            <article>
              <span>{{ t('assetTechnical.backtest.samples') }}</span>
              <strong>{{ backtest.totalSignals }}</strong>
              <small>{{
                t('assetTechnical.backtest.directionSamples', {
                  bullish: backtest.bullishSignals,
                  bearish: backtest.bearishSignals,
                })
              }}</small>
            </article>
            <article v-for="item in backtest.horizons" :key="item.observations">
              <span>{{ t('assetTechnical.backtest.forward', { days: item.observations }) }}</span>
              <strong v-if="item.status !== 'insufficient'">{{
                `${item.winRatePct?.toFixed(1)}%`
              }}</strong>
              <strong v-else>—</strong>
              <small v-if="item.status !== 'insufficient'" class="backtest-confidence">
                <em :class="item.status">{{
                  t(`assetTechnical.backtest.confidence.${item.status}`)
                }}</em>
                {{
                  t('assetTechnical.backtest.confidenceInterval', {
                    low: item.winRateIntervalPct?.low ?? '—',
                    high: item.winRateIntervalPct?.high ?? '—',
                  })
                }}
              </small>
              <small v-if="item.status !== 'insufficient'">{{
                t('assetTechnical.backtest.average', {
                  value: formatSigned(item.averageDirectionalReturnPct),
                })
              }}</small>
              <small v-else>{{
                t('assetTechnical.backtest.insufficient', {
                  count: item.sampleSize,
                  minimum: backtest.minimumSamples,
                })
              }}</small>
            </article>
          </div>
          <div class="backtest-table" role="table" :aria-label="t('assetTechnical.backtest.title')">
            <div class="backtest-row backtest-head" role="row">
              <span>{{ t('assetTechnical.backtest.horizon') }}</span>
              <span>{{ t('assetTechnical.backtest.winRate') }}</span>
              <span>{{ t('assetTechnical.backtest.confidenceRange') }}</span>
              <span>{{ t('assetTechnical.backtest.medianReturn') }}</span>
              <span>{{ t('assetTechnical.backtest.maxAdverse') }}</span>
              <span>{{ t('assetTechnical.backtest.invalidation') }}</span>
            </div>
            <div v-for="item in backtest.horizons" :key="`detail-${item.observations}`" class="backtest-row" role="row">
              <b>{{ t('assetTechnical.backtest.forward', { days: item.observations }) }}</b>
              <span>{{ item.winRatePct === null ? '—' : `${item.winRatePct.toFixed(1)}%` }}</span>
              <span>{{
                item.winRateIntervalPct
                  ? `${item.winRateIntervalPct.low.toFixed(1)}–${item.winRateIntervalPct.high.toFixed(1)}%`
                  : '—'
              }}</span>
              <span>{{ formatSigned(item.medianDirectionalReturnPct) }}</span>
              <span>{{ formatSigned(item.maximumAdverseExcursionPct) }}</span>
              <span>{{
                item.medianInvalidationBars === null
                  ? '—'
                  : t('assetTechnical.backtest.bars', { value: item.medianInvalidationBars })
              }}</span>
            </div>
          </div>
          <section class="resonance-evidence">
            <header>
              <div>
                <span>{{ t('assetTechnical.backtest.resonanceEyebrow') }}</span>
                <b>{{ t('assetTechnical.backtest.resonanceTitle') }}</b>
              </div>
              <em
                :class="{
                  accepted:
                    resonanceEvaluation?.allowed && resonanceEvaluation.selectedUsesCrossAsset,
                  rejected:
                    resonanceEvaluation &&
                    (!resonanceEvaluation.allowed ||
                      !resonanceEvaluation.selectedUsesCrossAsset),
                }"
              >{{
                !resonanceEvaluation
                  ? t('assetTechnical.backtest.unavailable')
                  : resonanceEvaluation.allowed && resonanceEvaluation.selectedUsesCrossAsset
                    ? t('assetTechnical.backtest.accepted')
                    : t('assetTechnical.backtest.rejected')
              }}</em>
            </header>
            <p>{{ t('assetTechnical.backtest.resonanceIntro') }}</p>
            <div v-if="resonanceEvaluation" class="resonance-metrics">
              <div>
                <span>{{ t('assetTechnical.backtest.pairedSamples') }}</span
                ><strong>{{ resonanceEvaluation.samples }}</strong>
              </div>
              <div>
                <span>{{ t('assetTechnical.backtest.withDrivers') }}</span
                ><strong>{{ formatSigned(resonanceEvaluation.fullAccuracyPct) }}</strong>
              </div>
              <div>
                <span>{{ t('assetTechnical.backtest.momentumOnly') }}</span
                ><strong>{{ formatSigned(resonanceEvaluation.momentumOnlyAccuracyPct) }}</strong>
              </div>
              <div>
                <span>{{ t('assetTechnical.backtest.incrementalLift') }}</span
                ><strong>{{ formatSigned(resonanceEvaluation.liftPct) }}</strong>
              </div>
            </div>
            <p v-if="resonanceEvaluation" class="resonance-decision">
              {{
                t(
                  resonanceEvaluation.allowed && resonanceEvaluation.selectedUsesCrossAsset
                    ? 'assetTechnical.backtest.resonanceAcceptedReason'
                    : 'assetTechnical.backtest.resonanceRejectedReason',
                  {
                    p:
                      resonanceEvaluation.pairedAdvantagePValue === null
                        ? '—'
                        : resonanceEvaluation.pairedAdvantagePValue.toFixed(3),
                  },
                )
              }}
            </p>
          </section>
          <details>
            <summary>{{ t('assetTechnical.backtest.methodology') }}</summary>
            <p>{{
              t('assetTechnical.backtest.methodologyText', {
                threshold: backtest.signalThreshold,
                interval: backtest.samplingInterval,
                formula: backtest.formulaVersion,
              })
            }}</p>
            <p>{{ t('assetTechnical.backtest.exclusions') }}</p>
          </details>
        </section>
      </section>

      <aside class="signal-panel">
        <section class="score-breakdown">
          <header>
            <b>{{ t('assetTechnical.signalBreakdown') }}</b
            ><small>{{ t('assetTechnical.notAdvice') }}</small>
          </header>
          <article v-for="indicator in analysis.indicators" :key="indicator.id">
            <div>
              <span>{{ t(`assetTechnical.indicator.${indicator.id}`) }}</span
              ><strong>{{ indicatorValue(indicator.id, indicator.value) }}</strong>
            </div>
            <div class="score-line">
              <i
                :style="{
                  width: `${Math.abs(indicator.score)}%`,
                  marginLeft: indicator.score < 0 ? `${100 - Math.abs(indicator.score)}%` : '0',
                }"
                :class="indicator.score >= 0 ? 'positive' : 'negative'"
              ></i>
            </div>
            <p>
              {{ statusLabel(indicator.status) }} ·
              {{ t(`assetTechnical.change.${indicator.change}`) }}
            </p>
          </article>
        </section>
        <section class="horizon-matrix">
          <header>
            <b>{{ t('assetTechnical.multiHorizon') }}</b
            ><small>{{ t('assetTechnical.closeBased') }}</small>
          </header>
          <div v-for="horizon in analysis.horizons" :key="horizon.id">
            <span>{{ t(`assetTechnical.horizon.${horizon.id}`) }}</span>
            <b :class="horizon.score >= 0 ? 'positive-text' : 'negative-text'">{{
              formatSigned(horizon.returnPct)
            }}</b>
            <em :class="horizon.status">{{ statusLabel(horizon.status) }}</em>
          </div>
        </section>
        <section class="alert-center">
          <header>
            <div>
              <b>{{ t('assetTechnical.alert.title') }}</b>
              <small>{{ t('assetTechnical.alert.hint') }}</small>
            </div>
            <span>{{ currentAssetAlerts.length }}</span>
          </header>
          <form v-if="can('technicalAlerts.manage')" @submit.prevent="createAlert">
            <label>
              <span>{{ t('assetTechnical.alert.condition') }}</span>
              <select v-model="alertCondition">
                <option
                  v-for="condition in [
                    'priceAbove',
                    'priceBelow',
                    'rsiAbove',
                    'rsiBelow',
                    'macdBullishCross',
                    'macdBearishCross',
                  ] as TechnicalAlertCondition[]"
                  :key="condition"
                  :value="condition"
                >
                  {{ t(`assetTechnical.alert.conditionName.${condition}`) }}
                </option>
              </select>
            </label>
            <label v-if="!alertCondition.startsWith('macd')">
              <span>{{ t('assetTechnical.alert.threshold') }}</span>
              <input v-model.number="alertThreshold" type="number" step="any" required />
            </label>
            <button :disabled="alertsLoading" type="submit">
              {{ alertsLoading ? t('assetTechnical.alert.saving') : t('assetTechnical.alert.create') }}
            </button>
          </form>
          <p v-else class="alert-permission">{{ t('assetTechnical.alert.permission') }}</p>
          <p v-if="alertMessage" class="alert-message" role="status">{{ alertMessage }}</p>
          <p v-if="!currentAssetAlerts.length" class="alert-empty">
            {{ t('assetTechnical.alert.empty') }}
          </p>
          <article
            v-for="rule in currentAssetAlerts"
            :key="rule.id"
            class="alert-rule"
            :class="{
              triggered: evaluateAlert(rule).triggered,
              disabled: !rule.enabled,
            }"
          >
            <div>
              <span>
                {{ t(`assetTechnical.alert.conditionName.${rule.condition}`) }}
                <b v-if="rule.threshold !== null">{{ formatValue(rule.threshold) }}</b>
              </span>
              <strong>
                {{
                  evaluateAlert(rule).triggered
                    ? t('assetTechnical.alert.triggered')
                    : t('assetTechnical.alert.watching')
                }}
              </strong>
            </div>
            <p>{{ evaluateAlert(rule).explanation }}</p>
            <footer>
              <small>{{ rule.series }} · {{ rule.updatedAt.slice(0, 10) }}</small>
              <button
                :disabled="alertBusyId === rule.id"
                type="button"
                @click="toggleAlert(rule)"
              >
                {{ rule.enabled ? t('assetTechnical.alert.pause') : t('assetTechnical.alert.enable') }}
              </button>
              <button
                :disabled="alertBusyId === rule.id"
                class="remove-alert"
                type="button"
                @click="removeAlert(rule)"
              >
                {{ t('assetTechnical.alert.remove') }}
              </button>
            </footer>
          </article>
        </section>
        <details class="drivers">
          <summary>
            {{ t('assetTechnical.crossAssetEvidence', { count: marketDrivers.length }) }}
          </summary>
          <p v-if="!marketDrivers.length">{{ t('assetTechnical.noDrivers') }}</p>
          <article v-for="driver in marketDrivers" :key="`${driver.chain}-${driver.driver}`">
            <b>{{ driver.chain }}</b
            ><span :class="driver.effect">{{ t(`assetTechnical.effect.${driver.effect}`) }}</span>
            <p>{{ driver.text }}</p>
          </article>
        </details>
      </aside>
    </div>
    <footer class="page-disclaimer">{{ t('assetTechnical.disclaimer') }}</footer>
  </main>
</template>

<style scoped>
.technical-page {
  max-width: 1380px;
  margin: auto;
  padding: 40px clamp(20px, 3.5vw, 52px) 80px;
}
.page-heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 24px;
  align-items: end;
}
.page-heading > div > p {
  margin: 0 0 8px;
  color: var(--accent);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
}
.page-heading h1 {
  margin: 0;
  font:
    500 clamp(36px, 4vw, 52px) Georgia,
    'Songti SC',
    serif;
  letter-spacing: -0.035em;
}
.page-heading > div > span {
  display: block;
  max-width: 760px;
  margin: 12px 0 16px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.7;
}
.headline-signal {
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px 12px;
}
.headline-signal span,
.headline-signal small {
  color: var(--muted);
  font-size: 9px;
}
.headline-signal strong {
  font:
    500 21px Georgia,
    serif;
}
.headline-signal b {
  grid-row: 1/3;
  grid-column: 2;
  font:
    500 30px Georgia,
    serif;
  align-self: center;
}
.headline-signal[class*='Bullish'] b,
.positive-text {
  color: var(--positive);
}
.headline-signal[class*='Bearish'] b,
.negative-text {
  color: var(--negative);
}
.chain-player {
  margin: 24px 0;
  padding: 16px 18px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px 20px;
}
.chain-meta {
  grid-column: 1/-1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chain-meta > span {
  color: var(--accent);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
}
.chain-filters {
  display: flex;
  gap: 4px;
}
.chain-filters button,
.chain-controls button,
.range-tabs button,
.chart-actions button {
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
  color: var(--muted);
  cursor: pointer;
}
.chain-filters button {
  min-height: 30px;
  padding: 5px 9px;
  font-size: 9px;
}
.chain-filters button.active,
.range-tabs button.active,
.chart-actions button.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}
.chain-content {
  min-width: 0;
}
.chain-path {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 5px;
}
.chain-path > i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--warning);
  flex: 0 0 auto;
}
.chain-path > i.confirming {
  background: var(--positive);
}
.chain-path > i.diverging {
  background: var(--negative);
}
.chain-path > span {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.chain-path b {
  font-size: 12px;
}
.chain-path em {
  color: var(--accent);
  font-style: normal;
}
.chain-reading {
  margin-top: 7px;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.chain-reading strong {
  font-size: 11px;
}
.chain-reading span {
  padding: 3px 6px;
  border-radius: 4px;
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 8px;
}
.chain-reading small {
  color: var(--muted);
  font-size: 8px;
}
.chain-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}
.chain-controls button {
  min-height: 34px;
  padding: 6px 10px;
}
.chain-controls span {
  min-width: 44px;
  text-align: center;
  color: var(--muted);
  font-size: 9px;
}
.research-layout {
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr) 260px;
  gap: 16px;
  align-items: start;
}
.asset-picker,
.signal-panel > section,
.signal-panel > details,
.chart-shell,
.methodology {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}
.asset-picker {
  max-height: 780px;
  overflow-y: auto;
  padding: 14px;
}
.asset-picker > header,
.score-breakdown > header,
.horizon-matrix > header,
.alert-center > header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.asset-picker > header b,
.score-breakdown > header b,
.horizon-matrix > header b,
.alert-center > header b {
  font-size: 12px;
}
.asset-picker > header small,
.score-breakdown > header small,
.horizon-matrix > header small,
.alert-center > header small {
  color: var(--muted);
  font-size: 8px;
}
.asset-picker label {
  display: grid;
  gap: 5px;
  margin: 12px 0;
}
.asset-picker label span {
  color: var(--muted);
  font-size: 8px;
}
.asset-picker input,
.chart-actions select {
  width: 100%;
  min-height: 38px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
  padding: 8px;
}
.asset-picker h2 {
  margin: 16px 0 5px;
  color: var(--muted);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.asset-button {
  width: calc(100% - 34px);
  min-height: 48px;
  padding: 7px 8px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--ink);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  text-align: left;
  cursor: pointer;
}
.asset-button:hover {
  background: var(--surface-soft);
}
.asset-button.active {
  background: var(--accent-soft);
  color: var(--accent);
}
.asset-button span b,
.asset-button span small {
  display: block;
}
.asset-button span b {
  font-size: 10px;
}
.asset-button span small {
  margin-top: 3px;
  color: var(--muted);
  font-size: 7px;
}
.asset-row {
  display: flex;
  align-items: center;
}
.favorite-button {
  width: 32px;
  min-height: 40px;
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
}
.favorite-button.saved {
  color: var(--accent);
}
.favorite-strip {
  padding: 8px;
  border-radius: 7px;
  background: var(--surface-soft);
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
.favorite-strip > span {
  width: 100%;
  color: var(--muted);
  font-size: 8px;
}
.favorite-strip button {
  min-height: 28px;
  border: 0;
  border-radius: 5px;
  background: var(--surface);
  font-size: 8px;
}
.chart-column {
  min-width: 0;
}
.chart-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.range-tabs,
.chart-actions {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.range-tabs button,
.chart-actions button {
  min-height: 36px;
  padding: 6px 9px;
  font-size: 9px;
}
.chart-actions select {
  width: 150px;
  min-height: 36px;
  font-size: 9px;
}
.chart-actions button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.indicator-toggles {
  margin-bottom: 8px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.indicator-toggles label {
  padding: 6px 9px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface-soft);
  font-size: 8px;
  display: flex;
  gap: 5px;
  align-items: center;
}
.chart-shell {
  height: 590px;
  padding: 14px;
}
.chart-shell:fullscreen {
  padding: 24px;
  background: var(--paper);
}
.chart-shell > header {
  height: 48px;
  display: flex;
  gap: 24px;
  align-items: start;
}
.chart-shell > header > div:first-child {
  margin-right: auto;
}
.chart-shell > header span,
.chart-shell > header strong,
.chart-shell > header small,
.chart-shell > header b {
  display: block;
}
.chart-shell > header span,
.chart-shell > header small {
  color: var(--muted);
  font-size: 8px;
}
.chart-shell > header strong {
  margin-top: 3px;
  font:
    500 19px Georgia,
    serif;
}
.chart-shell > header b {
  margin-top: 3px;
  font-size: 11px;
}
.chart-shell :deep(.chart) {
  height: 510px;
}
.methodology {
  margin-top: 10px;
  padding: 0 14px;
}
.methodology summary {
  padding: 12px 0;
  font-size: 10px;
  font-weight: 700;
}
.methodology p {
  color: var(--muted);
  font-size: 9px;
  line-height: 1.6;
}
.methodology a {
  display: inline-block;
  margin-bottom: 12px;
  color: var(--accent);
  font-size: 9px;
}
.backtest-panel {
  margin-top: 10px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}
.backtest-panel > header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: end;
}
.backtest-panel > header div {
  display: grid;
  gap: 4px;
}
.backtest-panel > header span {
  color: var(--accent);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.11em;
}
.backtest-panel > header b {
  font-size: 12px;
}
.backtest-panel > header small,
.backtest-summary small,
.backtest-panel details p {
  color: var(--muted);
  font-size: 8px;
  line-height: 1.55;
}
.backtest-summary {
  margin: 14px 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 7px;
}
.backtest-summary article {
  min-width: 0;
  padding: 10px;
  border-radius: 7px;
  background: var(--surface-soft);
  display: grid;
  gap: 4px;
}
.backtest-summary article > span {
  color: var(--muted);
  font-size: 8px;
}
.backtest-summary strong {
  font: 500 20px Georgia, serif;
}
.backtest-confidence {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.backtest-confidence em {
  padding: 2px 5px;
  border-radius: 99px;
  background: var(--paper);
  color: var(--muted);
  font-size: 7px;
  font-style: normal;
}
.backtest-confidence em.supported {
  color: var(--positive);
}
.backtest-confidence em.contradicted {
  color: var(--negative);
}
.backtest-confidence em.watch {
  color: var(--warning);
}
.backtest-table {
  min-width: 540px;
  border-top: 1px solid var(--border);
  overflow: hidden;
}
.backtest-row {
  min-height: 34px;
  border-bottom: 1px solid var(--border);
  display: grid;
  grid-template-columns: 1.05fr repeat(5, 1fr);
  gap: 8px;
  align-items: center;
  font-size: 8px;
}
.backtest-head {
  color: var(--muted);
}
.backtest-panel details {
  margin-top: 8px;
}
.resonance-evidence {
  margin-top: 14px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-soft);
}
.resonance-evidence > header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.resonance-evidence > header div {
  display: grid;
  gap: 3px;
}
.resonance-evidence > header span {
  color: var(--accent);
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.1em;
}
.resonance-evidence > header b {
  font-size: 10px;
}
.resonance-evidence > header em {
  padding: 4px 7px;
  border-radius: 99px;
  background: var(--paper);
  color: var(--muted);
  font-size: 8px;
  font-style: normal;
}
.resonance-evidence > header em.accepted {
  background: color-mix(in srgb, var(--positive) 12%, var(--paper));
  color: var(--positive);
}
.resonance-evidence > header em.rejected {
  background: color-mix(in srgb, var(--warning) 12%, var(--paper));
  color: var(--warning);
}
.resonance-evidence > p {
  margin: 9px 0;
  color: var(--muted);
  font-size: 8px;
  line-height: 1.55;
}
.resonance-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}
.resonance-metrics > div {
  min-width: 0;
  padding: 8px;
  border-radius: 6px;
  background: var(--surface);
  display: grid;
  gap: 3px;
}
.resonance-metrics span {
  color: var(--muted);
  font-size: 7px;
}
.resonance-metrics strong {
  font-size: 11px;
}
.resonance-evidence > .resonance-decision {
  margin-bottom: 0;
  color: var(--ink);
}
.backtest-panel summary {
  padding: 6px 0;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
}
.signal-panel {
  display: grid;
  gap: 10px;
}
.score-breakdown,
.horizon-matrix,
.alert-center,
.drivers {
  padding: 14px;
}
.score-breakdown article {
  padding: 12px 0;
  border-top: 1px solid var(--border);
}
.score-breakdown article:first-of-type {
  margin-top: 10px;
}
.score-breakdown article > div:first-child {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.score-breakdown article span {
  color: var(--muted);
  font-size: 9px;
}
.score-breakdown article strong {
  font-size: 10px;
}
.score-breakdown article p {
  margin: 5px 0 0;
  color: var(--muted);
  font-size: 8px;
}
.score-line {
  height: 4px;
  margin-top: 7px;
  border-radius: 4px;
  background: var(--surface-soft);
  overflow: hidden;
}
.score-line i {
  display: block;
  height: 100%;
}
.score-line i.positive {
  background: var(--positive);
}
.score-line i.negative {
  background: var(--negative);
}
.horizon-matrix > div {
  padding: 9px 0;
  border-top: 1px solid var(--border);
  display: grid;
  grid-template-columns: 42px 1fr auto;
  gap: 8px;
  align-items: center;
}
.horizon-matrix > div:first-of-type {
  margin-top: 10px;
}
.horizon-matrix span {
  color: var(--muted);
  font-size: 8px;
}
.horizon-matrix b {
  font-size: 10px;
}
.horizon-matrix em {
  padding: 3px 5px;
  border-radius: 4px;
  background: var(--surface-soft);
  font-size: 7px;
  font-style: normal;
}
.alert-center > header > div {
  display: grid;
  gap: 3px;
}
.alert-center > header > span {
  min-width: 24px;
  padding: 4px;
  border-radius: 12px;
  background: var(--surface-soft);
  text-align: center;
  color: var(--muted);
  font-size: 8px;
}
.alert-center form {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  display: grid;
  gap: 8px;
}
.alert-center form label {
  display: grid;
  gap: 4px;
}
.alert-center form label span {
  color: var(--muted);
  font-size: 8px;
}
.alert-center select,
.alert-center input,
.alert-center form button {
  width: 100%;
  min-height: 36px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface-soft);
  padding: 7px 9px;
  color: var(--ink);
  font-size: 9px;
}
.alert-center form button {
  background: var(--ink);
  color: var(--paper);
  cursor: pointer;
}
.alert-center button:disabled {
  opacity: 0.5;
  cursor: wait;
}
.alert-permission,
.alert-message,
.alert-empty {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 8px;
  line-height: 1.5;
}
.alert-message {
  color: var(--accent);
}
.alert-rule {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid var(--border);
  border-left: 3px solid var(--muted);
  border-radius: 7px;
  background: var(--surface-soft);
}
.alert-rule.triggered {
  border-left-color: var(--warning);
}
.alert-rule.disabled {
  opacity: 0.58;
}
.alert-rule > div,
.alert-rule footer {
  display: flex;
  align-items: center;
  gap: 5px;
}
.alert-rule > div {
  justify-content: space-between;
}
.alert-rule > div span,
.alert-rule > div strong,
.alert-rule footer {
  font-size: 8px;
}
.alert-rule > div strong {
  color: var(--muted);
}
.alert-rule.triggered > div strong {
  color: var(--warning);
}
.alert-rule p {
  margin: 7px 0;
  color: var(--muted);
  font-size: 8px;
  line-height: 1.55;
}
.alert-rule footer small {
  margin-right: auto;
  color: var(--muted);
}
.alert-rule footer button {
  min-height: 28px;
  border: 0;
  background: transparent;
  color: var(--accent);
  font-size: 8px;
  cursor: pointer;
}
.alert-rule footer .remove-alert {
  color: var(--negative);
}
.drivers summary {
  font-size: 10px;
  font-weight: 700;
}
.drivers > p,
.drivers article p {
  color: var(--muted);
  font-size: 8px;
  line-height: 1.6;
}
.drivers article {
  padding: 10px 0;
  border-top: 1px solid var(--border);
}
.drivers article b {
  font-size: 9px;
}
.drivers article span {
  float: right;
  font-size: 8px;
}
.drivers article span.tailwind {
  color: var(--positive);
}
.drivers article span.headwind {
  color: var(--negative);
}
.page-disclaimer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 9px;
}
.positive {
  background: var(--positive);
}
.negative {
  background: var(--negative);
}
@media (max-width: 1180px) {
  .research-layout {
    grid-template-columns: 190px minmax(0, 1fr);
  }
  .signal-panel {
    grid-column: 1/-1;
    grid-template-columns: 1fr 1fr 1fr;
  }
  .chart-shell {
    height: 540px;
  }
  .chart-shell :deep(.chart) {
    height: 460px;
  }
}
@media (max-width: 760px) {
  .technical-page {
    padding: 24px 14px 60px;
  }
  .page-heading {
    grid-template-columns: 1fr;
  }
  .headline-signal {
    max-width: none;
  }
  .chain-player {
    grid-template-columns: 1fr;
  }
  .chain-controls {
    justify-content: space-between;
  }
  .research-layout {
    grid-template-columns: 1fr;
  }
  .asset-picker {
    max-height: 280px;
  }
  .asset-picker > section {
    display: inline;
  }
  .asset-picker h2 {
    width: 100%;
  }
  .asset-row {
    display: inline-flex;
    width: 170px;
    margin: 2px;
  }
  .asset-button {
    width: 136px;
  }
  .chart-toolbar {
    display: grid;
  }
  .range-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
  }
  .backtest-panel {
    overflow-x: auto;
  }
  .backtest-panel > header {
    min-width: 540px;
  }
  .backtest-summary {
    min-width: 540px;
  }
  .resonance-evidence {
    min-width: 540px;
  }
  .range-tabs button {
    flex: 0 0 auto;
  }
  .chart-actions select {
    width: 100%;
  }
  .chart-shell {
    height: 480px;
    padding: 10px;
  }
  .chart-shell > header {
    gap: 12px;
  }
  .chart-shell :deep(.chart) {
    height: 400px;
  }
  .signal-panel {
    grid-column: auto;
    grid-template-columns: 1fr;
  }
  .chain-path {
    align-items: flex-start;
  }
  .chain-content {
    overflow: hidden;
  }
}
</style>
