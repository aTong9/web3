<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DataUpdateStatus from '@/components/DataUpdateStatus.vue'
import AsyncDataState from '@/components/AsyncDataState.vue'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import FundResearchWorkbench from '@/components/FundResearchWorkbench.vue'
import type { FundVenue, UsFund, UsFundDataset } from '@/types'
import HotStocksPanel from '@/components/HotStocksPanel.vue'
import UsMegaCapsPanel from '@/components/UsMegaCapsPanel.vue'
import { useI18n } from '@/composables/use-i18n'
import type { FundResearchItem } from '@/utils/fund-research'

type SortKey = 'scale' | 'fee' | 'premium' | 'firstYearCost'
type Workspace = 'overview' | 'research' | 'costs'
const ALL_INDEX = 'all'

const dataset = ref<UsFundDataset>({ updatedAt: '', source: '', funds: [] })
const dataLoading = ref(true)
const dataError = ref(false)
const activeVenue = ref<FundVenue>('exchange')
const activeIndex = ref(ALL_INDEX)
const sortKey = ref<SortKey>('scale')
const brokerageFeePct = ref(0.03)
const activeWorkspace = ref<Workspace>('overview')
const { t } = useI18n()

const indices = computed(() => [...new Set(dataset.value.funds.map((fund) => fund.index))])

const totalFee = (fund: UsFund) =>
  (fund.managementFeePct ?? 0) + (fund.custodianFeePct ?? 0) + (fund.serviceFeePct ?? 0)

const entryCost = (fund: UsFund) =>
  fund.venue === 'exchange'
    ? (fund.premiumRatePct ?? 0) + brokerageFeePct.value
    : (fund.purchaseFeePct ?? 0)

const firstYearCost = (fund: UsFund) => totalFee(fund) + entryCost(fund)

const visibleFunds = computed(() =>
  dataset.value.funds
    .filter(
      (fund) =>
        fund.venue === activeVenue.value &&
        (activeIndex.value === ALL_INDEX || fund.index === activeIndex.value),
    )
    .sort((a, b) => {
      if (sortKey.value === 'scale') return (b.scaleBillionCny ?? -1) - (a.scaleBillionCny ?? -1)
      if (sortKey.value === 'premium')
        return (a.premiumRatePct ?? Infinity) - (b.premiumRatePct ?? Infinity)
      if (sortKey.value === 'firstYearCost') return firstYearCost(a) - firstYearCost(b)
      return totalFee(a) - totalFee(b)
    }),
)

const researchFunds = computed<FundResearchItem[]>(() =>
  dataset.value.funds.map((fund) => ({
    code: fund.code,
    name: fund.name,
    group: `${fund.index} · ${t(`funds.venue.${fund.venue}`)}`,
    latestValue: fund.venue === 'exchange' ? fund.latestClose : fund.latestNav,
    latestDate: fund.venue === 'exchange' ? fund.latestCloseDate : fund.navDate,
    annualFeePct: totalFee(fund),
    premiumRatePct: fund.premiumRatePct,
    trackingErrorPct: fund.trackingErrorPct,
    trackingBenchmark: fund.trackingBenchmark,
    marketId: fund.index.includes('纳斯达克') ? 'nasdaq' : 'sp500',
    marketProxyLabel: fund.index.includes('纳斯达克') ? 'NASDAQ Composite' : 'S&P 500',
    history: fund.priceHistory.length ? fund.priceHistory : fund.navHistory,
  })),
)

const formatFee = (value: number | null) => (value === null ? '—' : `${value.toFixed(2)}%`)
const formatSignedFee = (value: number | null) =>
  value === null ? '—' : `${value > 0 ? '+' : ''}${value.toFixed(2)}%`

const formatLimit = (fund: UsFund) => {
  if (fund.recurringInvestmentOpen === false) return t('funds.status.stopped')
  if (fund.dailyInvestmentLimitCny === null) return t('funds.status.noLimit')
  return `¥${fund.dailyInvestmentLimitCny.toLocaleString('zh-CN')} / 日`
}

const limitChanged = (fund: UsFund) => {
  const history = fund.investmentLimitHistory
  if (history.length < 2) return false
  const latest = history[history.length - 1]
  const previous = history[history.length - 2]
  return (
    latest?.limitCny !== previous?.limitCny ||
    latest?.purchaseStatus !== previous?.purchaseStatus ||
    latest?.recurringInvestmentOpen !== previous?.recurringInvestmentOpen
  )
}

