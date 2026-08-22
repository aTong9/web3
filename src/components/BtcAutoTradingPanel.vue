<script setup lang="ts">
import type { EChartsCoreOption } from 'echarts/core'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import type {
  BtcAutoPerformanceSummary,
  BtcAutoTrade,
  BtcAutoTradingConfig,
  BtcAutoTradingDashboard,
  TestnetDrillType,
  TestnetExecutionCalibrationEvidenceEnvelope,
  TestnetExecutionCalibrationReport,
} from '@/types'
import DisclosureCard from '@/components/DisclosureCard.vue'
import EChart from '@/components/EChart.vue'
import { useI18n } from '@/composables/use-i18n'
import { quantApi } from '@/utils/quant-api'
import { assessTestnetExecutionCalibrationEvidenceCurrency } from '@/utils/testnet-execution-calibration'

const emit = defineEmits<{
  calibration: [evidence: TestnetExecutionCalibrationEvidenceEnvelope]
}>()
const { locale, t } = useI18n()
const dashboard = ref<BtcAutoTradingDashboard | null>(null)
const loading = ref(true)
const busy = ref(false)
const error = ref<string | null>(null)
const calibrationEvidence = ref<TestnetExecutionCalibrationEvidenceEnvelope | null>(null)
const calibrationLoading = ref(false)
const calibrationError = ref<string | null>(null)
const refreshIntervalMs = 60_000
let refreshTimer: number | undefined
const refreshing = ref(false)
const drillDraft = reactive<{ type: TestnetDrillType; evidence: string }>({
  type: 'emergencyClose',
  evidence: '',
})
const interactionLocked = computed(() => busy.value || refreshing.value)
const draft = reactive<BtcAutoTradingConfig>({
  enabled: true,
  executionMode: 'paper',
  riskControlsEnabled: true,
  hedgeModeEnabled: false,
  maxPositionsPerDirection: 1,
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
  maximumHoldingMinutes: 60,
  feeRatePct: 0.05,
  eligibilityConfirmed: false,
  updatedAt: new Date(0).toISOString(),
})

const hydrate = (next: BtcAutoTradingDashboard) => {
  dashboard.value = next
  Object.assign(draft, next.config)
}

const calibrationCopy = computed(() =>
  locale.value === 'zh'
    ? {
        eyebrow: 'TESTNET 执行证据',
        title: '成交校准与安全演练',
        ready: '可进入 Paper 对比',
        blocked: '证据尚未达标',
        observations: '执行样本',
        uniqueCommands: '唯一执行命令',
        filledObservations: '有效成交样本',
        filledOpenObservations: '开仓有效成交',
        filledCloseObservations: '平仓有效成交',
        commissionCoverage: '手续费证据覆盖率',
        completedRoundTrips: '完整往返交易',
        fillRate: '总成交率',
        rejectionRate: '命令拒绝率',
        slippage: 'P95 绝对滑点',
        submissionLatency: 'P95 提交延迟',
        latency: 'P95 确认延迟',
        unresolved: '未完成对账',
        recovered: '异常恢复',
        recoveryDependencyRate: '异常恢复依赖率',
        costModel: '建议成本模型',
        recommendedFee: '建议单边手续费',
        feeSamples: '手续费样本',
        drills: '安全演练',
        evidence: '演练证据（工单、日志摘要或复盘说明）',
        submit: '记录通过的演练',
        saving: '正在记录…',
        retry: '重新读取',
        drillNames: {
          emergencyClose: '紧急平仓',
          disableEntries: '停止新开仓',
          staleMarketCircuitBreaker: '陈旧行情熔断',
          continuousReconciliation: '持续对账恢复',
        },
      }
    : {
        eyebrow: 'TESTNET EXECUTION EVIDENCE',
        title: 'Fill calibration and safety drills',
        ready: 'Ready for Paper comparison',
        blocked: 'Evidence below threshold',
        observations: 'Observations',
        uniqueCommands: 'Unique commands',
        filledObservations: 'Filled observations',
        filledOpenObservations: 'Filled opens',
        filledCloseObservations: 'Filled closes',
        commissionCoverage: 'Commission evidence coverage',
        completedRoundTrips: 'Completed round trips',
        fillRate: 'Aggregate fill rate',
        rejectionRate: 'Command rejection rate',
        slippage: 'P95 absolute slippage',
        submissionLatency: 'P95 submission latency',
        latency: 'P95 acknowledgement latency',
        unresolved: 'Unreconciled orders',
        recovered: 'Recovered unknowns',
        recoveryDependencyRate: 'Recovery dependency rate',
        costModel: 'Suggested cost model',
        recommendedFee: 'Suggested one-way fee',
        feeSamples: 'Commission samples',
        drills: 'Safety drills',
        evidence: 'Drill evidence (ticket, log summary, or review note)',
        submit: 'Record passed drill',
        saving: 'Saving…',
        retry: 'Reload',
        drillNames: {
          emergencyClose: 'Emergency close',
          disableEntries: 'Disable entries',
          staleMarketCircuitBreaker: 'Stale-market circuit breaker',
          continuousReconciliation: 'Continuous reconciliation',
        },
      },
)

