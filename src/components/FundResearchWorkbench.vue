<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { EChartsCoreOption } from 'echarts/core'
import EChart from '@/components/EChart.vue'
import { useI18n } from '@/composables/use-i18n'
import transmissionData from '@/data/fund-transmission.json'
import type { FundTransmissionDataset } from '@/types'
import { evaluateFundDivergence } from '@/utils/fund-divergence'
import type { FundResearchItem } from '@/utils/fund-research'
import { normalizeFundHistory, rollingFundCorrelation } from '@/utils/fund-research'

const props = defineProps<{ funds: FundResearchItem[]; initialCodes?: string[]; storageKey: string }>()
const { t, locale } = useI18n()
const transmission = transmissionData as FundTransmissionDataset
const selectedCodes = ref(
  (props.initialCodes?.length ? props.initialCodes : props.funds.slice(0, 3).map((fund) => fund.code))
    .filter((code) => props.funds.some((fund) => fund.code === code))
    .slice(0, 4),
)
const favoriteCodes = ref<string[]>([])
const defaultCodes = () =>
  (props.initialCodes?.length ? props.initialCodes : props.funds.slice(0, 3).map((fund) => fund.code))
    .filter((code) => props.funds.some((fund) => fund.code === code))
    .slice(0, 4)

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(`fund-research:${props.storageKey}`) ?? '{}')
    favoriteCodes.value = Array.isArray(saved.favorites) ? saved.favorites : []
    if (Array.isArray(saved.selection)) {
      const available = saved.selection.filter((code: string) =>
        props.funds.some((fund) => fund.code === code),
      )
      if (available.length) selectedCodes.value = available.slice(0, 4)
    }
  } catch {
    favoriteCodes.value = []
  }
})

watch(
  () => props.funds,
  (funds) => {
    selectedCodes.value = selectedCodes.value.filter((code) =>
      funds.some((fund) => fund.code === code),
    )
    if (!selectedCodes.value.length && funds[0]) selectedCodes.value = [funds[0].code]
  },
)

const selectedFunds = computed(() =>
  selectedCodes.value
    .map((code) => props.funds.find((fund) => fund.code === code))
    .filter((fund): fund is FundResearchItem => Boolean(fund)),
)
const comparisonCandidates = computed(() =>
  props.funds
    .filter((fund) => fund.history.length >= 21)
    .slice()
    .sort(
      (left, right) =>
        Number(favoriteCodes.value.includes(right.code)) -
        Number(favoriteCodes.value.includes(left.code)),
    ),
)
const leftCode = ref(selectedCodes.value[0] ?? '')
const rightCode = ref(selectedCodes.value[1] ?? selectedCodes.value[0] ?? '')
watch(selectedCodes, (codes) => {
  if (!codes.includes(leftCode.value)) leftCode.value = codes[0] ?? ''
  if (!codes.includes(rightCode.value) || rightCode.value === leftCode.value)
    rightCode.value = codes.find((code) => code !== leftCode.value) ?? codes[0] ?? ''
})

const toggleFund = (code: string) => {
  if (selectedCodes.value.includes(code)) {
    if (selectedCodes.value.length > 1)
      selectedCodes.value = selectedCodes.value.filter((item) => item !== code)
    return
  }
  if (selectedCodes.value.length < 4) selectedCodes.value = [...selectedCodes.value, code]
}
const persistView = () =>
  localStorage.setItem(
    `fund-research:${props.storageKey}`,
    JSON.stringify({ selection: selectedCodes.value, favorites: favoriteCodes.value }),
  )
const toggleFavorite = (code: string) => {
  favoriteCodes.value = favoriteCodes.value.includes(code)
    ? favoriteCodes.value.filter((item) => item !== code)
    : [...favoriteCodes.value, code]
  persistView()
}
const resetView = () => {
  selectedCodes.value = defaultCodes()
  favoriteCodes.value = []
  localStorage.removeItem(`fund-research:${props.storageKey}`)
}

const palette = ['#31715d', '#b7791f', '#4361a6', '#9a4d62']
const normalizedOption = computed<EChartsCoreOption>(() => ({
  animation: false,
  color: palette,
  tooltip: { trigger: 'axis' },
  legend: { type: 'scroll', top: 0, textStyle: { color: '#7d817b' } },
  grid: { left: 52, right: 22, top: 48, bottom: 48 },
  xAxis: { type: 'time', axisLabel: { color: '#7d817b' } },
  yAxis: {
    type: 'value',
    name: t('fundResearch.base100'),
    scale: true,
    axisLabel: { color: '#7d817b' },
  },
  dataZoom: [{ type: 'inside' }, { type: 'slider', height: 18, bottom: 8 }],
  series: selectedFunds.value.map((fund) => ({
    name: `${fund.name} · ${fund.code}`,
    type: 'line',
    showSymbol: false,
    connectNulls: false,
    data: normalizeFundHistory(fund.history).map((point) => [point.date, point.value]),
  })),
}))

