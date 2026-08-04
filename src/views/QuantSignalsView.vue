<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DataUpdateStatus from '@/components/DataUpdateStatus.vue'
import { useI18n } from '@/composables/use-i18n'
import crossAssetData from '@/data/cross-asset.json'
import megaCapData from '@/data/us-megacaps.json'
import type {
  CrossAssetCategory,
  CrossAssetDataset,
  OptionCandidateAction,
  PaperSignalPosition,
  QuantAssetSignal,
  QuantOptionCandidate,
  QuantSignalLevel,
  UsMegaCapDataset,
} from '@/types'
import { buildQuantDashboard } from '@/utils/quant-signals'

type CategoryFilter = 'all' | Exclude<CrossAssetCategory, 'macro'>
type SortMode = 'score' | 'evidence'

const { locale, t } = useI18n()
const dataset = crossAssetData as CrossAssetDataset
const megaCaps = megaCapData as UsMegaCapDataset
const dashboard = buildQuantDashboard(dataset, megaCaps)
const category = ref<CategoryFilter>('all')
const sortMode = ref<SortMode>('score')
const paperPositions = ref<PaperSignalPosition[]>([])
const paperStorageKey = 'market-desk-quant-paper-signals-v1'

const categoryFilters: CategoryFilter[] = [
  'all',
  'stocks',
  'bonds',
  'fx',
  'commodities',
  'crypto',
]
const filteredAssets = computed(() =>
  dashboard.assets
    .filter((asset) => category.value === 'all' || asset.category === category.value)
    .sort((left, right) =>
      sortMode.value === 'evidence'
        ? right.evidenceScore - left.evidenceScore || right.score - left.score
        : right.score - left.score || right.evidenceScore - left.evidenceScore,
    ),
)

const formatNumber = (value: number, maximumFractionDigits = 2) =>
  value.toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN', { maximumFractionDigits })
const formatValue = (asset: QuantAssetSignal) => {
  const value = formatNumber(asset.value, Math.abs(asset.value) < 10 ? 4 : 2)
  return asset.unit === '美元' ? `$${value}` : `${value} ${asset.unit}`
}
const formatChange = (asset: QuantAssetSignal, value: number | null) =>
  value === null
    ? '—'
    : `${value > 0 ? '+' : ''}${value.toFixed(2)}${asset.mode === 'return' ? '%' : asset.mode === 'difference' ? 'bp' : ''}`
const formatDate = (value: string) =>
  new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
