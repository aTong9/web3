<script setup lang="ts">
import { computed, ref } from 'vue'
import DataUpdateStatus from '@/components/DataUpdateStatus.vue'
import FundResearchWorkbench from '@/components/FundResearchWorkbench.vue'
import fundData from '@/data/us-funds.json'
import type { FundVenue, UsFund, UsFundDataset } from '@/types'
import HotStocksPanel from '@/components/HotStocksPanel.vue'
import UsMegaCapsPanel from '@/components/UsMegaCapsPanel.vue'
import { useI18n } from '@/composables/use-i18n'
import type { FundResearchItem } from '@/utils/fund-research'

type SortKey = 'scale' | 'fee' | 'premium' | 'firstYearCost'
const ALL_INDEX = 'all'

const dataset = fundData as UsFundDataset
const activeVenue = ref<FundVenue>('exchange')
const activeIndex = ref(ALL_INDEX)
const sortKey = ref<SortKey>('scale')
const brokerageFeePct = ref(0.03)
const { t } = useI18n()

const indices = computed(() => [...new Set(dataset.funds.map((fund) => fund.index))])

const totalFee = (fund: UsFund) =>
  (fund.managementFeePct ?? 0) + (fund.custodianFeePct ?? 0) + (fund.serviceFeePct ?? 0)

const entryCost = (fund: UsFund) =>
  fund.venue === 'exchange'
    ? (fund.premiumRatePct ?? 0) + brokerageFeePct.value
    : (fund.purchaseFeePct ?? 0)

const firstYearCost = (fund: UsFund) => totalFee(fund) + entryCost(fund)

const visibleFunds = computed(() =>
  dataset.funds
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
  dataset.funds.map((fund) => ({
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
</script>

<template>
  <div class="fund-page">
    <header class="page-heading">
      <div>
        <p>{{ t('funds.sub') }}</p>
        <h1>{{ t('funds.title') }}</h1>
      </div>
      <DataUpdateStatus
        :updated-at="dataset.updatedAt"
        schedule="funds"
        :label="t('funds.monitor')"
      />
    </header>

    <section class="scope-note">
      <p>
        {{ t('funds.scope.intro') }}
      </p>
      <p>{{ dataset.source }}</p>
    </section>

    <UsMegaCapsPanel />
    <HotStocksPanel market="us" />

    <FundResearchWorkbench
      :funds="researchFunds"
      :initial-codes="['513100', '159941', '513500']"
      storage-key="us-funds"
    />

    <div class="controls">
      <div class="segmented" :aria-label="t('funds.venue.exchange')">
        <button :class="{ active: activeVenue === 'exchange' }" @click="activeVenue = 'exchange'">
          {{ t('funds.venue.exchange') }}
        </button>
        <button
          :class="{ active: activeVenue === 'offExchange' }"
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
            <td>
              <a :href="fund.sourceUrl" target="_blank" rel="noopener noreferrer">
                <strong>{{ fund.name }}</strong>
                <small>{{ fund.code }} ↗</small>
              </a>
            </td>
            <td>
              <span class="index-tag">{{ fund.index }}</span>
            </td>
            <td class="number">
              <strong>{{ fund.scaleBillionCny?.toFixed(2) ?? '—' }} 亿</strong>
              <small>{{ fund.scaleDate ?? '—' }}</small>
            </td>
            <td class="number">
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
            <td class="number">
              <strong>{{ formatFee(totalFee(fund)) }}</strong>
              <small>{{ t('funds.table.row.annualOpFee') }}</small>
            </td>
            <td class="number">
              <strong>{{
                formatSignedFee(fund.venue === 'exchange' ? fund.premiumRatePct : null)
              }}</strong>
              <small>{{ fund.navDate ?? '—' }}</small>
            </td>
            <td class="number">
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
            <td class="number cost-total">
              <strong>{{ formatSignedFee(firstYearCost(fund)) }}</strong>
              <small>{{ t('funds.table.row.feeFormula') }}</small>
            </td>
            <td v-if="activeVenue === 'offExchange'">
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
            <td class="fee-detail">
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

    <footer>
      {{ t('funds.notice') }} {{ t('funds.caution') }}
    </footer>
  </div>
</template>

<style scoped>
.fund-page {
  max-width: 1320px;
  margin: 0 auto;
  padding: 40px clamp(20px, 3.5vw, 52px) 80px;
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
}
</style>
