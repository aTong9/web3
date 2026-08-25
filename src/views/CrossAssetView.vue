<script setup lang="ts">
import { computed, ref } from 'vue'
import DataUpdateStatus from '@/components/DataUpdateStatus.vue'
import EChart from '@/components/EChart.vue'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import crossAssetData from '@/data/cross-asset.json'
import marketNewsData from '@/data/market-news.json'
import type {
  CrossAssetCategory,
  CrossAssetDataset,
  CrossAssetItem,
  MarketNewsDataset,
} from '@/types'
import { useTheme } from '@/utils/use-theme'
import { useI18n } from '@/composables/use-i18n'

const dataset = crossAssetData as CrossAssetDataset
const newsDataset = marketNewsData as MarketNewsDataset
const activeCategory = ref<'all' | CrossAssetCategory>('all')
const chainStatus = ref<'all' | 'confirming' | 'diverging' | 'dormant' | 'context' | 'unavailable'>(
  'all',
)
const selectedBriefId = ref(dataset.marketBrief.markets[0]?.id ?? 'sp500')
const { theme } = useTheme()
const { t } = useI18n()
const chartPalette = computed(() =>
  theme.value === 'dark'
    ? {
        text: '#c7d0d7',
        split: '#303841',
        neutral: '#20262d',
        positive: '#ed9385',
        negative: '#69c49e',
      }
    : {
        text: '#4f554f',
        split: '#e5e5df',
        neutral: '#f5f1e9',
        positive: '#b45043',
        negative: '#28765d',
      },
)

const categoryNames: Record<CrossAssetCategory, string> = {
  stocks: t('crossAsset.category.stocks'),
  bonds: t('crossAsset.category.bonds'),
  fx: t('crossAsset.category.fx'),
  commodities: t('crossAsset.category.commodities'),
  crypto: t('crossAsset.category.crypto'),
  macro: t('crossAsset.category.macro'),
}
const periods = [
  ['day', t('crossAsset.periodLabel.day')],
  ['week', t('crossAsset.periodLabel.week')],
  ['month', t('crossAsset.periodLabel.month')],
  ['quarter', t('crossAsset.periodLabel.quarter')],
  ['halfYear', t('crossAsset.periodLabel.halfYear')],
  ['yearToDate', t('crossAsset.periodLabel.yearToDate')],
  ['year', t('crossAsset.periodLabel.year')],
] as const

const visibleAssets = computed(() =>
  dataset.assets.filter(
    (asset) => activeCategory.value === 'all' || asset.category === activeCategory.value,
  ),
)
const visibleChains = computed(() =>
  dataset.transmissionChains.filter(
    (chain) => chainStatus.value === 'all' || chain.status === chainStatus.value,
  ),
)
const selectedBrief = computed(
  () =>
    dataset.marketBrief.markets.find((market) => market.id === selectedBriefId.value) ??
    dataset.marketBrief.markets[0],
)
const newsAssetMap: Record<string, string[]> = {
  sp500: ['美股'],
  nasdaq: ['美股'],
  shanghai: ['A股'],
  hangseng: ['港股', 'A股'],
  euro50: ['美股', '债券', '美元'],
  nikkei: ['美股', '债券', '美元'],
  wti: ['原油'],
  gold: ['黄金', '美元', '债券'],
  btc: ['加密', '美元'],
  eth: ['加密', '美元'],
}
const newsCategoryMap: Record<string, string[]> = {
  sp500: ['equities', 'technology', 'macro'],
  nasdaq: ['equities', 'technology', 'macro'],
  shanghai: ['equities', 'macro'],
  hangseng: ['equities', 'macro'],
  euro50: ['equities', 'macro', 'geopolitics'],
  nikkei: ['equities', 'macro', 'geopolitics'],
  wti: ['commodities', 'geopolitics'],
  gold: ['commodities', 'macro', 'geopolitics'],
  btc: ['macro', 'technology'],
  eth: ['macro', 'technology'],
}
const selectedCatalysts = computed(() => {
  const targets = newsAssetMap[selectedBrief.value?.id ?? ''] ?? []
  const categories = newsCategoryMap[selectedBrief.value?.id ?? ''] ?? []
  const referenceTime = Date.parse(newsDataset.updatedAt)
  const impactWeights = { critical: 40, high: 30, medium: 15, low: 0 } as const
  return newsDataset.articles
    .map((article) => {
      const directAssets = article.affectedAssets.filter((asset) => targets.includes(asset))
      const primaryAssetMatch = targets[0] ? article.affectedAssets.includes(targets[0]) : false
      const categoryMatch = categories.includes(article.category)
      const searchableTitle = `${article.title} ${article.translatedTitle ?? ''}`.toLowerCase()
      const marketKeywordMatch =
        /(inflation|interest rate|yield|oil|opec|sanction|war|tariff|payroll|jobs|gdp|bitcoin|crypto|ethereum|\bgold\b|通胀|利率|收益率|原油|石油|欧佩克|制裁|战争|关税|就业|非农|比特币|加密|以太坊|黄金)/i.test(
          searchableTitle,
        )
      const ageHours = Math.max(0, (referenceTime - Date.parse(article.publishedAt)) / 3_600_000)
      const recencyScore = ageHours <= 6 ? 20 : ageHours <= 24 ? 10 : ageHours <= 72 ? 5 : 0
      const matchScore =
        impactWeights[article.impact] +
        (primaryAssetMatch ? 60 : directAssets.length ? 20 : 0) +
        (categoryMatch ? 15 : 0) +
        (marketKeywordMatch ? 20 : 0) +
        (article.sourceType === 'official' ? 5 : 0) +
        recencyScore -
        (!primaryAssetMatch && !marketKeywordMatch ? 30 : 0) -
        (article.sourceType === 'official' && !primaryAssetMatch && !marketKeywordMatch ? 15 : 0)
      return {
        ...article,
        matchScore,
        ageHours,
        matchReason: primaryAssetMatch
          ? t('crossAsset.matchReason.direct', { market: translateAssetName(targets[0] ?? t('crossAsset.noMarket')) })
          : directAssets.length
            ? t('crossAsset.matchReason.related', {
                markets: directAssets.map((market) => translateAssetName(market)).join('、'),
              })
            : categoryMatch
              ? t('crossAsset.matchReason.category', { category: categoryLabel(article.category) })
              : t('crossAsset.matchReason.critical'),
      }
    })
    .filter(
      (article) =>
        article.impact !== 'low' &&
        article.matchScore >= 40 &&
        (article.affectedAssets.some((asset) => targets.includes(asset)) ||
          categories.includes(article.category) ||
          article.impact === 'critical'),
    )
    .sort(
      (left, right) =>
        right.matchScore - left.matchScore ||
        Date.parse(right.publishedAt) - Date.parse(left.publishedAt),
    )
    .slice(0, 3)
})
const biasNames = {
  bullish: t('crossAsset.confidence.bullish'),
  bearish: t('crossAsset.confidence.bearish'),
  neutral: t('crossAsset.confidence.neutral'),
} as const
const confidenceNames = {
  low: t('crossAsset.confidenceName.low'),
  medium: t('crossAsset.confidenceName.medium'),
} as const
const formatNewsAge = (hours: number) =>
  hours < 1
  ? t('crossAsset.hourAgo')
  : hours < 24
      ? `${Math.round(hours)}${t('crossAsset.hourAgo')}`
      : `${Math.round(hours / 24)}${t('crossAsset.dayAgo')}`
