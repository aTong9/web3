<script setup lang="ts">
import { computed } from 'vue'
import type { ContractPaperTrade } from '@/types'
import DisclosureCard from '@/components/DisclosureCard.vue'
import { useI18n } from '@/composables/use-i18n'
import {
  evaluateContractPaperTrade,
  summarizeContractPaperTrades,
} from '@/utils/contract-paper-journal'

const props = defineProps<{
  trades: ContractPaperTrade[]
  currentSymbol: string
  currentPrice: number | null
}>()
const emit = defineEmits<{
  select: [trade: ContractPaperTrade]
  close: [trade: ContractPaperTrade]
  remove: [trade: ContractPaperTrade]
}>()
const { locale, t } = useI18n()
const summary = computed(() => summarizeContractPaperTrades(props.trades))
const rows = computed(() =>
  props.trades.map((trade) => ({
    trade,
    evaluation: evaluateContractPaperTrade(
      trade,
      trade.symbol === props.currentSymbol ? props.currentPrice : null,
    ),
  })),
)

const formatNumber = (value: number | null, maximumFractionDigits = 2) =>
  value === null
    ? '—'
    : value.toLocaleString(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
        maximumFractionDigits,
      })
const formatPrice = (value: number | null) =>
  value === null ? '—' : formatNumber(value, value < 1 ? 6 : value < 100 ? 4 : 2)
const formatSigned = (value: number | null, digits = 1) =>
  value === null ? '—' : `${value > 0 ? '+' : ''}${formatNumber(value, digits)}%`
const formatMetric = (value: number | null, digits: number, suffix: string) =>
  value === null ? '—' : `${formatNumber(value, digits)}${suffix}`
const formatMoney = (value: number | null, quoteAsset: string, signed = false) =>
  value === null
    ? '—'
    : `${signed && value > 0 ? '+' : ''}${formatNumber(value, 2)} ${quoteAsset}`
const formatTime = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(value))
    : '—'
const resultClass = (value: number | null | undefined) =>
  value === null || value === undefined ? 'neutral' : value >= 0 ? 'positive' : 'negative'
</script>

<template>
  <DisclosureCard
    class="paper-journal"
    :default-open="true"
    :eyebrow="t('assetTechnical.contract.journal.eyebrow')"
    :title="t('assetTechnical.contract.journal.title')"
    :description="t('assetTechnical.contract.journal.description')"
  >
    <template #metric>
      <strong>
        {{ t('assetTechnical.contract.journal.openCount', { count: summary.open }) }}
      </strong>
    </template>
    <div class="journal-summary">
      <article>
        <span>{{ t('assetTechnical.contract.journal.total') }}</span>
        <strong>{{ summary.total }}</strong>
      </article>
      <article>
        <span>{{ t('assetTechnical.contract.journal.open') }}</span>
        <strong>{{ summary.open }}</strong>
      </article>
      <article>
        <span>{{ t('assetTechnical.contract.journal.closed') }}</span>
        <strong>{{ summary.closed }}</strong>
      </article>
      <article>
        <span>{{ t('assetTechnical.contract.journal.winRate') }}</span>
        <strong>{{ formatMetric(summary.winRatePct, 1, '%') }}</strong>
      </article>
    </div>
    <p v-if="!rows.length" class="journal-empty">
      {{ t('assetTechnical.contract.journal.empty') }}
    </p>
    <div v-else class="journal-list">
      <article
        v-for="row in rows"
        :key="row.trade.id"
        class="journal-row"
        :class="row.trade.status"
      >
        <header>
          <div>
            <strong>{{ row.trade.symbol }}</strong>
            <span>{{ row.trade.displayName }}</span>
          </div>
          <div>
            <b :class="row.trade.direction">
              {{ t(`assetTechnical.contract.simulator.${row.trade.direction}`) }}
            </b>
            <em>{{ t(`assetTechnical.contract.journal.status.${row.trade.status}`) }}</em>
          </div>
        </header>
        <dl class="journal-plan">
          <div>
            <dt>{{ t('assetTechnical.contract.journal.openedAt') }}</dt>
            <dd>{{ formatTime(row.trade.openedAt) }}</dd>
          </div>
          <div>
            <dt>{{ t('assetTechnical.contract.journal.entryPrice') }}</dt>
            <dd>{{ formatPrice(row.trade.entryPrice) }}</dd>
          </div>
          <div>
            <dt>{{ t('assetTechnical.contract.journal.referencePrice') }}</dt>
            <dd>{{ formatPrice(row.evaluation?.referencePrice ?? null) }}</dd>
          </div>
          <div>
            <dt>{{ t('assetTechnical.contract.journal.position') }}</dt>
            <dd>
              {{ formatMoney(row.trade.notional, row.trade.quoteAsset) }} ·
              {{ row.trade.leverage }}x
            </dd>
          </div>
          <div>
            <dt>{{ t('assetTechnical.contract.journal.plan') }}</dt>
            <dd>{{ formatPrice(row.trade.stopLoss) }} / {{ formatPrice(row.trade.takeProfit) }}</dd>
          </div>
          <div>
            <dt>{{ t('assetTechnical.contract.journal.plannedRisk') }}</dt>
            <dd>
              {{ formatMoney(row.trade.enteredRiskAmount, row.trade.quoteAsset) }} /
              {{ formatMoney(row.trade.riskBudget, row.trade.quoteAsset) }}
            </dd>
          </div>
        </dl>
        <div class="journal-review">
          <div>
            <span>{{ t('assetTechnical.contract.journal.positionMove') }}</span>
            <strong :class="resultClass(row.evaluation?.positionMovePct)">
              {{ formatSigned(row.evaluation?.positionMovePct ?? null, 2) }}
            </strong>
          </div>
          <div>
            <span>{{ t('assetTechnical.contract.journal.estimatedNetPnl') }}</span>
            <strong :class="resultClass(row.evaluation?.netPnl)">
              {{ formatMoney(row.evaluation?.netPnl ?? null, row.trade.quoteAsset, true) }}
            </strong>
          </div>
          <div>
            <span>{{ t('assetTechnical.contract.journal.marginReturn') }}</span>
            <strong :class="resultClass(row.evaluation?.marginReturnPct)">
              {{ formatSigned(row.evaluation?.marginReturnPct ?? null, 2) }}
            </strong>
          </div>
          <div>
            <span>{{ t('assetTechnical.contract.journal.signalSnapshot') }}</span>
            <strong>
              {{ row.trade.signalScore > 0 ? '+' : '' }}{{ row.trade.signalScore }} ·
              {{ row.trade.signalConfidence }}%
            </strong>
          </div>
        </div>
        <footer>
          <small v-if="row.trade.status === 'open' && !row.evaluation">
            {{ t('assetTechnical.contract.journal.selectHint') }}
          </small>
          <button
            v-if="row.trade.status === 'open' && row.trade.symbol !== currentSymbol"
            type="button"
            @click="emit('select', row.trade)"
          >
            {{ t('assetTechnical.contract.journal.select') }}
          </button>
          <button
            v-else-if="row.trade.status === 'open'"
            type="button"
            :disabled="currentPrice === null"
            @click="emit('close', row.trade)"
          >
            {{ t('assetTechnical.contract.journal.close') }}
          </button>
          <button
            v-else
            type="button"
            class="remove"
            @click="emit('remove', row.trade)"
          >
            {{ t('assetTechnical.contract.journal.remove') }}
          </button>
        </footer>
      </article>
    </div>
    <p class="journal-disclaimer">{{ t('assetTechnical.contract.journal.disclaimer') }}</p>
  </DisclosureCard>
