<script setup lang="ts">
import { computed, ref } from 'vue'
import fundData from '@/data/us-funds.json'
import type { FundVenue, UsFund, UsFundDataset } from '@/types'
import HotStocksPanel from '@/components/HotStocksPanel.vue'

type SortKey = 'scale' | 'fee' | 'premium' | 'firstYearCost'

const dataset = fundData as UsFundDataset
const activeVenue = ref<FundVenue>('exchange')
const activeIndex = ref('全部指数')
const sortKey = ref<SortKey>('scale')
const brokerageFeePct = ref(0.03)

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
        (activeIndex.value === '全部指数' || fund.index === activeIndex.value),
    )
    .sort((a, b) => {
      if (sortKey.value === 'scale') return (b.scaleBillionCny ?? -1) - (a.scaleBillionCny ?? -1)
      if (sortKey.value === 'premium')
        return (a.premiumRatePct ?? Infinity) - (b.premiumRatePct ?? Infinity)
      if (sortKey.value === 'firstYearCost') return firstYearCost(a) - firstYearCost(b)
      return totalFee(a) - totalFee(b)
    }),
)

const formatUpdatedAt = (value: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

const formatFee = (value: number | null) => (value === null ? '—' : `${value.toFixed(2)}%`)
const formatSignedFee = (value: number | null) =>
  value === null ? '—' : `${value > 0 ? '+' : ''}${value.toFixed(2)}%`

const formatLimit = (fund: UsFund) => {
  if (fund.recurringInvestmentOpen === false) return '暂停定投'
  if (fund.dailyInvestmentLimitCny === null) return '未检出限额'
  return `¥${fund.dailyInvestmentLimitCny.toLocaleString('zh-CN')} / 日`
}
</script>

<template>
  <div class="fund-page">
    <header class="page-heading">
      <div>
        <p>US equity funds · 中国市场</p>
        <h1>美股市场</h1>
      </div>
      <div class="freshness">
        <span class="live-dot"></span>
        <div>
          <strong>每日监控</strong>
          <small>更新于 {{ formatUpdatedAt(dataset.updatedAt) }}</small>
        </div>
      </div>
    </header>

    <section class="scope-note">
      <p>
        首批覆盖跟踪纳斯达克 100 与标普 500 的主流境内 QDII
        产品。总成本估算将年运作费率、当前购买手续费、场内佣金假设和最近溢折价分开计算。
      </p>
      <p>{{ dataset.source }}</p>
    </section>

    <HotStocksPanel market="us" />

    <div class="controls">
      <div class="segmented" aria-label="交易场所">
        <button :class="{ active: activeVenue === 'exchange' }" @click="activeVenue = 'exchange'">
          场内 ETF
        </button>
        <button
          :class="{ active: activeVenue === 'offExchange' }"
          @click="activeVenue = 'offExchange'"
        >
          场外基金
        </button>
      </div>

      <div class="filter-row">
        <label>
          跟踪指数
          <select v-model="activeIndex">
            <option>全部指数</option>
            <option v-for="indexName in indices" :key="indexName">{{ indexName }}</option>
          </select>
        </label>
        <label>
          排序
          <select v-model="sortKey">
            <option value="scale">规模从大到小</option>
            <option value="fee">综合费率从低到高</option>
            <option value="premium">溢价率从低到高</option>
            <option value="firstYearCost">首年成本估算从低到高</option>
          </select>
        </label>
        <label v-if="activeVenue === 'exchange'">
          单边佣金
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
            <th>基金</th>
            <th>跟踪指数</th>
            <th class="number">规模</th>
            <th class="number">综合费率</th>
            <th class="number">溢折价</th>
            <th class="number">购买成本</th>
            <th class="number">首年成本估算</th>
            <th v-if="activeVenue === 'offExchange'">每日定投参考额度</th>
            <th>明细</th>
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
              <strong>{{ formatSignedFee(fund.premiumRatePct) }}</strong>
              <small v-if="fund.venue === 'exchange'">净值 {{ fund.navDate ?? '—' }}</small>
              <small v-else>场外按净值申购</small>
            </td>
            <td class="number">
              <strong>{{
                formatFee(fund.venue === 'exchange' ? brokerageFeePct : fund.purchaseFeePct)
              }}</strong>
              <small>{{ fund.venue === 'exchange' ? '买入佣金假设' : '当前申购费' }}</small>
            </td>
            <td class="number cost-total">
              <strong>{{ formatSignedFee(firstYearCost(fund)) }}</strong>
              <small>运作费 + 买入成本 + 溢折价</small>
            </td>
            <td class="number">
              <strong>{{ formatFee(totalFee(fund)) }}</strong>
              <small>年运作费率</small>
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
              <small class="channel-note">天天基金渠道</small>
            </td>
            <td class="fee-detail">
              <span>管理 {{ formatFee(fund.managementFeePct) }}</span>
              <span>托管 {{ formatFee(fund.custodianFeePct) }}</span>
              <span v-if="(fund.serviceFeePct ?? 0) > 0">
                销售服务 {{ formatFee(fund.serviceFeePct) }}
              </span>
              <span v-if="(fund.purchaseFeePct ?? 0) > 0">
                当前申购 {{ formatFee(fund.purchaseFeePct) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer>
      场内产品还应结合实时溢价率、成交额与券商佣金判断；本页排序不代表推荐，也不构成投资建议。
      首年成本未计卖出佣金、买卖价差、持有期相关赎回费、跟踪误差及汇率影响；负值表示当前折价抵减了估算成本。
    </footer>
  </div>
</template>

<style scoped>
.fund-page {
  max-width: 1320px;
  margin: 0 auto;
  padding: 40px clamp(20px, 3.5vw, 52px) 80px;
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