const translateAssetName = (value: string) => {
  const map: Record<string, string> = {
    美股: t('crossAsset.tagLabels.us'),
    A股: t('crossAsset.tagLabels.aShare'),
    港股: t('crossAsset.tagLabels.hk'),
    债券: t('crossAsset.tagLabels.bond'),
    美元: t('crossAsset.tagLabels.usd'),
    原油: t('crossAsset.tagLabels.oil'),
    黄金: t('crossAsset.tagLabels.gold'),
    加密: t('crossAsset.tagLabels.crypto'),
  }
  return map[value] ?? value
}
const chainStatusNames = {
  confirming: t('crossAsset.chainStatus.confirming'),
  diverging: t('crossAsset.chainStatus.diverging'),
  context: t('crossAsset.chainStatus.context'),
  dormant: t('crossAsset.chainStatus.dormant'),
  unavailable: t('crossAsset.chainStatus.unavailable'),
} as const
const stabilityNames = {
  stable: t('crossAsset.stability.stable'),
  mixed: t('crossAsset.stability.mixed'),
  insufficient: t('crossAsset.stability.insufficient'),
} as const
const evidenceNames = {
  strong: t('crossAsset.evidence.strong'),
  supported: t('crossAsset.evidence.supported'),
  uncertain: t('crossAsset.evidence.uncertain'),
} as const
const categoryLabel = (value: 'macro' | 'geopolitics' | 'equities' | 'commodities' | 'technology') =>
  value === 'macro'
    ? t('marketNews.categories.macro')
    : value === 'geopolitics'
      ? t('marketNews.categories.geopolitics')
      : value === 'equities'
        ? t('marketNews.categories.equities')
        : value === 'commodities'
          ? t('marketNews.categories.commodities')
          : t('marketNews.categories.technology')
const assetById = (id: string) => dataset.assets.find((asset) => asset.id === id)
const curveSpread = computed(() => {
  const two = assetById('us2y')?.value
  const ten = assetById('us10y')?.value
  return two == null || ten == null ? null : Math.round((ten - two) * 100)
})

const formatValue = (asset: CrossAssetItem) => {
  if (asset.value === null) return '—'
  const maximumFractionDigits = Math.abs(asset.value) >= 100 ? 2 : 4
  return `${asset.value.toLocaleString('zh-CN', { maximumFractionDigits })}${asset.unit ? ` ${asset.unit}` : ''}`
}
const formatChange = (
  value: number | null | undefined,
  mode: CrossAssetItem['mode'] = 'return',
) => {
  if (value === null || value === undefined) return '—'
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}${mode === 'difference' ? t('crossAsset.modeBp') : mode === 'absolute' ? t('crossAsset.modePoints') : t('crossAsset.modePercent')}`
}
const valueClass = (value: number | null | undefined) => ({
  positive: value !== null && value !== undefined && value > 0,
  negative: value !== null && value !== undefined && value < 0,
})
const matrixNames = computed(() => dataset.matrix.ids.map((id) => assetById(id)?.name ?? id))
const heatmapOption = computed(() => ({
  animation: false,
  tooltip: {
  formatter: (params: { value: [number, number, number] }) =>
      `${t('crossAsset.corrLabel')}${params.value[2].toFixed(2)}`,
  },
  grid: { left: 116, right: 24, top: 76, bottom: 28 },
  xAxis: {
    type: 'category',
    data: matrixNames.value,
    position: 'top',
    axisLabel: { rotate: 38, fontSize: 10, color: chartPalette.value.text },
    splitArea: { show: true },
  },
  yAxis: {
    type: 'category',
    data: matrixNames.value,
    axisLabel: { fontSize: 10, color: chartPalette.value.text },
    splitArea: { show: true },
  },
  visualMap: {
    min: -1,
    max: 1,
    orient: 'horizontal',
    left: 'center',
    top: 4,
    inRange: {
      color: [chartPalette.value.positive, chartPalette.value.neutral, chartPalette.value.negative],
    },
    text: [t('crossAsset.heatmapTextSame'), t('crossAsset.heatmapTextOpposite')],
    textStyle: { fontSize: 9, color: chartPalette.value.text },
  },
  series: [
    {
      type: 'heatmap',
      data: dataset.matrix.correlations.flatMap((row, y) =>
        row.values.map((value, x) => [x, y, value ?? 0]),
      ),
      label: {
        show: true,
        fontSize: 9,
        formatter: (params: { value: [number, number, number] }) => params.value[2].toFixed(2),
      },
    },
  ],
}))
const performanceAssets = [
  'sp500',
  'nasdaq',
  'shanghai',
  'hangseng',
  'euro50',
  'nikkei',
  'wti',
  'gold',
  'btc',
]
const performanceOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    valueFormatter: (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`,
  },
  grid: { left: 105, right: 35, top: 18, bottom: 26 },
  xAxis: {
    type: 'value',
    axisLabel: { formatter: '{value}%', fontSize: 9, color: chartPalette.value.text },
    splitLine: { lineStyle: { color: chartPalette.value.split } },
  },
  yAxis: {
    type: 'category',
    data: performanceAssets.map((id) => assetById(id)?.name),
    axisLabel: { fontSize: 10, color: chartPalette.value.text },
  },
  series: [
    {
      type: 'bar',
      data: performanceAssets.map((id) => {
        const value = assetById(id)?.changes.month ?? 0
        return {
          value,
          itemStyle: {
            color: value >= 0 ? chartPalette.value.positive : chartPalette.value.negative,
          },
        }
      }),
      barMaxWidth: 18,
      label: {
        show: true,
        position: 'right',
        formatter: (params: { value: number }) =>
          `${params.value > 0 ? '+' : ''}${params.value.toFixed(1)}%`,
        fontSize: 9,
      },
    },
  ],
}))
</script>

