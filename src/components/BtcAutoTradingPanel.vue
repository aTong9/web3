<script setup lang="ts">
import type { EChartsCoreOption } from 'echarts/core'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import type {
  BtcAutoPerformanceSummary,
  BtcAutoTrade,
  BtcAutoTradingConfig,
  BtcAutoTradingDashboard,
} from '@/types'
import DisclosureCard from '@/components/DisclosureCard.vue'
import EChart from '@/components/EChart.vue'
import { useI18n } from '@/composables/use-i18n'
import { quantApi } from '@/utils/quant-api'

const { locale, t } = useI18n()
const dashboard = ref<BtcAutoTradingDashboard | null>(null)
const loading = ref(true)
const busy = ref(false)
const error = ref<string | null>(null)
const refreshIntervalMs = 60_000
let refreshTimer: number | undefined
const refreshing = ref(false)
const interactionLocked = computed(() => busy.value || refreshing.value)
const draft = reactive<BtcAutoTradingConfig>({
  enabled: true,
  executionMode: 'paper',
  symbol: 'BTCUSDT',
  interval: '5m',
  notionalUsdt: 100,
  leverage: 2,
  minimumConfidence: 65,
  minimumDirectionalScore: 55,
  requiredConfirmations: 2,
  cooldownMinutes: 30,
  dailyLossLimitUsdt: 10,
  maxConsecutiveLosses: 3,
  lossPauseMinutes: 360,
  performanceWindowTrades: 20,
  minimumRollingProfitFactor: 0.8,
  maximumRollingDrawdownUsdt: 3,
  performancePauseMinutes: 1440,
  feeRatePct: 0.05,
  eligibilityConfirmed: false,
  updatedAt: new Date(0).toISOString(),
})

const hydrate = (next: BtcAutoTradingDashboard) => {
  dashboard.value = next
  Object.assign(draft, next.config)
}

const load = async (silent = false) => {
  if (refreshing.value || (silent && busy.value)) return
  refreshing.value = true
  if (!silent) {
    loading.value = true
    error.value = null
  }
  try {
    hydrate(await quantApi.btcAutoTrading())
    error.value = null
  } catch (loadError) {
    error.value =
      loadError instanceof Error ? loadError.message : t('assetTechnical.contract.auto.error')
  } finally {
    if (!silent) loading.value = false
    refreshing.value = false
  }
}