const loadDataset = async () => {
  dataLoading.value = true
  dataError.value = false
  try {
    const module = await import('@/data/us-funds.json')
    dataset.value = module.default as UsFundDataset
  } catch (error) {
    dataError.value = true
    console.warn('US fund dataset failed to load:', error)
  } finally {
    dataLoading.value = false
  }
}
onMounted(loadDataset)
</script>

<template>
  <div class="fund-page">
    <ResearchPageHeader :eyebrow="t('funds.sub')" :title="t('funds.title')">
      <template #status>
      <DataUpdateStatus
        :updated-at="dataset.updatedAt"
        schedule="funds"
        :label="t('funds.monitor')"
        source-label="天天基金公开页面"
        quality="complete"
      />
      </template>
    </ResearchPageHeader>

    <AsyncDataState
      :loading="dataLoading"
      :error="dataError"
      loading-label="正在载入基金数据…"
      error-message="基金数据暂时无法载入；当前页面不会展示不完整的费用比较。"
      :retry-label="t('ui.app.retry')"
      @retry="loadDataset"
    />

    <section class="scope-note">
      <p>
        {{ t('funds.scope.intro') }}
      </p>
      <p>{{ dataset.source }}</p>
    </section>

    <nav class="workspace-tabs" :aria-label="t('funds.workspace.label')">
      <button
        v-for="workspace in (['overview', 'research', 'costs'] as Workspace[])"
        :key="workspace"
        :class="{ active: activeWorkspace === workspace }"
        :aria-pressed="activeWorkspace === workspace"
        @click="activeWorkspace = workspace"
      >
        <strong>{{ t(`funds.workspace.${workspace}`) }}</strong>
        <span>{{ t(`funds.workspace.${workspace}Hint`) }}</span>
      </button>
    </nav>

    <section v-show="activeWorkspace === 'overview'" class="workspace-panel">
      <UsMegaCapsPanel />
      <HotStocksPanel market="us" />
    </section>

    <section v-show="activeWorkspace === 'research'" class="workspace-panel">
      <FundResearchWorkbench
        :funds="researchFunds"
        :initial-codes="['513100', '159941', '513500']"
        storage-key="us-funds"
      />
    </section>

    <section v-show="activeWorkspace === 'costs'" class="workspace-panel">
    <div class="controls">
      <div class="segmented" :aria-label="t('funds.venue.exchange')">
        <button
          :class="{ active: activeVenue === 'exchange' }"
          :aria-pressed="activeVenue === 'exchange'"
          @click="activeVenue = 'exchange'"
        >
          {{ t('funds.venue.exchange') }}
        </button>
        <button
          :class="{ active: activeVenue === 'offExchange' }"
          :aria-pressed="activeVenue === 'offExchange'"
          @click="activeVenue = 'offExchange'"
        >
          {{ t('funds.venue.offExchange') }}
        </button>
      </div>

      <div class="filter-row">
        <label>
          {{ t('funds.index') }}
          <select v-model="activeIndex">
            <option :value="ALL_INDEX">{{ t('funds.allIndex') }}</option>
            <option v-for="indexName in indices" :key="indexName">{{ indexName }}</option>
          </select>
        </label>
        <label>
          {{ t('funds.sort') }}
          <select v-model="sortKey">
            <option value="scale">{{ t('funds.sortOptions.scale') }}</option>
            <option value="fee">{{ t('funds.sortOptions.fee') }}</option>
            <option value="premium">{{ t('funds.sortOptions.premium') }}</option>
            <option value="firstYearCost">{{ t('funds.sortOptions.firstYearCost') }}</option>
          </select>
        </label>
        <label v-if="activeVenue === 'exchange'">
          {{ t('funds.feeHint') }}
          <span class="commission-input"
            ><input v-model.number="brokerageFeePct" type="number" min="0" step="0.01" />%</span
          >
        </label>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{{ t('funds.table.fund') }}</th>
            <th>{{ t('funds.table.indexLabel') }}</th>
            <th class="number">{{ t('funds.table.scale') }}</th>
            <th class="number">{{ t('funds.table.value') }}</th>
            <th class="number">{{ t('funds.table.fee') }}</th>
            <th class="number">{{ t('funds.table.premium') }}</th>
            <th class="number">{{ t('funds.table.entryCost') }}</th>
            <th class="number">{{ t('funds.table.firstYear') }}</th>
            <th v-if="activeVenue === 'offExchange'">{{ t('funds.table.dailyLimit') }}</th>
            <th>{{ t('funds.table.detail') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fund in visibleFunds" :key="fund.code">
            <td :data-label="t('funds.table.fund')">
              <a :href="fund.sourceUrl" target="_blank" rel="noopener noreferrer">
                <strong>{{ fund.name }}</strong>
                <small>{{ fund.code }} ↗</small>
              </a>
            </td>
            <td :data-label="t('funds.table.indexLabel')">
              <span class="index-tag">{{ fund.index }}</span>
            </td>
            <td class="number" :data-label="t('funds.table.scale')">
              <strong>{{ fund.scaleBillionCny?.toFixed(2) ?? '—' }} 亿</strong>
              <small>{{ fund.scaleDate ?? '—' }}</small>
            </td>
            <td class="number" :data-label="t('funds.table.value')">
              <strong>{{
                fund.venue === 'exchange'
                  ? (fund.latestClose?.toFixed(4) ?? '—')
                  : (fund.latestNav?.toFixed(4) ?? '—')
              }}</strong>
              <small>
                {{
                  fund.venue === 'exchange'
                    ? `${fund.latestCloseDate ?? '—'} · NAV ${fund.latestNav?.toFixed(4) ?? '—'}`
                    : `${t('funds.table.row.offExchangeNav')} · ${fund.navDate ?? '—'}`
                }}
              </small>
            </td>
            <td class="number" :data-label="t('funds.table.fee')">
              <strong>{{ formatFee(totalFee(fund)) }}</strong>
              <small>{{ t('funds.table.row.annualOpFee') }}</small>
            </td>
            <td class="number" :data-label="t('funds.table.premium')">
              <strong>{{
                formatSignedFee(fund.venue === 'exchange' ? fund.premiumRatePct : null)
              }}</strong>
              <small>{{ fund.navDate ?? '—' }}</small>
            </td>
            <td class="number" :data-label="t('funds.table.entryCost')">
              <strong>{{
                formatFee(fund.venue === 'exchange' ? brokerageFeePct : fund.purchaseFeePct)
              }}</strong>
              <small>
                {{
                  fund.venue === 'exchange'
                    ? t('funds.table.row.buyFee')
                    : t('funds.table.row.applyFee')
                }}
              </small>
            </td>
            <td class="number cost-total" :data-label="t('funds.table.firstYear')">
              <strong>{{ formatSignedFee(firstYearCost(fund)) }}</strong>
              <small>{{ t('funds.table.row.feeFormula') }}</small>
            </td>
            <td v-if="activeVenue === 'offExchange'" :data-label="t('funds.table.dailyLimit')">
              <span
                class="limit"
                :class="{
                  stopped: fund.recurringInvestmentOpen === false,
                  tight: (fund.dailyInvestmentLimitCny ?? Infinity) <= 10,
                }"
              >
                {{ formatLimit(fund) }}
              </span>
              <em v-if="limitChanged(fund)" class="limit-change">{{ t('funds.status.changed') }}</em>
              <small class="channel-note">{{ t('funds.row.channelNote') }}</small>
            </td>
            <td class="fee-detail" :data-label="t('funds.table.detail')">
              <span>{{ t('funds.legend.management', { value: formatFee(fund.managementFeePct) }) }}</span>
              <span>{{ t('funds.legend.custody', { value: formatFee(fund.custodianFeePct) }) }}</span>
              <span v-if="(fund.serviceFeePct ?? 0) > 0">
                {{ t('funds.legend.service', { value: formatFee(fund.serviceFeePct) }) }}
              </span>
              <span v-if="(fund.purchaseFeePct ?? 0) > 0">
                {{ t('funds.legend.purchase', { value: formatFee(fund.purchaseFeePct) }) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </section>

    <footer>
      {{ t('funds.notice') }} {{ t('funds.caution') }}
    </footer>
  </div>
</template>

<style scoped>
.fund-page {
  max-width: var(--content-wide);
  margin: 0 auto;
  padding: 32px var(--page-gutter) 80px;
}

.limit-change {
  display: inline-block;
  margin-top: 5px;
  color: var(--accent);
  font-size: 10px;
  font-style: normal;
  font-weight: 700;
}

.page-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 32px;
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
  margin: 0;
  font-family: Georgia, 'Songti SC', serif;
  font-size: clamp(36px, 4.5vw, 54px);
  font-weight: 500;
  letter-spacing: -0.04em;
}

.freshness {
  padding: 12px 15px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  display: flex;
  align-items: center;
  gap: 10px;
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

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}

.scope-note {
  margin: 38px 0 34px;
  padding: 16px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  color: var(--muted);
  display: grid;
  grid-template-columns: 1fr 0.7fr;
  gap: 40px;
  font-size: 12px;
  line-height: 1.7;
}

.scope-note p {
  margin: 0;
}

.workspace-tabs {
  margin-bottom: 28px;
  padding: 5px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-soft);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
}

.workspace-tabs button {
  min-height: 64px;
  padding: 11px 14px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  display: grid;
  gap: 4px;
  text-align: left;
}

.workspace-tabs button:hover {
  background: var(--surface-elevated);
}

.workspace-tabs button.active {
  background: var(--surface);
  color: var(--ink);
  box-shadow: var(--shadow);
}

.workspace-tabs strong {
  font-size: 12px;
}

.workspace-tabs span {
  color: var(--muted);
  font-size: 9px;
  line-height: 1.45;
}

.workspace-panel {
  min-width: 0;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
}

.segmented {
  padding: 3px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface-soft);
  display: flex;
}

