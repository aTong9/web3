<script setup lang="ts">
import type { EChartsCoreOption } from 'echarts/core'
import { computed, onMounted, ref, watch } from 'vue'
import EChart from '@/components/EChart.vue'
import AsyncDataState from '@/components/AsyncDataState.vue'
import DataUpdateStatus from '@/components/DataUpdateStatus.vue'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import { useI18n } from '@/composables/use-i18n'
import {
  qqqProfile,
  qqqSectors,
  qqqTopHoldings,
  sp500Profile,
  sp500Sectors,
  sp500TopHoldings,
  usIndexMilestones,
  usIndexSources,
  type UsIndexId,
  type UsIndexMilestoneKind,
} from '@/data/us-indexes'
import {
  buildIndexDcaCsv,
  compareIndexDcaPlans,
  compareIndexProfiles,
  normalizePerformanceSeries,
  simulateIndexDca,
} from '@/utils/us-indexes'

type PageSection =
  | 'compare'
  | 'history'
  | 'holdings'
  | 'performance'
  | 'leaders'
  | 'dca'
  | 'methodology'
type TimelineFilter = '全部' | UsIndexMilestoneKind
interface LeaderSnapshotIndex {
  id: UsIndexId
  benchmarkTicker: 'QQQ' | 'SPY'
  holdingsAsOfDate: string
  sourceUrl: string
  sectorAsOfDate: string
  sectorSourceUrl: string
  sectorSystem: string
  sectors: Array<{ name: string; weightPct: number }>
  leaders: Array<{ rank: number; ticker: string; name: string; weightPct: number }>
}
interface LeaderSnapshot {
  period: string
  capturedAt: string
  status: 'archived'
  methodology: string
  indexes: LeaderSnapshotIndex[]
}
interface LeaderComparisonStrategy {
  size: 1 | 3 | 5 | 10
  weighting: 'equal' | 'official'
  leaderTickers: string[]
  grossReturnPct: number
  netReturnPct: number
  benchmarkNetReturnPct: number
  excessReturnPctPoints: number
  outperformed: boolean
}
interface LeaderComparison {
  fromPeriod: string
  toPeriod: string
  status: 'complete'
  roundTripCostPct: number
  indexes: Array<{
    id: UsIndexId
    benchmarkTicker: 'QQQ' | 'SPY'
    startDate: string
    endDate: string
    strategies: LeaderComparisonStrategy[]
  }>
}
interface UsIndexResearchDataset {
  schemaVersion: number
  datasetVersion: string
  generatedAt: string
  status: 'complete' | 'partial'
  source: {
    marketData: string
    officialStructure: string
    note: string
  }
  products: Array<{
    id: 'qqq' | 'spy' | 'gld' | 'btc'
    ticker: string
    index: string
    inception: string
    feePct: number
  }>
  productProfiles: Array<{
    id: 'qqq' | 'spy' | 'gld'
    ticker: 'QQQ' | 'SPY' | 'GLD'
    name: string
    benchmark: string
    inceptionDate: string
    expenseRatioPct: number
    totalNetAssetsUsd: number
    netAssetsAsOfDate: string
    holdingsCount?: number
    holdingsCountAsOfDate?: string
    sourceAsOfDate: string
    sourceUrl: string
    sourceLabel: string
    goldHoldingsTonnes?: number
    goldOuncesPerShare?: number
    goldHoldingsAsOfDate?: string
    holdingsSourceUrl?: string
  }>
  monthlySeries: Array<{
    symbol: string
    currency: string
    prices: Array<{
      date: string
      open?: number
      close: number
      adjClose?: number
      splitRatio?: number
      dividendPerShare?: number
    }>
  }>
  leaderSnapshots: LeaderSnapshot[]
  leaderComparisons: LeaderComparison[]
}
interface UsIndexDailyDataset {
  schemaVersion: 1
  datasetVersion: string
  generatedAt: string
  status: 'complete'
  marketSeries: UsIndexResearchDataset['monthlySeries']
}

const usIndexResearch = ref<UsIndexResearchDataset>({
  schemaVersion: 0,
  datasetVersion: '',
  generatedAt: '',
  status: 'partial',
  source: { marketData: '', officialStructure: '', note: '' },
  products: [],
  productProfiles: [],
  monthlySeries: [],
  leaderSnapshots: [],
  leaderComparisons: [],
})
const researchLoading = ref(true)
const researchError = ref(false)
const dailyResearch = ref<UsIndexDailyDataset | null>(null)
const dailyLoading = ref(false)
const dailyError = ref(false)
const { t } = useI18n()
const latestMarketDate = computed(() => {
  const dates = usIndexResearch.value.monthlySeries
    .map((series) => series.prices[series.prices.length - 1]?.date)
    .filter((date): date is string => Boolean(date))
  return dates.length ? [...dates].sort()[0] : undefined
})

const activeSection = ref<PageSection>('performance')
const activeIndex = ref<UsIndexId>('qqq')
const timelineFilter = ref<TimelineFilter>('全部')
const dcaProduct = ref<'qqq' | 'spy' | 'gld' | 'btc'>('qqq')
const dcaStartDate = ref('2020-01-01')
const dcaEndDate = ref('2026-08-24')
const dcaAmount = ref(500)
const dcaDay = ref(1)
const dcaExecution = ref<'next-trading-day' | 'previous-trading-day'>('next-trading-day')
const dcaPrice = ref<'open' | 'close'>('close')
const dcaReinvest = ref(true)
const dcaPurchaseFeePct = ref(0)
const dcaPurchaseFeeFixed = ref(0)
const dcaDividendTaxPct = ref(0)
const dcaLiquidationFeePct = ref(0)
const dcaAnnualCustodyFeePct = ref(0)
const performanceStartDate = ref('2020-01-01')
const performanceEndDate = ref('2026-08-24')
const latestArchiveFor = (id: UsIndexId) => {
  const snapshots = usIndexResearch.value.leaderSnapshots
  return snapshots[snapshots.length - 1]?.indexes.find((index) => index.id === id)
}
const qqqCurrentArchive = computed(() => latestArchiveFor('qqq'))
const sp500CurrentArchive = computed(() => latestArchiveFor('sp500'))
const qqqOfficialProfile = computed(() =>
  usIndexResearch.value.productProfiles.find((profile) => profile.id === 'qqq'),
)
const spyOfficialProfile = computed(() =>
  usIndexResearch.value.productProfiles.find((profile) => profile.id === 'spy'),
)
const gldOfficialProfile = computed(() =>
  usIndexResearch.value.productProfiles.find((profile) => profile.id === 'gld'),
)
const formatFundAssets = (value?: number) =>
  value
    ? `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value / 1_000_000_000)}B`
    : '—'
const top10Weight = (archive: LeaderSnapshotIndex | undefined, fallback: number) =>
  archive
    ? Number(archive.leaders.reduce((total, holding) => total + holding.weightPct, 0).toFixed(2))
    : fallback
