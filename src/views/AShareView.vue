<script setup lang="ts">
import { computed, ref } from 'vue'
import sectorData from '@/data/a-share-sectors.json'
import type { AShareFund, AShareSectorDataset, SectorKind, SectorPeriod } from '@/types'

type Scope = 'all' | SectorKind

const dataset = sectorData as AShareSectorDataset
const activePeriod = ref<SectorPeriod>('day')
const activeScope = ref<Scope>('all')
const direction = ref<'desc' | 'asc'>('desc')
const query = ref('')
const brokerageFeePct = ref(0.03)

const periodOptions: Array<{ value: SectorPeriod; label: string }> = [
  { value: 'day', label: '日' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'quarter', label: '季度' },
  { value: 'yearToDate', label: '今年' },
  { value: 'year', label: '近一年' },
]

const rankedSectors = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  return dataset.sectors
    .filter(
      (sector) =>
        (activeScope.value === 'all' || sector.kind === activeScope.value) &&
        (!needle || sector.name.toLocaleLowerCase().includes(needle)),
    )
    .sort((a, b) => {
      const left = a.returns[activePeriod.value] ?? -Infinity
      const right = b.returns[activePeriod.value] ?? -Infinity
      return direction.value === 'desc' ? right - left : left - right
    })
})

const upCount = computed(
  () => dataset.sectors.filter((sector) => (sector.returns.day ?? 0) > 0).length,
)
const downCount = computed(
  () => dataset.sectors.filter((sector) => (sector.returns.day ?? 0) < 0).length,
)

const getRepresentative = (code: string) => dataset.funds.find((fund) => fund.code === code)
const getSectorFunds = (sectorName: string) =>
  dataset.funds
    .filter((fund) => fund.sector === sectorName)
    .sort((a, b) => (b.scaleBillionCny ?? -1) - (a.scaleBillionCny ?? -1))

const totalFee = (fund: AShareFund) =>
  fund.managementFeePct === null || fund.custodianFeePct === null
    ? null
    : fund.managementFeePct + fund.custodianFeePct

const firstYearCost = (fund: AShareFund) => {
  const annualFee = totalFee(fund)
  return annualFee === null ? null : annualFee + brokerageFeePct.value + (fund.premiumRatePct ?? 0)
}

const formatReturn = (value: number | null) => {
  if (value === null) return '—'
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
}

const formatCost = (value: number | null) => {
  if (value === null) return '—'
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
}

const returnClass = (value: number | null) => ({
  positive: value !== null && value > 0,
  negative: value !== null && value < 0,
})

