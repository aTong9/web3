<script setup lang="ts">
import { computed, ref } from 'vue'
import megaCapData from '@/data/us-megacaps.json'
import type { UsMegaCapDataset, UsMegaCapStock } from '@/types'

type SortKey = 'trailingPe' | 'marketCapUsd' | 'historicalPeMedian5y' | 'forwardPe'

const dataset = megaCapData as UsMegaCapDataset
const forwardPeThreshold = 35
const sortKey = ref<SortKey>('forwardPe')
const rows = computed(() =>
  [...dataset.stocks].sort((left, right) => {
    const leftValue = left[sortKey.value]
    const rightValue = right[sortKey.value]
    if (leftValue === null) return 1
    if (rightValue === null) return -1
    return sortKey.value === 'marketCapUsd' ? rightValue - leftValue : leftValue - rightValue
  }),
)

const formatMarketCap = (value: number | null) => {
  if (value === null) return '—'
  return value >= 1_000_000_000_000
    ? `$${(value / 1_000_000_000_000).toFixed(2)}万亿`
    : `$${(value / 1_000_000_000).toFixed(0)}亿`
}
const formatPe = (value: number | null) => (value === null ? '—' : `${value.toFixed(1)}×`)
const valuationGap = (stock: UsMegaCapStock) => {
  if (stock.trailingPe === null || stock.historicalPeMedian5y === null) return null
  return ((stock.trailingPe / stock.historicalPeMedian5y - 1) * 100).toFixed(0)
}
const forwardSignal = (value: number | null) => {
  if (value === null) return { level: 'unavailable', label: '数据不足' }
  if (value > forwardPeThreshold) return { level: 'reduce', label: '减仓观察' }
  if (value < forwardPeThreshold) return { level: 'watch', label: '估值观察' }
  return { level: 'neutral', label: '临界观察' }
}
const signalSummary = computed(() => ({
  reduce: dataset.stocks.filter((stock) => stock.forwardPe !== null && stock.forwardPe > forwardPeThreshold)
    .length,
  watch: dataset.stocks.filter((stock) => stock.forwardPe !== null && stock.forwardPe < forwardPeThreshold)
    .length,
  unavailable: dataset.stocks.filter((stock) => stock.forwardPe === null).length,
}))
const formatUpdatedAt = (value: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
</script>

<template>
  <section class="mega-panel">
    <header>
      <div>
        <span>US MEGA CAPS · TOP 10</span>
        <h2>美股市值前十估值</h2>
        <p>默认按市场预期 Forward PE 从低到高排列；长期中枢取最近5个可用年度正 PE 的中位数。</p>
      </div>
      <label>
        排序口径
        <select v-model="sortKey">
          <option value="trailingPe">当前PE：低到高</option>
          <option value="historicalPeMedian5y">5年PE中枢：低到高</option>
          <option value="forwardPe">市场预期PE：低到高</option>
          <option value="marketCapUsd">市值：高到低</option>
        </select>
      </label>
    </header>

    <p v-if="dataset.status !== 'ok'" class="status-message">
      {{ dataset.statusMessage ?? '估值数据本次未能更新，正在展示上次有效版本。' }}
    </p>

    <div class="discipline-bar" aria-label="Forward PE 35倍估值纪律">
      <div>
        <b>Forward PE 35× 纪律</b>
        <span>高于35×减仓观察；低于35×进入估值观察，仍需结合历史中枢与盈利质量（TSLA，SPCX除外，靠ELON人格魅力）。</span>
      </div>
      <span class="reduce">减仓观察 {{ signalSummary.reduce }}</span>
      <span class="watch">估值观察 {{ signalSummary.watch }}</span>
      <span v-if="signalSummary.unavailable" class="unavailable">
        数据不足 {{ signalSummary.unavailable }}
      </span>
    </div>

    <div class="valuation-table">
      <div class="valuation-row table-head" aria-hidden="true">
        <span>PE排名 / 股票</span>
        <span>市值</span>
        <span>当前PE</span>
        <span>5年PE中枢</span>
        <span>市场预期PE</span>
      </div>
      <a
        v-for="(stock, index) in rows"
        :key="stock.symbol"
        class="valuation-row"
        :href="stock.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="company">
          <b>{{ (index + 1).toString().padStart(2, '0') }}</b>
          <span><strong>{{ stock.symbol }}</strong><small>{{ stock.name }}</small></span>
        </span>
        <span data-label="市值">
          <strong>{{ formatMarketCap(stock.marketCapUsd) }}</strong>
          <small>市值第 {{ stock.marketCapRank }}</small>
        </span>
        <span data-label="当前PE" class="pe-value">
          <strong>{{ formatPe(stock.trailingPe) }}</strong>
          <small v-if="valuationGap(stock) !== null">
            较5年中枢 {{ Number(valuationGap(stock)) > 0 ? '+' : '' }}{{ valuationGap(stock) }}%
          </small>
        </span>
        <span data-label="5年PE中枢">
          <strong>{{ formatPe(stock.historicalPeMedian5y) }}</strong>
          <small>历史估值锚</small>
        </span>
        <span data-label="市场预期PE">
          <strong>{{ formatPe(stock.forwardPe) }}</strong>
          <small>Forward PE</small>
          <em :class="forwardSignal(stock.forwardPe).level">
            {{ forwardSignal(stock.forwardPe).label }}
          </em>
        </span>
      </a>
    </div>

    <footer>
      <span>更新于 {{ formatUpdatedAt(dataset.updatedAt) }}</span>
      <span>
        <a
          v-for="source in dataset.sources"
          :key="source.name"
          :href="source.url"
          target="_blank"
          rel="noopener noreferrer"
          >{{ source.name }} ↗</a
        >
      </span>
    </footer>
    <p class="methodology">{{ dataset.methodology }} PE 受一次性损益与预期变化影响，不应脱离盈利质量单独判断。</p>
  </section>
</template>

<style scoped>
.mega-panel {
  margin: 28px 0;
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
}
.mega-panel > header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
}
.mega-panel header > div > span {
  color: var(--accent);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.13em;
}
.mega-panel h2 {
  margin: 5px 0;
  font: 500 26px Georgia, 'Songti SC', serif;
}
.mega-panel p,
.mega-panel label,
.mega-panel footer {
  margin: 0;
  color: var(--muted);
  font-size: 10px;
}
.mega-panel label {
  display: grid;
  gap: 6px;
}
select {
  min-height: 40px;
  padding: 0 32px 0 11px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
  color: var(--ink);
}
.valuation-table {
  margin-top: 18px;
  border-top: 1px solid var(--ink);
}
.discipline-bar {
  margin-top: 16px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface-soft);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.discipline-bar > div {
  margin-right: auto;
  display: grid;
  gap: 3px;
}
.discipline-bar b {
  font-size: 11px;
}
.discipline-bar div span {
  color: var(--muted);
  font-size: 9px;
}
.discipline-bar > span,
.valuation-row em {
  padding: 4px 7px;
  border-radius: 5px;
  font-size: 9px;
  font-style: normal;
  white-space: nowrap;
}
.reduce {
  background: var(--danger-soft);
  color: var(--danger);
}
.watch {
  background: var(--accent-soft);
  color: var(--accent);
}
.neutral,
.unavailable {
  background: var(--warning-soft);
  color: var(--warning);
}
.valuation-row {
  min-height: 68px;
  padding: 12px 8px;
  border-bottom: 1px solid var(--border);
  color: var(--ink);
  display: grid;
  grid-template-columns: minmax(210px, 1.5fr) repeat(4, minmax(105px, 0.8fr));
  align-items: center;
  gap: 14px;
  text-decoration: none;
}
.valuation-row:not(.table-head):hover {
  background: var(--surface-elevated);
}
.table-head {
  min-height: 36px;
  color: var(--muted);
  font-size: 9px;
  text-transform: uppercase;
}
.valuation-row > span strong,
.valuation-row > span small {
  display: block;
}
.valuation-row > span > strong {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
.valuation-row small {
  margin-top: 4px;
  color: var(--muted);
  font-size: 9px;
}
.valuation-row em {
  margin-top: 6px;
  display: inline-block;
}
.company {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
}
.company > b {
  color: var(--accent);
  font-size: 10px;
}
.company span {
  min-width: 0;
}
.company strong {
  font-size: 14px;
}
.company small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pe-value > strong {
  font-size: 18px !important;
}
.mega-panel > footer {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
.mega-panel footer span:last-child {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.mega-panel footer a {
  color: var(--accent);
  text-decoration: none;
}
.methodology {
  margin-top: 10px !important;
  line-height: 1.6;
}
.status-message {
  margin-top: 12px !important;
  color: var(--warning) !important;
}
@media (max-width: 820px) {
  .mega-panel > header {
    align-items: start;
    flex-direction: column;
  }
  .valuation-table {
    display: grid;
    gap: 8px;
    border: 0;
  }
  .table-head {
    display: none;
  }
  .valuation-row {
    padding: 14px;
    border: 1px solid var(--border);
    border-radius: 9px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .company {
    grid-column: 1 / -1;
  }
  .valuation-row > span:not(.company)::before {
    content: attr(data-label);
    margin-bottom: 4px;
    color: var(--muted);
    display: block;
    font-size: 9px;
  }
}
@media (max-width: 520px) {
  .mega-panel {
    padding: 16px;
  }
  .mega-panel > footer {
    flex-direction: column;
  }
}
</style>