const save = async () => {
  if (interactionLocked.value) return
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
  if (interactionLocked.value) return
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
  if (interactionLocked.value || !dashboard.value?.openTrade) return
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
const equityOption = computed<EChartsCoreOption>(() => {
  const points = dashboard.value?.equityCurve ?? []
  return {
    animationDuration: 350,
    grid: { left: 44, right: 18, top: 38, bottom: 30 },
    legend: {
      top: 0,
      textStyle: { color: '#94a3b8', fontSize: 9 },
      data: [
        t('assetTechnical.contract.auto.dailyNetPnl'),
        t('assetTechnical.contract.auto.cumulativeNetPnl'),
        t('assetTechnical.contract.auto.drawdownSeries'),
      ],
    },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: points.map((point) => point.date.slice(5)),
      axisLabel: { color: '#94a3b8', fontSize: 9 },
      axisLine: { lineStyle: { color: '#334155' } },
    },
    yAxis: {
      type: 'value',
      name: 'USDT',
      nameTextStyle: { color: '#94a3b8', fontSize: 9 },
      axisLabel: { color: '#94a3b8', fontSize: 9 },
      splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.12)' } },
    },
    series: [
      {
        name: t('assetTechnical.contract.auto.dailyNetPnl'),
        type: 'bar',
        data: points.map((point) => ({
          value: point.netPnl,
          itemStyle: { color: point.netPnl >= 0 ? '#22c55e' : '#ef4444' },
        })),
      },
      {
        name: t('assetTechnical.contract.auto.cumulativeNetPnl'),
        type: 'line',
        data: points.map((point) => point.cumulativeNetPnl),
        symbolSize: 5,
        lineStyle: { width: 2, color: '#38bdf8' },
        itemStyle: { color: '#38bdf8' },
      },
      {
        name: t('assetTechnical.contract.auto.drawdownSeries'),
        type: 'line',
        data: points.map((point) => -point.drawdownUsdt),
        symbol: 'none',
        lineStyle: { width: 1, type: 'dashed', color: '#f59e0b' },
        itemStyle: { color: '#f59e0b' },
      },
    ],
  }
})
const recentTrades = computed(() => dashboard.value?.trades.slice(0, 12) ?? [])
const recentSignals = computed(() => dashboard.value?.signalHistory.slice(0, 12) ?? [])
const openRisk = computed(() => {
  const trade = dashboard.value?.openTrade
  const price = dashboard.value?.signal?.price
  if (!trade || !trade.entryPrice || !price) return null
  const multiplier = trade.direction === 'long' ? 1 : -1
  const gross = (price - trade.entryPrice) * trade.quantity * multiplier
  const fees = (trade.entryPrice + price) * trade.quantity * (trade.feeRatePct / 100)
  const riskToStop =
    Math.abs(trade.entryPrice - trade.stopLoss) * trade.quantity +
    (trade.entryPrice + trade.stopLoss) * trade.quantity * (trade.feeRatePct / 100)
  return { unrealizedPnl: gross - fees, riskToStop }
})
const periodLabel = (summary: BtcAutoPerformanceSummary) =>
  t(`assetTechnical.contract.auto.period.${summary.period}`)
const tradeDirection = (trade: BtcAutoTrade) =>
  t(`assetTechnical.contract.simulator.${trade.direction}`)

const exportTrades = async () => {
  if (!dashboard.value || interactionLocked.value) return
  busy.value = true
  error.value = null
  try {
    const blob = await quantApi.exportBtcAutoTrading(locale.value)
    const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  const day = new Date().toISOString().slice(0, 10)
  anchor.href = url
  anchor.download = `btc-auto-trading-${day}.csv`
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
  } catch (exportError) {
    error.value =
      exportError instanceof Error ? exportError.message : t('assetTechnical.contract.auto.error')
  } finally {
    busy.value = false
  }
}

const refreshWhenVisible = () => {
  if (document.visibilityState === 'visible') void load(true)
}

onMounted(() => {
  void load()
  refreshTimer = window.setInterval(refreshWhenVisible, refreshIntervalMs)
  document.addEventListener('visibilitychange', refreshWhenVisible)
})