.segmented button {
  padding: 9px 16px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
}

.segmented button.active {
  background: var(--surface);
  color: var(--ink);
  box-shadow: var(--shadow);
}

.filter-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

label {
  color: var(--muted);
  display: grid;
  gap: 6px;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

select {
  min-width: 150px;
  padding: 9px 28px 9px 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface);
  color: var(--ink);
  font: inherit;
  font-size: 12px;
  letter-spacing: 0;
  text-transform: none;
}

.commission-input {
  padding: 0 9px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface);
  display: flex;
  align-items: center;
  color: var(--muted);
}

.commission-input input {
  width: 58px;
  padding: 9px 4px;
  border: 0;
  background: transparent;
  color: var(--ink);
  font: inherit;
}

.cost-total strong {
  color: var(--accent);
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}

table {
  width: 100%;
  min-width: 1180px;
  border-collapse: collapse;
  font-size: 12px;
}

th,
td {
  padding: 15px 14px;
  border-bottom: 1px solid var(--border);
  text-align: left;
  vertical-align: middle;
}

th {
  color: var(--muted);
  background: var(--surface-elevated);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}

tbody tr:last-child td {
  border-bottom: 0;
}

tbody tr:hover {
  background: var(--surface-elevated);
}

td a {
  min-width: 220px;
  color: var(--ink);
  display: block;
  text-decoration: none;
}