<template>
  <main class="dashboard-page">
    <ResearchPageHeader
      :eyebrow="t('crossAsset.description')"
      :title="t('crossAsset.title')"
      :description="t('crossAsset.summaryLabel')"
    >
      <template #status><div class="heading-status">
        <DataUpdateStatus
          :updated-at="dataset.updatedAt"
          schedule="crossAsset"
          source-label="FRED 等公开数据源"
          :source-url="dataset.sourceUrl"
          quality="complete"
        />
        <a :href="dataset.sourceUrl" target="_blank" rel="noopener noreferrer">
          {{ t('crossAsset.sourceLabel') }}
        </a>
      </div></template>
    </ResearchPageHeader>

    <section class="chains-section top-chains">
      <header class="section-heading">
        <div>
          <span>01</span>
          <h2>{{ t('crossAsset.rulesTitle') }}</h2>
        </div>
        <p>{{ t('crossAsset.coreRules', { count: dataset.transmissionChains.length }) }}</p>
      </header>
      <div class="daily-brief">
        <header>
          <div>
            <span>{{ t('crossAsset.dailyBriefBadge') }} · {{ dataset.marketBrief.asOfDate }}</span>
            <h3>{{ dataset.marketBrief.regime.title }}</h3>
            <p>{{ dataset.marketBrief.regime.summary }}</p>
            <details class="regime-context">
              <summary>{{ t('crossAsset.regimes') }} <i aria-hidden="true">⌄</i></summary>
              <p>
                <b>{{ dataset.marketBrief.rateRegime.title }}</b> ·
                {{ dataset.marketBrief.rateRegime.summary }}
              </p>
              <p>
                <b>{{ dataset.marketBrief.cryptoRegime.title }}</b> ·
                {{ dataset.marketBrief.cryptoRegime.summary }}
              </p>
              <p>
                <b>{{ dataset.marketBrief.breadth.title }}</b> ·
                {{ dataset.marketBrief.breadth.summary }}
              </p>
            </details>
          </div>
          <small>{{ dataset.marketBrief.disclaimer }}</small>
        </header>
        <div class="movers">
          <div>
            <b>{{ t('crossAsset.leaders') }}</b>
            <span v-for="market in dataset.marketBrief.leaders" :key="market.id">
              {{ market.name }} <em>+{{ market.move?.toFixed(2) }}%</em>
            </span>
          </div>
          <div>
            <b>{{ t('crossAsset.laggards') }}</b>
            <span v-for="market in dataset.marketBrief.laggards" :key="market.id">
              {{ market.name }} <em>{{ market.move?.toFixed(2) }}%</em>
            </span>
          </div>
        </div>
        <div class="brief-tabs">
          <button
            v-for="market in dataset.marketBrief.markets"
            :key="market.id"
            :class="{ active: selectedBriefId === market.id }"
            @click="selectedBriefId = market.id"
          >
            {{ market.name }}
          </button>
        </div>
        <article v-if="selectedBrief" class="brief-detail">
          <div class="brief-current">
            <span>{{ t('crossAsset.attributionTitle') }}</span>
            <h4>{{ selectedBrief.dailySummary }}</h4>
            <ul>
              <li
                v-for="driver in selectedBrief.drivers"
                :key="driver.chain"
                :class="driver.effect"
              >
                {{ driver.text }}
              </li>
              <li v-if="!selectedBrief.drivers.length">{{ t('crossAsset.emptyDrivers') }}</li>
            </ul>
            <div class="event-catalysts">
              <b>{{
                selectedBrief.dailyAttribution.alignment === 'diverging'
                  ? t('crossAsset.alertGap')
                  : t('crossAsset.candidate')
              }}</b>
              <small>{{ t('crossAsset.catalystSortHint') }}</small>
              <a
                v-for="article in selectedCatalysts"
                :key="article.id"
                :href="article.url"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span
                  >{{
                    article.impact === 'critical'
                      ? t('crossAsset.eventLabels.critical')
                      : article.impact === 'high'
                        ? t('crossAsset.eventLabels.high')
                        : t('crossAsset.eventLabels.medium')
                  }}
                  · {{ article.source }} · {{ t('crossAsset.matchScoreLabel') }} {{ article.matchScore }} ·
                  {{ article.matchReason }} · {{ formatNewsAge(article.ageHours) }}</span
                >
                <strong
                  >{{ article.translatedTitle ? t('crossAsset.translatedTitle') : ''
                  }}{{ article.translatedTitle ?? article.title }}</strong
                >
                <em v-if="article.translatedTitle">{{ t('crossAsset.sourceTitle') }}{{ article.title }}</em>
              </a>
              <p v-if="!selectedCatalysts.length">{{ t('crossAsset.noImpactNews') }}</p>
            </div>
          </div>
          <div class="brief-outlook">
            <span>{{ selectedBrief.outlook.horizon }}{{ t('crossAsset.scenarioSuffix') }}</span>
            <div>
              <strong :class="selectedBrief.outlook.bias">
                {{ biasNames[selectedBrief.outlook.bias] }}
              </strong>
              <em>
                {{ confidenceNames[selectedBrief.outlook.confidence] }} · {{ t('crossAsset.confidenceLabel') }}
                {{ selectedBrief.outlook.score.toFixed(2) }}
                · {{ t('crossAsset.momentum5d') }}
                {{ selectedBrief.outlook.momentumSignals.week.toFixed(2) }} / {{ t('crossAsset.regimeWindow') }}
                {{ selectedBrief.outlook.momentumSignals.month.toFixed(2) }}
              </em>
              <small class="probability-summary">
                {{ t('crossAsset.upProb') }}
                {{ selectedBrief.outlook.probability.upProbabilityPct.toFixed(1) }}%（95%
                {{ selectedBrief.outlook.probability.intervalPct.low?.toFixed(1) ?? '—' }}–{{
                  selectedBrief.outlook.probability.intervalPct.high?.toFixed(1) ?? '—'
                }}%）· {{ t('crossAsset.brierLabel') }}
                {{
                  selectedBrief.outlook.probability.validationBrierSkillPct === null
                    ? '—'
                    : `${selectedBrief.outlook.probability.validationBrierSkillPct > 0 ? '+' : ''}${selectedBrief.outlook.probability.validationBrierSkillPct.toFixed(1)}%`
                }}
                （p={{
                  selectedBrief.outlook.probability.validationBrierAdvantagePValue?.toFixed(3) ??
                  '—'
                }}） · {{ selectedBrief.outlook.probability.macroRegime
                }}{{
                  selectedBrief.outlook.probability.source === 'macro-regime'
                    ? t('crossAsset.insideProbability')
                    : t('crossAsset.outsideProbability')
                }}
              </small>
            </div>
            <details class="backtest-line">
              <summary>
                <b>{{ t('crossAsset.validationTitle') }}</b>
                <span>{{ t('crossAsset.validationDesc') }}</span>
                <i aria-hidden="true">⌄</i>
              </summary>
              <b>{{ t('crossAsset.historicalValidateTitle') }}</b>
              <span>
                {{ selectedBrief.outlook.backtest.samples }}{{ t('crossAsset.samplesSuffix') }} ·
                {{ selectedBrief.outlook.backtest.directionalAccuracyPct?.toFixed(1) ?? '—' }}%
                （95% [{{
                  selectedBrief.outlook.backtest.accuracyIntervalPct.low?.toFixed(1) ?? '—'
                }},
                {{ selectedBrief.outlook.backtest.accuracyIntervalPct.high?.toFixed(1) ?? '—' }}]）
              </span>
              <span>
                {{ t('crossAsset.liveLedger', {
                  model: selectedBrief.outlook.liveEvaluation.modelVersion,
                  total: selectedBrief.outlook.liveEvaluation.totalSnapshots,
                  resolved: selectedBrief.outlook.liveEvaluation.resolvedSamples,
                }) }}
                <template v-if="selectedBrief.outlook.liveEvaluation.resolvedSamples">
                  · {{ t('crossAsset.directionalSamples') }} {{ selectedBrief.outlook.liveEvaluation.directionalSamples }}{{ t('crossAsset.samplesSuffix') }} · {{ t('crossAsset.hitRate') }}
                  {{
                    selectedBrief.outlook.liveEvaluation.directionalAccuracyPct?.toFixed(1) ?? '—'
                  }}% · Brier
                  {{ selectedBrief.outlook.liveEvaluation.brierScore?.toFixed(4) ?? '—' }}
                  {{ selectedBrief.outlook.liveEvaluation.latestOutcomeDate }}</template
                ><template v-else> · {{ t('crossAsset.untilSettled') }}</template>
              </span>
              <span>
                {{ t('crossAsset.momentumBaseLabel') }}
                {{ selectedBrief.outlook.backtest.baselineAccuracyPct?.toFixed(1) ?? '—' }}% · {{ t('crossAsset.boostLabel') }}
                {{
                  selectedBrief.outlook.backtest.liftPct === null
                    ? '—'
                    : `${selectedBrief.outlook.backtest.liftPct > 0 ? '+' : ''}${selectedBrief.outlook.backtest.liftPct.toFixed(1)}%`
                }}
              </span>
              <span>
                {{ t('crossAsset.baselineLabel') }}
                {{ selectedBrief.outlook.backtest.majorityBaselineAccuracyPct?.toFixed(1) ?? '—' }}%
                · {{ t('crossAsset.baselineGapLabel') }}
                {{
                  selectedBrief.outlook.backtest.liftVsBestBaselinePct === null
                    ? '—'
                    : `${selectedBrief.outlook.backtest.liftVsBestBaselinePct > 0 ? '+' : ''}${selectedBrief.outlook.backtest.liftVsBestBaselinePct.toFixed(1)}%`
                }}
              </span>
              <span>
                {{ t('crossAsset.selectedRuleLabel') }} {{ selectedBrief.outlook.backtest.selectivity.selectedRule.name }}（5日/{{
                  selectedBrief.outlook.backtest.selectivity.selectedRule.weekWeight.toFixed(2)
                }}、{{ t('crossAsset.month') }}/{{
                  selectedBrief.outlook.backtest.selectivity.selectedRule.monthWeight.toFixed(2)
                }}、{{ t('crossAsset.assetsTag') }}/{{
                  selectedBrief.outlook.backtest.selectivity.selectedRule.driverWeight.toFixed(2)
                }}）· {{ t('crossAsset.thresholdLabel') }} ±{{
                  selectedBrief.outlook.backtest.selectivity.selectedThreshold.toFixed(2)
                }}
                · {{ t('crossAsset.conservativeAdvantageLabel') }}
                {{
                  selectedBrief.outlook.backtest.selectivity.selectedConservativeEdgePct === null
                    ? '—'
                    : `${selectedBrief.outlook.backtest.selectivity.selectedConservativeEdgePct > 0 ? '+' : ''}${selectedBrief.outlook.backtest.selectivity.selectedConservativeEdgePct.toFixed(1)}%`
                }}
                · {{ t('crossAsset.validationCoverageLabel') }}
                {{
                  selectedBrief.outlook.backtest.selectivity.validationCoveragePct?.toFixed(1) ??
                  '—'
                }}%
              </span>
              <span>
                {{ t('crossAsset.ablationLabel') }}
                {{
                  selectedBrief.outlook.backtest.selectivity.driverAblation.fullAccuracyPct?.toFixed(
                    1,
                  ) ?? '—'
                }}% · {{ t('crossAsset.momentumOnlyLabel') }}
                {{
                  selectedBrief.outlook.backtest.selectivity.driverAblation.momentumOnlyAccuracyPct?.toFixed(
                    1,
                  ) ?? '—'
                }}% · {{ t('crossAsset.pairedWinsLabel') }}
                {{ selectedBrief.outlook.backtest.selectivity.driverAblation.fullWins }}/{{
                  selectedBrief.outlook.backtest.selectivity.driverAblation.momentumWins
                }}
                · p={{
                  selectedBrief.outlook.backtest.selectivity.driverAblation.pairedAdvantagePValue?.toFixed(
                    3,
                  ) ?? '—'
                }}
                ·
                {{
                  selectedBrief.outlook.backtest.selectivity.selectedRule.driverWeight === 0
                    ? t('crossAsset.driverPassLabel')
                    : selectedBrief.outlook.backtest.selectivity.driverAblation.allowed
                      ? t('crossAsset.driverWeightsLabel')
                      : t('crossAsset.noDriverLabel')
                }}
              </span>
              <span>
                {{ t('crossAsset.trainingLabel') }} {{ selectedBrief.outlook.backtest.selectivity.training.samples }}{{ t('crossAsset.samplesSuffix') }} ·
                {{ t('crossAsset.hitRate') }}
                {{
                  selectedBrief.outlook.backtest.selectivity.training.directionalAccuracyPct?.toFixed(
                    1,
                  ) ?? '—'
                }}% · {{ t('crossAsset.baselineGapLabel') }}
                {{
                  selectedBrief.outlook.backtest.selectivity.training.liftVsBestBaselinePct === null
                    ? '—'
                    : `${selectedBrief.outlook.backtest.selectivity.training.liftVsBestBaselinePct > 0 ? '+' : ''}${selectedBrief.outlook.backtest.selectivity.training.liftVsBestBaselinePct.toFixed(1)}%`
                }}
              </span>
              <span>
                {{ t('crossAsset.validationLabel') }} {{ selectedBrief.outlook.backtest.selectivity.validation.samples }}{{ t('crossAsset.samplesSuffix') }} ·
                {{ t('crossAsset.hitRate') }}
                {{
                  selectedBrief.outlook.backtest.selectivity.validation.directionalAccuracyPct?.toFixed(
                    1,
                  ) ?? '—'
                }}% · {{ t('crossAsset.baselineGapLabel') }}
                {{
                  selectedBrief.outlook.backtest.selectivity.validation.liftVsBestBaselinePct ===
                  null
                    ? '—'
                    : `${selectedBrief.outlook.backtest.selectivity.validation.liftVsBestBaselinePct > 0 ? '+' : ''}${selectedBrief.outlook.backtest.selectivity.validation.liftVsBestBaselinePct.toFixed(1)}%`
                }}
              </span>
              <span>
                {{ t('crossAsset.macroRegimeLabel') }}{{ selectedBrief.outlook.backtest.selectivity.macroRegime.name }} ·
                {{ t('crossAsset.regimeSamplesLabel') }}
                {{ selectedBrief.outlook.backtest.selectivity.macroRegime.validation.samples }}{{ t('crossAsset.samplesSuffix') }} ·
                {{ t('crossAsset.hitRate') }}
                {{
                  selectedBrief.outlook.backtest.selectivity.macroRegime.validation.directionalAccuracyPct?.toFixed(
                    1,
                  ) ?? '—'
                }}% · {{ t('crossAsset.baselineGapLabel') }}
                {{
                  selectedBrief.outlook.backtest.selectivity.macroRegime.validation
                    .liftVsBestBaselinePct === null
                    ? '—'
                    : `${selectedBrief.outlook.backtest.selectivity.macroRegime.validation.liftVsBestBaselinePct > 0 ? '+' : ''}${selectedBrief.outlook.backtest.selectivity.macroRegime.validation.liftVsBestBaselinePct.toFixed(1)}%`
                }}
              </span>
              <span>
                {{ t('crossAsset.consensusLabel') }}
                {{ selectedBrief.outlook.consensus.aligned }}/{{
                  selectedBrief.outlook.consensus.total
                }}
                （{{ selectedBrief.outlook.consensus.pct?.toFixed(0) ?? '—' }}%）
              </span>
              <span>
                {{ selectedBrief.outlook.backtest.regime }}
                {{ selectedBrief.outlook.backtest.regimeSamples }}{{ t('crossAsset.samplesSuffix') }} · {{ t('crossAsset.boostLabel') }}
                {{
                  selectedBrief.outlook.backtest.regimeLiftPct === null
                    ? '—'
                    : `${selectedBrief.outlook.backtest.regimeLiftPct > 0 ? '+' : ''}${selectedBrief.outlook.backtest.regimeLiftPct.toFixed(1)}%`
                }}
              </span>
              <span>
                {{ t('crossAsset.regimeLabel') }} {{ selectedBrief.outlook.backtest.validation.samples }}{{ t('crossAsset.samplesSuffix') }} · {{ t('crossAsset.hitRate') }}
                {{
                  selectedBrief.outlook.backtest.validation.directionalAccuracyPct?.toFixed(1) ??
                  '—'
                }}% · {{ t('crossAsset.baselineGapLabel') }}
                {{
                  selectedBrief.outlook.backtest.validation.liftVsBestBaselinePct === null
                    ? '—'
                    : `${selectedBrief.outlook.backtest.validation.liftVsBestBaselinePct > 0 ? '+' : ''}${selectedBrief.outlook.backtest.validation.liftVsBestBaselinePct.toFixed(1)}%`
                }}
              </span>
              <small>{{ selectedBrief.outlook.backtest.note }}</small>
            </details>
            <div
              class="direction-gate"
              :class="{ passed: selectedBrief.outlook.directionGate.eligible }"
            >
              <b
                >{{ t('crossAsset.gateTitle') }} {{ selectedBrief.outlook.directionGate.eligible ? t('crossAsset.gatePassed') : t('crossAsset.gateFailed') }}</b
              >
              <span v-if="selectedBrief.outlook.directionGate.eligible">
                {{ t('crossAsset.gatePassTip') }}
              </span>
              <span v-for="reason in selectedBrief.outlook.directionGate.reasons" :key="reason">
                {{ reason }}
              </span>
            </div>
            <div v-if="selectedBrief.outlook.scenario" class="scenario-range">
              <b>{{ t('crossAsset.historyScenario') }}</b>
              <span>
                {{
                  selectedBrief.outlook.scenario.direction === 'bullish'
                    ? t('crossAsset.historicalDirectionBullish')
                    : t('crossAsset.historicalDirectionBearish')
                }}
                {{ selectedBrief.outlook.scenario.samples }}{{ t('crossAsset.samplesSuffix') }} · {{ t('crossAsset.hitRate') }}
                {{ selectedBrief.outlook.scenario.directionalAccuracyPct?.toFixed(1) ?? '—' }}%
              </span>
              <span>
                {{ t('crossAsset.future5d') }}
                {{ selectedBrief.outlook.scenario.medianReturnPct?.toFixed(2) ?? '—' }}% · 25%–75%
                [{{ selectedBrief.outlook.scenario.q25ReturnPct?.toFixed(2) ?? '—' }}%,
                {{ selectedBrief.outlook.scenario.q75ReturnPct?.toFixed(2) ?? '—' }}%]
              </span>
              <small>{{ t('crossAsset.interlude') }}</small>
            </div>
            <b>{{ t('crossAsset.supportReasonsLabel') }}</b>
            <ul>
              <li v-for="reason in selectedBrief.outlook.reasons" :key="reason">{{ reason }}</li>
            </ul>
            <b>{{ t('crossAsset.oppositeRisks') }}</b>
            <ul class="risks">
              <li v-for="risk in selectedBrief.outlook.risks" :key="risk">{{ risk }}</li>
            </ul>
          </div>
        </article>
        <footer>{{ dataset.marketBrief.methodology }}</footer>
      </div>
      <div class="chain-filters">
        <button :class="{ active: chainStatus === 'all' }" @click="chainStatus = 'all'">
          {{ t('crossAsset.allLabel') }}
        </button>
        <button
          v-for="(name, key) in chainStatusNames"
          :key="key"
          :class="{ active: chainStatus === key }"
          @click="chainStatus = key"
        >
          {{ name }}
        </button>
      </div>
      <div class="chain-grid">
        <details
          v-for="(chain, index) in visibleChains"
          :key="chain.title"
          class="chain-card"
          :open="index < 3"
        >
          <summary>
            <div>
              <small>{{ chain.group }}</small>
              <h3>{{ chain.title }}</h3>
            </div>
            <div class="chain-signal">
              <em :class="chain.status">{{ chainStatusNames[chain.status] }}</em>
              <strong :class="valueClass(chain.signal)">{{
                chain.signal === null ? '—' : `ρ ${chain.signal.toFixed(2)}`
              }}</strong>
            </div>
            <i aria-hidden="true">⌄</i>
          </summary>
          <div class="steps">
            <template v-for="(step, index) in chain.steps" :key="step"
              ><span>{{ step }}</span
              ><b v-if="index < chain.steps.length - 1">→</b></template
            >
          </div>
          <div class="chain-windows">
            <span>{{ t('crossAsset.regimeWindow') }} {{ chain.windows.short?.toFixed(2) ?? '—' }}</span>
            <span>{{ t('crossAsset.regimeWindowMedium') }} {{ chain.windows.medium?.toFixed(2) ?? '—' }}</span>
            <span>{{ t('crossAsset.regimeWindowLong') }} {{ chain.windows.long?.toFixed(2) ?? '—' }}</span>
            <b :class="chain.stability">
              {{ stabilityNames[chain.stability] }}{{ chain.regimeShift ? t('crossAsset.regimeShift') : '' }}
            </b>
            <b :class="`evidence-${chain.evidence}`">
              {{ evidenceNames[chain.evidence] }} · {{ t('crossAsset.regimeWindowMedium') }}95% [{{
                chain.statistics.medium.ciLow?.toFixed(2) ?? '—'
              }}, {{ chain.statistics.medium.ciHigh?.toFixed(2) ?? '—' }}] · {{ t('crossAsset.regimeWindowLong') }}95% [{{
                chain.statistics.long.ciLow?.toFixed(2) ?? '—'
              }}, {{ chain.statistics.long.ciHigh?.toFixed(2) ?? '—' }}]
            </b>
            <b :class="`evidence-${chain.predictive.evidence}`">
              {{ t('crossAsset.predictiveLabel') }} ρ={{ chain.predictive.value?.toFixed(2) ?? '—' }} · {{ t('crossAsset.samplesLabel') }} {{
                chain.predictive.samples
              }}
              · FDR q={{ chain.predictive.qValue?.toFixed(3) ?? '—' }} · 95% [{{
                chain.predictive.ciLow?.toFixed(2) ?? '—'
              }}, {{ chain.predictive.ciHigh?.toFixed(2) ?? '—' }}]
            </b>
            <b :class="`evidence-${chain.shock.evidence}`">
              {{ t('crossAsset.upperShockLabel') }}{{ chain.shock.triggered ? t('crossAsset.triggered') : t('crossAsset.notTriggered') }} · {{ t('crossAsset.samplesLabel') }} {{
                chain.shock.eventSamples
              }}
              · {{ t('crossAsset.liftLabel') }} {{ chain.shock.liftPct?.toFixed(1) ?? '—' }}{{ t('crossAsset.allPeriodLift') }} · FDR q={{
                chain.shock.qValue?.toFixed(3) ?? '—'
              }}
            </b>
            <b :class="`evidence-${chain.lowerShock.evidence}`">
              {{ t('crossAsset.lowerShockLabel') }}{{ chain.lowerShock.triggered ? t('crossAsset.triggered') : t('crossAsset.notTriggered') }} · {{ t('crossAsset.samplesLabel') }} {{
                chain.lowerShock.eventSamples
              }}
              · {{ t('crossAsset.liftLabel') }} {{ chain.lowerShock.liftPct?.toFixed(1) ?? '—' }}{{ t('crossAsset.allPeriodLift') }} · FDR q={{
                chain.lowerShock.qValue?.toFixed(3) ?? '—'
              }}
            </b>
          </div>
          <p>{{ chain.interpretation }}</p>
          <a :href="chain.sourceUrl" target="_blank" rel="noopener noreferrer">
            {{ chain.sourceTitle }} ↗
          </a>
        </details>
      </div>
    </section>

    <section class="regime-strip">
        <div>
        <span>{{ t('crossAsset.trendTitle') }}</span
        ><strong>{{
          curveSpread === null ? '—' : `${curveSpread > 0 ? '+' : ''}${curveSpread}bp`
        }}</strong>
      </div>
      <div>
        <span>{{ t('crossAsset.hyLabel') }}</span
        ><strong>{{ assetById('hyspread')?.value?.toFixed(2) ?? '—' }}%</strong>
      </div>
      <div>
        <span>USD/JPY</span><strong>{{ assetById('usdjpy')?.value?.toFixed(2) ?? '—' }}</strong>
      </div>
      <div>
        <span>BTC</span
        ><strong>${{ assetById('btc')?.value?.toLocaleString('zh-CN') ?? '—' }}</strong>
      </div>
    </section>

    <section class="performance-section">
      <header class="section-heading">
        <div>
          <span>02</span>
          <h2>{{ t('crossAsset.monthStrength') }}</h2>
        </div>
        <p>{{ t('crossAsset.strengthHint') }}</p>
      </header>
      <div class="chart-panel"><EChart :option="performanceOption" /></div>
    </section>

    <section class="asset-section">
      <header class="section-heading">
        <div>
          <span>03</span>
          <h2>{{ t('crossAsset.podsTitle') }}</h2>
        </div>
        <p>{{ t('crossAsset.podsHint') }}</p>
      </header>
      <div class="tabs">
        <button :class="{ active: activeCategory === 'all' }" @click="activeCategory = 'all'">
          {{ t('crossAsset.allLabel') }}
        </button>
        <button
          v-for="(name, key) in categoryNames"
          :key="key"
          :class="{ active: activeCategory === key }"
          @click="activeCategory = key"
        >
          {{ name }}
        </button>
      </div>
      <div class="asset-table">
        <div class="asset-row asset-header">
          <span>{{ t('crossAsset.coreTarget') }}</span><span>{{ t('crossAsset.latestValue') }}</span
          ><span v-for="[, label] in periods" :key="label">{{ label }}</span
          ><span>{{ t('crossAsset.flowLabel') }}</span>
        </div>
        <div v-for="asset in visibleAssets" :key="asset.id" class="asset-row">
          <span class="asset-name"
            ><b>{{ asset.name }}</b
            ><small
              >{{ categoryNames[asset.category] }} · {{ t('crossAsset.observePrefix') }}
              {{ asset.date ?? t('crossAsset.noData') }}<template
                v-if="asset.availableDate && asset.availableDate !== asset.date"
              >
                · {{ t('crossAsset.availablePrefix') }} {{ asset.availableDate }}</template
              ><template v-if="asset.stale"> · {{ t('crossAsset.staleNote') }}</template></small
            ></span
          >
          <strong>{{ formatValue(asset) }}</strong>
          <span
            v-for="[period] in periods"
            :key="period"
            :class="valueClass(asset.changes[period])"
            >{{ formatChange(asset.changes[period], asset.mode) }}</span
          >
          <span class="flow"
            ><b :class="asset.flow.status">{{ formatChange(asset.flow.value, asset.mode) }}</b
            ><small>{{ asset.flow.label }} · {{ asset.flow.note }}</small></span
          >
        </div>
      </div>
    </section>

    <section class="matrix-section">
      <header class="section-heading">
        <div>
          <span>04</span>
          <h2>{{ t('crossAsset.matrixTitle') }}</h2>
        </div>
        <p>{{ dataset.correlationWindow }} · {{ t('crossAsset.matrixHint') }}</p>
      </header>
      <div class="matrix-wrap">
        <EChart :option="heatmapOption" />
      </div>
    </section>

    <aside class="coverage-note">
      <strong>{{ t('crossAsset.dataCover') }}</strong>
      <ul>
        <li v-for="item in dataset.limitations" :key="item">{{ item }}</li>
      </ul>
    </aside>
  </main>