onBeforeUnmount(() => {
  if (refreshTimer !== undefined) window.clearInterval(refreshTimer)
  document.removeEventListener('visibilitychange', refreshWhenVisible)
})
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
        <span :class="`cycle-${dashboard.lastCycleStatus}`">
          {{ t(`assetTechnical.contract.auto.cycleStatus.${dashboard.lastCycleStatus}`) }}
        </span>
        <span>
          {{ t('assetTechnical.contract.auto.lastSuccess') }}
          {{ formatTime(dashboard.lastSuccessfulRunAt) }}
        </span>
        <span>
          {{ t('assetTechnical.contract.auto.nextRun') }}
          {{ formatTime(dashboard.nextRunAt) }}
        </span>
        <span v-if="dashboard.consecutiveFailures" class="cycle-failed">
          {{
            t('assetTechnical.contract.auto.consecutiveFailures', {
              count: dashboard.consecutiveFailures,
            })
          }}
          · {{ formatTime(dashboard.lastFailureAt) }}
        </span>
      </div>

      <p v-if="error || dashboard.lastError" class="panel-message error">
        {{ error || dashboard.lastError }}
      </p>

      <section class="entry-gate" :class="dashboard.entryGate.eligible ? 'ready' : 'blocked'">
        <div>
          <span>{{ t('assetTechnical.contract.auto.entryGate') }}</span>
          <strong>{{
            t(`assetTechnical.contract.auto.entryGateReason.${dashboard.entryGate.reason}`)
          }}</strong>
        </div>
        <small>
          {{
            t('assetTechnical.contract.auto.lossStreak', {
              count: dashboard.entryGate.consecutiveLosses,
            })
          }}
          <template v-if="dashboard.entryGate.resumeAt">
            · {{ t('assetTechnical.contract.auto.resumeAt') }}
            {{ formatTime(dashboard.entryGate.resumeAt) }}
          </template>
        </small>
      </section>

      <section class="strategy-health" :class="dashboard.rollingHealth.status">
        <header>
          <div>
            <span>{{ t('assetTechnical.contract.auto.rollingHealth') }}</span>
            <strong>{{
              t(
                `assetTechnical.contract.auto.rollingHealthStatus.${dashboard.rollingHealth.status}`,
              )
            }}</strong>
          </div>
          <small v-if="dashboard.rollingHealth.resumeAt">
            {{ t('assetTechnical.contract.auto.resumeAt') }}
            {{ formatTime(dashboard.rollingHealth.resumeAt) }}
          </small>
        </header>
        <dl>
          <div>
            <dt>{{ t('assetTechnical.contract.auto.strategyVersion') }}</dt>
            <dd><code>{{ dashboard.strategyVersion }}</code></dd>
          </div>
          <div>
            <dt>{{ t('assetTechnical.contract.auto.currentVersionSample') }}</dt>
            <dd>
              {{ dashboard.rollingHealth.currentVersionSampleSize }} /
              {{ dashboard.rollingHealth.requiredSampleSize }}
            </dd>
          </div>
          <div>
            <dt>{{ t('assetTechnical.contract.auto.sampleScopeLabel') }}</dt>
            <dd>
              {{
                t(
                  `assetTechnical.contract.auto.sampleScope.${dashboard.rollingHealth.sampleScope}`,
                )
              }}
            </dd>
          </div>
          <div>
            <dt>{{ t('assetTechnical.contract.auto.rollingSample') }}</dt>
            <dd>
              {{ dashboard.rollingHealth.sampleSize }} /
              {{ dashboard.rollingHealth.requiredSampleSize }}
            </dd>
          </div>
          <div>
            <dt>{{ t('assetTechnical.contract.auto.rollingProfitFactor') }}</dt>
            <dd>
              {{ formatNumber(dashboard.rollingHealth.profitFactor) }} /
              {{ formatNumber(dashboard.rollingHealth.minimumProfitFactor) }}
            </dd>
          </div>
          <div>
            <dt>{{ t('assetTechnical.contract.auto.rollingDrawdown') }}</dt>
            <dd>
              {{ formatNumber(dashboard.rollingHealth.maxDrawdownUsdt) }} /
              {{ formatNumber(dashboard.rollingHealth.maximumDrawdownUsdt) }} USDT
            </dd>
          </div>
        </dl>
        <p v-if="dashboard.rollingHealth.reasons.length">
          {{
            dashboard.rollingHealth.reasons
              .map((reason) => t(`assetTechnical.contract.auto.rollingHealthReason.${reason}`))
              .join(' · ')
          }}
        </p>
      </section>

      <section class="shadow-validation">
        <header>
          <div>
            <span>{{ t('assetTechnical.contract.auto.shadowValidation') }}</span>
            <strong>{{ t('assetTechnical.contract.auto.shadowValidationTitle') }}</strong>
          </div>
          <small>{{ t('assetTechnical.contract.auto.shadowValidationHint') }}</small>
        </header>
        <div class="shadow-grid">
          <article v-for="outcome in dashboard.signalOutcomes" :key="outcome.horizon">
            <b>{{ outcome.horizon }}</b>
            <dl>
              <div>
                <dt>{{ t('assetTechnical.contract.auto.shadowSamples') }}</dt>
                <dd>{{ outcome.samples }}</dd>
              </div>
              <div>
                <dt>{{ t('assetTechnical.contract.auto.shadowHitRate') }}</dt>
                <dd>{{ formatSigned(outcome.hitRatePct, 1, '%').replace('+', '') }}</dd>
              </div>
              <div>
                <dt>{{ t('assetTechnical.contract.auto.shadowAverageMove') }}</dt>
                <dd :class="pnlClass(outcome.averageDirectionalMovePct)">
                  {{ formatSigned(outcome.averageDirectionalMovePct, 3, '%') }}
                </dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

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
            <div v-if="openRisk">
              <dt>{{ t('assetTechnical.contract.auto.unrealizedPnl') }}</dt>
              <dd :class="pnlClass(openRisk.unrealizedPnl)">
                {{ formatSigned(openRisk.unrealizedPnl, 2, ' USDT') }}
              </dd>
            </div>
            <div v-if="openRisk">
              <dt>{{ t('assetTechnical.contract.auto.riskToStop') }}</dt>
              <dd>{{ formatNumber(openRisk.riskToStop, 2) }} USDT</dd>
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
              <dt>{{ t('assetTechnical.contract.auto.reconciliationCoverage') }}</dt>
              <dd>{{ summary.reconciledTrades }} / {{ summary.trades }}</dd>
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
            <div>
              <dt>{{ t('assetTechnical.contract.auto.expectancy') }}</dt>
              <dd :class="pnlClass(summary.expectancyUsdt)">
                {{ formatSigned(summary.expectancyUsdt, 2) }}
              </dd>
            </div>
            <div>
              <dt>{{ t('assetTechnical.contract.auto.maxDrawdown') }}</dt>
              <dd>{{ formatNumber(summary.maxDrawdownUsdt, 2) }}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section class="equity-curve">
        <header>
          <div>
            <span>{{ t('assetTechnical.contract.auto.equityCurve') }}</span>
            <strong>{{ t('assetTechnical.contract.auto.equityCurveTitle') }}</strong>
          </div>
          <small>{{ t('assetTechnical.contract.auto.equityCurveHint') }}</small>
        </header>
        <EChart
          v-if="dashboard.equityCurve.length"
          :option="equityOption"
          :label="t('assetTechnical.contract.auto.equityCurveLabel')"
        />
        <p v-else class="panel-message">{{ t('assetTechnical.contract.auto.equityCurveEmpty') }}</p>
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
            <span>{{ t('assetTechnical.contract.auto.minimumDirectionalScore') }}</span>
            <input
              v-model.number="draft.minimumDirectionalScore"
              type="number"
              min="30"
              max="90"
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
            <span>{{ t('assetTechnical.contract.auto.maxConsecutiveLosses') }}</span>
            <input
              v-model.number="draft.maxConsecutiveLosses"
              type="number"
              min="2"
              max="10"
              step="1"
            />
          </label>
          <label>
            <span>{{ t('assetTechnical.contract.auto.lossPauseMinutes') }}</span>
            <input
              v-model.number="draft.lossPauseMinutes"
              type="number"
              min="30"
              max="2880"
              step="30"
            />
          </label>
          <label>
            <span>{{ t('assetTechnical.contract.auto.performanceWindowTrades') }}</span>
            <input
              v-model.number="draft.performanceWindowTrades"
              type="number"
              min="10"
              max="100"
              step="1"
            />
          </label>
          <label>
            <span>{{ t('assetTechnical.contract.auto.minimumRollingProfitFactor') }}</span>
            <input
              v-model.number="draft.minimumRollingProfitFactor"
              type="number"
              min="0.5"
              max="2"
              step="0.05"
            />
          </label>
          <label>
            <span>{{ t('assetTechnical.contract.auto.maximumRollingDrawdown') }}</span>
            <input
              v-model.number="draft.maximumRollingDrawdownUsdt"
              type="number"
              min="1"
              max="1000"
              step="0.5"
            />
          </label>
          <label>
            <span>{{ t('assetTechnical.contract.auto.performancePauseMinutes') }}</span>
            <input
              v-model.number="draft.performancePauseMinutes"
              type="number"
              min="60"
              max="10080"
              step="60"
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
            :disabled="interactionLocked || dashboard.openTrade.status !== 'open'"
            @click="closePosition"
          >
            {{ t('assetTechnical.contract.auto.manualClose') }}
          </button>
          <button type="button" :disabled="interactionLocked" @click="runNow">
            {{ t('assetTechnical.contract.auto.runNow') }}
          </button>
          <button type="submit" class="primary" :disabled="interactionLocked">
            {{ t('assetTechnical.contract.auto.save') }}
          </button>
        </footer>
      </form>

      <section class="trade-history">
        <header>
          <div>
            <span>{{ t('assetTechnical.contract.auto.history') }}</span>
            <small>{{ t('assetTechnical.contract.auto.pnlBoundary') }}</small>
          </div>
          <button
            type="button"
            class="export-button"
            :disabled="interactionLocked"
            @click="exportTrades"
          >
            {{ t('assetTechnical.contract.auto.exportCsv') }}
          </button>
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
                <th>{{ t('assetTechnical.contract.auto.pnlSourceLabel') }}</th>
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
                  {{ t(`assetTechnical.contract.auto.pnlSource.${trade.pnlSource}`) }}
                  <small v-if="trade.fundingFee">
                    · {{ t('assetTechnical.contract.auto.fundingFee') }}
                    {{ formatSigned(trade.fundingFee, 4) }}
                  </small>
                  <small v-if="trade.reconciliationError" class="reconciliation-pending">
                    · {{ t('assetTechnical.contract.auto.reconciliationPending') }}
                  </small>
                </td>
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

      <section class="signal-history">
        <header>
          <span>{{ t('assetTechnical.contract.auto.signalHistory') }}</span>
          <small>{{ t('assetTechnical.contract.auto.signalHistoryHint') }}</small>
        </header>
        <p v-if="!recentSignals.length" class="panel-message">
          {{ t('assetTechnical.contract.auto.signalHistoryEmpty') }}
        </p>
        <div v-else class="trade-table-wrap">
          <table>
            <thead>
              <tr>
                <th>{{ t('assetTechnical.contract.auto.time') }}</th>
                <th>{{ t('assetTechnical.contract.auto.strategyVersion') }}</th>
                <th>{{ t('assetTechnical.contract.auto.latestSignal') }}</th>
                <th>{{ t('assetTechnical.contract.auto.score') }}</th>
                <th>{{ t('assetTechnical.contract.auto.confidence') }}</th>
                <th>{{ t('assetTechnical.contract.auto.evolution') }}</th>
                <th>{{ t('assetTechnical.contract.auto.forwardOutcome') }}</th>
                <th>{{ t('assetTechnical.contract.auto.entryGate') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="signal in recentSignals" :key="signal.id">
                <td>{{ formatTime(signal.observedAt) }}</td>
                <td><code>{{ signal.strategyVersion }}</code></td>
                <td>{{ t(`assetTechnical.contract.action.${signal.action}`) }}</td>
                <td>{{ signal.score }}</td>
                <td>{{ signal.confidence }}%</td>
                <td>{{ t(`assetTechnical.contract.auto.evolutionState.${signal.evolution}`) }}</td>
                <td>
                  1h {{ formatSigned(signal.forward1hPct, 2, '%') }} · 4h
                  {{ formatSigned(signal.forward4hPct, 2, '%') }} · 24h
                  {{ formatSigned(signal.forward24hPct, 2, '%') }}
                </td>
                <td :class="signal.entryEligible ? 'positive' : 'neutral'">
                  {{ t(`assetTechnical.contract.auto.entryGateReason.${signal.entryGateReason}`) }}
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
.trade-history > header > div {
  display: grid;
  gap: 3px;
}
.export-button {
  flex: 0 0 auto;
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
.auto-status-strip .cycle-success {
  color: var(--positive);
}
.auto-status-strip .cycle-failed {
  color: var(--negative);
}
.auto-status-strip .cycle-skipped,
.auto-status-strip .cycle-unknown {
  color: var(--muted);
}
.entry-gate {
  margin-top: var(--auto-gap);
  padding: 10px 11px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid var(--border);
  border-left-width: 3px;
  border-radius: 7px;
  background: var(--surface-soft);
}
.entry-gate.ready {
  border-left-color: var(--positive);
}
.entry-gate.blocked {
  border-left-color: var(--warning);
}
.entry-gate div {
  display: grid;
  gap: 3px;
}
.entry-gate span,
.entry-gate small {
  color: var(--muted);
  font-size: 7px;
}
.entry-gate strong {
  font-size: 9px;
}
.strategy-health {
  margin-top: var(--auto-gap);
  padding: 10px 11px;
  border: 1px solid var(--border);
  border-left: 3px solid var(--positive);
  border-radius: 7px;
  background: var(--surface-soft);
}
.equity-curve {
  margin-top: var(--auto-gap);
  padding: 10px 11px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
}
.equity-curve > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.equity-curve > header div {
  display: grid;
  gap: 3px;
}
.equity-curve span,
.equity-curve small {
  color: var(--muted);
  font-size: 7px;
}
.equity-curve strong {
  font-size: 9px;
}
.equity-curve :deep(.chart) {
  height: 240px;
  min-height: 240px;
}
.shadow-validation {
  margin-top: var(--auto-gap);
  padding: 10px 11px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
}
.shadow-validation > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.shadow-validation > header div {
  display: grid;
  gap: 3px;
}
.shadow-validation span,
.shadow-validation small,
.shadow-validation dt {
  color: var(--muted);
  font-size: 7px;
}
.shadow-validation strong {
  font-size: 9px;
}
.shadow-grid {
  margin-top: 9px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
}
.shadow-grid article {
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
}
.shadow-grid article > b {
  font-size: 9px;
}
.shadow-grid dl {
  margin: 7px 0 0;
  display: grid;
  gap: 5px;
}
.shadow-grid dl div {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.shadow-grid dd {
  margin: 0;
  font-size: 8px;
}
.strategy-health.paused {
  border-left-color: var(--negative);
}
.strategy-health.insufficientSample,
.strategy-health.probeEligible {
  border-left-color: var(--warning);
}
.strategy-health > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.strategy-health > header div {
  display: grid;
  gap: 3px;
}
.strategy-health span,
.strategy-health small,
.strategy-health p {
  color: var(--muted);
  font-size: 7px;
}
.strategy-health strong {
  font-size: 9px;
}
.strategy-health dl {
  margin: 9px 0 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}
.strategy-health p {
  margin: 8px 0 0;
  line-height: 1.5;
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
.trade-history,
.signal-history {
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
.signal-history > header,
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
.trade-history header span,
.signal-history header span {
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
.trade-history small,
.signal-history small {
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
.trade-history,
.signal-history {
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
  min-width: 840px;
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
.reconciliation-pending {
  color: var(--warning);
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
  .shadow-grid {
    grid-template-columns: 1fr;
  }
  .auto-config > header,
  .auto-config > footer {
    align-items: stretch;
    flex-direction: column;
  }
  .entry-gate {
    align-items: start;
    flex-direction: column;
  }
  .strategy-health > header {
    align-items: start;
    flex-direction: column;
  }
  .strategy-health dl {
    grid-template-columns: 1fr;
  }
  .auto-config footer small {
    margin-right: 0;
  }
}
</style>
