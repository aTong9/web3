<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type {
  BtcAutoPerformanceSummary,
  BtcAutoTrade,
  BtcAutoTradingConfig,
  BtcAutoTradingDashboard,
} from '@/types'
import DisclosureCard from '@/components/DisclosureCard.vue'
import { useI18n } from '@/composables/use-i18n'
import { quantApi } from '@/utils/quant-api'

const { locale, t } = useI18n()
const dashboard = ref<BtcAutoTradingDashboard | null>(null)
const loading = ref(true)
const busy = ref(false)
const error = ref<string | null>(null)
const draft = reactive<BtcAutoTradingConfig>({
  enabled: true,
  executionMode: 'paper',
  symbol: 'BTCUSDT',
  interval: '5m',
  notionalUsdt: 100,
  leverage: 2,
  minimumConfidence: 65,
  requiredConfirmations: 2,
  cooldownMinutes: 30,
  dailyLossLimitUsdt: 10,
  feeRatePct: 0.05,
  eligibilityConfirmed: false,
  updatedAt: new Date(0).toISOString(),
})

const hydrate = (next: BtcAutoTradingDashboard) => {
  dashboard.value = next
  Object.assign(draft, next.config)
}

const load = async () => {
  loading.value = true
  error.value = null
  try {
    hydrate(await quantApi.btcAutoTrading())
  } catch (loadError) {
    error.value =
      loadError instanceof Error ? loadError.message : t('assetTechnical.contract.auto.error')
  } finally {
    loading.value = false
  }
}

const save = async () => {
  if (busy.value) return
  busy.value = true
  error.value = null
  try {
    hydrate(await quantApi.saveBtcAutoTrading({ ...draft }))
  } catch (saveError) {
    error.value =
      saveError instanceof Error ? saveError.message : t('assetTechnical.contract.auto.error')
  } finally {
    busy.value = false
  }
}

const runNow = async () => {
  if (busy.value) return
  busy.value = true
  error.value = null
  try {
    hydrate(await quantApi.runBtcAutoTrading())
  } catch (runError) {
    error.value =
      runError instanceof Error ? runError.message : t('assetTechnical.contract.auto.error')
  } finally {
    busy.value = false
  }
}

const closePosition = async () => {
  if (busy.value || !dashboard.value?.openTrade) return
  if (!window.confirm(t('assetTechnical.contract.auto.manualCloseConfirm'))) return
  busy.value = true
  error.value = null
  try {
    hydrate(await quantApi.closeBtcAutoTrading())
  } catch (closeError) {
    error.value =
      closeError instanceof Error ? closeError.message : t('assetTechnical.contract.auto.error')
  } finally {
    busy.value = false
  }
}

const formatNumber = (value: number | null, digits = 2) =>
  value === null
    ? '—'
    : value.toLocaleString(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
        maximumFractionDigits: digits,
      })
const formatSigned = (value: number | null, digits = 2, suffix = '') =>
  value === null ? '—' : `${value > 0 ? '+' : ''}${formatNumber(value, digits)}${suffix}`
const formatTime = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(value))
    : '—'
const pnlClass = (value: number | null) =>
  value === null ? 'neutral' : value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral'
const performance = computed(() => dashboard.value?.performance ?? [])
const recentTrades = computed(() => dashboard.value?.trades.slice(0, 12) ?? [])
const periodLabel = (summary: BtcAutoPerformanceSummary) =>
  t(`assetTechnical.contract.auto.period.${summary.period}`)
const tradeDirection = (trade: BtcAutoTrade) =>
  t(`assetTechnical.contract.simulator.${trade.direction}`)

onMounted(load)
</script>

