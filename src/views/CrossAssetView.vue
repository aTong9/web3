<script setup lang="ts">
import { computed, ref } from 'vue'
import EChart from '@/components/EChart.vue'
import crossAssetData from '@/data/cross-asset.json'
import marketNewsData from '@/data/market-news.json'
import type {
  CrossAssetCategory,
  CrossAssetDataset,
  CrossAssetItem,
  MarketNewsDataset,
} from '@/types'

const dataset = crossAssetData as CrossAssetDataset
const newsDataset = marketNewsData as MarketNewsDataset
const activeCategory = ref<'all' | CrossAssetCategory>('all')
const chainStatus = ref<'all' | 'confirming' | 'diverging' | 'dormant' | 'context' | 'unavailable'>(
  'all',
)
const selectedBriefId = ref(dataset.marketBrief.markets[0]?.id ?? 'sp500')

const categoryNames: Record<CrossAssetCategory, string> = {
  stocks: '股票',
  bonds: '债券',
  fx: '外汇',
  commodities: '大宗商品',
  crypto: '加密货币',
  macro: '宏观流动性',
}
const periods = [
  ['day', '日'],
  ['week', '周'],
  ['month', '月'],
  ['quarter', '季度'],
  ['yearToDate', '今年'],
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
          ? `直接涉及${targets[0]}`
          : directAssets.length
            ? `二级关联${directAssets.join('、')}`
            : categoryMatch
              ? `匹配${article.category}主题`
              : '全市场紧急事件',
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
const biasNames = { bullish: '偏多', bearish: '偏空', neutral: '中性' } as const
const confidenceNames = { low: '低置信度', medium: '中置信度' } as const
const formatNewsAge = (hours: number) =>
  hours < 1
    ? '1小时内'
    : hours < 24
      ? `${Math.round(hours)}小时前`
      : `${Math.round(hours / 24)}天前`
const chainStatusNames = {
  confirming: '当前确认',
  diverging: '当前背离',
  dormant: '低相关/休眠',
  context: '情景依赖',
  unavailable: '数据不足',
} as const
const stabilityNames = {
  stable: '跨周期稳定',
  mixed: '周期分歧',
  insufficient: '样本/强度不足',
} as const
const evidenceNames = {
  strong: '强证据',
  supported: '有支持',
  uncertain: '区间跨零',
} as const
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
const formatChange = (value: number | null, mode: CrossAssetItem['mode'] = 'return') => {
  if (value === null) return '—'
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}${mode === 'difference' ? 'bp' : mode === 'absolute' ? '点' : '%'}`
}
const valueClass = (value: number | null) => ({
  positive: value !== null && value > 0,
  negative: value !== null && value < 0,
})
const matrixNames = computed(() => dataset.matrix.ids.map((id) => assetById(id)?.name ?? id))
const heatmapOption = computed(() => ({
  animation: false,
  tooltip: {
    formatter: (params: { value: [number, number, number] }) =>
      `相关系数：${params.value[2].toFixed(2)}`,
  },
  grid: { left: 116, right: 24, top: 76, bottom: 28 },
  xAxis: {
    type: 'category',
    data: matrixNames.value,
    position: 'top',
    axisLabel: { rotate: 38, fontSize: 10 },
    splitArea: { show: true },
  },
  yAxis: {
    type: 'category',
    data: matrixNames.value,
    axisLabel: { fontSize: 10 },
    splitArea: { show: true },
  },
  visualMap: {
    min: -1,
    max: 1,
    orient: 'horizontal',
    left: 'center',
    top: 4,
    inRange: { color: ['#a44d3f', '#f5f1e9', '#1d7459'] },
    text: ['同向', '反向'],
    textStyle: { fontSize: 9 },
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
    axisLabel: { formatter: '{value}%', fontSize: 9 },
    splitLine: { lineStyle: { color: '#e5e5df' } },
  },
  yAxis: {
    type: 'category',
    data: performanceAssets.map((id) => assetById(id)?.name),
    axisLabel: { fontSize: 10 },
  },
  series: [
    {
      type: 'bar',
      data: performanceAssets.map((id) => {
        const value = assetById(id)?.changes.month ?? 0
        return { value, itemStyle: { color: value >= 0 ? '#b45043' : '#28765d' } }
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
const formatUpdatedAt = (value: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
</script>

<template>
  <main class="dashboard-page">
    <header class="page-heading">
      <div>
        <p>Cross-asset regime monitor · 多资产联动</p>
        <h1>跨资产市场驾驶舱</h1>
        <span>先看资产之间如何传导，再看单一市场涨跌。</span>
      </div>
      <a :href="dataset.sourceUrl" target="_blank" rel="noopener noreferrer" class="freshness">
        <i></i
        ><span
          ><strong>交易日自动更新</strong
          ><small>{{ formatUpdatedAt(dataset.updatedAt) }} · 数据来源 ↗</small></span
        >
      </a>
    </header>

    <section class="chains-section top-chains">
      <header class="section-heading">
        <div>
          <span>01</span>
          <h2>市场传导链</h2>
        </div>
        <p>{{ dataset.transmissionChains.length }}条核心规则 · 当前实测会确认、背离或休眠</p>
      </header>
      <div class="daily-brief">
        <header>
          <div>
            <span>DAILY MARKET BRIEF · {{ dataset.marketBrief.asOfDate }}</span>
            <h3>{{ dataset.marketBrief.regime.title }}</h3>
            <p>{{ dataset.marketBrief.regime.summary }}</p>
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
          </div>
          <small>{{ dataset.marketBrief.disclaimer }}</small>
        </header>
        <div class="movers">
          <div>
            <b>领涨</b>
            <span v-for="market in dataset.marketBrief.leaders" :key="market.id">
              {{ market.name }} <em>+{{ market.move?.toFixed(2) }}%</em>
            </span>
          </div>
          <div>
            <b>领跌</b>
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
            <span>最近交易日归因</span>
            <h4>{{ selectedBrief.dailySummary }}</h4>
            <ul>
              <li
                v-for="driver in selectedBrief.drivers"
                :key="driver.chain"
                :class="driver.effect"
              >
                {{ driver.text }}
              </li>
              <li v-if="!selectedBrief.drivers.length">没有足够强的跨资产线索，不强行归因。</li>
            </ul>
            <div class="event-catalysts">
              <b>{{
                selectedBrief.dailyAttribution.alignment === 'diverging'
                  ? '共振解释缺口 · 优先核对事件'
                  : '候选事件催化剂'
              }}</b>
              <small>按资产、主题、影响等级与新鲜度排序；候选事件不是已证明的上涨/下跌原因。</small>
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
                      ? '紧急'
                      : article.impact === 'high'
                        ? '高影响'
                        : '中影响'
                  }}
                  · {{ article.source }} · 匹配{{ article.matchScore }} ·
                  {{ article.matchReason }} · {{ formatNewsAge(article.ageHours) }}</span
                >
                <strong
                  >{{ article.translatedTitle ? '译文：' : ''
                  }}{{ article.translatedTitle ?? article.title }}</strong
                >
                <em v-if="article.translatedTitle">原文核对：{{ article.title }}</em>
              </a>
              <p v-if="!selectedCatalysts.length">当前没有匹配的中高影响快讯。</p>
            </div>
          </div>
          <div class="brief-outlook">
            <span>{{ selectedBrief.outlook.horizon }}情景展望</span>
            <div>
              <strong :class="selectedBrief.outlook.bias">
                {{ biasNames[selectedBrief.outlook.bias] }}
              </strong>
              <em>
                {{ confidenceNames[selectedBrief.outlook.confidence] }} · 得分
                {{ selectedBrief.outlook.score.toFixed(2) }}
                · 标准化动量 5日
                {{ selectedBrief.outlook.momentumSignals.week.toFixed(2) }} / 1月
                {{ selectedBrief.outlook.momentumSignals.month.toFixed(2) }}
              </em>
              <small class="probability-summary">
                训练条件上涨概率
                {{ selectedBrief.outlook.probability.upProbabilityPct.toFixed(1) }}%（95%
                {{ selectedBrief.outlook.probability.intervalPct.low?.toFixed(1) ?? '—' }}–{{
                  selectedBrief.outlook.probability.intervalPct.high?.toFixed(1) ?? '—'
                }}%）· 留出Brier技能
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
                    ? '状态内概率'
                    : '样本不足，使用全状态概率'
                }}
              </small>
            </div>
            <div class="backtest-line">
              <b>历史方向检验</b>
              <span>
                {{ selectedBrief.outlook.backtest.samples }}个样本 ·
                {{ selectedBrief.outlook.backtest.directionalAccuracyPct?.toFixed(1) ?? '—' }}%
                （95% [{{
                  selectedBrief.outlook.backtest.accuracyIntervalPct.low?.toFixed(1) ?? '—'
                }},
                {{ selectedBrief.outlook.backtest.accuracyIntervalPct.high?.toFixed(1) ?? '—' }}]）
              </span>
              <span>
                真实运行账本（{{ selectedBrief.outlook.liveEvaluation.modelVersion }}）：已保存
                {{ selectedBrief.outlook.liveEvaluation.totalSnapshots }}期 · 已到期
                {{ selectedBrief.outlook.liveEvaluation.resolvedSamples }}期
                <template v-if="selectedBrief.outlook.liveEvaluation.resolvedSamples">
                  · 方向样本 {{ selectedBrief.outlook.liveEvaluation.directionalSamples }}期 · 命中
                  {{
                    selectedBrief.outlook.liveEvaluation.directionalAccuracyPct?.toFixed(1) ?? '—'
                  }}% · Brier
                  {{ selectedBrief.outlook.liveEvaluation.brierScore?.toFixed(4) ?? '—' }} · 截至
                  {{ selectedBrief.outlook.liveEvaluation.latestOutcomeDate }}</template
                ><template v-else> · 满5个后续观测日后自动结算</template>
              </span>
              <span>
                动量基线
                {{ selectedBrief.outlook.backtest.baselineAccuracyPct?.toFixed(1) ?? '—' }}% · 增量
                {{
                  selectedBrief.outlook.backtest.liftPct === null
                    ? '—'
                    : `${selectedBrief.outlook.backtest.liftPct > 0 ? '+' : ''}${selectedBrief.outlook.backtest.liftPct.toFixed(1)}%`
                }}
              </span>
              <span>
                多数方向基线
                {{ selectedBrief.outlook.backtest.majorityBaselineAccuracyPct?.toFixed(1) ?? '—' }}%
                · 相对最佳基线增量
                {{
                  selectedBrief.outlook.backtest.liftVsBestBaselinePct === null
                    ? '—'
                    : `${selectedBrief.outlook.backtest.liftVsBestBaselinePct > 0 ? '+' : ''}${selectedBrief.outlook.backtest.liftVsBestBaselinePct.toFixed(1)}%`
                }}
              </span>
              <span>
                选定规则 {{ selectedBrief.outlook.backtest.selectivity.selectedRule.name }}（5日/{{
                  selectedBrief.outlook.backtest.selectivity.selectedRule.weekWeight.toFixed(2)
                }}、1月/{{
                  selectedBrief.outlook.backtest.selectivity.selectedRule.monthWeight.toFixed(2)
                }}、跨资产/{{
                  selectedBrief.outlook.backtest.selectivity.selectedRule.driverWeight.toFixed(2)
                }}）· 门槛 ±{{
                  selectedBrief.outlook.backtest.selectivity.selectedThreshold.toFixed(2)
                }}
                · 训练95%保守优势
                {{
                  selectedBrief.outlook.backtest.selectivity.selectedConservativeEdgePct === null
                    ? '—'
                    : `${selectedBrief.outlook.backtest.selectivity.selectedConservativeEdgePct > 0 ? '+' : ''}${selectedBrief.outlook.backtest.selectivity.selectedConservativeEdgePct.toFixed(1)}%`
                }}
                · 留出期覆盖
                {{
                  selectedBrief.outlook.backtest.selectivity.validationCoveragePct?.toFixed(1) ??
                  '—'
                }}%
              </span>
              <span>
                跨资产驱动消融：完整模型
                {{
                  selectedBrief.outlook.backtest.selectivity.driverAblation.fullAccuracyPct?.toFixed(
                    1,
                  ) ?? '—'
                }}% · 纯动量
                {{
                  selectedBrief.outlook.backtest.selectivity.driverAblation.momentumOnlyAccuracyPct?.toFixed(
                    1,
                  ) ?? '—'
                }}% · 配对胜负
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
                    ? '选中纯动量规则'
                    : selectedBrief.outlook.backtest.selectivity.driverAblation.allowed
                      ? '允许跨资产贡献进入评分'
                      : '未证明增量，跨资产贡献已归零'
                }}
              </span>
              <span>
                训练强信号 {{ selectedBrief.outlook.backtest.selectivity.training.samples }}个 ·
                命中
                {{
                  selectedBrief.outlook.backtest.selectivity.training.directionalAccuracyPct?.toFixed(
                    1,
                  ) ?? '—'
                }}% · 相对最佳基线
                {{
                  selectedBrief.outlook.backtest.selectivity.training.liftVsBestBaselinePct === null
                    ? '—'
                    : `${selectedBrief.outlook.backtest.selectivity.training.liftVsBestBaselinePct > 0 ? '+' : ''}${selectedBrief.outlook.backtest.selectivity.training.liftVsBestBaselinePct.toFixed(1)}%`
                }}
              </span>
              <span>
                留出强信号 {{ selectedBrief.outlook.backtest.selectivity.validation.samples }}个 ·
                命中
                {{
                  selectedBrief.outlook.backtest.selectivity.validation.directionalAccuracyPct?.toFixed(
                    1,
                  ) ?? '—'
                }}% · 相对最佳基线
                {{
                  selectedBrief.outlook.backtest.selectivity.validation.liftVsBestBaselinePct ===
                  null
                    ? '—'
                    : `${selectedBrief.outlook.backtest.selectivity.validation.liftVsBestBaselinePct > 0 ? '+' : ''}${selectedBrief.outlook.backtest.selectivity.validation.liftVsBestBaselinePct.toFixed(1)}%`
                }}
              </span>
              <span>
                当前宏观状态：{{ selectedBrief.outlook.backtest.selectivity.macroRegime.name }} ·
                状态内留出样本
                {{ selectedBrief.outlook.backtest.selectivity.macroRegime.validation.samples }}个 ·
                命中
                {{
                  selectedBrief.outlook.backtest.selectivity.macroRegime.validation.directionalAccuracyPct?.toFixed(
                    1,
                  ) ?? '—'
                }}% · 相对最佳基线
                {{
                  selectedBrief.outlook.backtest.selectivity.macroRegime.validation
                    .liftVsBestBaselinePct === null
                    ? '—'
                    : `${selectedBrief.outlook.backtest.selectivity.macroRegime.validation.liftVsBestBaselinePct > 0 ? '+' : ''}${selectedBrief.outlook.backtest.selectivity.macroRegime.validation.liftVsBestBaselinePct.toFixed(1)}%`
                }}
              </span>
              <span>
                规则共识
                {{ selectedBrief.outlook.consensus.aligned }}/{{
                  selectedBrief.outlook.consensus.total
                }}
                （{{ selectedBrief.outlook.consensus.pct?.toFixed(0) ?? '—' }}%）
              </span>
              <span>
                {{ selectedBrief.outlook.backtest.regime }}
                {{ selectedBrief.outlook.backtest.regimeSamples }}样本 · 增量
                {{
                  selectedBrief.outlook.backtest.regimeLiftPct === null
                    ? '—'
                    : `${selectedBrief.outlook.backtest.regimeLiftPct > 0 ? '+' : ''}${selectedBrief.outlook.backtest.regimeLiftPct.toFixed(1)}%`
                }}
              </span>
              <span>
                留出验证 {{ selectedBrief.outlook.backtest.validation.samples }}样本 · 命中
                {{
                  selectedBrief.outlook.backtest.validation.directionalAccuracyPct?.toFixed(1) ??
                  '—'
                }}% · 相对最佳基线增量
                {{
                  selectedBrief.outlook.backtest.validation.liftVsBestBaselinePct === null
                    ? '—'
                    : `${selectedBrief.outlook.backtest.validation.liftVsBestBaselinePct > 0 ? '+' : ''}${selectedBrief.outlook.backtest.validation.liftVsBestBaselinePct.toFixed(1)}%`
                }}
              </span>
              <small>{{ selectedBrief.outlook.backtest.note }}</small>
            </div>
            <div
              class="direction-gate"
              :class="{ passed: selectedBrief.outlook.directionGate.eligible }"
            >
              <b
                >方向闸门：{{ selectedBrief.outlook.directionGate.eligible ? '通过' : '未通过' }}</b
              >
              <span v-if="selectedBrief.outlook.directionGate.eligible">
                样本、命中率与相对基线增量均达到最低门槛。
              </span>
              <span v-for="reason in selectedBrief.outlook.directionGate.reasons" :key="reason">
                {{ reason }}
              </span>
            </div>
            <div v-if="selectedBrief.outlook.scenario" class="scenario-range">
              <b>同方向历史情景</b>
              <span>
                {{
                  selectedBrief.outlook.scenario.direction === 'bullish' ? '历史偏多' : '历史偏空'
                }}
                {{ selectedBrief.outlook.scenario.samples }}次 · 命中率
                {{ selectedBrief.outlook.scenario.directionalAccuracyPct?.toFixed(1) ?? '—' }}%
              </span>
              <span>
                未来5日中位收益
                {{ selectedBrief.outlook.scenario.medianReturnPct?.toFixed(2) ?? '—' }}% · 25%–75%
                [{{ selectedBrief.outlook.scenario.q25ReturnPct?.toFixed(2) ?? '—' }}%,
                {{ selectedBrief.outlook.scenario.q75ReturnPct?.toFixed(2) ?? '—' }}%]
              </span>
              <small> 这是历史条件分布，不是保证区间；方向闸门未通过时仅作参考。 </small>
            </div>
            <b>支持理由</b>
            <ul>
              <li v-for="reason in selectedBrief.outlook.reasons" :key="reason">{{ reason }}</li>
            </ul>
            <b>反向风险</b>
            <ul class="risks">
              <li v-for="risk in selectedBrief.outlook.risks" :key="risk">{{ risk }}</li>
            </ul>
          </div>
        </article>
        <footer>{{ dataset.marketBrief.methodology }}</footer>
      </div>
      <div class="chain-filters">
        <button :class="{ active: chainStatus === 'all' }" @click="chainStatus = 'all'">
          全部
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
        <article v-for="chain in visibleChains" :key="chain.title">
          <header>
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
          </header>
          <div class="steps">
            <template v-for="(step, index) in chain.steps" :key="step"
              ><span>{{ step }}</span
              ><b v-if="index < chain.steps.length - 1">→</b></template
            >
          </div>
          <div class="chain-windows">
            <span>20日 {{ chain.windows.short?.toFixed(2) ?? '—' }}</span>
            <span>60日 {{ chain.windows.medium?.toFixed(2) ?? '—' }}</span>
            <span>120日 {{ chain.windows.long?.toFixed(2) ?? '—' }}</span>
            <b :class="chain.stability">
              {{ stabilityNames[chain.stability] }}{{ chain.regimeShift ? ' · 结构突变' : '' }}
            </b>
            <b :class="`evidence-${chain.evidence}`">
              {{ evidenceNames[chain.evidence] }} · 60日95% [{{
                chain.statistics.medium.ciLow?.toFixed(2) ?? '—'
              }}, {{ chain.statistics.medium.ciHigh?.toFixed(2) ?? '—' }}] · 120日95% [{{
                chain.statistics.long.ciLow?.toFixed(2) ?? '—'
              }}, {{ chain.statistics.long.ciHigh?.toFixed(2) ?? '—' }}]
            </b>
            <b :class="`evidence-${chain.predictive.evidence}`">
              领先5日（非重叠） ρ={{ chain.predictive.value?.toFixed(2) ?? '—' }} · n={{
                chain.predictive.samples
              }}
              · FDR q={{ chain.predictive.qValue?.toFixed(3) ?? '—' }} · 95% [{{
                chain.predictive.ciLow?.toFixed(2) ?? '—'
              }}, {{ chain.predictive.ciHigh?.toFixed(2) ?? '—' }}]
            </b>
            <b :class="`evidence-${chain.shock.evidence}`">
              上尾10%冲击{{ chain.shock.triggered ? '已触发' : '未触发' }} · n={{
                chain.shock.eventSamples
              }}
              · 后续5日上涨率增量 {{ chain.shock.liftPct?.toFixed(1) ?? '—' }}pp · FDR q={{
                chain.shock.qValue?.toFixed(3) ?? '—'
              }}
            </b>
            <b :class="`evidence-${chain.lowerShock.evidence}`">
              下尾10%冲击{{ chain.lowerShock.triggered ? '已触发' : '未触发' }} · n={{
                chain.lowerShock.eventSamples
              }}
              · 后续5日上涨率增量 {{ chain.lowerShock.liftPct?.toFixed(1) ?? '—' }}pp · FDR q={{
                chain.lowerShock.qValue?.toFixed(3) ?? '—'
              }}
            </b>
          </div>
          <p>{{ chain.interpretation }}</p>
          <a :href="chain.sourceUrl" target="_blank" rel="noopener noreferrer">
            {{ chain.sourceTitle }} ↗
          </a>
        </article>
      </div>
    </section>

    <section class="regime-strip">
      <div>
        <span>10Y–2Y曲线</span
        ><strong>{{
          curveSpread === null ? '—' : `${curveSpread > 0 ? '+' : ''}${curveSpread}bp`
        }}</strong>
      </div>
      <div>
        <span>高收益利差</span
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
          <h2>全球资产月度强弱</h2>
        </div>
        <p>用于快速识别风险偏好与轮动方向</p>
      </header>
      <div class="chart-panel"><EChart :option="performanceOption" /></div>
    </section>

    <section class="asset-section">
      <header class="section-heading">
        <div>
          <span>03</span>
          <h2>五类资产分舱</h2>
        </div>
        <p>核心标的 · 相对价格 · 相关性 · 流向状态</p>
      </header>
      <div class="tabs">
        <button :class="{ active: activeCategory === 'all' }" @click="activeCategory = 'all'">
          全部
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
          <span>核心标的</span><span>最新值</span
          ><span v-for="[, label] in periods" :key="label">{{ label }}</span
          ><span>资金流向</span>
        </div>
        <div v-for="asset in visibleAssets" :key="asset.id" class="asset-row">
          <span class="asset-name"
            ><b>{{ asset.name }}</b
            ><small
              >{{ categoryNames[asset.category] }} · 观察 {{ asset.date ?? '待更新'
              }}<template v-if="asset.availableDate && asset.availableDate !== asset.date">
                · 可用 {{ asset.availableDate }}</template
              ><template v-if="asset.stale"> · 数据过期，仅供历史研究</template></small
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
          <h2>跨资产相关性矩阵</h2>
        </div>
        <p>{{ dataset.correlationWindow }} · 日收益/收益率日变化 · 绿色同向 / 红色反向</p>
      </header>
      <div class="matrix-wrap">
        <EChart :option="heatmapOption" />
      </div>
    </section>

    <aside class="coverage-note">
      <strong>数据覆盖说明</strong>
      <ul>
        <li v-for="item in dataset.limitations" :key="item">{{ item }}</li>
      </ul>
    </aside>
  </main>
</template>

<style scoped>
.dashboard-page {
  max-width: 1320px;
  margin: 0 auto;
  padding: 58px clamp(20px, 4vw, 64px) 80px;
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
  font-size: clamp(42px, 6vw, 70px);
  font-weight: 400;
  letter-spacing: -0.045em;
}
.page-heading > div > span {
  color: var(--muted);
  font-size: 13px;
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
  margin-top: 42px;
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
  min-width: 1060px;
  padding: 13px 14px;
  border-bottom: 1px solid var(--border);
  display: grid;
  grid-template-columns: minmax(180px, 1.3fr) 145px repeat(5, 85px) minmax(190px, 1fr);
  gap: 12px;
  align-items: center;
  font-size: 12px;
}
.asset-row:last-child {
  border: 0;
}
.asset-header {
  background: #fafaf7;
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
  color: #8b621e;
}
.positive {
  color: #b33c2e;
}
.negative {
  color: #187555;
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
  background: #172019;
  color: white;
  display: flex;
  justify-content: space-between;
  gap: 24px;
}
.daily-brief > header span {
  color: #83b8a2;
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
  color: #aab5af;
  font-size: 10px;
  line-height: 1.6;
}
.daily-brief > header small {
  max-width: 290px;
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
  flex-wrap: wrap;
}
.brief-tabs button {
  padding: 6px 9px;
  border: 1px solid var(--border);
  border-radius: 5px;
  background: white;
  color: var(--muted);
  font-size: 9px;
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
  grid-template-columns: 1fr 1fr;
  gap: 28px;
}
.brief-detail > div > span {
  color: var(--muted);
  font-size: 8px;
  letter-spacing: 0.08em;
}
.brief-current h4 {
  margin: 8px 0 12px;
  font-size: 13px;
  line-height: 1.55;
}
.brief-detail ul {
  margin: 7px 0 12px;
  padding-left: 17px;
  color: var(--muted);
  font-size: 9px;
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
  font-size: 8px;
  line-height: 1.5;
}
.brief-outlook > div strong.bullish {
  background: #f3e2df;
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
  padding: 9px 10px;
  border-radius: 5px;
  background: var(--surface-soft);
  display: grid;
  grid-template-columns: auto repeat(3, 1fr);
  gap: 3px 9px;
  font-size: 9px;
}
.backtest-line span {
  color: var(--accent);
  font-weight: 700;
}
.backtest-line small {
  grid-column: 1 / -1;
  color: var(--muted);
  font-size: 8px;
}
.brief-outlook > .direction-gate {
  margin: -4px 0 13px;
  padding: 8px 10px;
  border: 1px solid #ead2ce;
  border-radius: 5px;
  background: #f8edeb;
  display: grid;
  align-items: start;
  gap: 3px;
  color: var(--danger);
  font-size: 8px;
}
.brief-outlook > .direction-gate.passed {
  border-color: #cce2d9;
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
@media (max-width: 900px) {
  .backtest-line {
    grid-template-columns: auto 1fr;
  }
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
.chain-grid article {
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
}
.chain-grid header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.chain-grid header small {
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
  background: #f3e2df;
  color: var(--danger);
}
.chain-signal em.context {
  background: #f3ead9;
  color: #86601d;
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
  background: #f3e2df;
  color: var(--danger);
}
.chain-windows b.evidence-strong,
.chain-windows b.evidence-supported {
  background: var(--accent-soft);
  color: var(--accent);
}
.chain-windows b.evidence-uncertain {
  background: #f3ead9;
  color: #86601d;
}
.chain-grid p {
  margin: 0;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.6;
}
.chain-grid article > a {
  margin-top: 12px;
  color: var(--accent);
  display: inline-block;
  font-size: 9px;
  text-decoration: none;
}
.coverage-note {
  margin-top: 42px;
  padding: 17px 20px;
  border-left: 3px solid #9a7420;
  background: #f5eee3;
  font-size: 11px;
}
.coverage-note ul {
  margin: 8px 0 0;
  padding-left: 18px;
  color: var(--muted);
  line-height: 1.8;
}
@media (max-width: 760px) {
  .page-heading,
  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .freshness {
    align-self: flex-start;
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