const calibration = computed<TestnetExecutionCalibrationReport | null>(() => {
  const evidence = calibrationEvidence.value
  if (!evidence) return null
  const currency = assessTestnetExecutionCalibrationEvidenceCurrency(evidence)
  if (currency.status === 'current') return evidence.report
  const reason =
    locale.value === 'zh'
      ? `Testnet证据当前无效：${currency.reasons.join(', ')}`
      : `Testnet evidence is not current: ${currency.reasons.join(', ')}`
  return {
    ...evidence.report,
    readyForPaperComparison: false,
    blockers: [...evidence.report.blockers, reason],
  }
})

const drillTypes: TestnetDrillType[] = [
  'emergencyClose',
  'disableEntries',
  'staleMarketCircuitBreaker',
  'continuousReconciliation',
]

const unresolvedTestnetOrders = computed(
  () => (calibration.value?.timedOut ?? 0) + (calibration.value?.unknown ?? 0),
)

const loadCalibration = async () => {
  if (calibrationLoading.value) return
  calibrationLoading.value = true
  calibrationError.value = null
  try {
    const evidence = await quantApi.testnetExecutionCalibrationEvidence()
    calibrationEvidence.value = evidence
    emit('calibration', evidence)
  } catch (loadError) {
    calibrationError.value =
      loadError instanceof Error ? loadError.message : 'Testnet calibration unavailable'
  } finally {
    calibrationLoading.value = false
  }
}