const technologyWeight = (
  archive: LeaderSnapshotIndex | undefined,
  fallback: number,
  names: string[],
) => archive?.sectors.find((sector) => names.includes(sector.name))?.weightPct ?? fallback
const comparison = computed(() =>
  compareIndexProfiles(
    {
      ...qqqProfile,
      top10WeightPct: top10Weight(qqqCurrentArchive.value, qqqProfile.top10WeightPct),
      technologyWeightPct: technologyWeight(
        qqqCurrentArchive.value,
        qqqProfile.technologyWeightPct,
        ['Technology', 'Information Technology'],
      ),
    },
    {
      ...sp500Profile,
      top10WeightPct: top10Weight(sp500CurrentArchive.value, sp500Profile.top10WeightPct),
      technologyWeightPct: technologyWeight(
        sp500CurrentArchive.value,
        sp500Profile.technologyWeightPct,
        ['Information Technology', 'Technology'],
      ),
    },
  ),
)
const qqqTop10CurrentPct = computed(() =>
  top10Weight(qqqCurrentArchive.value, qqqProfile.top10WeightPct),
)
const sp500Top10CurrentPct = computed(() =>
  top10Weight(sp500CurrentArchive.value, sp500Profile.top10WeightPct),
)
const qqqLargestCurrentPct = computed(
  () => qqqCurrentArchive.value?.leaders[0]?.weightPct ?? qqqProfile.largestWeightPct,
)
const sp500LargestCurrentPct = computed(
  () => sp500CurrentArchive.value?.leaders[0]?.weightPct ?? sp500Profile.largestWeightPct,
)
const visibleMilestones = computed(() =>
  usIndexMilestones.filter(
    (item) =>
      (item.indexId === activeIndex.value || item.indexId === 'both') &&
      (timelineFilter.value === '全部' || item.kind === timelineFilter.value),
  ),
)
const activeProfile = computed(() => (activeIndex.value === 'qqq' ? qqqProfile : sp500Profile))
const activeHoldings = computed(() =>
  activeLeaderArchive.value
    ? activeLeaderArchive.value.leaders.map((holding) => ({
        ...holding,
        sector: '官方持仓未附行业',
      }))
    : activeIndex.value === 'qqq'
      ? qqqTopHoldings
      : sp500TopHoldings,
)
const activeHoldingsAsOfDate = computed(
  () => activeLeaderArchive.value?.holdingsAsOfDate ?? activeProfile.value.holdingsAsOfDate,
)
const activeTop10WeightPct = computed(() =>
  activeLeaderArchive.value
    ? Number(
        activeLeaderArchive.value.leaders
          .reduce((total, holding) => total + holding.weightPct, 0)
          .toFixed(2),
      )
    : activeProfile.value.top10WeightPct,
)
const activeSectors = computed<ReadonlyArray<readonly [string, number]>>(() =>
  activeLeaderArchive.value?.sectors.length
    ? activeLeaderArchive.value.sectors.map((sector) => [sector.name, sector.weightPct] as const)
    : activeIndex.value === 'qqq'
      ? qqqSectors
      : sp500Sectors,
)
const activeSectorAsOfDate = computed(
  () => activeLeaderArchive.value?.sectorAsOfDate ?? activeProfile.value.holdingsAsOfDate,
)
const activeSectorSystem = computed(
  () => activeLeaderArchive.value?.sectorSystem ?? activeProfile.value.sectorSystem,
)
const latestLeaderSnapshot = computed(
  () => usIndexResearch.value.leaderSnapshots[usIndexResearch.value.leaderSnapshots.length - 1],
)
const activeLeaderArchive = computed(() =>
  activeIndex.value === 'qqq' ? qqqCurrentArchive.value : sp500CurrentArchive.value,
)
const activeLeaderEvidence = computed(() =>
  usIndexResearch.value.leaderComparisons.flatMap((comparison) => {
    const index = comparison.indexes.find((item) => item.id === activeIndex.value)
    const strategy = index?.strategies.find((item) => item.size === 5 && item.weighting === 'equal')
    return index && strategy
      ? [{ fromPeriod: comparison.fromPeriod, toPeriod: comparison.toPeriod, ...index, strategy }]
      : []
  }),
)
const activeLeaderSummary = computed(() => {
  const periods = activeLeaderEvidence.value
  if (!periods.length) return null
  const leaderGrowth = periods.reduce(
    (growth, period) => growth * (1 + period.strategy.netReturnPct / 100),
    1,
  )
  const benchmarkGrowth = periods.reduce(
    (growth, period) => growth * (1 + period.strategy.benchmarkNetReturnPct / 100),
    1,
  )
  const wins = periods.filter((period) => period.strategy.outperformed).length
  return {
    periods: periods.length,
    wins,
    winRatePct: Number(((wins / periods.length) * 100).toFixed(1)),
    leaderReturnPct: Number(((leaderGrowth - 1) * 100).toFixed(2)),
    benchmarkReturnPct: Number(((benchmarkGrowth - 1) * 100).toFixed(2)),
    excessReturnPctPoints: Number(((leaderGrowth - benchmarkGrowth) * 100).toFixed(2)),
  }
})
const selectedResearchProduct = computed(() =>
  usIndexResearch.value.products.find((product) => product.id === dcaProduct.value),
)
const isZeroFrictionBtc = computed(
  () =>
    dcaProduct.value === 'btc' &&
    dcaPurchaseFeePct.value === 0 &&
    dcaPurchaseFeeFixed.value === 0 &&
    dcaLiquidationFeePct.value === 0 &&
    dcaAnnualCustodyFeePct.value === 0,
)
const selectedMarketSeries = computed(() =>
  dailyResearch.value?.marketSeries.find(
    (series) => series.symbol === selectedResearchProduct.value?.ticker,
  ),
)
const dailyReady = computed(
  () => dailyResearch.value?.datasetVersion === usIndexResearch.value.datasetVersion,
)
const dcaResult = computed(() => {
  try {
    if (!selectedResearchProduct.value || !selectedMarketSeries.value) return null
    return simulateIndexDca({
      symbol: selectedResearchProduct.value.ticker,
      startDate: dcaStartDate.value,
      endDate: dcaEndDate.value,
      contributionAmount: dcaAmount.value,
      frequency: 'monthly',
      dayOfMonth: dcaDay.value,
      executionRule: dcaExecution.value,
      purchasePrice: dcaPrice.value,
      reinvestDividends: dcaReinvest.value,
      annualExpenseRatioPct: selectedResearchProduct.value.feePct,
      purchaseFeePct: dcaPurchaseFeePct.value,
      purchaseFeeFixed: dcaPurchaseFeeFixed.value,
      dividendTaxPct: dcaDividendTaxPct.value,
      liquidationFeePct: dcaLiquidationFeePct.value,
      annualCustodyFeePct: dcaAnnualCustodyFeePct.value,
      prices: selectedMarketSeries.value.prices,
    })
  } catch {
    return null
  }
})
const dcaComparison = computed(() => {
  try {
    if (!dailyReady.value || !dailyResearch.value) return null
    return compareIndexDcaPlans({
      startDate: dcaStartDate.value,
      endDate: dcaEndDate.value,
      contributionAmount: dcaAmount.value,
      dayOfMonth: dcaDay.value,
      executionRule: dcaExecution.value,
      purchasePrice: dcaPrice.value,
      reinvestDividends: dcaReinvest.value,
      purchaseFeePct: dcaPurchaseFeePct.value,
      purchaseFeeFixed: dcaPurchaseFeeFixed.value,
      dividendTaxPct: dcaDividendTaxPct.value,
      liquidationFeePct: dcaLiquidationFeePct.value,
      annualCustodyFeePct: dcaAnnualCustodyFeePct.value,
      products: usIndexResearch.value.products.map((product) => ({
        id: product.id,
        symbol: product.ticker,
        annualExpenseRatioPct: product.feePct,
        prices:
          dailyResearch.value!.marketSeries.find((series) => series.symbol === product.ticker)
            ?.prices ?? [],
      })),
    })
  } catch {
    return null
  }
})
const recentDcaPurchases = computed(() => dcaResult.value?.purchases.slice(-12).reverse() ?? [])
const downloadDcaCsv = () => {
  if (!dcaResult.value) return
  const blob = new Blob([buildIndexDcaCsv(dcaResult.value)], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${dcaResult.value.symbol.toLowerCase()}-dca-${dcaStartDate.value}-${dcaEndDate.value}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
const dcaAssetLabel = (id: string) =>
  ({ qqq: 'QQQ', spy: 'SPY', gld: '黄金 GLD', btc: '比特币' })[id] ?? id
const performance = computed(() =>
  usIndexResearch.value.monthlySeries.length
    ? normalizePerformanceSeries(
        usIndexResearch.value.monthlySeries.map((series) => ({
          id: series.symbol,
          points: series.prices.map((point) => ({
            date: point.date,
            close: point.adjClose ?? point.close,
          })),
        })),
        performanceStartDate.value,
        performanceEndDate.value,
        'monthly',
      )
    : { dates: [], series: [] },
)
const performanceOption = computed<EChartsCoreOption>(() => ({
  animation: false,
  color: ['#7357d8', '#3b82b8', '#d29b35', '#d76b41'],
  tooltip: { trigger: 'axis', valueFormatter: (value: unknown) => `${Number(value).toFixed(1)}` },
  legend: { top: 0, textStyle: { color: '#7c8798' } },
  grid: { left: 54, right: 24, top: 48, bottom: 58 },
  xAxis: { type: 'category', data: performance.value.dates, axisLabel: { hideOverlap: true } },
  yAxis: { type: 'value', name: '起点 = 100', scale: true },
  dataZoom: [{ type: 'inside' }, { type: 'slider', height: 18, bottom: 12 }],
  series: performance.value.series.map((series) => ({
    name:
      series.id === 'SPY'
        ? 'S&P 500（SPY）'
        : series.id === 'GLD'
          ? '黄金（GLD）'
          : series.id === 'BTC-USD'
            ? '比特币'
            : 'QQQ',
    type: 'line',
    showSymbol: false,
    sampling: 'lttb',
    data: series.values,
  })),
}))
const assetCards = computed(() => {
  const meta = {
    QQQ: { id: 'qqq' as const, label: 'QQQ', role: '科技成长', tone: 'purple' },
    SPY: { id: 'spy' as const, label: 'SPY', role: '美国大盘', tone: 'blue' },
    GLD: { id: 'gld' as const, label: 'GLD', role: '黄金防守', tone: 'gold' },
    'BTC-USD': {
      id: 'btc' as const,
      label: 'BTC',
      role: '另类资产',
      tone: 'orange',
    },
  }
  return performance.value.series.map((series) => {
    const card = meta[series.id as keyof typeof meta]
    const product = usIndexResearch.value.products.find((item) => item.id === card.id)
    return {
      ...card,
      fee: card.id === 'btc' ? '成本需自填' : `${product?.feePct ?? '—'}%`,
      returnPct: Number((series.values[series.values.length - 1]! - 100).toFixed(1)),
    }
  })
})

const primarySections: Array<{ id: PageSection; label: string }> = [
  { id: 'performance', label: '四资产收益' },
  { id: 'dca', label: '定投试算' },
  { id: 'compare', label: '资产差异' },
]
const researchSections: Array<{ id: PageSection; label: string }> = [
  { id: 'holdings', label: '持仓拆解' },
  { id: 'leaders', label: '龙头跟踪' },
  { id: 'history', label: '历史转折' },
  { id: 'methodology', label: '规则与口径' },
]
const filters: TimelineFilter[] = ['全部', '发布', '产品化', '危机', '方法调整']

const loadResearchDataset = async () => {
  researchLoading.value = true
  researchError.value = false
  try {
    const module = await import('@/data/us-index-research.json')
    usIndexResearch.value = module.default as UsIndexResearchDataset
    const prices = usIndexResearch.value.monthlySeries[0]?.prices ?? []
    const latestDate = prices[prices.length - 1]?.date
    if (latestDate) {
      dcaEndDate.value = latestDate
      performanceEndDate.value = latestDate
    }
  } catch (error) {
    researchError.value = true
    console.warn('Core asset research data failed to load:', error)
  } finally {
    researchLoading.value = false
  }
}
const loadDailyDataset = async () => {
  if (!usIndexResearch.value.datasetVersion || dailyLoading.value || dailyReady.value) return
  dailyLoading.value = true
  dailyError.value = false
  try {
    const module = await import('@/data/us-index-daily.json')
    const dataset = module.default as UsIndexDailyDataset
    if (dataset.datasetVersion !== usIndexResearch.value.datasetVersion)
      throw new Error('US index overview and daily dataset versions do not match')
    dailyResearch.value = dataset
  } catch (error) {
    dailyError.value = true
    console.warn('US index daily data failed to load:', error)
  } finally {
    dailyLoading.value = false
  }
}
watch([activeSection, () => usIndexResearch.value.datasetVersion], ([section, version]) => {
  if (section === 'dca' && version) void loadDailyDataset()
})
onMounted(loadResearchDataset)
</script>

<template>
  <main class="us-index-page">
    <ResearchPageHeader
      eyebrow="CORE ASSET RESEARCH WORKBENCH"
      title="四类核心资产研究台"
      description="用同一套历史口径比较科技成长、美国大盘、黄金与比特币，并立即试算自己的定投方案。"
    >
      <template v-if="usIndexResearch.generatedAt" #status>
        <DataUpdateStatus
          :updated-at="usIndexResearch.generatedAt"
          schedule="usIndexes"
          :as-of-date="latestMarketDate"
          :source-label="usIndexResearch.source.marketData"
          :quality="usIndexResearch.status"
        />
      </template>
    </ResearchPageHeader>

    <AsyncDataState
      :loading="researchLoading"
      :error="researchError"
      loading-label="正在载入四资产历史数据…"
      error-message="四资产历史数据暂时无法载入；当前页面不会使用不完整数据生成收益结论。"
      :retry-label="t('ui.app.retry')"
      @retry="loadResearchDataset"
    />

    <section class="asset-strip" aria-label="四资产区间速览">
      <button
        v-for="asset in assetCards"
        :key="asset.id"
        :class="['asset-card', asset.tone, { active: dcaProduct === asset.id }]"
        :aria-pressed="dcaProduct === asset.id"
        @click="dcaProduct = asset.id"
      >
        <span><i></i>{{ asset.role }}</span>
        <div>
          <strong>{{ asset.label }}</strong
          ><b :class="{ negative: asset.returnPct < 0 }"
            >{{ asset.returnPct >= 0 ? '+' : '' }}{{ asset.returnPct }}%</b
          >
        </div>
        <small>{{ performanceStartDate }} 至今 · 费率 {{ asset.fee }}</small>
      </button>
    </section>

    <nav class="section-nav" aria-label="美国核心指数研究章节">
      <div>
        <small>主要任务</small
        ><button
          v-for="section in primarySections"
          :key="section.id"
          :class="{ active: activeSection === section.id }"
          :aria-pressed="activeSection === section.id"
          @click="activeSection = section.id"
        >
          {{ section.label }}
        </button>
      </div>
      <div>
        <small>深入研究</small
        ><button
          v-for="section in researchSections"
          :key="section.id"
          :class="{ active: activeSection === section.id }"
          :aria-pressed="activeSection === section.id"
          @click="activeSection = section.id"
        >
          {{ section.label }}
        </button>
      </div>
    </nav>

    <section v-if="activeSection === 'compare'" class="section-stack">
      <article class="definition-note">
        <b>先分清对象</b>
        <p>
          <strong>QQQ</strong> 是 ETF，有
          {{ qqqOfficialProfile?.expenseRatioPct ?? qqqProfile.expenseRatioPct }}%
          总费率、NAV、市场价格和跟踪误差；<strong>S&amp;P 500</strong>
          是指数，本身不能直接买入，也没有基金费率；本站定投与收益比较使用官方数据中的 SPY
          作为可交易代理，其当前毛费率为 {{ spyOfficialProfile?.expenseRatioPct ?? '—' }}%。
        </p>
      </article>

      <div class="profile-grid">
        <article class="profile qqq-card">
          <div class="profile-title"><span>ETF · QQQ</span><b>纳斯达克大型非金融公司</b></div>
          <h2>Invesco QQQ</h2>
          <p>被动追踪 Nasdaq-100，但基金实际回报还会受到费用、现金、申赎和交易摩擦影响。</p>
          <dl>
            <div>
              <dt>成立</dt>
              <dd>{{ qqqOfficialProfile?.inceptionDate ?? qqqProfile.inceptionDate }}</dd>
            </div>
            <div>
              <dt>总费率</dt>
              <dd>{{ qqqOfficialProfile?.expenseRatioPct ?? qqqProfile.expenseRatioPct }}%</dd>
            </div>
            <div>
              <dt>ETF 持仓证券</dt>
              <dd>{{ qqqOfficialProfile?.holdingsCount ?? '—' }}</dd>
            </div>
            <div>
              <dt>ETF 净资产</dt>
              <dd>{{ formatFundAssets(qqqOfficialProfile?.totalNetAssetsUsd) }}</dd>
            </div>
            <div>
              <dt>最大证券</dt>
              <dd>{{ qqqLargestCurrentPct.toFixed(2) }}%</dd>
            </div>
            <div>
              <dt>产品概况截至</dt>
              <dd>{{ qqqOfficialProfile?.sourceAsOfDate ?? '—' }}</dd>
            </div>
          </dl>
          <a
            :href="qqqOfficialProfile?.sourceUrl ?? usIndexSources.qqqHome"
            target="_blank"
            rel="noopener noreferrer"
            >Invesco 官方资料 ↗</a
          >
        </article>
        <article class="profile sp-card">
          <div class="profile-title">
            <span>INDEX + ETF PROXY</span><b>指数研究 · SPY 执行代理</b>
          </div>
          <h2>S&amp;P 500 / SPY</h2>
          <p>
            由委员会从合资格美国公司中选择，并按自由流通市值加权；不是机械选取市值最大的 500 家。
          </p>
          <dl>
            <div>
              <dt>正式发布</dt>
              <dd>{{ sp500Profile.inceptionDate }}</dd>
            </div>
            <div>
              <dt>SPY 成立</dt>
              <dd>{{ spyOfficialProfile?.inceptionDate ?? '—' }}</dd>
            </div>
            <div>
              <dt>SPY 毛费率</dt>
              <dd>{{ spyOfficialProfile?.expenseRatioPct ?? '—' }}%</dd>
            </div>
            <div>
              <dt>SPY 持仓证券</dt>
              <dd>{{ spyOfficialProfile?.holdingsCount ?? '—' }}</dd>
            </div>
            <div>
              <dt>SPY 管理规模</dt>
              <dd>{{ formatFundAssets(spyOfficialProfile?.totalNetAssetsUsd) }}</dd>
            </div>
            <div>
              <dt>最大证券</dt>
              <dd>{{ sp500LargestCurrentPct.toFixed(2) }}%</dd>
            </div>
          </dl>
          <a
            :href="spyOfficialProfile?.sourceUrl ?? usIndexSources.sp500"
            target="_blank"
            rel="noopener noreferrer"
            >State Street SPY 官方资料 ↗</a
          >
        </article>
      </div>

      <section class="panel concentration-panel">
        <div class="panel-heading">
          <div>
            <small>CONCENTRATION</small>
            <h2>巨头集中度</h2>
          </div>
          <span>官方自动快照</span>
        </div>
        <div class="concentration-grid">
          <article>
            <div>
              <b>QQQ / Nasdaq-100</b><strong>{{ qqqTop10CurrentPct }}%</strong>
            </div>
            <i><span :style="{ width: `${qqqTop10CurrentPct}%` }"></span></i>
            <p>前十大 · {{ qqqCurrentArchive?.holdingsAsOfDate ?? qqqProfile.holdingsAsOfDate }}</p>
          </article>
          <article>
            <div>
              <b>S&amp;P 500</b><strong>{{ sp500Top10CurrentPct }}%</strong>
            </div>
            <i><span :style="{ width: `${sp500Top10CurrentPct}%` }"></span></i>
            <p>
              前十大 · {{ sp500CurrentArchive?.holdingsAsOfDate ?? sp500Profile.holdingsAsOfDate }}
            </p>
          </article>
        </div>
        <p class="callout">
          QQQ 的前十大集中度高约
          <b>{{ comparison.concentrationDifferencePctPoints.toFixed(1) }} 个百分点</b
          >，科技行业权重高约
          <b>{{ comparison.technologyDifferencePctPoints.toFixed(1) }} 个百分点</b>。由于日期及
          产品分类/GICS 口径不同，这里只用于结构判断，不是严格的同日归因。
        </p>
      </section>

      <section class="panel matrix-panel">
        <div class="panel-heading">
          <div>
            <small>INDEX BLUEPRINT</small>
            <h2>规则决定暴露</h2>
          </div>
        </div>
        <div class="comparison-table">
          <div class="head"><span>维度</span><b>QQQ / Nasdaq-100</b><b>S&amp;P 500</b></div>
          <div>
            <span>选择入口</span>
            <p>{{ qqqProfile.selection }}</p>
            <p>{{ sp500Profile.selection }}</p>
          </div>
          <div>
            <span>权重</span>
            <p>{{ qqqProfile.weighting }}</p>
            <p>{{ sp500Profile.weighting }}</p>
          </div>
          <div>
            <span>调整</span>
            <p>{{ qqqProfile.review }}</p>
            <p>{{ sp500Profile.review }}</p>
          </div>
          <div>
            <span>行业分类</span>
            <p>{{ qqqProfile.sectorSystem }}</p>
            <p>{{ sp500Profile.sectorSystem }}</p>
          </div>
          <div>
            <span>主要偏向</span>
            <p>科技与可选消费；排除金融公司</p>
            <p>覆盖 11 个 GICS 行业，仍由大型科技公司主导</p>
          </div>
        </div>
      </section>
    </section>

    <section v-else-if="activeSection === 'history'" class="section-stack">
      <div class="section-intro">
        <div>
          <small>TIMELINE</small>
          <h2>指数与产品的关键转折</h2>
        </div>
        <p>切换对象后只保留对应历史；“共同事件”会同时显示。</p>
      </div>
      <div class="control-row">
        <div class="index-switch">
          <button
            :class="{ active: activeIndex === 'qqq' }"
            :aria-pressed="activeIndex === 'qqq'"
            @click="activeIndex = 'qqq'"
          >
            QQQ / Nasdaq-100</button
          ><button
            :class="{ active: activeIndex === 'sp500' }"
            :aria-pressed="activeIndex === 'sp500'"
            @click="activeIndex = 'sp500'"
          >
            S&amp;P 500
          </button>
        </div>
        <div class="filter-row">
          <button
            v-for="filter in filters"
            :key="filter"
            :class="{ active: timelineFilter === filter }"
            :aria-pressed="timelineFilter === filter"
            @click="timelineFilter = filter"
          >
            {{ filter }}
          </button>
        </div>
      </div>
      <div class="timeline">
        <article
          v-for="item in visibleMilestones"
          :key="`${item.year}-${item.title}`"
          :class="{ turning: item.isTurningPoint }"
        >
          <div class="year">
            <strong>{{ item.year }}</strong
            ><span>{{ item.kind }}</span>
          </div>
          <div>
            <div class="event-title">
              <h3>{{ item.title }}</h3>
              <b v-if="item.isTurningPoint">关键转折</b>
            </div>
            <p>{{ item.summary }}</p>
            <div class="impact"><small>长期影响</small>{{ item.impact }}</div>
            <a :href="item.sourceUrl" target="_blank" rel="noopener noreferrer">官方依据 ↗</a>
          </div>
        </article>
      </div>
    </section>

    <section v-else-if="activeSection === 'holdings'" class="section-stack">
      <div class="section-intro">
        <div>
          <small>CONSTITUENTS</small>
          <h2>成分与行业拆解</h2>
        </div>
        <p>证券行不等于公司数：Alphabet A/C 等多股权类别需要分别显示、合并理解风险。</p>
      </div>
      <div class="index-switch large">
        <button
          :class="{ active: activeIndex === 'qqq' }"
          :aria-pressed="activeIndex === 'qqq'"
          @click="activeIndex = 'qqq'"
        >
          QQQ / Nasdaq-100</button
        ><button
          :class="{ active: activeIndex === 'sp500' }"
          :aria-pressed="activeIndex === 'sp500'"
          @click="activeIndex = 'sp500'"
        >
          S&amp;P 500
        </button>
      </div>
      <div class="snapshot-banner">
        <div>
          <small>当前对象</small><strong>{{ activeProfile.name }}</strong>
        </div>
        <div>
          <small>持仓截点</small><strong>{{ activeHoldingsAsOfDate }}</strong>
        </div>
        <div>
          <small>前十大合计</small><strong>{{ activeTop10WeightPct }}%</strong>
        </div>
        <div>
          <small>行业数据截至</small><strong>{{ activeSectorAsOfDate }}</strong>
        </div>
      </div>
      <div class="holdings-layout">
        <section class="panel sector-panel">
          <div class="panel-heading">
            <div>
              <small>SECTORS</small>
              <h2>行业权重</h2>
            </div>
            <a
              v-if="activeLeaderArchive"
              :href="activeLeaderArchive.sectorSourceUrl"
              target="_blank"
              rel="noopener noreferrer"
              >{{ activeSectorSystem }} ↗</a
            >
            <span v-else>{{ activeSectorSystem }}</span>
          </div>
          <div class="sector-bars">
            <div v-for="sector in activeSectors" :key="sector[0]">
              <span>{{ sector[0] }}</span
              ><i><b :style="{ width: `${sector[1]}%` }"></b></i><strong>{{ sector[1] }}%</strong>
            </div>
          </div>
        </section>
        <section class="panel holdings-panel">
          <div class="panel-heading">
            <div>
              <small>TOP 10</small>
              <h2>前十大证券</h2>
            </div>
            <span>{{ activeHoldingsAsOfDate }}</span>
          </div>
          <div class="holding-list">
            <article v-for="holding in activeHoldings" :key="holding.rank">
              <em>{{ holding.rank }}</em>
              <div>
                <strong>{{ holding.name }}</strong
                ><small>{{ holding.ticker }} · {{ holding.sector }}</small>
              </div>
              <b>{{
                holding.weightPct === null ? '未逐只公开' : `${holding.weightPct.toFixed(1)}%`
              }}</b>
            </article>
          </div>
          <p v-if="activeLeaderArchive" class="note">
            当前名单与权重来自自动锁定的官方基金持仓快照；行业标签未包含在该归档源中，因此不使用旧分类回填。
          </p>
          <p v-else class="note">自动归档不可用时才显示内置参考快照，并明确保留其原始截止日期。</p>
        </section>
      </div>
    </section>

    <section v-else-if="activeSection === 'performance'" class="section-stack">
      <div class="section-intro">
        <div>
          <small>NORMALIZED RETURN</small>
          <h2>四类核心资产收益对比</h2>
        </div>
        <p>QQQ、SPY、GLD 使用复权收盘价，比特币使用美元现货参考价；按自然月末取样并统一为 100。</p>
      </div>
      <div class="performance-controls">
        <label>开始日期<input v-model="performanceStartDate" type="date" min="2014-09-17" /></label>
        <label>结束日期<input v-model="performanceEndDate" type="date" /></label>
        <button @click="performanceStartDate = '2020-01-01'">2020 至今</button>
        <button @click="performanceStartDate = '2024-01-01'">近年</button>
      </div>
      <div class="decision-grid">
        <section class="panel performance-panel">
          <EChart :option="performanceOption" label="QQQ、标普500、黄金和比特币归一化收益率图" />
        </section>
        <aside class="panel quick-calc">
          <div>
            <small>QUICK DCA</small>
            <h2>快速定投试算</h2>
          </div>
          <div class="asset-pills">
            <button
              v-for="asset in assetCards"
              :key="asset.id"
              :class="{ active: dcaProduct === asset.id }"
              :aria-pressed="dcaProduct === asset.id"
              @click="dcaProduct = asset.id"
            >
              {{ asset.label }}
            </button>
          </div>
          <label>每月投入（USD）<input v-model.number="dcaAmount" type="number" min="1" /></label>
          <label>开始日期<input v-model="dcaStartDate" type="date" /></label>
          <div v-if="dcaResult" class="quick-result">
            <small>历史模拟期末资产</small
            ><strong>${{ dcaResult.endingValue.toLocaleString() }}</strong>
            <span :class="{ positive: dcaResult.gain >= 0 }"
              >投入 ${{ dcaResult.totalContributed.toLocaleString() }} ·
              {{ dcaResult.totalReturnPct >= 0 ? '+' : '' }}{{ dcaResult.totalReturnPct }}%</span
            >
          </div>
          <button class="detail-action" @click="activeSection = 'dca'">打开完整计算器 →</button>
          <p>完整计算器打开后按需加载日线；交易费、平台费和股息税设置会同步应用。</p>
        </aside>
      </div>
      <article class="definition-note">
        <b>比较口径</b>
        <p>
          图中 120 表示相对共同起点累计上涨 20%。ETF
          采用复权价格近似含分红总回报；比特币没有现金分红。每项资产取各自然月最后一个有效报价，避免把
          BTC 周末波动与 ETF 休市旧价格当作同步变化。
        </p>
      </article>
    </section>

    <section v-else-if="activeSection === 'leaders'" class="section-stack">
      <div class="section-intro">
        <div>
          <small>LEADER FOLLOWING</small>
          <h2>每期重仓龙头跟踪</h2>
        </div>
        <p>默认比较 Top 5 等权组合与对应 ETF 总回报；名单只使用当期已发布并归档的官方快照。</p>
      </div>
      <template v-if="activeLeaderArchive && latestLeaderSnapshot">
        <div class="index-switch large">
          <button
            :class="{ active: activeIndex === 'qqq' }"
            :aria-pressed="activeIndex === 'qqq'"
            @click="activeIndex = 'qqq'"
          >
            QQQ 官方持仓
          </button>
          <button
            :class="{ active: activeIndex === 'sp500' }"
            :aria-pressed="activeIndex === 'sp500'"
            @click="activeIndex = 'sp500'"
          >
            SPY 官方持仓
          </button>
        </div>
        <div class="snapshot-banner leader-snapshot-banner">
          <div>
            <small>归档月份</small><strong>{{ latestLeaderSnapshot.period }}</strong>
          </div>
          <div>
            <small>官方持仓截至</small><strong>{{ activeLeaderArchive.holdingsAsOfDate }}</strong>
          </div>
          <div>
            <small>前五合计权重</small
            ><strong
              >{{
                activeLeaderArchive.leaders
                  .slice(0, 5)
                  .reduce((sum, leader) => sum + leader.weightPct, 0)
                  .toFixed(2)
              }}%</strong
            >
          </div>
          <div><small>归档状态</small><strong>已锁定</strong></div>
        </div>
        <section class="panel table-panel leader-archive-table">
          <div class="panel-heading">
            <div>
              <small>PROSPECTIVE ARCHIVE</small>
              <h2>当期前十大重仓</h2>
            </div>
            <a :href="activeLeaderArchive.sourceUrl" target="_blank" rel="noopener noreferrer"
              >官方持仓源 ↗</a
            >
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>代码</th>
                  <th>公司</th>
                  <th class="number">当期权重</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="leader in activeLeaderArchive.leaders" :key="leader.ticker">
                  <td>{{ leader.rank }}</td>
                  <td>
                    <strong>{{ leader.ticker }}</strong>
                  </td>
                  <td>{{ leader.name }}</td>
                  <td class="number">{{ leader.weightPct.toFixed(2) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
      <template v-if="activeLeaderSummary">
        <div class="metric-grid leader-evidence-metrics">
          <article>
            <small>完整持有期</small><strong>{{ activeLeaderSummary.periods }}</strong
            ><span>Top 5 等权</span>
          </article>
          <article>
            <small>跑赢期数</small><strong>{{ activeLeaderSummary.wins }}</strong
            ><span>胜率 {{ activeLeaderSummary.winRatePct }}%</span>
          </article>
          <article>
            <small>龙头组合累计</small
            ><strong
              >{{ activeLeaderSummary.leaderReturnPct >= 0 ? '+' : ''
              }}{{ activeLeaderSummary.leaderReturnPct }}%</strong
            ><span>扣除往返成本</span>
          </article>
          <article>
            <small>{{ activeIndex === 'qqq' ? 'QQQ' : 'SPY' }} 累计</small
            ><strong
              >{{ activeLeaderSummary.benchmarkReturnPct >= 0 ? '+' : ''
              }}{{ activeLeaderSummary.benchmarkReturnPct }}%</strong
            ><span
              >超额 {{ activeLeaderSummary.excessReturnPctPoints >= 0 ? '+' : ''
              }}{{ activeLeaderSummary.excessReturnPctPoints }} 个百分点</span
            >
          </article>
        </div>
        <section class="panel table-panel leader-archive-table">
          <div class="panel-heading">
            <div>
              <small>CLOSED PERIODS</small>
              <h2>逐期对照</h2>
            </div>
            <span>Top 5 等权 · 含息复权</span>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>归档期</th>
                  <th>实际持有区间</th>
                  <th>龙头组合</th>
                  <th class="number">龙头净回报</th>
                  <th class="number">指数净回报</th>
                  <th class="number">超额</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="period in activeLeaderEvidence"
                  :key="`${period.fromPeriod}-${period.toPeriod}`"
                >
                  <td>{{ period.fromPeriod }} → {{ period.toPeriod }}</td>
                  <td>{{ period.startDate }} → {{ period.endDate }}</td>
                  <td>{{ period.strategy.leaderTickers.join(' · ') }}</td>
                  <td class="number">
                    {{ period.strategy.netReturnPct >= 0 ? '+' : ''
                    }}{{ period.strategy.netReturnPct }}%
                  </td>
                  <td class="number">
                    {{ period.strategy.benchmarkNetReturnPct >= 0 ? '+' : ''
                    }}{{ period.strategy.benchmarkNetReturnPct }}%
                  </td>
                  <td class="number">
                    {{ period.strategy.excessReturnPctPoints >= 0 ? '+' : ''
                    }}{{ period.strategy.excessReturnPctPoints }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
      <article class="panel pending-panel">
        <span>PROSPECTIVE TRACKING</span>
        <h2>
          {{
            activeLeaderSummary
              ? '已有初步逐期结果，样本仍不足以下长期结论'
              : usIndexResearch.leaderSnapshots.length
                ? '归档已启动，尚不足以判断是否跑赢'
                : '尚不足以判断“跟买龙头”是否跑赢指数'
          }}
        </h2>
        <p>
          当前可复演的官方月度快照为
          <b>{{ usIndexResearch.leaderSnapshots.length }}</b>
          期。至少需要两个连续快照才能形成一个完整持有期；
          系统不会用今天的成分名单回填过去，以避免前视偏差和幸存者偏差。少于 12
          个完整月度持有期时只展示观察结果，不输出“长期跑赢”结论。
        </p>
        <div class="research-rules">
          <b>未来每期输出</b><span>Top 1 / 3 / 5 / 10</span><span>等权 / 官方权重</span
          ><span>月末 / 季末</span><span>含息总回报</span><span>超额收益与胜出期比例</span>
        </div>
      </article>
      <article class="definition-note">
        <b>判定规则</b>
        <p>
          每月首次成功抓取的官方持仓会立即锁定；从归档后的下一共同收盘价持有至下期归档前的最后共同收盘价。龙头与
          QQQ/SPY 均使用复权收盘价，并统一扣除 0.20%
          往返成本假设。任一证券缺少共同交易区间时整期不可用，不用局部样本补齐。
        </p>
      </article>
    </section>

    <section v-else-if="activeSection === 'dca'" class="section-stack">
      <div class="section-intro">
        <div>
          <small>DOLLAR-COST AVERAGING</small>
          <h2>四资产定投计算器</h2>
        </div>
        <p>
          标普500和黄金分别使用 SPY、GLD 代理，比特币使用 BTC-USD 参考现货；ETF
          计算包含现金分红与拆股事件。
        </p>
      </div>
      <AsyncDataState
        :loading="dailyLoading"
        :error="dailyError"
        loading-label="正在按需载入完整日线数据…"
        error-message="完整日线数据暂时无法载入；为避免版本混用，计算器不会使用旧数据生成结果。"
        :retry-label="t('ui.app.retry')"
        @retry="loadDailyDataset"
      />
      <div v-if="dailyReady" class="calculator-layout">
        <form class="panel calculator-form" @submit.prevent>
          <label
            >产品<select v-model="dcaProduct">
              <option value="qqq">QQQ · Nasdaq-100</option>
              <option value="spy">SPY · S&amp;P 500</option>
              <option value="gld">GLD · 黄金</option>
              <option value="btc">BTC-USD · 比特币</option>
            </select></label
          >
          <article v-if="dcaProduct === 'gld' && gldOfficialProfile" class="product-cost-note">
            <b>GLD 官方产品快照</b>
            <span>
              毛费率 {{ gldOfficialProfile.expenseRatioPct }}% · 净资产
              {{ formatFundAssets(gldOfficialProfile.totalNetAssetsUsd) }} · 实物黄金
              {{ gldOfficialProfile.goldHoldingsTonnes?.toLocaleString() }} 吨
            </span>
            <small>黄金持仓截至 {{ gldOfficialProfile.goldHoldingsAsOfDate }}</small>
          </article>
          <article v-else-if="dcaProduct === 'btc'" class="product-cost-note btc-cost-note">
            <b>BTC-USD 是现货参考价格，不是零成本产品</b>
            <span>请按实际平台填写买卖交易费、价差/滑点代理及年化托管或平台费。</span>
            <small>链上转账费、汇率成本和税务仍需另行评估。</small>
          </article>
          <label>开始日期<input v-model="dcaStartDate" type="date" /></label>
          <label>结束日期<input v-model="dcaEndDate" type="date" /></label>
          <label
            >每月投入（USD）<input v-model.number="dcaAmount" type="number" min="1" step="1"
          /></label>
          <label>每月日期<input v-model.number="dcaDay" type="number" min="1" max="31" /></label>
          <label
            >非交易日<select v-model="dcaExecution">
              <option value="next-trading-day">顺延下一交易日</option>
              <option value="previous-trading-day">前移上一交易日</option>
            </select></label
          >
          <label
            >成交价<select v-model="dcaPrice">
              <option value="close">收盘价</option>
              <option value="open">开盘价</option>
            </select></label
          >
          <label class="check"><input v-model="dcaReinvest" type="checkbox" /> 分红再投资</label>
          <div class="form-divider"><b>个人成本假设</b><span>按自己的券商和税务情况填写</span></div>
          <label
            >每次买入费率（%）<input
              v-model.number="dcaPurchaseFeePct"
              type="number"
              min="0"
              max="99"
              step="0.01"
          /></label>
          <label
            >每次固定费用（USD）<input
              v-model.number="dcaPurchaseFeeFixed"
              type="number"
              min="0"
              :max="Math.max(0, dcaAmount - 0.01)"
              step="0.01"
          /></label>
          <label
            >额外年化托管/平台费（%）<input
              v-model.number="dcaAnnualCustodyFeePct"
              type="number"
              min="0"
              max="99"
              step="0.01"
          /></label>
          <label
            >现金股息税率（%）<input
              v-model.number="dcaDividendTaxPct"
              type="number"
              min="0"
              max="100"
              step="0.1"
          /></label>
          <label
            >期末卖出费率（%）<input
              v-model.number="dcaLiquidationFeePct"
              type="number"
              min="0"
              max="99"
              step="0.01"
          /></label>
          <p v-if="isZeroFrictionBtc" class="zero-friction-warning">
            当前 BTC 为零摩擦情景，只适合观察价格路径；这不代表真实买卖与托管成本为零。
          </p>
        </form>
        <section class="panel results-panel">
          <template v-if="dcaResult">
            <div class="result-hero">
              <small>{{ dcaLiquidationFeePct > 0 ? '预估清仓后资产' : '期末资产' }}</small
              ><strong>${{ dcaResult.endingValue.toLocaleString() }}</strong
              ><span :class="{ positive: dcaResult.gain >= 0 }"
                >{{ dcaResult.gain >= 0 ? '+' : '' }}${{ dcaResult.gain.toLocaleString() }} ·
                {{ dcaResult.totalReturnPct }}%</span
              >
            </div>
            <dl>
              <div>
                <dt>总投入</dt>
                <dd>${{ dcaResult.totalContributed.toLocaleString() }}</dd>
              </div>
              <div>
                <dt>实际买入金额</dt>
                <dd>${{ dcaResult.totalInvested.toLocaleString() }}</dd>
              </div>
              <div>
                <dt>资金加权年化</dt>
                <dd>
                  {{
                    dcaResult.annualizedMoneyWeightedReturnPct === null
                      ? '—'
                      : `${dcaResult.annualizedMoneyWeightedReturnPct}%`
                  }}
                </dd>
              </div>
              <div>
                <dt>执行次数</dt>
                <dd>{{ dcaResult.purchases.length }}</dd>
              </div>
              <div>
                <dt>累计份额</dt>
                <dd>{{ dcaResult.shares }}</dd>
              </div>
              <div>
                <dt>买入交易费</dt>
                <dd>${{ dcaResult.totalPurchaseFees.toLocaleString() }}</dd>
              </div>
              <div>
                <dt>托管/平台费</dt>
                <dd>${{ dcaResult.totalCustodyFees.toLocaleString() }}</dd>
              </div>
              <div>
                <dt>税前分红</dt>
                <dd>${{ dcaResult.grossDividends.toLocaleString() }}</dd>
              </div>
              <div>
                <dt>股息税</dt>
                <dd>${{ dcaResult.dividendTaxes.toLocaleString() }}</dd>
              </div>
              <div>
                <dt>{{ dcaReinvest ? '税后再投资分红' : '税后现金分红' }}</dt>
                <dd>
                  ${{
                    (dcaReinvest
                      ? dcaResult.reinvestedDividends
                      : dcaResult.cashDividends
                    ).toLocaleString()
                  }}
                </dd>
              </div>
              <div>
                <dt>预估卖出费</dt>
                <dd>${{ dcaResult.estimatedLiquidationFee.toLocaleString() }}</dd>
              </div>
              <div>
                <dt>产品年费率</dt>
                <dd>{{ dcaResult.annualExpenseRatioPct }}%</dd>
              </div>
              <div>
                <dt>估算已内含费用</dt>
                <dd>≈ ${{ dcaResult.estimatedEmbeddedExpense.toLocaleString() }}</dd>
              </div>
            </dl>
          </template>
          <p v-else class="invalid-result">所选日期或金额无法计算，请检查输入范围。</p>
        </section>
      </div>
      <section v-if="dcaComparison" class="panel table-panel dca-comparison-panel">
        <div class="panel-heading">
          <div>
            <small>SAME CASH-FLOW COMPARISON</small>
            <h2>同一方案的四资产结果</h2>
          </div>
          <span>{{ dcaComparison.commonStartDate }} → {{ dcaComparison.commonEndDate }}</span>
        </div>
        <p v-if="!dcaComparison.comparableCashFlows" class="comparison-warning">
          因交易日差异，各资产实际执行期数不同，本表不进行优劣排名。
        </p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>资产</th>
                <th class="number">投入</th>
                <th class="number">期末资产</th>
                <th class="number">总回报</th>
                <th class="number">资金加权年化</th>
                <th class="number">额外费用与税</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in dcaComparison.results" :key="item.id">
                <td>
                  <strong>{{ dcaAssetLabel(item.id) }}</strong>
                </td>
                <td class="number">${{ item.result.totalContributed.toLocaleString() }}</td>
                <td class="number">${{ item.result.endingValue.toLocaleString() }}</td>
                <td class="number" :class="{ positive: item.result.totalReturnPct >= 0 }">
                  {{ item.result.totalReturnPct >= 0 ? '+' : '' }}{{ item.result.totalReturnPct }}%
                </td>
                <td class="number">
                  {{
                    item.result.annualizedMoneyWeightedReturnPct === null
                      ? '—'
                      : `${item.result.annualizedMoneyWeightedReturnPct}%`
                  }}
                </td>
                <td class="number">
                  ${{
                    (
                      item.result.totalPurchaseFees +
                      item.result.totalCustodyFees +
                      item.result.dividendTaxes +
                      item.result.estimatedLiquidationFee
                    ).toLocaleString()
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="note">
          为避免成立日期偏差，四项都从共同可用日线起点开始；个人费用参数保持一致，产品自身费率已反映在历史价格中，不重复扣除。
        </p>
      </section>
      <section v-if="dcaResult" class="panel table-panel dca-ledger-panel">
        <div class="panel-heading">
          <div>
            <small>EXECUTION LEDGER</small>
            <h2>逐笔定投明细</h2>
          </div>
          <button type="button" class="ledger-download" @click="downloadDcaCsv">
            下载完整 CSV
          </button>
        </div>
        <p class="note">
          页面展示最近 {{ recentDcaPurchases.length }} 笔，共 {{ dcaResult.purchases.length }}
          笔；CSV 包含完整汇总、实际成交日、投入、费用、成交价格和份额。
        </p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>实际成交日</th>
                <th class="number">当期投入</th>
                <th class="number">实际买入</th>
                <th class="number">交易费</th>
                <th class="number">成交价</th>
                <th class="number">买入份额</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(purchase, index) in recentDcaPurchases"
                :key="`${purchase.date}-${index}`"
              >
                <td>{{ purchase.date }}</td>
                <td class="number">${{ purchase.amount.toLocaleString() }}</td>
                <td class="number">${{ purchase.investedAmount.toLocaleString() }}</td>
                <td class="number">${{ purchase.transactionFee.toLocaleString() }}</td>
                <td class="number">${{ purchase.price.toLocaleString() }}</td>
                <td class="number">{{ purchase.shares.toFixed(6) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <article class="definition-note">
        <b>费用与收益口径</b>
        <p>
          每月投入被视为包含买入费用的总预算，交易费先扣除，余额才购买份额；分红先扣除用户填写的税率，再进入现金或再投资。期末卖出费仅作为清仓情景扣除。“总收益率”是期末盈亏除以累计投入，“资金加权年化”则考虑每笔投入的实际日期。QQQ、SPY
          和 GLD
          的历史价格已经反映基金日常费用，因此产品费率不会重复扣除；“估算已内含费用”只用于理解成本量级。“额外年化托管/平台费”会按实际持有天数持续扣减份额，适用于交易所、托管人或投顾另收的费用。BTC-USD
          没有基金费率，不能据此理解为零成本；买卖价差与滑点可保守并入交易费率。汇率、链上转账费和个人资本利得税仍未计入。
        </p>
      </article>
      <p class="data-stamp">
        行情更新：{{ usIndexResearch.generatedAt.slice(0, 10) }} · 数据源 Yahoo Finance（非官方）·
        自动任务失败时保留上一份有效快照
      </p>
    </section>

    <section v-else class="section-stack methodology">
      <div class="section-intro">
        <div>
          <small>READ BEFORE USE</small>
          <h2>构建规则与研究边界</h2>
        </div>
        <p>指数名称、ETF 产品、价格指数和总回报指数是不同对象。</p>
      </div>
      <div class="method-grid">
        <article>
          <b>01</b>
          <div>
            <h3>QQQ 不等于 Nasdaq-100</h3>
            <p>QQQ 持有证券并在交易所交易；0.18% 费率、NAV、价差和跟踪误差属于 ETF，不属于指数。</p>
          </div>
        </article>
        <article>
          <b>02</b>
          <div>
            <h3>S&amp;P 500 不是基金</h3>
            <p>SPX 是指数，本身不能直接买入。SPY、VOO、IVV 等跟踪产品有各自费用和交易特征。</p>
          </div>
        </article>
        <article>
          <b>03</b>
          <div>
            <h3>“100”与“500”不是固定证券行数</h3>
            <p>多股权类别和 Fast Entry 可令证券行数高于目标公司数；同一公司风险应合并观察。</p>
          </div>
        </article>
        <article>
          <b>04</b>
          <div>
            <h3>行业数据不能机械比较</h3>
            <p>
              Nasdaq-100 使用 ICB，S&amp;P 500 使用 GICS；本页快照日期也不同，只能说明结构差异。
            </p>
          </div>
        </article>
        <article>
          <b>05</b>
          <div>
            <h3>权重变化不等于主动交易</h3>
            <p>
              市值加权指数会随价格、股份、公司行动和重构变化，不能把权重上升直接描述成“基金经理加仓”。
            </p>
          </div>
        </article>
        <article>
          <b>06</b>
          <div>
            <h3>回报口径必须一致</h3>
            <p>价格指数不包含股息再投资，总回报指数包含股息；历史回报也不构成未来收益承诺。</p>
          </div>
        </article>
      </div>
      <article class="sources-panel">
        <h2>官方资料</h2>
        <a :href="usIndexSources.qqqHome" target="_blank" rel="noopener noreferrer">Invesco QQQ ↗</a
        ><a :href="usIndexSources.nasdaqMethodology" target="_blank" rel="noopener noreferrer"
          >Nasdaq-100 方法 ↗</a
        ><a :href="usIndexSources.nasdaqSnapshot" target="_blank" rel="noopener noreferrer"
          >Nasdaq 官方快照 ↗</a
        ><a :href="usIndexSources.sp500" target="_blank" rel="noopener noreferrer">S&amp;P 500 ↗</a
        ><a :href="usIndexSources.sp500Methodology" target="_blank" rel="noopener noreferrer"
          >S&amp;P 美国指数方法 ↗</a
        >
      </article>
    </section>
  </main>
</template>

<style scoped>
.us-index-page {
  max-width: var(--content-workbench);
  margin: 0 auto;
  padding: 32px var(--page-gutter) 72px;
  color: var(--ink);
}
.hero {
  min-height: 118px;
  padding: 26px 30px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background:
    radial-gradient(circle at 86% 18%, rgb(80 126 198 / 30%), transparent 28%),
    linear-gradient(135deg, #101c30, #172942 55%, #243650);
  color: #f5f8fc;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 28px;
  align-items: center;
  overflow: hidden;
}
.eyebrow,
.panel-heading small,
.section-intro small {
  margin: 0;
  color: #92b7e9;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
}
.hero h1 {
  margin: 8px 0;
  font:
    700 clamp(28px, 4vw, 44px)/1.1 Georgia,
    serif;
}
.hero h1 i {
  color: #87aee1;
  font-size: 0.36em;
  font-weight: 400;
}
.lead {
  max-width: 760px;
  margin: 0;
  color: rgb(255 255 255 / 72%);
  font-size: 14px;
  line-height: 1.9;
}
.hero-status {
  min-width: 130px;
  padding-left: 24px;
  border-left: 1px solid rgb(255 255 255 / 16%);
}
.hero-status span,
.hero-status small {
  display: block;
  color: rgb(255 255 255 / 56%);
  font-size: 9px;
}
.hero-status b {
  display: block;
  margin: 7px 0;
  color: #76d4a4;
  font-size: 12px;
}
.asset-strip {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
.asset-card {
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--surface);
  color: var(--ink);
  text-align: left;
  cursor: pointer;
}
.asset-card.active {
  border-color: var(--asset-color);
  box-shadow: inset 0 0 0 1px var(--asset-color);
}
.asset-card.purple {
  --asset-color: #7357d8;
}
.asset-card.blue {
  --asset-color: #3b82b8;
}
.asset-card.gold {
  --asset-color: #d29b35;
}
.asset-card.orange {
  --asset-color: #d76b41;
}
.asset-card > span,
.asset-card small {
  color: var(--muted);
  font-size: 8px;
}
.asset-card i {
  width: 7px;
  height: 7px;
  margin-right: 6px;
  border-radius: 50%;
  background: var(--asset-color);
  display: inline-block;
}
.asset-card div {
  margin: 8px 0 5px;
  display: flex;
  justify-content: space-between;
}
.asset-card strong {
  font-size: 16px;
}
.asset-card b {
  color: #26865c;
  font-size: 12px;
}
.asset-card b.negative {
  color: #b05050;
}
.section-nav {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  position: sticky;
  top: 0;
  z-index: 5;
}
.section-nav > div {
  display: flex;
  gap: 3px;
  align-items: center;
}
.section-nav > div > small {
  margin: 0 7px;
  color: var(--muted);
  font-size: 8px;
}
.section-nav {
  margin: 14px 0 30px;
  padding: 5px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}
.section-nav button,
.index-switch button,
.filter-row button {
  border: 0;
  border-radius: 7px;
  padding: 9px 14px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 11px;
}
.section-nav button.active,
.index-switch button.active,
.filter-row button.active {
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 700;
}
.section-stack {
  display: grid;
  gap: 22px;
}
.definition-note {
  padding: 20px 24px;
  border-left: 3px solid var(--accent);
  background: var(--accent-soft);
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 18px;
}
.definition-note b {
  color: var(--accent);
  font-size: 11px;
}
.definition-note p {
  margin: 0;
  font-size: 12px;
  line-height: 1.8;
}
.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}
.profile {
  padding: 28px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  position: relative;
  overflow: hidden;
}
.profile::after {
  content: '';
  width: 120px;
  height: 120px;
  border-radius: 50%;
  position: absolute;
  right: -45px;
  top: -45px;
  background: var(--accent-soft);
}
.profile-title {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  position: relative;
  z-index: 1;
}
.profile-title span {
  color: var(--accent);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
}
.profile-title b {
  color: var(--muted);
  font-size: 9px;
}
.profile h2 {
  margin: 22px 0 8px;
  font:
    700 30px Georgia,
    serif;
}
.profile > p {
  min-height: 48px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.7;
}
.profile dl {
  margin: 22px 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.profile dl div {
  padding: 13px;
  border-radius: 8px;
  background: var(--surface-soft);
}
.profile dt,
.profile dd {
  margin: 0;
}
.profile dt {
  color: var(--muted);
  font-size: 8px;
}
.profile dd {
  margin-top: 5px;
  font-size: 12px;
  font-weight: 700;
}
.profile a,
.timeline a,
.sources-panel a {
  color: var(--accent);
  font-size: 9px;
}
.panel {
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  min-width: 0;
}
.panel-heading {
  margin-bottom: 22px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: end;
}
.panel-heading h2,
.section-intro h2 {
  margin: 5px 0 0;
  font-size: 19px;
}
.panel-heading > span {
  color: var(--muted);
  font-size: 9px;
}
.concentration-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}
.concentration-grid article > div {
  display: flex;
  justify-content: space-between;
}
.concentration-grid b {
  font-size: 11px;
}
.concentration-grid strong {
  font:
    700 24px Georgia,
    serif;
}
.concentration-grid i {
  height: 10px;
  margin: 12px 0 8px;
  border-radius: 8px;
  background: var(--surface-soft);
  display: block;
  overflow: hidden;
}
.concentration-grid i span {
  height: 100%;
  display: block;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent), #73a4df);
}
.concentration-grid p {
  margin: 0;
  color: var(--muted);
  font-size: 9px;
}
.callout {
  margin: 24px 0 0;
  padding: 16px 18px;
  border-radius: 8px;
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 10px;
  line-height: 1.8;
}
.callout b {
  color: var(--ink);
}
.comparison-table {
  display: grid;
}
.comparison-table > div {
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
  display: grid;
  grid-template-columns: 130px repeat(2, minmax(0, 1fr));
  gap: 22px;
  align-items: start;
}
.comparison-table .head {
  color: var(--muted);
  font-size: 9px;
}
.comparison-table span {
  font-size: 10px;
  font-weight: 700;
}
.comparison-table p {
  margin: 0;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.6;
}
.section-intro {
  display: flex;
  justify-content: space-between;
  gap: 30px;
  align-items: end;
}
.section-intro > p {
  max-width: 570px;
  margin: 0;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.7;
}
.control-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.index-switch,
.filter-row {
  padding: 4px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  display: inline-flex;
  gap: 3px;
}
.index-switch.large {
  justify-self: start;
}
.timeline {
  display: grid;
  gap: 10px;
}
.timeline article {
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 24px;
}
.timeline article.turning {
  border-left: 3px solid var(--accent);
}
.year strong {
  display: block;
  font:
    700 23px Georgia,
    serif;
}
.year span {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 7px;
  border-radius: 4px;
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 8px;
}
.event-title {
  display: flex;
  gap: 10px;
  align-items: center;
}
.event-title h3 {
  margin: 0;
  font-size: 14px;
}
.event-title b {
  padding: 3px 7px;
  border-radius: 4px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 8px;
}
.timeline p {
  margin: 8px 0;
  color: var(--muted);
  font-size: 11px;
}
.impact {
  margin: 12px 0;
  font-size: 11px;
  line-height: 1.7;
}
.impact small {
  margin-right: 10px;
  color: var(--accent);
  font-weight: 700;
}
.snapshot-banner {
  padding: 18px 22px;
  border-radius: 12px;
  background: linear-gradient(90deg, var(--accent-soft), var(--surface));
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}
.snapshot-banner small,
.snapshot-banner strong {
  display: block;
}
.snapshot-banner small {
  color: var(--muted);
  font-size: 8px;
}
.snapshot-banner strong {
  margin-top: 5px;
  font-size: 12px;
}
.leader-archive-table,
.dca-comparison-panel,
.dca-ledger-panel {
  overflow: hidden;
}
.leader-archive-table .table-wrap,
.dca-comparison-panel .table-wrap,
.dca-ledger-panel .table-wrap {
  overflow-x: auto;
}
.leader-archive-table table,
.dca-comparison-panel table,
.dca-ledger-panel table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
}
.leader-archive-table th,
.leader-archive-table td,
.dca-comparison-panel th,
.dca-comparison-panel td,
.dca-ledger-panel th,
.dca-ledger-panel td {
  padding: 10px 8px;
  border-bottom: 1px solid var(--border);
  text-align: left;
}
.leader-archive-table th,
.dca-comparison-panel th,
.dca-ledger-panel th {
  color: var(--muted);
  font-size: 8px;
  font-weight: 600;
}
.leader-archive-table .number,
.dca-comparison-panel .number,
.dca-ledger-panel .number {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.dca-comparison-panel .positive {
  color: #26865c;
}
.dca-ledger-panel table {
  min-width: 680px;
}
.comparison-warning {
  margin: 0 0 14px;
  color: #b36a2e;
  font-size: 9px;
}
.ledger-download {
  padding: 8px 12px;
  border: 1px solid var(--accent);
  border-radius: 7px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
}
.holdings-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
  gap: 22px;
}
.sector-bars {
  display: grid;
  gap: 10px;
}
.sector-bars > div {
  display: grid;
  grid-template-columns: 105px 1fr 42px;
  gap: 10px;
  align-items: center;
  font-size: 10px;
}
.sector-bars i {
  height: 6px;
  border-radius: 6px;
  background: var(--surface-soft);
  overflow: hidden;
}
.sector-bars i b {
  height: 100%;
  display: block;
  background: var(--accent);
}
.sector-bars strong {
  text-align: right;
}
.holding-list {
  display: grid;
}
.holding-list article {
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  display: grid;
  grid-template-columns: 26px 1fr 82px;
  gap: 10px;
  align-items: center;
}
.holding-list em {
  color: var(--muted);
  font:
    italic 12px Georgia,
    serif;
}
.holding-list strong,
.holding-list small {
  display: block;
}
.holding-list strong {
  font-size: 11px;
}
.holding-list small {
  margin-top: 3px;
  color: var(--muted);
  font-size: 8px;
}
.holding-list > article > b {
  text-align: right;
  font-size: 10px;
}
.note {
  margin: 16px 0 0;
  color: var(--muted);
  font-size: 9px;
  line-height: 1.7;
}
.method-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.method-grid article {
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  display: flex;
  gap: 18px;
}
.method-grid article > b {
  color: var(--accent);
  font:
    700 24px Georgia,
    serif;
}
.method-grid h3 {
  margin: 2px 0 8px;
  font-size: 13px;
}
.method-grid p {
  margin: 0;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.8;
}
.sources-panel {
  padding: 24px;
  border-radius: 12px;
  background: var(--surface-soft);
  display: flex;
  flex-wrap: wrap;
  gap: 12px 22px;
  align-items: center;
}
.sources-panel h2 {
  width: 100%;
  margin: 0 0 4px;
  font-size: 15px;
}
.pending-panel span,
.data-stamp {
  color: var(--muted);
  font-size: 9px;
}
.pending-panel h2 {
  margin: 10px 0;
  font-size: 22px;
}
.pending-panel p {
  max-width: 820px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.8;
}
.research-rules {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.research-rules b,
.research-rules span {
  padding: 7px 10px;
  border-radius: 6px;
  background: var(--surface-soft);
  font-size: 9px;
}
.research-rules b {
  background: var(--accent-soft);
  color: var(--accent);
}
.calculator-layout {
  display: grid;
  grid-template-columns: minmax(300px, 0.72fr) minmax(0, 1.28fr);
  gap: 22px;
}
.calculator-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.calculator-form label {
  color: var(--muted);
  font-size: 9px;
}
.calculator-form input,
.calculator-form select {
  width: 100%;
  margin-top: 6px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
  color: var(--ink);
  box-sizing: border-box;
}
.calculator-form .check {
  display: flex;
  gap: 8px;
  align-items: center;
}
.calculator-form .check input {
  width: auto;
  margin: 0;
}
.form-divider {
  grid-column: 1 / -1;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}
.form-divider b,
.form-divider span {
  display: block;
}
.form-divider b {
  color: var(--ink);
  font-size: 11px;
}
.form-divider span {
  margin-top: 4px;
  color: var(--muted);
  font-size: 8px;
}
.product-cost-note,
.zero-friction-warning {
  grid-column: 1 / -1;
}
.product-cost-note {
  padding: 12px 14px;
  border: 1px solid color-mix(in srgb, var(--accent) 28%, var(--border));
  border-radius: 8px;
  background: var(--accent-soft);
}
.product-cost-note b,
.product-cost-note span,
.product-cost-note small {
  display: block;
}
.product-cost-note b {
  color: var(--accent);
  font-size: 10px;
}
.product-cost-note span {
  margin-top: 5px;
  font-size: 9px;
  line-height: 1.6;
}
.product-cost-note small {
  margin-top: 3px;
  color: var(--muted);
  font-size: 8px;
}
.zero-friction-warning {
  margin: 0;
  padding: 10px 12px;
  border-left: 3px solid var(--warning, #d29b35);
  background: color-mix(in srgb, #d29b35 10%, transparent);
  color: var(--muted);
  font-size: 9px;
  line-height: 1.6;
}
.result-hero {
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}
.result-hero small,
.result-hero strong,
.result-hero span {
  display: block;
}
.result-hero small {
  color: var(--muted);
  font-size: 9px;
}
.result-hero strong {
  margin: 8px 0;
  font:
    700 36px Georgia,
    serif;
}
.result-hero span {
  color: #b05050;
  font-size: 11px;
}
.result-hero span.positive {
  color: #26865c;
}
.results-panel dl {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.results-panel dl div {
  padding: 12px;
  border-radius: 8px;
  background: var(--surface-soft);
}
.results-panel dt,
.results-panel dd {
  margin: 0;
}
.results-panel dt {
  color: var(--muted);
  font-size: 8px;
}
.results-panel dd {
  margin-top: 6px;
  font-size: 11px;
  font-weight: 700;
}
.invalid-result {
  color: var(--muted);
  font-size: 11px;
}
.data-stamp {
  margin: -8px 0 0;
}
.performance-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: end;
}
.performance-controls label {
  color: var(--muted);
  font-size: 9px;
}
.performance-controls input,
.performance-controls button {
  margin-top: 5px;
  padding: 9px 11px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface);
  color: var(--ink);
}
.performance-controls label input {
  display: block;
}
.performance-controls button {
  cursor: pointer;
  color: var(--accent);
}
.performance-panel {
  height: 470px;
  padding: 16px;
}
.decision-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 310px;
  gap: 16px;
}
.quick-calc {
  display: grid;
  align-content: start;
  gap: 15px;
}
.quick-calc h2 {
  margin: 4px 0 0;
  font-size: 18px;
}
.quick-calc > div > small,
.quick-result small {
  color: var(--muted);
  font-size: 8px;
  letter-spacing: 0.1em;
}
.asset-pills {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
}
.asset-pills button,
.detail-action {
  min-height: 36px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
  color: var(--muted);
  cursor: pointer;
}
.asset-pills button.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 700;
}
.quick-calc label {
  color: var(--muted);
  font-size: 9px;
}
.quick-calc input {
  width: 100%;
  margin-top: 6px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
  color: var(--ink);
  box-sizing: border-box;
}
.quick-result {
  padding: 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--accent-soft), var(--surface-soft));
}
.quick-result strong,
.quick-result span {
  display: block;
}
.quick-result strong {
  margin: 8px 0;
  font:
    700 28px Georgia,
    serif;
}
.quick-result span {
  color: #b05050;
  font-size: 9px;
}
.quick-result span.positive {
  color: #26865c;
}
.detail-action {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}
.quick-calc > p {
  margin: 0;
  color: var(--muted);
  font-size: 8px;
  line-height: 1.6;
}
@media (max-width: 1000px) {
  .hero {
    grid-template-columns: 1fr;
  }
  .profile-grid,
  .holdings-layout,
  .calculator-layout {
    grid-template-columns: 1fr;
  }
  .decision-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 720px) {
  .us-index-page {
    padding: 16px 13px 50px;
  }
  .hero {
    padding: 28px 22px;
  }
  .asset-strip,
  .profile-grid,
  .concentration-grid,
  .method-grid {
    grid-template-columns: 1fr;
  }
  .calculator-form,
  .results-panel dl {
    grid-template-columns: 1fr;
  }
  .performance-panel {
    height: 390px;
    padding: 8px;
  }
  .section-nav {
    width: 100%;
    overflow-x: auto;
    display: block;
  }
  .section-nav > div {
    width: max-content;
  }
  .section-nav > div + div {
    margin-top: 4px;
  }
  .asset-strip {
    grid-template-columns: repeat(4, minmax(150px, 1fr));
    overflow-x: auto;
    padding-bottom: 4px;
  }
  .hero-status {
    padding: 14px 0 0;
    border-top: 1px solid rgb(255 255 255 / 16%);
    border-left: 0;
  }
  .section-nav button {
    flex: 0 0 auto;
  }
  .definition-note {
    grid-template-columns: 1fr;
  }
  .section-intro {
    display: block;
  }
  .section-intro > p {
    margin-top: 10px;
  }
  .comparison-table {
    overflow-x: auto;
  }
  .comparison-table > div {
    min-width: 650px;
  }
  .snapshot-banner {
    grid-template-columns: repeat(2, 1fr);
  }
  .timeline article {
    grid-template-columns: 76px 1fr;
    gap: 12px;
  }
  .event-title {
    align-items: flex-start;
    flex-direction: column;
  }
  .sector-bars > div {
    grid-template-columns: 90px 1fr 38px;
  }
}
</style>