td strong,
td small {
  display: block;
}

td small {
  margin-top: 5px;
  color: var(--muted);
  font-size: 10px;
}

.number {
  text-align: right;
  white-space: nowrap;
}

.index-tag {
  padding: 5px 8px;
  border-radius: 5px;
  background: var(--surface-soft);
  white-space: nowrap;
}

.limit {
  color: var(--accent);
  font-weight: 600;
  white-space: nowrap;
}

.limit.tight,
.limit.stopped {
  color: var(--danger);
}

.channel-note {
  display: block;
}

.fee-detail {
  min-width: 130px;
  color: var(--muted);
}

.fee-detail span {
  display: block;
  line-height: 1.65;
  white-space: nowrap;
}

footer {
  margin-top: 24px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.7;
}

@media (max-width: 760px) {
  .page-heading,
  .controls {
    align-items: stretch;
    flex-direction: column;
  }

  .freshness {
    align-self: flex-start;
  }

  .scope-note {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .workspace-tabs {
    grid-template-columns: 1fr;
  }

  .workspace-tabs button {
    min-height: 52px;
  }

  .segmented button {
    flex: 1;
  }

  .filter-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  select {
    width: 100%;
    min-width: 0;
  }

  .table-wrap {
    overflow: visible;
    border: 0;
    background: transparent;
  }

  table,
  tbody,
  tr,
  td {
    display: block;
    width: 100%;
    min-width: 0;
  }

  thead {
    display: none;
  }

  tbody {
    display: grid;
    gap: 12px;
  }

  tbody tr {
    padding: 8px 16px;
    border: 1px solid var(--border);
    border-radius: var(--panel-radius);
    background: var(--surface);
  }

  td,
  td.number {
    padding: 11px 0;
    border-bottom: 1px solid var(--border);
    display: grid;
    grid-template-columns: minmax(92px, 0.45fr) minmax(0, 1fr);
    gap: 14px;
    text-align: right;
    white-space: normal;
  }

  td::before {
    content: attr(data-label);
    color: var(--muted);
    font-size: 10px;
    font-weight: 700;
    text-align: left;
  }

  td:last-child {
    border-bottom: 0;
  }

  td a,
  .fee-detail {
    min-width: 0;
  }
}
</style>