const formatUpdatedAt = (value: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
</script>

<template>
  <div class="sector-page">
    <header class="page-heading">
      <div>
        <p>A-share sector monitor · 收盘数据</p>
        <h1>A股行业</h1>
      </div>
      <div class="market-state">
        <span :class="dataset.marketStatus"></span>
        <div>
          <strong>{{ dataset.marketStatus === 'closed' ? '今日已收盘' : '非交易日' }}</strong>
          <small
            >交易日 {{ dataset.tradingDate }} · {{ formatUpdatedAt(dataset.updatedAt) }} 更新</small
          >
        </div>
      </div>
    </header>

    <section class="market-summary">
      <div>
        <span>覆盖分类</span><strong>{{ dataset.sectors.length }}</strong>
      </div>
      <div>
        <span>上涨</span><strong class="positive">{{ upCount }}</strong>
      </div>
      <div>
        <span>下跌</span><strong class="negative">{{ downCount }}</strong>
      </div>
      <div>
        <span>当前口径</span><strong>{{ dataset.periods[activePeriod] }}</strong>
      </div>
    </section>

    <div class="toolbar">
      <div class="period-tabs" aria-label="涨幅周期">
        <button
          v-for="option in periodOptions"
          :key="option.value"
          :class="{ active: activePeriod === option.value }"
          @click="activePeriod = option.value"
        >
          {{ option.label }}
        </button>
      </div>
      <div class="filters">
        <select v-model="activeScope" aria-label="分类范围">
          <option value="all">全部分类</option>
          <option value="industry">标准行业</option>
          <option value="theme">主题赛道</option>
        </select>
        <select v-model="direction" aria-label="排序方向">
          <option value="desc">涨幅从高到低</option>
          <option value="asc">涨幅从低到高</option>
        </select>
        <input v-model="query" type="search" placeholder="搜索行业…" aria-label="搜索行业" />
        <label class="commission-field">
          单边佣金
          <span><input v-model.number="brokerageFeePct" type="number" min="0" step="0.01" />%</span>
        </label>
      </div>
    </div>

    <div class="ranking-head">
      <span>排名 / 行业</span><span>代表基金</span><span>{{ dataset.periods[activePeriod] }}</span>
    </div>

    <div class="ranking-list">
      <details v-for="(sector, index) in rankedSectors" :key="sector.name">
        <summary>
          <span class="rank">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="sector-name">
            <strong>{{ sector.name }}</strong>
            <small>{{ sector.kind === 'industry' ? '标准行业' : '主题赛道' }}</small>
          </span>
          <span class="representative">
            <strong>{{ getRepresentative(sector.representativeFundCode)?.name }}</strong>
            <small>{{ sector.representativeFundCode }}</small>
          </span>
          <span class="period-return" :class="returnClass(sector.returns[activePeriod])">
            {{ formatReturn(sector.returns[activePeriod]) }}
          </span>
          <span class="disclosure">⌄</span>
        </summary>

        <div class="sector-detail">
          <div class="return-strip">
            <div v-for="option in periodOptions" :key="option.value">
              <span>{{ option.label }}</span>
              <strong :class="returnClass(sector.returns[option.value])">
                {{ formatReturn(sector.returns[option.value]) }}
              </strong>
            </div>
          </div>

          <div class="fund-table">
            <div class="fund-row fund-header">
              <span>相关基金</span><span>规模</span><span>年运作费</span><span>溢折价</span
              ><span>首年成本估算</span><span>最新收盘</span>
            </div>
            <a
              v-for="fund in getSectorFunds(sector.name)"
              :key="fund.code"
              :href="fund.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="fund-row"
            >
              <span
                ><strong>{{ fund.name }}</strong
                ><small>{{ fund.code }} ↗</small></span
              >
              <span>
                <strong>{{ fund.scaleBillionCny?.toFixed(2) ?? '—' }} 亿</strong>
                <small>{{ fund.scaleDate ?? '数据待更新' }}</small>
              </span>
              <span>{{ totalFee(fund) === null ? '—' : `${totalFee(fund)?.toFixed(2)}%` }}</span>
              <span
                >{{ formatCost(fund.premiumRatePct)
                }}<small>净值 {{ fund.navDate ?? '—' }}</small></span
              >
              <span
                >{{ formatCost(firstYearCost(fund))
                }}<small>含 {{ brokerageFeePct.toFixed(2) }}% 买入佣金</small></span
              >
              <span>{{ fund.latestClose.toFixed(3) }}</span>
            </a>
          </div>
        </div>
      </details>
    </div>

    <footer>
      {{
        dataset.source
      }}。ETF价格可能受流动性、溢折价和分红影响，排行榜仅用于市场观察，不构成投资建议。
      首年成本估算为年运作费、买入佣金和最近溢折价之和，不含卖出佣金、买卖价差、跟踪误差和税费。
    </footer>
  </div>
</template>

<style scoped>
.sector-page {
  max-width: 1240px;
  margin: 0 auto;
  padding: 58px clamp(20px, 4vw, 64px) 80px;
}

.page-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
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
  margin: 0;
  font-family: Georgia, 'Songti SC', serif;
  font-size: clamp(46px, 7vw, 76px);
  font-weight: 400;
  letter-spacing: -0.04em;
}

.market-state {
  padding: 12px 15px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  display: flex;
  align-items: center;
  gap: 10px;
}

.market-state > span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}

.market-state > span.holiday {
  background: #9a7420;
  box-shadow: 0 0 0 4px #f4ecd9;
}

.market-state strong,
.market-state small {
  display: block;
}

.market-state strong {
  font-size: 12px;
}

.market-state small {
  margin-top: 3px;
  color: var(--muted);
  font-size: 10px;
}