</template>

<style scoped>
.journal-summary {
  padding-top: 14px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 7px;
}
.journal-summary article {
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
  display: grid;
  gap: 6px;
}
.journal-summary span,
.journal-plan dt,
.journal-review span,
.journal-row header span,
.journal-row footer small,
.journal-empty,
.journal-disclaimer {
  color: var(--muted);
  font-size: 7px;
}
.journal-summary strong {
  font-size: 12px;
}
.journal-empty {
  margin: 10px 0 0;
  padding: 18px;
  border: 1px dashed var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
  text-align: center;
  line-height: 1.6;
}
.journal-list {
  margin-top: 8px;
  display: grid;
  gap: 8px;
}
.journal-row {
  padding: 11px;
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 7px;
  background: var(--surface-soft);
}
.journal-row.closed {
  border-left-color: var(--muted);
}
.journal-row > header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}
.journal-row > header > div {
  display: flex;
  gap: 7px;
  align-items: center;
}
.journal-row > header strong {
  font-size: 11px;
}
.journal-row > header b,
.journal-row > header em {
  padding: 4px 6px;
  border-radius: 99px;
  font-size: 7px;
  font-style: normal;
}
.journal-row > header b.long {
  background: color-mix(in srgb, var(--positive) 12%, var(--surface));
  color: var(--positive);
}
.journal-row > header b.short {
  background: color-mix(in srgb, var(--negative) 12%, var(--surface));
  color: var(--negative);
}
.journal-row > header em {
  background: var(--surface);
  color: var(--muted);
}
.journal-plan {
  margin: 10px 0 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}
.journal-plan div {
  min-width: 0;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
}
.journal-plan dd {
  margin: 5px 0 0;
  overflow-wrap: anywhere;
  font-size: 8px;
  font-weight: 700;
}
.journal-review {
  margin-top: 6px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}
.journal-review div {
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  display: grid;
  gap: 5px;
}
.journal-review strong {
  font-size: 9px;
}
.journal-review strong.positive {
  color: var(--positive);
}
.journal-review strong.negative {
  color: var(--negative);
}
.journal-review strong.neutral {
  color: var(--muted);
}
.journal-row footer {
  margin-top: 8px;
  display: flex;
  justify-content: end;
  gap: 8px;
  align-items: center;
}
.journal-row footer small {
  margin-right: auto;
  line-height: 1.45;
}
.journal-row footer button {
  min-height: 34px;
  padding: 7px 10px;
  border: 1px solid var(--accent);
  border-radius: 6px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 8px;
  font-weight: 700;
  cursor: pointer;
}
.journal-row footer button:disabled {
  border-color: var(--border);
  background: var(--surface-soft);
  color: var(--muted);
  cursor: not-allowed;
  opacity: 0.7;
}
.journal-row footer button.remove {
  border-color: var(--border);
  background: var(--surface);
  color: var(--muted);
}
.journal-disclaimer {
  margin: 9px 2px 0;
  line-height: 1.6;
}
@media (max-width: 760px) {
  .journal-summary,
  .journal-plan,
  .journal-review {
    grid-template-columns: 1fr;
  }
  .journal-row > header,
  .journal-row footer {
    align-items: stretch;
    flex-direction: column;
  }
  .journal-row > header > div,
  .journal-row footer {
    justify-content: start;
  }
}
</style>