<template>
  <DisclosureCard
    class="btc-auto-panel"
    :default-open="true"
    :eyebrow="t('assetTechnical.contract.auto.eyebrow')"
    :title="t('assetTechnical.contract.auto.title')"
    :description="t('assetTechnical.contract.auto.description')"
  >
    <template #metric>
      <span class="engine-state" :class="dashboard?.config.enabled ? 'enabled' : 'disabled'">
        <i></i>
        {{
          t(
            dashboard?.config.enabled
              ? 'assetTechnical.contract.auto.enabled'
              : 'assetTechnical.contract.auto.disabled',
          )
        }}
      </span>
    </template>

    <p v-if="loading" class="panel-message">{{ t('assetTechnical.contract.auto.loading') }}</p>
    <p v-else-if="error && !dashboard" class="panel-message error">{{ error }}</p>
    <template v-else-if="dashboard">
      <div class="auto-status-strip">
        <span>{{ dashboard.config.symbol }} · {{ dashboard.config.interval }}</span>
        <span>{{ t(`assetTechnical.contract.auto.mode.${dashboard.config.executionMode}`) }}</span>
        <span v-if="dashboard.signal">
          {{ t(`assetTechnical.contract.auto.marketSource.${dashboard.signal.marketSource}`) }}
        </span>
        <span :class="dashboard.credentialsReady ? 'ready' : 'pending'">
          {{
            t(
              dashboard.credentialsReady
                ? 'assetTechnical.contract.auto.credentialsReady'
                : 'assetTechnical.contract.auto.credentialsMissing',
            )
          }}
        </span>
        <span
          >{{ t('assetTechnical.contract.auto.lastRun') }}
          {{ formatTime(dashboard.lastRunAt) }}</span
        >
      </div>

      <p v-if="error || dashboard.lastError" class="panel-message error">
        {{ error || dashboard.lastError }}
      </p>

      <section class="signal-and-position">
        <article class="auto-signal">
          <header>
            <span>{{ t('assetTechnical.contract.auto.latestSignal') }}</span>
            <b>{{
              dashboard.signal
                ? t(`assetTechnical.contract.action.${dashboard.signal.action}`)
                : '—'
            }}</b>
          </header>
          <dl>
            <div>
              <dt>{{ t('assetTechnical.contract.auto.score') }}</dt>
              <dd>{{ dashboard.signal?.score ?? '—' }}</dd>
            </div>
            <div>
              <dt>{{ t('assetTechnical.contract.auto.confidence') }}</dt>
              <dd>{{ dashboard.signal ? `${dashboard.signal.confidence}%` : '—' }}</dd>
            </div>
            <div>
              <dt>{{ t('assetTechnical.contract.auto.evolution') }}</dt>
              <dd>
                {{
                  dashboard.signal
                    ? t(`assetTechnical.contract.auto.evolutionState.${dashboard.signal.evolution}`)
                    : '—'
                }}
              </dd>
            </div>
            <div>
              <dt>{{ t('assetTechnical.contract.auto.confirmations') }}</dt>
              <dd>
                {{ dashboard.signal?.confirmations ?? 0 }} /
                {{ dashboard.config.requiredConfirmations }}
              </dd>
            </div>
          </dl>
        </article>

        <article class="open-position">
          <header>
            <span>{{ t('assetTechnical.contract.auto.openPosition') }}</span>
            <b v-if="dashboard.openTrade" :class="dashboard.openTrade.direction">
              {{ tradeDirection(dashboard.openTrade) }}
            </b>
            <b v-else>{{ t('assetTechnical.contract.auto.flat') }}</b>
          </header>
          <dl v-if="dashboard.openTrade">
            <div>
              <dt>{{ t('assetTechnical.contract.auto.entry') }}</dt>
              <dd>{{ formatNumber(dashboard.openTrade.entryPrice) }}</dd>
            </div>
            <div>
              <dt>{{ t('assetTechnical.contract.auto.quantity') }}</dt>
              <dd>{{ formatNumber(dashboard.openTrade.quantity, 6) }} BTC</dd>
            </div>
            <div>
              <dt>{{ t('assetTechnical.contract.auto.stop') }}</dt>
              <dd>{{ formatNumber(dashboard.openTrade.stopLoss) }}</dd>
            </div>
            <div>
              <dt>{{ t('assetTechnical.contract.auto.target') }}</dt>
              <dd>{{ formatNumber(dashboard.openTrade.takeProfit) }}</dd>
            </div>
          </dl>
          <p v-else>{{ t('assetTechnical.contract.auto.flatHint') }}</p>
        </article>
      </section>

      <section class="performance-grid">
        <article v-for="summary in performance" :key="summary.period">
          <header>
            <span>{{ periodLabel(summary) }}</span>
            <b :class="pnlClass(summary.netPnl)">{{ formatSigned(summary.netPnl, 2, ' USDT') }}</b>
          </header>
          <dl>
            <div>
              <dt>{{ t('assetTechnical.contract.auto.trades') }}</dt>
              <dd>{{ summary.trades }}</dd>
            </div>
            <div>
              <dt>{{ t('assetTechnical.contract.auto.winRate') }}</dt>
              <dd>{{ formatSigned(summary.winRatePct, 1, '%').replace('+', '') }}</dd>
            </div>
            <div>
              <dt>{{ t('assetTechnical.contract.auto.winLossRatio') }}</dt>
              <dd>{{ formatNumber(summary.averageWinLossRatio) }}</dd>
            </div>
            <div>
              <dt>{{ t('assetTechnical.contract.auto.profitFactor') }}</dt>
              <dd>{{ formatNumber(summary.profitFactor) }}</dd>
            </div>
          </dl>
        </article>
      </section>

      <form class="auto-config" @submit.prevent="save">
        <header>
          <div>
            <span>{{ t('assetTechnical.contract.auto.configTitle') }}</span>
            <small>{{ t('assetTechnical.contract.auto.schedule') }}</small>
          </div>
          <label class="enable-toggle">
            <input v-model="draft.enabled" type="checkbox" />
            {{ t('assetTechnical.contract.auto.allowEntries') }}
          </label>
        </header>
        <div class="config-fields">
          <label>
            <span>{{ t('assetTechnical.contract.auto.executionMode') }}</span>
            <select v-model="draft.executionMode">
              <option value="paper">{{ t('assetTechnical.contract.auto.mode.paper') }}</option>
              <option value="testnet">{{ t('assetTechnical.contract.auto.mode.testnet') }}</option>
            </select>
          </label>
          <label>
            <span>{{ t('assetTechnical.contract.auto.notional') }}</span>
            <input
              v-model.number="draft.notionalUsdt"
              type="number"
              min="10"
              max="10000"
              step="10"
            />
          </label>
          <label>
            <span>{{ t('assetTechnical.contract.auto.leverage') }}</span>
            <input v-model.number="draft.leverage" type="number" min="1" max="5" step="1" />
          </label>
          <label>
            <span>{{ t('assetTechnical.contract.auto.minimumConfidence') }}</span>
            <input
              v-model.number="draft.minimumConfidence"
              type="number"
              min="55"
              max="88"
              step="1"
            />
          </label>
          <label>
            <span>{{ t('assetTechnical.contract.auto.requiredConfirmations') }}</span>
            <input
              v-model.number="draft.requiredConfirmations"
              type="number"
              min="2"
              max="6"
              step="1"
            />
          </label>
          <label>
            <span>{{ t('assetTechnical.contract.auto.cooldown') }}</span>
            <input
              v-model.number="draft.cooldownMinutes"
              type="number"
              min="5"
              max="1440"
              step="5"
            />
          </label>
          <label>
            <span>{{ t('assetTechnical.contract.auto.dailyLossLimit') }}</span>
            <input
              v-model.number="draft.dailyLossLimitUsdt"
              type="number"
              min="1"
              max="1000"
              step="1"
            />
          </label>
          <label>
            <span>{{ t('assetTechnical.contract.auto.feeRate') }}</span>
            <input v-model.number="draft.feeRatePct" type="number" min="0" max="1" step="0.01" />
          </label>
        </div>
        <label v-if="draft.executionMode === 'testnet'" class="eligibility-check">
          <input v-model="draft.eligibilityConfirmed" type="checkbox" />
          <span>{{ t('assetTechnical.contract.auto.eligibilityConfirmation') }}</span>
        </label>
        <footer>
          <small>{{ t('assetTechnical.contract.auto.testnetBoundary') }}</small>
          <button
            v-if="dashboard.openTrade"
            type="button"
            class="danger"
            :disabled="busy || dashboard.openTrade.status !== 'open'"
            @click="closePosition"
          >
            {{ t('assetTechnical.contract.auto.manualClose') }}
          </button>
          <button type="button" :disabled="busy" @click="runNow">
            {{ t('assetTechnical.contract.auto.runNow') }}
          </button>
          <button type="submit" class="primary" :disabled="busy">
            {{ t('assetTechnical.contract.auto.save') }}
          </button>
        </footer>
      </form>

      <section class="trade-history">
        <header>
          <span>{{ t('assetTechnical.contract.auto.history') }}</span>
          <small>{{ t('assetTechnical.contract.auto.pnlBoundary') }}</small>
        </header>
        <p v-if="!recentTrades.length" class="panel-message">
          {{ t('assetTechnical.contract.auto.empty') }}
        </p>
        <div v-else class="trade-table-wrap">
          <table>
            <thead>
              <tr>
                <th>{{ t('assetTechnical.contract.auto.time') }}</th>
                <th>{{ t('assetTechnical.contract.auto.direction') }}</th>
                <th>{{ t('assetTechnical.contract.auto.modeLabel') }}</th>
                <th>{{ t('assetTechnical.contract.auto.entryExit') }}</th>
                <th>{{ t('assetTechnical.contract.auto.netPnl') }}</th>
                <th>{{ t('assetTechnical.contract.auto.closeReason') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="trade in recentTrades" :key="trade.id">
                <td>{{ formatTime(trade.closedAt || trade.openedAt) }}</td>
                <td>{{ tradeDirection(trade) }}</td>
                <td>{{ t(`assetTechnical.contract.auto.mode.${trade.executionMode}`) }}</td>
                <td>{{ formatNumber(trade.entryPrice) }} / {{ formatNumber(trade.exitPrice) }}</td>
                <td :class="pnlClass(trade.netPnl)">{{ formatSigned(trade.netPnl, 2) }}</td>
                <td>
                  {{
                    trade.closeReason
                      ? t(`assetTechnical.contract.auto.closeReasonState.${trade.closeReason}`)
                      : t(`assetTechnical.contract.auto.tradeStatus.${trade.status}`)
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </DisclosureCard>
</template>

<style scoped>
.btc-auto-panel {
  --auto-gap: 8px;
}
.engine-state,
.auto-status-strip,
.enable-toggle {
  display: inline-flex;
  align-items: center;
}
.engine-state {
  gap: 6px;
  color: var(--muted);
  font-size: 8px;
}
.engine-state i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}
.engine-state.enabled,
.auto-status-strip .ready {
  color: var(--positive);
}
.auto-status-strip .pending,
.panel-message.error {
  color: var(--warning);
}
.panel-message {
  margin: 12px 0 0;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 8px;
  line-height: 1.6;
}
.auto-status-strip {
  margin-top: 14px;
  gap: 7px;
  flex-wrap: wrap;
}
.auto-status-strip span {
  padding: 5px 7px;
  border: 1px solid var(--border);
  border-radius: 99px;
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 7px;
}
.signal-and-position,
.performance-grid {
  margin-top: var(--auto-gap);
  display: grid;
  gap: var(--auto-gap);
}
.signal-and-position {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.performance-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.auto-signal,
.open-position,
.performance-grid article,
.auto-config,
.trade-history {
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
}
.auto-signal > header,
.open-position > header,
.performance-grid article > header,
.auto-config > header,
.trade-history > header,
.auto-config > footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.auto-signal header span,
.open-position header span,
.performance-grid header span,
.auto-config header span,
.trade-history header span {
  color: var(--muted);
  font-size: 7px;
}
.auto-signal header b,
.open-position header b,
.performance-grid header b {
  font-size: 10px;
}
.open-position header b.long,
.positive {
  color: var(--positive);
}
.open-position header b.short,
.negative {
  color: var(--negative);
}
.neutral {
  color: var(--muted);
}
.auto-signal dl,
.open-position dl,
.performance-grid dl {
  margin: 10px 0 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}
.auto-signal dl div,
.open-position dl div,
.performance-grid dl div {
  min-width: 0;
}
dt,
.open-position p,
.auto-config small,
.trade-history small {
  color: var(--muted);
  font-size: 7px;
}
dd {
  margin: 4px 0 0;
  font-size: 8px;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.open-position p {
  margin: 12px 0 0;
}
.auto-config,
.trade-history {
  margin-top: var(--auto-gap);
}
.auto-config header > div {
  display: grid;
  gap: 4px;
}
.enable-toggle {
  gap: 6px;
  color: var(--ink);
  font-size: 8px;
}
.config-fields {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 7px;
}
.config-fields label {
  display: grid;
  gap: 5px;
  color: var(--muted);
  font-size: 7px;
}
.eligibility-check {
  margin-top: 10px;
  display: flex;
  align-items: start;
  gap: 7px;
  color: var(--muted);
  font-size: 7px;
  line-height: 1.5;
}
.config-fields input,
.config-fields select {
  width: 100%;
  min-height: 36px;
  padding: 7px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--ink);
  font: inherit;
}
.auto-config footer {
  margin-top: 10px;
  justify-content: end;
}
.auto-config footer small {
  margin-right: auto;
  max-width: 680px;
  line-height: 1.5;
}
.auto-config button {
  min-height: 36px;
  padding: 8px 11px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--ink);
  font-size: 8px;
  font-weight: 700;
  cursor: pointer;
}
.auto-config button.primary {
  border-color: var(--accent);
  background: var(--accent);
  color: white;
}
.auto-config button.danger {
  border-color: color-mix(in srgb, var(--negative) 56%, var(--border));
  color: var(--negative);
}
.auto-config button:disabled {
  cursor: wait;
  opacity: 0.55;
}
.trade-table-wrap {
  margin-top: 9px;
  overflow-x: auto;
}
table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: 8px;
}
th,
td {
  padding: 9px 7px;
  border-bottom: 1px solid var(--border);
  text-align: left;
  white-space: nowrap;
}
th {
  color: var(--muted);
  font-size: 7px;
  font-weight: 600;
}
@media (max-width: 900px) {
  .performance-grid,
  .config-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .signal-and-position,
  .performance-grid,
  .config-fields {
    grid-template-columns: 1fr;
  }
  .auto-config > header,
  .auto-config > footer {
    align-items: stretch;
    flex-direction: column;
  }
  .auto-config footer small {
    margin-right: 0;
  }
}
</style>