const leftFund = computed(() => props.funds.find((fund) => fund.code === leftCode.value))
const rightFund = computed(() => props.funds.find((fund) => fund.code === rightCode.value))
const correlationSeries = computed(() =>
  [20, 60, 120].map((window) => ({
    window,
    points:
      leftFund.value && rightFund.value
        ? rollingFundCorrelation(leftFund.value.history, rightFund.value.history, window)
        : [],
  })),
)
const correlationOption = computed<EChartsCoreOption>(() => ({
  animation: false,
  color: palette,
  tooltip: { trigger: 'axis' },
  legend: { top: 0, textStyle: { color: '#7d817b' } },
  grid: { left: 52, right: 22, top: 48, bottom: 48 },
  xAxis: { type: 'time', axisLabel: { color: '#7d817b' } },
  yAxis: { type: 'value', min: -1, max: 1, axisLabel: { color: '#7d817b' } },
  dataZoom: [{ type: 'inside' }, { type: 'slider', height: 18, bottom: 8 }],
  series: correlationSeries.value.map((series) => ({
    name: `${series.window}D`,
    type: 'line',
    showSymbol: false,
    data: series.points.map((point) => [point.date, point.value]),
  })),
}))
const latestCorrelation = (window: number) => {
  const points = correlationSeries.value.find((series) => series.window === window)?.points ?? []
  return points[points.length - 1]?.value ?? null
}
const divergenceReadings = computed(() =>
  selectedFunds.value.map((fund) => ({ fund, reading: evaluateFundDivergence(fund, transmission) })),
)
const formatPct = (value: number | null) =>
  value === null ? '—' : `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
const driverEvidence = (driver: FundTransmissionDataset['markets'][number]['drivers'][number]) =>
  locale.value === 'zh'
    ? driver.text
    : t('fundResearch.driverEvidence', {
        driver: driver.driver,
        move: formatPct(driver.driverMove),
        correlation: driver.correlation.toFixed(2),
        contribution: driver.contribution.toFixed(2),
      })
</script>

<template>
  <section class="research-workbench">
    <header>
      <div>
        <p>{{ t('fundResearch.eyebrow') }}</p>
        <h2>{{ t('fundResearch.title') }}</h2>
        <span>{{ t('fundResearch.intro') }}</span>
      </div>
      <div class="view-actions">
        <strong>{{ t('fundResearch.selected', { count: selectedFunds.length }) }}</strong>
        <button @click="persistView">{{ t('fundResearch.saveView') }}</button>
        <button @click="resetView">{{ t('fundResearch.resetView') }}</button>
      </div>
    </header>

    <div class="fund-picker" role="group" :aria-label="t('fundResearch.choose')">
      <article
        v-for="fund in comparisonCandidates"
        :key="fund.code"
        :class="{ active: selectedCodes.includes(fund.code) }"
      >
        <button
          class="fund-select"
          :disabled="!selectedCodes.includes(fund.code) && selectedCodes.length >= 4"
          @click="toggleFund(fund.code)"
        ><strong>{{ fund.code }}</strong><span>{{ fund.name }}</span></button>
        <button
          class="favorite"
          :aria-label="t('fundResearch.favorite', { name: fund.name })"
          :aria-pressed="favoriteCodes.includes(fund.code)"
          @click="toggleFavorite(fund.code)"
        >{{ favoriteCodes.includes(fund.code) ? '★' : '☆' }}</button>
      </article>
    </div>

    <div class="chart-card">
      <div class="chart-heading">
        <div><strong>{{ t('fundResearch.normalized') }}</strong><span>{{ t('fundResearch.normalizedHint') }}</span></div>
      </div>
      <EChart :option="normalizedOption" :label="t('fundResearch.normalized')" />
    </div>

    <div class="correlation-grid">
      <div class="chart-card">
        <div class="chart-heading">
          <div><strong>{{ t('fundResearch.correlation') }}</strong><span>{{ t('fundResearch.correlationHint') }}</span></div>
          <div class="pair-selectors">
            <select v-model="leftCode" :aria-label="t('fundResearch.assetA')">
              <option v-for="fund in selectedFunds" :key="fund.code" :value="fund.code">{{ fund.code }}</option>
            </select>
            <span>×</span>
            <select v-model="rightCode" :aria-label="t('fundResearch.assetB')">
              <option v-for="fund in selectedFunds" :key="fund.code" :value="fund.code">{{ fund.code }}</option>
            </select>
          </div>
        </div>
        <EChart :option="correlationOption" :label="t('fundResearch.correlation')" />
      </div>
      <aside class="correlation-summary">
        <div v-for="window in [20, 60, 120]" :key="window">
          <span>{{ window }}D ρ</span>
          <strong>{{ latestCorrelation(window)?.toFixed(2) ?? '—' }}</strong>
        </div>
        <p>{{ t('fundResearch.correlationCaution') }}</p>
      </aside>
    </div>

    <div class="research-table-wrap">
      <table>
        <thead><tr><th>{{ t('fundResearch.fund') }}</th><th>{{ t('fundResearch.latest') }}</th><th>{{ t('fundResearch.annualFee') }}</th><th>{{ t('fundResearch.premium') }}</th><th>{{ t('fundResearch.trackingError') }}</th></tr></thead>
        <tbody>
          <tr v-for="fund in selectedFunds" :key="fund.code">
            <td><strong>{{ fund.name }}</strong><small>{{ fund.code }} · {{ fund.group }}</small></td>
            <td class="number"><strong>{{ fund.latestValue?.toFixed(4) ?? '—' }}</strong><small>{{ fund.latestDate ?? '—' }}</small></td>
            <td class="number">{{ formatPct(fund.annualFeePct) }}</td>
            <td class="number">{{ formatPct(fund.premiumRatePct) }}</td>
            <td class="number"><strong>{{ formatPct(fund.trackingErrorPct) }}</strong><small>{{ t('fundResearch.proxy', { code: fund.trackingBenchmark ?? '—' }) }}</small></td>
          </tr>
        </tbody>
      </table>
    </div>

    <section class="divergence-panel">
      <header>
        <div><strong>{{ t('fundResearch.divergence') }}</strong><span>{{ t('fundResearch.divergenceHint') }}</span></div>
        <small>{{ t('fundResearch.transmissionUpdated', { date: transmission.asOfDate ?? '—' }) }}</small>
      </header>
      <div class="divergence-list">
        <details v-for="item in divergenceReadings" :key="item.fund.code">
          <summary>
            <span><strong>{{ item.fund.code }}</strong><small>{{ item.fund.name }}</small></span>
            <span class="signal-status" :class="item.reading.status">{{ t(`fundResearch.divergenceStatus.${item.reading.status}`) }}</span>
            <span class="signal-number"><small>{{ t('fundResearch.fundMove') }}</small><strong>{{ formatPct(item.reading.fundMovePct) }}</strong></span>
            <span class="signal-number"><small>{{ item.reading.marketName }}</small><strong>{{ formatPct(item.reading.marketMovePct) }}</strong></span>
            <span class="signal-number"><small>{{ t('fundResearch.relativeGap') }}</small><strong>{{ formatPct(item.reading.relativeGapPct) }}</strong></span>
            <span>⌄</span>
          </summary>
          <div class="divergence-detail">
            <p>{{ item.reading.reasons.length ? item.reading.reasons.map((reason) => t(`fundResearch.divergenceReason.${reason}`)).join('；') : t('fundResearch.noSignal') }}</p>
            <div v-if="item.reading.drivers.length" class="driver-list">
              <article v-for="driver in item.reading.drivers" :key="`${item.fund.code}-${driver.chain}-${driver.driver}`">
                <strong>{{ driver.chain }}</strong>
                <span :class="driver.effect">{{ driver.effect === 'tailwind' ? '+' : driver.effect === 'headwind' ? '−' : '·' }} {{ driver.contribution.toFixed(2) }}</span>
                <p>{{ driverEvidence(driver) }}</p>
              </article>
            </div>
            <div v-if="item.reading.chains.length" class="related-chains">
              <span v-for="chain in item.reading.chains" :key="chain.title">{{ chain.title }} · ρ {{ chain.signal?.toFixed(2) ?? '—' }}</span>
            </div>
          </div>
        </details>
      </div>
      <p class="divergence-method">{{ t('fundResearch.divergenceMethod') }}</p>
    </section>
    <footer>{{ t('fundResearch.methodology') }}</footer>
  </section>
</template>

<style scoped>
.research-workbench { margin: 28px 0; padding: 24px; border: 1px solid var(--border); border-radius: 12px; background: var(--paper); }
.research-workbench > header, .chart-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
.research-workbench header p { margin: 0 0 7px; color: var(--accent); font-size: 10px; font-weight: 700; letter-spacing: .14em; }
.research-workbench h2 { margin: 0 0 7px; font: 500 clamp(25px,3vw,34px)/1.1 Georgia,'Songti SC',serif; }
.research-workbench header span, .chart-heading span, footer { color: var(--muted); font-size: 12px; }
.fund-picker { display: flex; gap: 8px; margin: 20px 0; padding-bottom: 8px; overflow-x: auto; }
.view-actions { display: flex; align-items: center; gap: 7px; }
.view-actions button { min-height: 34px; border: 1px solid var(--border); border-radius: 7px; background: var(--surface-soft); color: var(--ink); cursor: pointer; }
.fund-picker article { position: relative; flex: 0 0 150px; min-width: 0; border: 1px solid var(--border); border-radius: 8px; background: var(--surface-soft); overflow: hidden; }
.fund-picker article.active { border-color: var(--accent); background: color-mix(in srgb,var(--accent) 12%,var(--paper)); }
.fund-select { width: 100%; min-height: 54px; padding: 9px 32px 9px 11px; border: 0; background: transparent; color: var(--ink); text-align: left; cursor: pointer; }
.fund-select:disabled { opacity: .45; cursor: not-allowed; }
.favorite { position: absolute; top: 7px; right: 7px; border: 0; background: transparent; color: var(--accent); cursor: pointer; font-size: 17px; }
.fund-picker span, td small { display: block; margin-top: 3px; color: var(--muted); font-size: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chart-card { min-width: 0; padding: 16px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface-soft); }
.chart-heading { margin-bottom: 8px; }
.chart-heading div > span { display: block; margin-top: 3px; }
.correlation-grid { display: grid; grid-template-columns: minmax(0,1fr) 150px; gap: 12px; margin-top: 12px; }
.pair-selectors { display: flex; align-items: center; gap: 6px; }
select { min-height: 36px; border: 1px solid var(--border); border-radius: 7px; background: var(--paper); color: var(--ink); }
.correlation-summary { display: grid; gap: 8px; align-content: start; }
.correlation-summary div { padding: 14px; border: 1px solid var(--border); border-radius: 9px; background: var(--surface-soft); }
.correlation-summary span { display: block; color: var(--muted); font-size: 11px; }
.correlation-summary strong { display: block; margin-top: 5px; font: 500 24px/1 Georgia,serif; }
.correlation-summary p { margin: 4px; color: var(--muted); font-size: 11px; }
.research-table-wrap { margin-top: 12px; overflow-x: auto; }
table { width: 100%; min-width: 760px; border-collapse: collapse; }
th,td { padding: 11px; border-bottom: 1px solid var(--border); text-align: left; }
th { color: var(--muted); font-size: 10px; letter-spacing: .06em; text-transform: uppercase; }
.number { font-variant-numeric: tabular-nums; text-align: right; }
footer { margin-top: 12px; }
.divergence-panel { margin-top: 16px; padding: 16px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface-soft); }
.divergence-panel > header { display: flex; justify-content: space-between; gap: 18px; }
.divergence-panel header span { display: block; margin-top: 4px; color: var(--muted); font-size: 11px; }
.divergence-panel header small { color: var(--muted); white-space: nowrap; }
.divergence-list { display: grid; gap: 7px; margin-top: 14px; }
.divergence-list details { border: 1px solid var(--border); border-radius: 8px; background: var(--paper); }
.divergence-list summary { display: grid; grid-template-columns: minmax(140px,1.4fr) auto repeat(3,minmax(82px,.6fr)) auto; align-items: center; gap: 12px; padding: 12px; cursor: pointer; list-style: none; }
.divergence-list summary > span:first-child small,.signal-number small { display: block; margin-top: 3px; color: var(--muted); font-size: 10px; }
.signal-number { text-align: right; font-variant-numeric: tabular-nums; }
.signal-status { padding: 5px 8px; border: 1px solid var(--border); border-radius: 999px; font-size: 10px; font-weight: 700; }
.signal-status.confirming { color: var(--positive); }
.signal-status.diverging { color: var(--negative); }
.signal-status.insufficient { color: var(--muted); }
.divergence-detail { padding: 0 12px 13px; border-top: 1px solid var(--border); }
.divergence-detail > p,.divergence-method { color: var(--muted); font-size: 11px; }
.driver-list { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 8px; }
.driver-list article { padding: 10px; border: 1px solid var(--border); border-radius: 7px; }
.driver-list article > span { float: right; font-variant-numeric: tabular-nums; }
.driver-list article > span.tailwind { color: var(--positive); }
.driver-list article > span.headwind { color: var(--negative); }
.driver-list p { margin: 7px 0 0; color: var(--muted); font-size: 10px; }
.related-chains { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 9px; }
.related-chains span { padding: 4px 7px; border-radius: 6px; background: var(--surface-soft); color: var(--muted); font-size: 10px; }
@media (max-width: 760px) { .research-workbench { padding: 16px; } .research-workbench > header,.chart-heading { align-items: stretch; flex-direction: column; } .view-actions { flex-wrap: wrap; } .correlation-grid { grid-template-columns: 1fr; } .correlation-summary { grid-template-columns: repeat(3,1fr); } .correlation-summary p { grid-column: 1/-1; } }
@media (max-width: 760px) { .divergence-list summary { grid-template-columns: 1fr auto; } .signal-number { text-align: left; } .driver-list { grid-template-columns: 1fr; } .divergence-panel > header { flex-direction: column; } }
</style>