const formatPct = (value: number | null) =>
  value === null ? '—' : `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
const signalLabel = (signal: QuantSignalLevel) => t(`quant.signal.${signal}`)
const actionKey: Record<OptionCandidateAction, string> = {
  'long-call-candidate': 'longCallCandidate',
  'long-call-watch': 'longCallWatch',
  hold: 'hold',
  'exit-long-call': 'exitLongCall',
  avoid: 'avoid',
  unavailable: 'unavailable',
}
const actionLabel = (action: OptionCandidateAction) =>
  t(`quant.optionAction.${actionKey[action]}`)
const modelLabel = (source: QuantAssetSignal['modelSource']) =>
  t(
    `quant.model.${
      source === 'validated-horizon'
        ? 'validatedHorizon'
        : source === 'horizon-watch'
          ? 'horizonWatch'
          : 'momentumProxy'
    }`,
  )

const persistPaper = () => {
  window.localStorage.setItem(paperStorageKey, JSON.stringify(paperPositions.value))
}
const isRecorded = (candidate: QuantOptionCandidate) =>
  paperPositions.value.some(
    (position) => position.symbol === candidate.symbol && position.status === 'open',
  )
const addPaperPosition = (candidate: QuantOptionCandidate) => {
  if (candidate.price === null || isRecorded(candidate)) return
  paperPositions.value.unshift({
    id: `${candidate.symbol}-${Date.now()}`,
    symbol: candidate.symbol,
    name: candidate.name,
    action: candidate.action,
    openedAt: new Date().toISOString(),
    closedAt: null,
    entryUnderlyingPrice: candidate.price,
    exitUnderlyingPrice: null,
    forwardPe: candidate.forwardPe,
    signalScore: candidate.score,
    status: 'open',
  })
  persistPaper()
}
const currentCandidate = (symbol: string) =>
  dashboard.options.find((candidate) => candidate.symbol === symbol)
const paperReturn = (position: PaperSignalPosition) => {
  const price =
    position.status === 'closed'
      ? position.exitUnderlyingPrice
      : currentCandidate(position.symbol)?.price
  return price === null || price === undefined
    ? null
    : ((price - position.entryUnderlyingPrice) / position.entryUnderlyingPrice) * 100
}
const closePaperPosition = (position: PaperSignalPosition) => {
  const currentPrice = currentCandidate(position.symbol)?.price
  if (currentPrice === null || currentPrice === undefined) return
  position.status = 'closed'
  position.closedAt = new Date().toISOString()
  position.exitUnderlyingPrice = currentPrice
  persistPaper()
}
const removePaperPosition = (position: PaperSignalPosition) => {
  paperPositions.value = paperPositions.value.filter((item) => item.id !== position.id)
  persistPaper()
}

onMounted(() => {
  try {
    const stored = window.localStorage.getItem(paperStorageKey)
    paperPositions.value = stored ? (JSON.parse(stored) as PaperSignalPosition[]) : []
  } catch (error) {
    console.warn('Paper signal records could not be loaded:', error)
    paperPositions.value = []
  }
})
</script>

<template>
  <main class="quant-page">
    <header class="page-heading">
      <div>
        <p>{{ t('quant.badge') }}</p>
        <h1>{{ t('quant.title') }}</h1>
        <span>{{ t('quant.intro') }}</span>
        <DataUpdateStatus :updated-at="dashboard.generatedAt" schedule="crossAsset" />
      </div>
      <section class="strategy-focus" :aria-label="t('quant.configTitle')">
        <header>
          <span>{{ t('quant.configTitle') }}</span>
          <b>35x + 20%</b>
        </header>
        <dl>
          <div><dt>{{ t('quant.threshold') }}</dt><dd>{{ dashboard.config.forwardPeThreshold }}x</dd></div>
          <div><dt>{{ t('quant.buffer') }}</dt><dd>{{ dashboard.config.valuationBufferPct }}%</dd></div>
          <div><dt>{{ t('quant.risk') }}</dt><dd>{{ dashboard.config.maximumPositionRiskPct }}%</dd></div>
          <div>
            <dt>{{ t('quant.optionTemplate') }}</dt>
            <dd>
              {{
                t('quant.optionTemplateValue', {
                  min: dashboard.config.optionDteRange.min,
                  max: dashboard.config.optionDteRange.max,
                  deltaMin: dashboard.config.optionDeltaRange.min,
                  deltaMax: dashboard.config.optionDeltaRange.max,
                })
              }}
            </dd>
          </div>
        </dl>
      </section>
    </header>

    <section class="summary-strip">
      <div><span>{{ t('quant.summary.buy') }}</span><strong>{{ dashboard.summary.buyCandidates }}</strong></div>
      <div><span>{{ t('quant.summary.sell') }}</span><strong>{{ dashboard.summary.sellCandidates }}</strong></div>
      <div><span>{{ t('quant.summary.calls') }}</span><strong>{{ dashboard.summary.optionLongCallCandidates }}</strong></div>
      <div><span>{{ t('quant.summary.exits') }}</span><strong>{{ dashboard.summary.optionExitCandidates }}</strong></div>
    </section>

    <section class="section-heading">
      <div><h2>{{ t('quant.assetTitle') }}</h2><p>{{ t('quant.assetHint') }}</p></div>
      <select v-model="sortMode" :aria-label="t('quant.sort.score')">
        <option value="score">{{ t('quant.sort.score') }}</option>
        <option value="evidence">{{ t('quant.sort.evidence') }}</option>
      </select>
    </section>
    <div class="filters" role="group" :aria-label="t('quant.assetTitle')">
      <button
        v-for="item in categoryFilters"
        :key="item"
        :class="{ active: category === item }"
        @click="category = item"
      >
        {{ t(`quant.filter.${item}`) }}
      </button>
    </div>

    <section class="asset-table-wrap">
      <div class="asset-head">
        <span>{{ t('quant.columns.asset') }}</span><span>{{ t('quant.columns.price') }}</span>
        <span>{{ t('quant.columns.changes') }}</span><span>{{ t('quant.columns.score') }}</span>
        <span>{{ t('quant.columns.evidence') }}</span><span>{{ t('quant.columns.signal') }}</span>
      </div>
      <details v-for="asset in filteredAssets" :key="asset.id" class="asset-row">
        <summary>
          <span class="asset-name"><b>{{ asset.name }}</b><small>{{ modelLabel(asset.modelSource) }} · {{ asset.date }}</small></span>
          <span>{{ formatValue(asset) }}</span>
          <span>{{ formatChange(asset, asset.changes.week) }} / {{ formatChange(asset, asset.changes.month) }}</span>
          <strong :class="asset.score >= 0 ? 'positive' : 'negative'">{{ asset.score > 0 ? '+' : '' }}{{ asset.score }}</strong>
          <span class="evidence"><i :style="{ width: `${asset.evidenceScore}%` }"></i><b>{{ asset.evidenceScore }}</b></span>
          <em :class="asset.signal">{{ signalLabel(asset.signal) }}</em>
        </summary>
        <div class="asset-detail">
          <section><b>{{ t('quant.reasons') }}</b><ul><li v-for="reason in asset.reasons" :key="reason">{{ reason }}</li></ul></section>
          <section><b>{{ t('quant.risks') }}</b><ul><li v-for="risk in asset.risks" :key="risk">{{ risk }}</li><li v-if="!asset.risks.length">—</li></ul></section>
        </div>
      </details>
    </section>

    <section class="section-heading options-heading">
      <div><h2>{{ t('quant.optionsTitle') }}</h2><p>{{ t('quant.optionsHint') }}</p></div>
    </section>
    <section class="option-grid">
      <article v-for="candidate in dashboard.options" :key="candidate.symbol" class="option-card">
        <header>
          <div><span>{{ t('quant.rank', { rank: candidate.marketCapRank }) }}</span><h3>{{ candidate.symbol }}</h3><small>{{ candidate.name }}</small></div>
          <em :class="candidate.action">{{ actionLabel(candidate.action) }}</em>
        </header>
        <div class="option-metrics">
          <div><span>Forward PE</span><strong>{{ candidate.forwardPe?.toFixed(2) ?? '—' }}x</strong></div>
          <div><span>{{ t('quant.peGap', { value: formatPct(candidate.discountToThresholdPct) }) }}</span><strong>${{ candidate.price?.toFixed(2) ?? '—' }}</strong></div>
          <div><span>{{ t('quant.columns.score') }}</span><strong>{{ candidate.score > 0 ? '+' : '' }}{{ candidate.score }}</strong></div>
        </div>
        <details>
          <summary>{{ t('quant.detail') }}</summary>
          <div class="option-detail">
            <b>{{ t('quant.reasons') }}</b><ul><li v-for="reason in candidate.reasons" :key="reason">{{ reason }}</li></ul>
            <b>{{ t('quant.risks') }}</b><ul><li v-for="blocker in candidate.blockers" :key="blocker">{{ blocker }}</li></ul>
          </div>
        </details>
        <footer>
          <span class="execution">{{ candidate.executable ? t('quant.executable') : t('quant.notExecutable') }}</span>
          <button :disabled="candidate.price === null || isRecorded(candidate)" @click="addPaperPosition(candidate)">
            {{ isRecorded(candidate) ? t('quant.recorded') : t('quant.addPaper') }}
          </button>
        </footer>
      </article>
    </section>

    <section class="paper-section">
      <div class="section-heading"><div><h2>{{ t('quant.paperTitle') }}</h2><p>{{ t('quant.paperHint') }}</p></div></div>
      <p v-if="!paperPositions.length" class="empty">{{ t('quant.paperEmpty') }}</p>
      <article v-for="position in paperPositions" :key="position.id" class="paper-row">
        <div><strong>{{ position.symbol }}</strong><span>{{ actionLabel(position.action) }}</span></div>
        <div><small>{{ t('quant.paperOpened') }}</small><b>{{ formatDate(position.openedAt) }}</b></div>
        <div><small>{{ t('quant.paperEntry') }}</small><b>${{ position.entryUnderlyingPrice.toFixed(2) }}</b></div>
        <div><small>{{ t('quant.paperReturn') }}</small><b :class="(paperReturn(position) ?? 0) >= 0 ? 'positive' : 'negative'">{{ formatPct(paperReturn(position)) }}</b></div>
        <button v-if="position.status === 'open'" @click="closePaperPosition(position)">{{ t('quant.paperClose') }}</button>
        <button v-else class="remove-record" @click="removePaperPosition(position)">{{ t('quant.paperRemove') }}</button>
      </article>
    </section>

    <details class="methodology">
      <summary>{{ t('quant.methodologyTitle') }}</summary>
      <p>{{ t('quant.methodology') }}</p>
      <ul><li v-for="limitation in dashboard.limitations" :key="limitation">{{ limitation }}</li></ul>
    </details>
    <footer class="disclaimer">{{ t('quant.disclaimer') }}</footer>
  </main>
</template>

<style scoped>
.quant-page { max-width: 1380px; margin: 0 auto; padding: 40px clamp(20px, 3.5vw, 52px) 80px; }
.page-heading { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(440px, 1.1fr); gap: 24px; }
.page-heading p { margin: 0 0 9px; color: var(--accent); font-size: 9px; font-weight: 700; letter-spacing: .14em; }
.page-heading h1 { margin: 0; font: 500 clamp(34px, 4vw, 52px) Georgia, 'Songti SC', serif; letter-spacing: -.035em; }
.page-heading > div > span { display: block; max-width: 720px; margin: 12px 0 18px; color: var(--muted); font-size: 12px; line-height: 1.7; }
.strategy-focus { padding: 20px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); box-shadow: var(--shadow); }
.strategy-focus header { display: flex; justify-content: space-between; align-items: center; }
.strategy-focus header span { color: var(--muted); font-size: 10px; font-weight: 700; letter-spacing: .08em; }
.strategy-focus header b { color: var(--accent); font: 500 24px Georgia, serif; }
.strategy-focus dl { margin: 18px 0 0; display: grid; grid-template-columns: 1fr 1fr; }
.strategy-focus dl div { padding: 12px; border-top: 1px solid var(--border); }
.strategy-focus dt { color: var(--muted); font-size: 9px; }
.strategy-focus dd { margin: 5px 0 0; font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums; }
.summary-strip { margin: 24px 0 44px; display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid var(--border); border-radius: 10px; background: var(--surface); }
.summary-strip div { padding: 16px 18px; display: flex; justify-content: space-between; align-items: end; gap: 10px; }
.summary-strip div + div { border-left: 1px solid var(--border); }
.summary-strip span { color: var(--muted); font-size: 10px; }
.summary-strip strong { font: 500 26px Georgia, serif; }
.section-heading { margin-bottom: 14px; display: flex; justify-content: space-between; align-items: end; gap: 20px; }
.section-heading h2 { margin: 0; font: 500 27px Georgia, 'Songti SC', serif; }
.section-heading p { margin: 7px 0 0; max-width: 760px; color: var(--muted); font-size: 11px; line-height: 1.6; }
.section-heading select { min-height: 40px; padding: 0 34px 0 12px; border: 1px solid var(--border); border-radius: 7px; background: var(--surface-soft); color: var(--ink); }
.filters { margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 6px; }
.filters button { padding: 8px 13px; border: 1px solid var(--border); border-radius: 7px; background: var(--surface); color: var(--muted); cursor: pointer; }
.filters button.active { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); font-weight: 700; }
.asset-table-wrap { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; background: var(--surface); }
.asset-head, .asset-row summary { display: grid; grid-template-columns: minmax(190px, 1.3fr) minmax(115px, .8fr) minmax(150px, 1fr) 70px minmax(110px, .8fr) minmax(110px, .8fr); gap: 14px; align-items: center; }
.asset-head { padding: 10px 16px; background: var(--surface-soft); color: var(--muted); font-size: 9px; font-weight: 700; }
.asset-row { border-top: 1px solid var(--border); }
.asset-row summary { min-height: 72px; padding: 12px 16px; cursor: pointer; list-style: none; }
.asset-row summary::-webkit-details-marker { display: none; }
.asset-row summary:hover { background: var(--surface-elevated); }
.asset-name { display: grid; gap: 4px; }
.asset-name b { font-size: 13px; }
.asset-name small { color: var(--muted); font-size: 8px; }
.asset-row summary > span { font-size: 11px; font-variant-numeric: tabular-nums; }
.asset-row summary > strong { font-size: 16px; font-variant-numeric: tabular-nums; }
.positive { color: var(--positive); } .negative { color: var(--negative); }
.evidence { height: 7px; border-radius: 99px; background: var(--surface-soft); position: relative; }
.evidence i { height: 100%; border-radius: inherit; background: var(--accent); display: block; }
.evidence b { position: absolute; right: 0; top: -17px; font-size: 8px; }
.asset-row em, .option-card header em { justify-self: start; padding: 5px 8px; border-radius: 5px; background: var(--surface-soft); color: var(--muted); font-size: 9px; font-style: normal; font-weight: 700; }
.asset-row em.buy, .asset-row em.accumulate, .option-card em.long-call-candidate { background: var(--danger-soft); color: var(--positive); }
.asset-row em.sell, .asset-row em.reduce, .option-card em.exit-long-call, .option-card em.avoid { background: var(--accent-soft); color: var(--negative); }
.asset-detail { padding: 16px; border-top: 1px solid var(--border); background: var(--surface-soft); display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.asset-detail b, .option-detail b { font-size: 10px; }
.asset-detail ul, .option-detail ul { margin: 7px 0 0; padding-left: 16px; color: var(--muted); font-size: 10px; line-height: 1.65; }
.options-heading { margin-top: 48px; }
.option-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.option-card { padding: 17px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); }
.option-card > header { display: flex; justify-content: space-between; gap: 14px; }
.option-card header span, .option-card header small { display: block; color: var(--muted); font-size: 8px; }
.option-card h3 { margin: 4px 0; font: 500 23px Georgia, serif; }
.option-metrics { margin: 16px 0; display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--border); border-radius: 8px; }
.option-metrics div { padding: 11px; }
.option-metrics div + div { border-left: 1px solid var(--border); }
.option-metrics span { display: block; min-height: 24px; color: var(--muted); font-size: 8px; }
.option-metrics strong { font-size: 15px; font-variant-numeric: tabular-nums; }
.option-card details { border-top: 1px solid var(--border); }
.option-card details summary { padding: 11px 0; color: var(--muted); cursor: pointer; font-size: 10px; }
.option-detail { padding-bottom: 10px; }
.option-detail b:not(:first-child) { display: block; margin-top: 12px; }
.option-card > footer { padding-top: 12px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.execution { color: var(--warning); font-size: 9px; }
.option-card button, .paper-row button { padding: 7px 11px; border: 1px solid var(--accent); border-radius: 6px; background: var(--accent); color: var(--inverse-text); cursor: pointer; font-size: 9px; }
.paper-row .remove-record { border-color: var(--border); background: var(--surface-soft); color: var(--muted); }
.option-card button:disabled { border-color: var(--border); background: var(--surface-soft); color: var(--muted); cursor: not-allowed; }
.paper-section { margin-top: 48px; }
.empty { padding: 24px; border: 1px dashed var(--border); border-radius: 9px; color: var(--muted); font-size: 11px; text-align: center; }
.paper-row { padding: 13px 16px; border: 1px solid var(--border); border-radius: 8px; display: grid; grid-template-columns: minmax(140px, 1fr) repeat(3, minmax(100px, .7fr)) auto; gap: 16px; align-items: center; }
.paper-row + .paper-row { margin-top: 7px; }
.paper-row div { display: grid; gap: 3px; }
.paper-row div:first-child span, .paper-row small { color: var(--muted); font-size: 8px; }
.paper-row b { font-size: 11px; }
.closed { color: var(--muted); font-size: 9px; }
.methodology { margin-top: 40px; padding: 16px; border: 1px solid var(--border); border-radius: 9px; background: var(--surface-soft); }
.methodology summary { cursor: pointer; font-size: 11px; font-weight: 700; }
.methodology p, .methodology ul { color: var(--muted); font-size: 10px; line-height: 1.7; }
.disclaimer { margin-top: 18px; color: var(--muted); font-size: 9px; }
@media (max-width: 1050px) {
  .page-heading { grid-template-columns: 1fr; }
  .asset-head { display: none; }
  .asset-row summary { grid-template-columns: minmax(170px, 1.2fr) 1fr 1fr 55px 90px; }
  .asset-row summary > em { grid-column: 2 / -1; }
}
@media (max-width: 760px) {
  .summary-strip, .option-grid { grid-template-columns: 1fr 1fr; }
  .summary-strip div:nth-child(3) { border-left: 0; border-top: 1px solid var(--border); }
  .summary-strip div:nth-child(4) { border-top: 1px solid var(--border); }
  .asset-row summary { grid-template-columns: 1fr auto; gap: 7px 12px; }
  .asset-row summary > span:nth-child(3), .evidence { display: none; }
  .asset-row summary > strong { grid-column: 1; }
  .asset-row summary > em { grid-column: 2; grid-row: 2; }
  .asset-detail { grid-template-columns: 1fr; gap: 12px; }
  .paper-row { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 620px) {
  .quant-page { padding: 24px 14px 60px; }
  .strategy-focus dl, .option-grid { grid-template-columns: 1fr; }
  .summary-strip div { padding: 13px; }
  .summary-strip strong { font-size: 22px; }
  .section-heading { align-items: stretch; flex-direction: column; }
  .option-metrics { grid-template-columns: 1fr 1fr; }
  .option-metrics div:nth-child(3) { grid-column: 1 / -1; border-top: 1px solid var(--border); border-left: 0; }
  .paper-row { grid-template-columns: 1fr; }
}
</style>