const saveDrill = async () => {
  const evidence = drillDraft.evidence.trim()
  if (!evidence || interactionLocked.value) return
  busy.value = true
  calibrationError.value = null
  try {
    await quantApi.saveTestnetSafetyDrill({
      type: drillDraft.type,
      performedAt: new Date().toISOString(),
      passed: true,
      evidence,
    })
    await loadCalibration()
    drillDraft.evidence = ''
  } catch (saveError) {
    calibrationError.value =
      saveError instanceof Error ? saveError.message : 'Testnet drill could not be saved'
  } finally {
    busy.value = false
  }
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
    void loadCalibration()
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
const openRisk = (trade: BtcAutoTrade) => {
  const price = dashboard.value?.signal?.price
  if (!trade || !trade.entryPrice || !price) return null
  const multiplier = trade.direction === 'long' ? 1 : -1
  const gross = (price - trade.entryPrice) * trade.quantity * multiplier
  const fees = (trade.entryPrice + price) * trade.quantity * (trade.feeRatePct / 100)
  const riskToStop =
    Math.abs(trade.entryPrice - trade.stopLoss) * trade.quantity +
    (trade.entryPrice + trade.stopLoss) * trade.quantity * (trade.feeRatePct / 100)
  return { unrealizedPnl: gross - fees, riskToStop }
}
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

      <section class="testnet-calibration" :class="{ ready: calibration?.readyForPaperComparison }">
        <header>
          <div>
            <span>{{ calibrationCopy.eyebrow }}</span>
            <strong>{{ calibrationCopy.title }}</strong>
          </div>
          <b v-if="calibration">
            {{
              calibration.readyForPaperComparison
                ? calibrationCopy.ready
                : calibrationCopy.blocked
            }}
          </b>
          <button v-else type="button" :disabled="calibrationLoading" @click="loadCalibration">
            {{ calibrationLoading ? calibrationCopy.saving : calibrationCopy.retry }}
          </button>
        </header>
        <p v-if="calibrationError" class="panel-message error">{{ calibrationError }}</p>
        <template v-if="calibration">
          <dl class="calibration-metrics">
            <div>
              <dt>{{ calibrationCopy.observations }}</dt>
              <dd>{{ calibration.observations }}</dd>
            </div>
            <div>
              <dt>{{ calibrationCopy.uniqueCommands }}</dt>
              <dd>{{ calibration.uniqueCommands }}</dd>
            </div>
            <div>
              <dt>{{ calibrationCopy.filledObservations }}</dt>
              <dd>{{ calibration.filledObservations }}</dd>
            </div>
            <div>
              <dt>{{ calibrationCopy.filledOpenObservations }}</dt>
              <dd>{{ calibration.filledOpenObservations }}</dd>
            </div>
            <div>
              <dt>{{ calibrationCopy.filledCloseObservations }}</dt>
              <dd>{{ calibration.filledCloseObservations }}</dd>
            </div>
            <div>
              <dt>{{ calibrationCopy.commissionCoverage }}</dt>
              <dd>{{ formatNumber(calibration.commissionObservedFillRatePct, 1) }}%</dd>
            </div>
            <div>
              <dt>{{ calibrationCopy.completedRoundTrips }}</dt>
              <dd>{{ calibration.completedRoundTrips }}</dd>
            </div>
            <div>
              <dt>{{ calibrationCopy.fillRate }}</dt>
              <dd>{{ formatNumber(calibration.aggregateFillRatePct, 1) }}%</dd>
            </div>
            <div>
              <dt>{{ calibrationCopy.rejectionRate }}</dt>
              <dd>{{ formatNumber(calibration.rejectionRatePct, 1) }}%</dd>
            </div>
            <div>
              <dt>{{ calibrationCopy.slippage }}</dt>
              <dd>{{ formatNumber(calibration.p95AbsoluteSlippageBps, 2) }} bps</dd>
            </div>
            <div>
              <dt>{{ calibrationCopy.submissionLatency }}</dt>
              <dd>{{ formatNumber(calibration.p95SubmissionLatencyMs, 0) }} ms</dd>
            </div>
            <div>
              <dt>{{ calibrationCopy.latency }}</dt>
              <dd>{{ formatNumber(calibration.p95AcknowledgementLatencyMs, 0) }} ms</dd>
            </div>
            <div>
              <dt>{{ calibrationCopy.unresolved }}</dt>
              <dd :class="unresolvedTestnetOrders ? 'negative' : 'positive'">
                {{ unresolvedTestnetOrders }}
              </dd>
            </div>
            <div>
              <dt>{{ calibrationCopy.recovered }}</dt>
              <dd>{{ calibration.recoveredUnknown }}</dd>
            </div>
            <div>
              <dt>{{ calibrationCopy.recoveryDependencyRate }}</dt>
              <dd>{{ formatNumber(calibration.recoveryDependencyRatePct, 1) }}%</dd>
            </div>
            <div>
              <dt>{{ calibrationCopy.costModel }}</dt>
              <dd><code>{{ calibration.recommendedCostModel.version }}</code></dd>
            </div>
            <div>
              <dt>{{ calibrationCopy.recommendedFee }}</dt>
              <dd>{{ formatNumber(calibration.recommendedCostModel.feeRatePct, 4) }}%</dd>
            </div>
            <div>
              <dt>{{ calibrationCopy.feeSamples }}</dt>
              <dd>{{ calibration.recommendedCostModel.feeSourceObservations }}</dd>
            </div>
          </dl>
          <div class="drill-status">
            <span>{{ calibrationCopy.drills }}</span>
            <ol>
              <li v-for="type in drillTypes" :key="type" :class="{ passed: calibration.drills[type]?.passed }">
                <i></i>
                {{ calibrationCopy.drillNames[type] }}
              </li>
            </ol>
          </div>
          <form class="drill-form" @submit.prevent="saveDrill">
            <select v-model="drillDraft.type" aria-label="Testnet safety drill">
              <option v-for="type in drillTypes" :key="type" :value="type">
                {{ calibrationCopy.drillNames[type] }}
              </option>
            </select>
            <input
              v-model="drillDraft.evidence"
              :placeholder="calibrationCopy.evidence"
              maxlength="500"
              required
            />
            <button type="submit" :disabled="interactionLocked || !drillDraft.evidence.trim()">
              {{ busy ? calibrationCopy.saving : calibrationCopy.submit }}
            </button>
          </form>
          <ul v-if="calibration.blockers.length" class="calibration-blockers">
            <li v-for="blocker in calibration.blockers" :key="blocker">{{ blocker }}</li>
          </ul>
        </template>
      </section>

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
            <dd>
              <code>{{ dashboard.strategyVersion }}</code>
            </dd>
          </div>
          <div>
            <dt>{{ t('assetTechnical.contract.auto.signalModelVersion') }}</dt>
            <dd>
              <code>{{ dashboard.signalModelVersion }}</code>
            </dd>
          </div>
          <div>
            <dt>{{ t('assetTechnical.contract.auto.performanceCohortVersion') }}</dt>
            <dd>
              <code>{{ dashboard.performanceCohortVersion }}</code>
            </dd>
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
                t(`assetTechnical.contract.auto.sampleScope.${dashboard.rollingHealth.sampleScope}`)
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

      <section
        class="strategy-comparison"
        :class="`verdict-${dashboard.strategyComparison.verdict}`"
      >
        <header>
          <div>
            <span>{{ t('assetTechnical.contract.auto.strategyComparison') }}</span>
            <strong>
              {{
                t(
                  `assetTechnical.contract.auto.strategyVerdict.${dashboard.strategyComparison.verdict}`,
                )
              }}
            </strong>
          </div>
          <small>{{ t('assetTechnical.contract.auto.strategyComparisonHint') }}</small>
          <small>
            {{ t('assetTechnical.contract.auto.temporalValidation') }} ·
            {{
              t(
                dashboard.strategyComparison.temporalValidation.passed
                  ? 'assetTechnical.contract.auto.temporalValidationPassed'
                  : 'assetTechnical.contract.auto.temporalValidationWaiting',
              )
            }}
            · {{ dashboard.strategyComparison.temporalValidation.candidateSamples }} /
            {{ dashboard.strategyComparison.temporalValidation.minimumSamples }} ·
            {{
              formatSigned(dashboard.strategyComparison.temporalValidation.hitRateLiftPct, 1, 'pp')
            }}
          </small>
          <small>
            {{ t('assetTechnical.contract.auto.evidencePolicyVersion') }}
            <code>{{ dashboard.evidencePolicyVersion }}</code>
          </small>
          <small>
            {{ t('assetTechnical.contract.auto.maximumPairedWindow') }}
            {{ dashboard.strategyComparison.maximumSamples }}
          </small>
          <small v-if="dashboard.activeStrategyRegime">
            {{ t('assetTechnical.contract.auto.activeStrategyRegime') }}
            {{ t(`assetTechnical.contract.auto.strategyRegime.${dashboard.activeStrategyRegime}`) }}
          </small>
        </header>
        <div class="comparison-grid">
          <article>
            <b>{{ t('assetTechnical.contract.auto.baselineStrategy') }}</b>
            <span>
              {{ dashboard.strategyComparison.baselineSamples }} /
              {{ dashboard.strategyComparison.minimumSamples }}
            </span>
            <strong>
              {{
                formatSigned(dashboard.strategyComparison.baselineHitRatePct, 1, '%').replace(
                  '+',
                  '',
                )
              }}
            </strong>
            <small>
              {{ t('assetTechnical.contract.auto.netMove') }}
              {{ formatSigned(dashboard.strategyComparison.baselineAverageNetMovePct, 3, '%') }}
            </small>
          </article>
          <article>
            <b>{{ t('assetTechnical.contract.auto.ensembleCandidate') }}</b>
            <span>
              {{ dashboard.strategyComparison.ensembleSamples }} /
              {{ dashboard.strategyComparison.minimumSamples }}
            </span>
            <strong>
              {{
                formatSigned(dashboard.strategyComparison.ensembleHitRatePct, 1, '%').replace(
                  '+',
                  '',
                )
              }}
            </strong>
            <small>
              {{ t('assetTechnical.contract.auto.netMove') }}
              {{ formatSigned(dashboard.strategyComparison.ensembleAverageNetMovePct, 3, '%') }}
            </small>
          </article>
          <article>
            <b>{{ t('assetTechnical.contract.auto.hitRateAdvantage') }}</b>
            <span>
              {{ t('assetTechnical.contract.auto.pairedSamples') }}
              {{ dashboard.strategyComparison.pairedSamples }} /
              {{ dashboard.strategyComparison.minimumSamples }}
            </span>
            <strong :class="pnlClass(dashboard.strategyComparison.hitRateAdvantagePct)">
              {{ formatSigned(dashboard.strategyComparison.hitRateAdvantagePct, 1, 'pp') }}
            </strong>
            <small>
              {{ t('assetTechnical.contract.auto.conservativeAdvantage') }}
              {{
                formatSigned(dashboard.strategyComparison.hitRateAdvantageLowerBoundPct, 1, 'pp')
              }}
              · {{ dashboard.strategyComparison.confidenceLevelPct }}%
            </small>
            <small>
              {{ t('assetTechnical.contract.auto.estimatedRoundTripCost') }}
              {{ formatNumber(dashboard.strategyComparison.estimatedRoundTripCostPct, 3) }}%
            </small>
            <small>
              {{ t('assetTechnical.contract.auto.appliedCandidateWeight') }}
              {{ dashboard.strategyComparison.recommendedEnsembleWeightPct }}%
            </small>
            <small>
              {{ t('assetTechnical.contract.auto.discordantWins') }}
              {{ dashboard.strategyComparison.ensembleOnlyWins }} :
              {{ dashboard.strategyComparison.baselineOnlyWins }}
            </small>
          </article>
        </div>
        <div class="regime-comparison-grid">
          <article
            v-for="item in dashboard.strategyComparisonsByRegime"
            :key="item.regime"
            :class="{ active: item.regime === dashboard.activeStrategyRegime }"
          >
            <b>{{ t(`assetTechnical.contract.auto.strategyRegime.${item.regime}`) }}</b>
            <span>{{ item.pairedSamples }} / {{ item.minimumSamples }}</span>
            <strong>{{ t(`assetTechnical.contract.auto.strategyVerdict.${item.verdict}`) }}</strong>
            <small>{{ item.recommendedEnsembleWeightPct }}%</small>
          </article>
        </div>
      </section>

      <section class="score-threshold-study">
        <header>
          <div>
            <span>{{ t('assetTechnical.contract.auto.scoreThresholdStudy') }}</span>
            <strong>
              {{
                t(
                  `assetTechnical.contract.auto.scoreThresholdVerdict.${dashboard.scoreThresholdStudy.verdict}`,
                )
              }}
            </strong>
          </div>
          <small>{{ t('assetTechnical.contract.auto.scoreThresholdStudyHint') }}</small>
          <small>
            {{ t('assetTechnical.contract.auto.temporalValidation') }} ·
            {{
              t(
                dashboard.scoreThresholdStudy.temporalValidation.passed
                  ? 'assetTechnical.contract.auto.temporalValidationPassed'
                  : 'assetTechnical.contract.auto.temporalValidationWaiting',
              )
            }}
            · {{ dashboard.scoreThresholdStudy.temporalValidation.candidateSamples }} /
            {{ dashboard.scoreThresholdStudy.temporalValidation.minimumSamples }} ·
            {{
              formatSigned(dashboard.scoreThresholdStudy.temporalValidation.hitRateLiftPct, 1, 'pp')
            }}
          </small>
        </header>
        <div class="comparison-grid">
          <article>
            <b>
              {{ t('assetTechnical.contract.auto.currentThreshold') }}
              {{ dashboard.scoreThresholdStudy.currentThreshold }}
            </b>
            <span>
              {{ dashboard.scoreThresholdStudy.currentSamples }} /
              {{ dashboard.scoreThresholdStudy.minimumSamples }}
            </span>
            <strong>
              {{
                formatSigned(dashboard.scoreThresholdStudy.currentHitRatePct, 1, '%').replace(
                  '+',
                  '',
                )
              }}
            </strong>
            <small>
              {{ t('assetTechnical.contract.auto.netMove') }}
              {{ formatSigned(dashboard.scoreThresholdStudy.currentAverageNetMovePct, 3, '%') }}
            </small>
          </article>
          <article>
            <b>
              {{ t('assetTechnical.contract.auto.candidateThreshold') }}
              {{ dashboard.scoreThresholdStudy.candidateThreshold }}
            </b>
            <span>
              {{ dashboard.scoreThresholdStudy.candidateSamples }} /
              {{ dashboard.scoreThresholdStudy.minimumSamples }}
            </span>
            <strong>
              {{
                formatSigned(dashboard.scoreThresholdStudy.candidateHitRatePct, 1, '%').replace(
                  '+',
                  '',
                )
              }}
            </strong>
            <small>
              {{ t('assetTechnical.contract.auto.netMove') }}
              {{ formatSigned(dashboard.scoreThresholdStudy.candidateAverageNetMovePct, 3, '%') }}
            </small>
          </article>
          <article>
            <b>{{ t('assetTechnical.contract.auto.hitRateLift') }}</b>
            <strong :class="pnlClass(dashboard.scoreThresholdStudy.hitRateLiftPct)">
              {{ formatSigned(dashboard.scoreThresholdStudy.hitRateLiftPct, 1, 'pp') }}
            </strong>
            <small>
              {{ t('assetTechnical.contract.auto.candidateCoverage') }}
              {{ formatNumber(dashboard.scoreThresholdStudy.candidateCoveragePct, 1) }}%
            </small>
            <small>
              {{ t('assetTechnical.contract.auto.conservativeAdvantage') }}
              {{ formatSigned(dashboard.scoreThresholdStudy.hitRateLiftLowerBoundPct, 1, 'pp') }}
            </small>
          </article>
        </div>
      </section>

      <section class="score-threshold-study">
        <header>
          <div>
            <span>{{ t('assetTechnical.contract.auto.consensusStudy') }}</span>
            <strong>
              {{
                t(
                  `assetTechnical.contract.auto.consensusVerdict.${dashboard.consensusStudy.verdict}`,
                )
              }}
            </strong>
          </div>
          <small>{{ t('assetTechnical.contract.auto.consensusStudyHint') }}</small>
          <small>
            {{ t('assetTechnical.contract.auto.temporalValidation') }} ·
            {{
              t(
                dashboard.consensusStudy.temporalValidation.passed
                  ? 'assetTechnical.contract.auto.temporalValidationPassed'
                  : 'assetTechnical.contract.auto.temporalValidationWaiting',
              )
            }}
            · {{ dashboard.consensusStudy.temporalValidation.candidateSamples }} /
            {{ dashboard.consensusStudy.temporalValidation.minimumSamples }} ·
            {{ formatSigned(dashboard.consensusStudy.temporalValidation.hitRateLiftPct, 1, 'pp') }}
          </small>
        </header>
        <div class="comparison-grid">
          <article>
            <b>{{ t('assetTechnical.contract.auto.baselineOpportunity') }}</b>
            <span>
              {{ dashboard.consensusStudy.baselineSamples }} /
              {{ dashboard.consensusStudy.minimumSamples }}
            </span>
            <strong>
              {{
                formatSigned(dashboard.consensusStudy.baselineHitRatePct, 1, '%').replace('+', '')
              }}
            </strong>
            <small>
              {{ t('assetTechnical.contract.auto.netMove') }}
              {{ formatSigned(dashboard.consensusStudy.baselineAverageNetMovePct, 3, '%') }}
            </small>
          </article>
          <article>
            <b>{{ t('assetTechnical.contract.auto.consensusOpportunity') }}</b>
            <span>
              {{ dashboard.consensusStudy.consensusSamples }} /
              {{ dashboard.consensusStudy.minimumSamples }}
            </span>
            <strong>
              {{
                formatSigned(dashboard.consensusStudy.consensusHitRatePct, 1, '%').replace('+', '')
              }}
            </strong>
            <small>
              {{ t('assetTechnical.contract.auto.netMove') }}
              {{ formatSigned(dashboard.consensusStudy.consensusAverageNetMovePct, 3, '%') }}
            </small>
          </article>
          <article>
            <b>{{ t('assetTechnical.contract.auto.hitRateLift') }}</b>
            <strong :class="pnlClass(dashboard.consensusStudy.hitRateLiftPct)">
              {{ formatSigned(dashboard.consensusStudy.hitRateLiftPct, 1, 'pp') }}
            </strong>
            <small>
              {{ t('assetTechnical.contract.auto.candidateCoverage') }}
              {{ formatNumber(dashboard.consensusStudy.consensusCoveragePct, 1) }}%
            </small>
            <small>
              {{ t('assetTechnical.contract.auto.conservativeAdvantage') }}
              {{ formatSigned(dashboard.consensusStudy.hitRateLiftLowerBoundPct, 1, 'pp') }}
            </small>
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
            <b v-if="dashboard.openTrades.length">{{ dashboard.openTrades.length }}</b>
            <b v-else>{{ t('assetTechnical.contract.auto.flat') }}</b>
          </header>
          <div v-if="dashboard.openTrades.length" class="open-position-list">
            <dl v-for="trade in dashboard.openTrades" :key="trade.id">
              <div>
                <dt>{{ tradeDirection(trade) }}</dt>
                <dd :class="trade.direction">{{ formatNumber(trade.entryPrice) }}</dd>
              </div>
              <div>
                <dt>{{ t('assetTechnical.contract.auto.quantity') }}</dt>
                <dd>{{ formatNumber(trade.quantity, 6) }} BTC</dd>
              </div>
              <div>
                <dt>{{ t('assetTechnical.contract.auto.stop') }}</dt>
                <dd>{{ formatNumber(trade.stopLoss) }}</dd>
              </div>
              <div>
                <dt>{{ t('assetTechnical.contract.auto.target') }}</dt>
                <dd>{{ formatNumber(trade.takeProfit) }}</dd>
              </div>
              <div v-if="openRisk(trade)">
                <dt>{{ t('assetTechnical.contract.auto.unrealizedPnl') }}</dt>
                <dd :class="pnlClass(openRisk(trade)?.unrealizedPnl ?? null)">
                  {{ formatSigned(openRisk(trade)?.unrealizedPnl ?? null, 2, ' USDT') }}
                </dd>
              </div>
            </dl>
          </div>
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
        <p v-if="!draft.riskControlsEnabled" class="config-warning">
          {{ t('assetTechnical.contract.auto.unrestrictedWarning') }}
        </p>
        <div class="config-fields">
          <label>
            <span>{{ t('assetTechnical.contract.auto.executionMode') }}</span>
            <select v-model="draft.executionMode">
              <option value="paper">{{ t('assetTechnical.contract.auto.mode.paper') }}</option>
              <option value="testnet">{{ t('assetTechnical.contract.auto.mode.testnet') }}</option>
            </select>
          </label>
          <label>
            <span>{{ t('assetTechnical.contract.auto.riskControlsEnabled') }}</span>
            <select v-model="draft.riskControlsEnabled">
              <option :value="true">{{ t('assetTechnical.contract.auto.guarded') }}</option>
              <option :value="false">{{ t('assetTechnical.contract.auto.unrestricted') }}</option>
            </select>
          </label>
          <label>
            <span>{{ t('assetTechnical.contract.auto.hedgeModeEnabled') }}</span>
            <select v-model="draft.hedgeModeEnabled">
              <option :value="false">{{ t('assetTechnical.contract.auto.oneWay') }}</option>
              <option :value="true">{{ t('assetTechnical.contract.auto.hedgeMode') }}</option>
            </select>
          </label>
          <label>
            <span>{{ t('assetTechnical.contract.auto.maxPositionsPerDirection') }}</span>
            <input
              v-model.number="draft.maxPositionsPerDirection"
              type="number"
              min="1"
              max="20"
              step="1"
            />
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
            <span>{{ t('assetTechnical.contract.auto.maximumHoldingMinutes') }}</span>
            <input
              v-model.number="draft.maximumHoldingMinutes"
              type="number"
              min="0"
              max="1440"
              step="5"
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
            v-if="dashboard.openTrades.length"
            type="button"
            class="danger"
            :disabled="
              interactionLocked || !dashboard.openTrades.some((trade) => trade.status === 'open')
            "
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
                <td>
                  <code>{{ signal.strategyVersion }}</code>
                </td>
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
.testnet-calibration {
  margin-top: var(--auto-gap);
  padding: 12px;
  border: 1px solid color-mix(in srgb, var(--warning) 55%, var(--border));
  border-radius: 8px;
  background: color-mix(in srgb, var(--warning) 5%, var(--surface));
}
.testnet-calibration.ready {
  border-color: color-mix(in srgb, var(--positive) 55%, var(--border));
  background: color-mix(in srgb, var(--positive) 5%, var(--surface));
}
.testnet-calibration > header,
.testnet-calibration > header div {
  display: flex;
  gap: 8px;
}
.testnet-calibration > header {
  align-items: center;
  justify-content: space-between;
}
.testnet-calibration > header div {
  flex-direction: column;
  gap: 3px;
}
.testnet-calibration > header span,
.drill-status > span {
  color: var(--muted);
  font-size: 7px;
}
.testnet-calibration > header strong,
.testnet-calibration > header b {
  font-size: 9px;
}
.testnet-calibration > header b {
  color: var(--warning);
}
.testnet-calibration.ready > header b {
  color: var(--positive);
}
.testnet-calibration button,
.testnet-calibration input,
.testnet-calibration select {
  min-height: 34px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--ink);
  font: inherit;
}
.testnet-calibration button {
  padding: 7px 10px;
  cursor: pointer;
}
.testnet-calibration button:disabled {
  cursor: wait;
  opacity: 0.55;
}
.calibration-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin: 12px 0 0;
}
.calibration-metrics div {
  padding: 8px;
  border-radius: 6px;
  background: var(--surface-soft);
}
.drill-status {
  margin-top: 12px;
}
.drill-status ol {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 7px 0 0;
  padding: 0;
  list-style: none;
}
.drill-status li {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--muted);
  font-size: 7px;
}
.drill-status i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--warning);
}
.drill-status li.passed i {
  background: var(--positive);
}
.drill-form {
  display: grid;
  grid-template-columns: minmax(140px, 0.7fr) minmax(220px, 2fr) auto;
  gap: 7px;
  margin-top: 10px;
}
.drill-form input,
.drill-form select {
  min-width: 0;
  padding: 7px 8px;
}
.calibration-blockers {
  display: grid;
  gap: 4px;
  margin: 10px 0 0;
  padding-left: 16px;
  color: var(--muted);
  font-size: 7px;
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
.strategy-comparison {
  margin-top: var(--auto-gap);
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
}
.score-threshold-study {
  margin-top: var(--auto-gap);
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
}
.score-threshold-study > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.score-threshold-study > header div {
  display: grid;
  gap: 4px;
}
.score-threshold-study span,
.score-threshold-study small {
  color: var(--muted);
  font-size: 7px;
}
.strategy-comparison > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.strategy-comparison > header div {
  display: grid;
  gap: 4px;
}
.strategy-comparison span,
.strategy-comparison small {
  color: var(--muted);
  font-size: 7px;
}
.comparison-grid {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.comparison-grid article {
  display: grid;
  gap: 5px;
  padding: 9px;
  border: 1px solid var(--border);
  border-radius: 6px;
}
.regime-comparison-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  margin-top: 8px;
}
.regime-comparison-grid article {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 8px;
  padding: 7px 9px;
  border: 1px solid var(--border);
  border-radius: 6px;
}
.regime-comparison-grid article.active {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 7%, transparent);
}
.verdict-outperforming {
  border-color: var(--positive);
}
.verdict-underperforming {
  border-color: var(--negative);
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
.strategy-health.probeEligible,
.strategy-health.newVersionProbeEligible {
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
.config-warning {
  margin: 10px 0 0;
  padding: 8px 10px;
  border: 1px solid var(--warning);
  border-radius: 6px;
  color: var(--warning);
  font-size: 7px;
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
.open-position-list dl + dl {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
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
  .config-fields,
  .calibration-metrics {
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
  .comparison-grid {
    grid-template-columns: 1fr;
  }
  .regime-comparison-grid {
    grid-template-columns: 1fr;
  }
  .testnet-calibration > header,
  .drill-form {
    align-items: stretch;
    grid-template-columns: 1fr;
  }
  .testnet-calibration > header {
    flex-direction: column;
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