.market-summary {
  margin: 38px 0 28px;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.market-summary div {
  padding: 18px 16px;
  border-right: 1px solid var(--border);
}

.market-summary div:last-child {
  border-right: 0;
}

.market-summary span,
.market-summary strong {
  display: block;
}

.market-summary span {
  margin-bottom: 8px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.market-summary strong {
  font-family: Georgia, 'Songti SC', serif;
  font-size: 22px;
  font-weight: 500;
}

.toolbar {
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.period-tabs {
  padding: 3px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface-soft);
  display: flex;
}

.period-tabs button {
  padding: 8px 13px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
}

.period-tabs button.active {
  background: var(--surface);
  color: var(--ink);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.filters {
  display: flex;
  gap: 8px;
}

.commission-field {
  color: var(--muted);
  display: grid;
  gap: 5px;
  font-size: 9px;
}

.commission-field span {
  padding-right: 8px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface);
  display: flex;
  align-items: center;
}

.commission-field input {
  width: 66px;
  border: 0;
  background: transparent;
}

select,
input {
  min-width: 130px;
  padding: 9px 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface);
  color: var(--ink);
  font-size: 12px;
}

.ranking-head,
summary {
  display: grid;
  grid-template-columns: minmax(190px, 1fr) minmax(180px, 0.8fr) 130px 20px;
  align-items: center;
  gap: 20px;
}

.ranking-head {
  padding: 10px 18px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.ranking-head span:last-child {
  grid-column: 3;
  text-align: right;
}

.ranking-list {
  overflow: hidden;
  border-top: 1px solid var(--ink);
}

details {
  border-bottom: 1px solid var(--border);
}

summary {
  min-height: 78px;
  padding: 12px 18px;
  position: relative;
  cursor: pointer;
  list-style: none;
}

summary::-webkit-details-marker {
  display: none;
}

summary:hover {
  background: var(--surface);
}

.rank {
  position: absolute;
  color: var(--muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
}

.sector-name {
  padding-left: 36px;
}

.sector-name strong,
.sector-name small,
.representative strong,
.representative small {
  display: block;
}

.sector-name strong {
  font-family: Georgia, 'Songti SC', serif;
  font-size: 19px;
  font-weight: 500;
}

.sector-name small,
.representative small {
  margin-top: 5px;
  color: var(--muted);
  font-size: 10px;
}

.representative strong {
  font-size: 12px;
}

.period-return {
  font-family: Georgia, serif;
  font-size: 20px;
  text-align: right;
}

.positive {
  color: #b33c2e;
}

.negative {
  color: #187555;
}

.disclosure {
  color: var(--muted);
  text-align: right;
  transition: transform 0.2s ease;
}

details[open] .disclosure {
  transform: rotate(180deg);
}

.sector-detail {
  padding: 20px 18px 24px 54px;
  background: var(--surface-soft);
}

.return-strip {
  margin-bottom: 18px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1px;
}

.return-strip div {
  padding: 12px;
  background: var(--surface);
}

.return-strip span,
.return-strip strong {
  display: block;
}

.return-strip span {
  margin-bottom: 7px;
  color: var(--muted);
  font-size: 10px;
}

.return-strip strong {
  font-size: 13px;
}

.fund-row {
  padding: 11px 12px;
  border-bottom: 1px solid var(--border);
  color: var(--ink);
  display: grid;
  grid-template-columns: minmax(190px, 1fr) 120px 90px 110px 130px 90px;
  gap: 16px;
  text-decoration: none;
}

.fund-row:last-child {
  border-bottom: 0;
}

.fund-row:not(.fund-header):hover {
  background: var(--surface);
}

.fund-header {
  color: var(--muted);
  font-size: 9px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.fund-row strong,
.fund-row small {
  display: block;
}

.fund-row small {
  margin-top: 4px;
  color: var(--muted);
  font-size: 9px;
}

footer {
  margin-top: 24px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.7;
}

@media (max-width: 800px) {
  .page-heading,
  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .market-state {
    align-self: flex-start;
  }

  .market-summary {
    grid-template-columns: 1fr 1fr;
  }

  .market-summary div:nth-child(2) {
    border-right: 0;
  }

  .filters {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .filters > input {
    grid-column: 1 / -1;
  }

  .period-tabs {
    overflow-x: auto;
  }

  .period-tabs button {
    flex: 1 0 auto;
  }

  .ranking-head {
    display: none;
  }

  summary {
    grid-template-columns: minmax(0, 1fr) 100px 14px;
    gap: 10px;
  }

  .representative {
    display: none;
  }

  .sector-detail {
    padding-left: 18px;
  }

  .return-strip {
    grid-template-columns: repeat(3, 1fr);
  }

  .fund-table {
    overflow-x: auto;
  }

  .fund-row {
    min-width: 850px;
  }
}
</style>
