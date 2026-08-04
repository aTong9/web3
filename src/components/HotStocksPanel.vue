<script setup lang="ts">
import { computed, ref } from 'vue'
import DataUpdateStatus from '@/components/DataUpdateStatus.vue'
import hotStockData from '@/data/hot-stocks.json'
import type { HotStockDataset } from '@/types'
import { useI18n } from '@/composables/use-i18n'

const props = defineProps<{ market: 'aShare' | 'us' }>()
const dataset = hotStockData as HotStockDataset
const period = ref<'daily' | 'weekly'>('daily')
const expanded = ref(false)
const marketData = computed(() => dataset.markets[props.market])
const rows = computed(() => {
  const source = period.value === 'daily' ? marketData.value.daily : marketData.value.weekly
  return expanded.value ? source : source.slice(0, 8)
})
const method = computed(() =>
  period.value === 'daily' ? marketData.value.dailyMethod : marketData.value.weeklyMethod,
)
const { t } = useI18n()
const formatChange = (value: number | null) =>
  value === null ? '—' : (value > 0 ? '+' : '') + value.toFixed(2) + '%'
const formatActivity = (value: number | null) => {
  if (value === null) return '—'
  if (props.market === 'aShare')
    return value >= 100_000_000
      ? `${(value / 100_000_000).toFixed(1)}${t('hotStocks.unitBillionCny')}`
      : `${(value / 10_000).toFixed(0)}${t('hotStocks.unitTenThousands')}`
  return value >= 100_000_000
    ? `${(value / 100_000_000).toFixed(1)}${t('hotStocks.unitSharesBillion')}`
    : `${(value / 10_000).toFixed(0)}${t('hotStocks.unitSharesTenThousand')}`
}
</script>

<template>
  <section class="hot-panel">
    <header>
      <div>
        <span>{{ t('hotStocks.badge') }}</span>
        <h2>{{ t('hotStocks.title') }}</h2>
        <p>{{ method }}</p>
      </div>
      <div class="actions">
        <div class="period-tabs">
          <button :class="{ active: period === 'daily' }" @click="period = 'daily'">
            {{ t('hotStocks.periodDaily') }}
          </button>
          <button :class="{ active: period === 'weekly' }" @click="period = 'weekly'">
            {{ t('hotStocks.periodWeekly') }}
          </button>
        </div>
        <DataUpdateStatus :updated-at="dataset.updatedAt" schedule="hotStocks" />
      </div>
    </header>
    <p v-if="marketData.status !== 'ok'" class="status-message">
      {{ marketData.statusMessage ?? t('hotStocks.statusFallback') }}
    </p>
    <div class="stock-grid">
      <a
        v-for="stock in rows"
        :key="stock.code"
        :href="stock.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <b>{{ stock.rank.toString().padStart(2, '0') }}</b>
        <span>
          <strong>{{ stock.name }}</strong>
          <small>
            {{ stock.code }} · {{ t('crossAsset.latestValue') }}
            {{ stock.price?.toFixed(2) ?? '—' }} · {{ stock.activityLabel }}
            {{ formatActivity(stock.activityValue) }}
          </small>
        </span>
        <em
          :class="{
            positive:
              ((period === 'daily' ? stock.dayChangePct : stock.weekChangePct) ?? 0) > 0,
            negative:
              ((period === 'daily' ? stock.dayChangePct : stock.weekChangePct) ?? 0) < 0,
          }"
        >
          {{ formatChange(period === 'daily' ? stock.dayChangePct : stock.weekChangePct) }}
        </em>
      </a>
    </div>
    <footer>
      <a :href="marketData.sourceUrl" target="_blank" rel="noopener noreferrer">
        {{ marketData.source }} ↗
      </a>
      <button v-if="marketData[period].length > 8" @click="expanded = !expanded">
        {{ expanded ? t('hotStocks.collapse') : t('hotStocks.expand') }}
      </button>
    </footer>
  </section>
</template>

<style scoped>
.hot-panel {
  margin: 28px 0;
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  box-shadow: var(--shadow);
}
.hot-panel > header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
}
.hot-panel header span {
  color: var(--accent);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.13em;
}
.hot-panel h2 {
  margin: 5px 0;
  font: 400 26px Georgia, 'Songti SC', serif;
}
.hot-panel p,
.actions small {
  margin: 0;
  color: var(--muted);
  font-size: 9px;
}
.actions {
  display: grid;
  justify-items: end;
  gap: 7px;
}
.period-tabs {
  padding: 3px;
  border-radius: 8px;
  background: var(--surface-soft);
}
.period-tabs button {
  padding: 7px 13px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 10px;
}
.period-tabs button.active {
  background: var(--surface);
  color: var(--ink);
  box-shadow: var(--shadow);
}
.stock-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
}
.stock-grid > a {
  min-width: 0;
  padding: 11px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--ink);
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  text-decoration: none;
}
.stock-grid > a:hover {
  border-color: var(--accent);
  background: var(--surface-elevated);
}
.stock-grid > a > b {
  color: var(--muted);
  font-size: 9px;
  font-variant-numeric: tabular-nums;
}
.stock-grid span,
.stock-grid strong,
.stock-grid small {
  min-width: 0;
  display: block;
}
.stock-grid strong {
  overflow: hidden;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.stock-grid small {
  margin-top: 3px;
  overflow: hidden;
  color: var(--muted);
  font-size: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.stock-grid em {
  font-size: 11px;
  font-style: normal;
  font-weight: 700;
}
.positive {
  color: var(--positive);
}
.negative {
  color: var(--negative);
}
.hot-panel > footer {
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.hot-panel footer a,
.hot-panel footer button {
  border: 0;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  font-size: 9px;
  text-decoration: none;
}
.status-message {
  margin-top: 12px !important;
  color: var(--warning) !important;
}
@media (max-width: 680px) {
  .hot-panel > header {
    align-items: start;
    flex-direction: column;
  }
  .actions {
    justify-items: start;
  }
  .stock-grid {
    grid-template-columns: 1fr;
  }
}
</style>