</template>

<style scoped>
.dashboard-page {
  max-width: var(--content-wide);
  margin: 0 auto;
  padding: 32px var(--page-gutter) 80px;
}
.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 30px;
}
.page-heading p {
  margin: 0 0 14px;
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
h1 {
  margin: 0 0 12px;
  font-family: Georgia, 'Songti SC', serif;
  font-size: clamp(36px, 4.5vw, 54px);
  font-weight: 500;
  letter-spacing: -0.045em;
}
.page-heading > div > span {
  color: var(--muted);
  font-size: 13px;
}
.heading-status {
  display: grid;
  justify-items: end;
  gap: 6px;
}
.heading-status > a {
  color: var(--accent);
  font-size: 9px;
  text-decoration: none;
}
.freshness {
  padding: 12px 15px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  color: var(--ink);
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.freshness i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}
.freshness strong,
.freshness small {
  display: block;
}
.freshness strong {
  font-size: 12px;
}
.freshness small {
  margin-top: 3px;
  color: var(--muted);
  font-size: 10px;
}
.regime-strip {
  margin: 38px 0 48px;
  border-block: 1px solid var(--border);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
.top-chains {
  margin-top: 32px;
}
.chart-panel,
.matrix-wrap {
  height: 390px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
}
.regime-strip div {
  padding: 18px;
  border-right: 1px solid var(--border);
}
.regime-strip div:last-child {
  border: 0;
}
.regime-strip span,
.regime-strip strong {
  display: block;
}
.regime-strip span {
  color: var(--muted);
  font-size: 10px;
}
.regime-strip strong {
  margin-top: 6px;
  font-family: Georgia, serif;
  font-size: 23px;
  font-weight: 400;
}
section + section {
  margin-top: 58px;
}
.section-heading {
  margin-bottom: 18px;
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 20px;
}
.section-heading div {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.section-heading span {
  color: var(--accent);
  font:
    10px ui-monospace,
    monospace;
}
.section-heading h2 {
  margin: 0;
  font:
    400 26px Georgia,
    'Songti SC',
    serif;
}
.section-heading p {
  margin: 0;
  color: var(--muted);
  font-size: 11px;
}
.tabs {
  margin-bottom: 12px;
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
.tabs button {
  padding: 7px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--muted);
  cursor: pointer;
}
.tabs button.active {
  border-color: var(--ink);
  background: var(--ink);
  color: white;
}
.asset-table {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
}
.asset-row {
  min-width: 1240px;
  padding: 13px 14px;
  border-bottom: 1px solid var(--border);
  display: grid;
  grid-template-columns: minmax(180px, 1.3fr) 130px repeat(7, 76px) minmax(180px, 1fr);
  gap: 12px;
  align-items: center;
  font-size: 12px;
}
.asset-row:last-child {
  border: 0;
}
.asset-header {
  background: var(--surface-elevated);
  color: var(--muted);
  font-size: 9px;
  text-transform: uppercase;
}
.asset-name b,
.asset-name small,
.flow b,
.flow small {
  display: block;
}
.asset-name small,
.flow small {
  margin-top: 4px;
  color: var(--muted);
  font-size: 9px;
}
.flow b.proxy {
  color: var(--warning);
}
.positive {
  color: var(--positive);
}
.negative {
  color: var(--negative);
}
.matrix-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  background: var(--surface);
}
th,
td {
  height: 58px;
  padding: 8px;
  border: 1px solid var(--border);
  font-size: 11px;
  text-align: center;
}
th {
  color: var(--muted);
  font-weight: 500;
}
tbody th {
  min-width: 120px;
  text-align: left;
}
.chain-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.chain-filters {
  margin: -4px 0 14px;
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
.daily-brief {
  margin-bottom: 22px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  overflow: hidden;
}
.daily-brief > header {
  padding: 18px 20px;
  background: var(--inverse);
  color: white;
  display: flex;
  justify-content: space-between;
  gap: 24px;
}
.daily-brief > header span {
  color: var(--accent);
  font-size: 8px;
  letter-spacing: 0.12em;
}
.daily-brief > header h3 {
  margin: 6px 0;
  font:
    400 22px Georgia,
    'Songti SC',
    serif;
}
.daily-brief > header p,
.daily-brief > header small {
  margin: 0;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.7;
}
.daily-brief > header small {
  max-width: 290px;
}
.regime-context {
  margin-top: 10px;
}
.regime-context summary {
  min-height: 40px;
  padding: 8px 0;
  color: var(--accent);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  font-weight: 700;
}
.regime-context summary i {
  font-style: normal;
  transition: transform 0.18s cubic-bezier(0.23, 1, 0.32, 1);
}
.regime-context[open] summary i {
  transform: rotate(180deg);
}
.regime-context p + p {
  margin-top: 6px;
}
.movers {
  padding: 12px 18px;
  border-bottom: 1px solid var(--border);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.movers div {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}
.movers b {
  margin-right: 4px;
  color: var(--muted);
  font-size: 9px;
}
.movers span {
  padding: 4px 7px;
  border-radius: 4px;
  background: var(--surface-soft);
  font-size: 9px;
}
.movers em {
  color: var(--danger);
  font-style: normal;
}
.movers div:last-child em {
  color: var(--accent);
}
.brief-tabs {
  padding: 12px 16px 0;
  display: flex;
  gap: 5px;
  overflow-x: auto;
  scrollbar-width: thin;
}
.brief-tabs button {
  padding: 6px 9px;
  border: 1px solid var(--border);
  border-radius: 5px;
  background: var(--surface);
  color: var(--muted);
  font-size: 10px;
  white-space: nowrap;
  cursor: pointer;
}
.brief-tabs button.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}
.brief-detail {
  padding: 17px 18px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 28px;
}
.brief-detail > div > span {
  color: var(--muted);
  font-size: 8px;
  letter-spacing: 0.08em;
}
.brief-current h4 {
  margin: 8px 0 12px;
  font-size: 14px;
  line-height: 1.55;
}
.brief-detail ul {
  margin: 7px 0 12px;
  padding-left: 17px;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.65;
}
.brief-current li.tailwind::marker {
  color: var(--danger);
}
.brief-current li.headwind::marker,
.brief-outlook .risks li::marker {
  color: var(--accent);
}
.event-catalysts {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  display: grid;
  gap: 7px;
}
.event-catalysts > b {
  font-size: 9px;
}
.event-catalysts > small,
.event-catalysts > p {
  margin: 0;
  color: var(--muted);
  font-size: 8px;
  line-height: 1.55;
}
.event-catalysts a {
  padding: 8px 9px;
  border-radius: 5px;
  background: var(--surface-soft);
  display: grid;
  gap: 3px;
  color: inherit;
  text-decoration: none;
}
.event-catalysts a span,
.event-catalysts a em {
  color: var(--muted);
  font-size: 7px;
  font-style: normal;
}
.event-catalysts a strong {
  font-size: 9px;
  line-height: 1.45;
}
.brief-outlook > div {
  margin: 8px 0 13px;
  display: flex;
  align-items: center;
  gap: 9px;
}
.brief-outlook > div strong {
  padding: 5px 9px;
  border-radius: 5px;
  background: var(--surface-soft);
  font-size: 12px;
}
.probability-summary {
  color: var(--muted);
  font-size: 10px;
  line-height: 1.5;
}
.brief-outlook > div strong.bullish {
  background: var(--danger-soft);
  color: var(--danger);
}
.brief-outlook > div strong.bearish {
  background: var(--accent-soft);
  color: var(--accent);
}
.brief-outlook > div em {
  color: var(--muted);
  font-size: 9px;
  font-style: normal;
}
.brief-outlook > b {
  font-size: 9px;
}
.backtest-line {
  margin: -3px 0 13px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 5px;
  background: var(--surface-soft);
  font-size: 10px;
  overflow: hidden;
}
.backtest-line summary {
  min-height: 48px;
  padding: 10px 12px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) 18px;
  align-items: center;
  gap: 10px;
}
.backtest-line summary span {
  color: var(--muted);
  font-weight: 400;
}
.backtest-line summary i {
  color: var(--muted);
  font-style: normal;
  transition: transform 0.18s cubic-bezier(0.23, 1, 0.32, 1);
}
.backtest-line[open] summary i {
  transform: rotate(180deg);
}
.backtest-line > b,
.backtest-line > span,
.backtest-line > small {
  margin-inline: 12px;
  display: block;
}
.backtest-line > b {
  padding-top: 10px;
  border-top: 1px solid var(--border);
}
.backtest-line > span {
  margin-top: 6px;
}
.backtest-line span {
  color: var(--accent);
  font-weight: 700;
}
.backtest-line small {
  padding: 8px 0 12px;
  color: var(--muted);
  font-size: 9px;
}
.brief-outlook > .direction-gate {
  margin: -4px 0 13px;
  padding: 8px 10px;
  border: 1px solid var(--danger);
  border-radius: 5px;
  background: var(--danger-soft);
  display: grid;
  align-items: start;
  gap: 3px;
  color: var(--danger);
  font-size: 8px;
}
.brief-outlook > .direction-gate.passed {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}
.direction-gate span {
  line-height: 1.45;
}
.brief-outlook > .scenario-range {
  margin: -4px 0 13px;
  padding: 9px 10px;
  border-radius: 5px;
  background: var(--surface-soft);
  display: grid;
  align-items: start;
  gap: 4px;
  color: var(--ink);
  font-size: 8px;
}
.scenario-range span {
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}
.scenario-range small {
  color: var(--muted);
  line-height: 1.45;
}
.daily-brief > footer {
  padding: 10px 18px;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 8px;
}
.chain-filters button {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  color: var(--muted);
  font-size: 10px;
  cursor: pointer;
}
.chain-filters button.active {
  border-color: var(--ink);
  background: var(--ink);
  color: white;
}
.chain-grid .chain-card {
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
}
.chain-grid summary {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}
.chain-grid summary > i {
  color: var(--muted);
  font-style: normal;
  transition: transform 0.2s ease;
}
.chain-grid details[open] summary > i {
  transform: rotate(180deg);
}
.chain-grid summary small {
  color: var(--muted);
  font-size: 8px;
}
.chain-signal {
  display: grid;
  justify-items: end;
  gap: 6px;
}
.chain-signal em {
  padding: 3px 6px;
  border-radius: 4px;
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 8px;
  font-style: normal;
  white-space: nowrap;
}
.chain-signal em.confirming {
  background: var(--accent-soft);
  color: var(--accent);
}
.chain-signal em.diverging {
  background: var(--danger-soft);
  color: var(--danger);
}
.chain-signal em.context {
  background: var(--warning-soft);
  color: var(--warning);
}
.chain-grid h3 {
  margin: 0;
  font-size: 14px;
}
.steps {
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}
.steps span {
  padding: 6px 8px;
  border-radius: 5px;
  background: var(--surface-soft);
  font-size: 10px;
}
.steps b {
  color: var(--accent);
}
.chain-windows {
  margin: -8px 0 13px;
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
  color: var(--muted);
  font-size: 8px;
}
.chain-windows span {
  font-variant-numeric: tabular-nums;
}
.chain-windows b {
  padding: 3px 6px;
  border-radius: 4px;
  background: var(--surface-soft);
  font-size: 8px;
}
.chain-windows b.stable {
  background: var(--accent-soft);
  color: var(--accent);
}
.chain-windows b.mixed {
  background: var(--danger-soft);
  color: var(--danger);
}
.chain-windows b.evidence-strong,
.chain-windows b.evidence-supported {
  background: var(--accent-soft);
  color: var(--accent);
}
.chain-windows b.evidence-uncertain {
  background: var(--warning-soft);
  color: var(--warning);
}
.chain-grid p {
  margin: 0;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.6;
}
.chain-grid .chain-card > a {
  margin-top: 12px;
  color: var(--accent);
  display: inline-block;
  font-size: 9px;
  text-decoration: none;
}
.coverage-note {
  margin-top: 42px;
  padding: 17px 20px;
  border-left: 3px solid var(--warning);
  background: var(--warning-soft);
  font-size: 11px;
}
.coverage-note ul {
  margin: 8px 0 0;
  padding-left: 18px;
  color: var(--muted);
  line-height: 1.8;
}
@media (max-width: 760px) {
  .dashboard-page {
    padding: 24px 14px 60px;
  }
  .page-heading,
  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .heading-status {
    align-self: flex-start;
    justify-items: start;
  }
  .regime-strip {
    grid-template-columns: 1fr 1fr;
  }
  .regime-strip div:nth-child(2) {
    border-right: 0;
  }
  .chain-grid {
    grid-template-columns: 1fr;
  }
  .daily-brief > header,
  .brief-detail {
    grid-template-columns: 1fr;
    flex-direction: column;
  }
  .movers {
    grid-template-columns: 1fr;
  }
}
</style>
