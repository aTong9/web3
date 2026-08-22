<script setup lang="ts">
import type { EChartsCoreOption } from 'echarts/core'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type {
  ContractChartInterval,
  ContractBacktestEvidenceEnvelope,
  ContractInstrumentCategory,
  ContractPaperDriftReport,
  ContractPaperDriftInput,
  ContractPaperTelemetry,
  ContractPaperTrade,
  ContractPositionDirection,
  ContractStrategyBacktestReport,
  ContractTradeAction,
  LiveTradingReadinessInput,
  TestnetExecutionCalibrationEvidenceEnvelope,
  TradingReviewAttestationDraft,
  TradingReviewChecklist,
  TradingEvidenceCloudBundle,
  TradingEvidenceCloudSnapshot,
  TradingEvidenceCloudVersion,
  TradingEvidenceAuditVerification,
  TradingEvidenceAuditCheckpoint,
  TradingEvidenceAuditCheckpointVerification,
} from '@/types'
import BtcAutoTradingPanel from '@/components/BtcAutoTradingPanel.vue'
import ContractPaperJournal from '@/components/ContractPaperJournal.vue'
import DisclosureCard from '@/components/DisclosureCard.vue'
import EChart from '@/components/EChart.vue'
import TradingReadinessPanel from '@/components/TradingReadinessPanel.vue'
import TradingReviewChecklistPanel from '@/components/TradingReviewChecklist.vue'
import TradingEvidenceCloudPanel from '@/components/TradingEvidenceCloudPanel.vue'
import { useAuth } from '@/composables/use-auth'
import { useBinanceContractMarket } from '@/composables/use-binance-contract-market'
import { useI18n } from '@/composables/use-i18n'
import {
  contractPaperTradeToObservation,
  createContractPaperTrade,
} from '@/utils/contract-paper-journal'
import {
  analyzeContractPaperDrift,
  contractPaperDriftReviewPolicy,
} from '@/utils/contract-paper-drift'
import {
  buildContractPaperTelemetryEvidence,
  createContractPaperTelemetry,
  finishContractPaperMonitoringSession,
  observeContractPaperMonitoring,
  parseContractPaperTelemetry,
  startContractPaperMonitoringSession,
} from '@/utils/contract-paper-telemetry'
import type {
  ContractPaperJournalCommand,
  ContractPaperJournalStore,
  ContractPaperSyncStatus,
} from '@/utils/contract-paper-store'
import {
  cloudContractPaperJournalStore,
  createLocalContractPaperJournalStore,
  synchronizeContractPaperJournal,
} from '@/utils/contract-paper-store'
import {
  buildContractPaperCostAssumptions,
  simulateContractPosition,
} from '@/utils/contract-position-simulation'
import { assertContractBacktestReviewCostPolicy } from '@/utils/contract-strategy-backtest'
import { buildContractTradeDecision } from '@/utils/contract-trade-decision'
import {
  assessLiveTradingReadiness,
  liveTradingReadinessThresholds,
} from '@/utils/live-trading-readiness'
import { quantApi } from '@/utils/quant-api'
import { compareTradingEvidenceBundles } from '@/utils/trading-evidence-diff'
import { parseTradingEvidenceAuditCheckpoint } from '@/utils/trading-evidence-checkpoint'
import {
  buildCurrentPaperBacktestReferences,
  parseContractBacktestEvidenceEnvelope,
} from '@/utils/trading-evidence'
import {
  assessTradingReviewPackageCurrency,
  buildTradingReviewPackage,
  parseTradingReviewPackage,
  reverifyTradingReviewPackageCloudAudit,
} from '@/utils/trading-review-package'
import {
  applyTradingReviewChecklistDraft,
  createTradingReviewChecklist,
  evaluateTradingReviewChecklist,
  parseTradingReviewChecklist,
} from '@/utils/trading-review-checklist'
import { simpleMovingAverage } from '@/utils/technical-analysis'
import { assessTestnetExecutionCalibrationEvidenceCurrency } from '@/utils/testnet-execution-calibration'
import { useTheme } from '@/utils/use-theme'

const intervals: ContractChartInterval[] = ['1m', '3m', '5m', '15m', '30m', '1h', '4h']
const categoryOrder: ContractInstrumentCategory[] = [
  'equity',
  'etf',
  'commodity',
  'fx',
  'index',
  'crypto',
  'other',
]
type InstrumentFilter = 'all' | ContractInstrumentCategory
const symbolStorageKey = 'market-desk-contract-symbol-v1'
const savedSymbol =
  typeof window === 'undefined' ? null : window.localStorage.getItem(symbolStorageKey)
const selectedSymbol = ref(savedSymbol || 'BTCUSDT')
const selectedInterval = ref<ContractChartInterval>('5m')
const instrumentSearch = ref('')
const instrumentFilter = ref<InstrumentFilter>('all')
const positionDirection = ref<ContractPositionDirection>('long')
const positionNotional = ref(1_000)
const positionLeverage = ref(3)
const positionFeeRatePct = ref(0.05)
const positionSlippageRatePct = ref(0.05)
const positionFundingSettlements = ref(3)
const positionAccountEquity = ref(10_000)
const positionMaxRiskPct = ref(1)
const paperTrades = ref<ContractPaperTrade[]>([])
const paperStorageKey = 'market-desk-contract-paper-trades-v1'
const backtestEvidenceStorageKey = 'market-desk-contract-backtest-evidence-v1'
const reviewChecklistStorageKey = 'market-desk-trading-review-checklist-v1'
const paperTelemetryStorageKey = 'market-desk-contract-paper-telemetry-v1'
const paperSyncStatus = ref<ContractPaperSyncStatus>('loading')
const paperBusy = ref(false)
const testnetCalibrationEvidence = ref<TestnetExecutionCalibrationEvidenceEnvelope | null>(null)
const testnetCalibration = computed(() => {
  const evidence = testnetCalibrationEvidence.value
  if (!evidence) return null
  const currency = assessTestnetExecutionCalibrationEvidenceCurrency(evidence)
  return currency.status === 'current'
    ? evidence.report
    : { ...evidence.report, readyForPaperComparison: false }
})
const backtestEvidence = ref<ContractStrategyBacktestReport | null>(null)
const backtestEvidenceEnvelope = ref<ContractBacktestEvidenceEnvelope | null>(null)
const backtestEvidenceError = ref<string | null>(null)
const reviewPackageVerification = ref<{
  status: 'verified' | 'local-only' | 'stale' | 'invalid'
  message: string
} | null>(null)
const reviewChecklist = ref<TradingReviewChecklist>(createTradingReviewChecklist())
const paperTelemetry = ref<ContractPaperTelemetry>(createContractPaperTelemetry())
const cloudEvidenceSnapshot = ref<TradingEvidenceCloudSnapshot | null>(null)
const cloudEvidenceBusy = ref(false)
const cloudEvidenceError = ref<string | null>(null)
const cloudEvidenceVersions = ref<TradingEvidenceCloudVersion[]>([])
const cloudEvidencePreview = ref<TradingEvidenceCloudSnapshot | null>(null)
const cloudEvidenceAudit = ref<TradingEvidenceAuditVerification | null>(null)
const cloudEvidenceCheckpointVerification = ref<TradingEvidenceAuditCheckpointVerification | null>(
  null,
)
const cloudEvidenceCheckpoint = ref<TradingEvidenceAuditCheckpoint | null>(null)
const cloudEvidenceCheckpointVerifiedAt = ref<string | null>(null)
let monitoringSessionId: string | null = null
const localPaperJournalStore = createLocalContractPaperJournalStore(paperStorageKey)
let activePaperJournalStore: ContractPaperJournalStore = localPaperJournalStore
const { can, restore: restoreAuth } = useAuth()
const { locale, t } = useI18n()
const { theme } = useTheme()
const { snapshot, catalog, loadCatalog, connect, reconnect } = useBinanceContractMarket()
const decision = computed(() => buildContractTradeDecision(snapshot.value))
const paperCostAssumptions = computed(() =>
  buildContractPaperCostAssumptions(
    positionFeeRatePct.value,
    positionSlippageRatePct.value,
  ),
)
const latestMarketPointAt = computed(
  () => snapshot.value.points[snapshot.value.points.length - 1]?.date ?? null,
)
const paperDriftInput = computed<ContractPaperDriftInput | null>(() => {
  if (!backtestEvidence.value) return null
  const references = buildCurrentPaperBacktestReferences(backtestEvidence.value)
  if (!references.length) return null
  const telemetryEvidence = buildContractPaperTelemetryEvidence(paperTelemetry.value, new Date(), {
    startAt: references.reduce(
      (earliest, reference) =>
        Date.parse(reference.startAt) < Date.parse(earliest) ? reference.startAt : earliest,
      references[0]!.startAt,
    ),
    endAt: references.reduce(
      (latest, reference) =>
        Date.parse(reference.endAt) > Date.parse(latest) ? reference.endAt : latest,
      references[0]!.endAt,
    ),
  })
  return {
    ...contractPaperDriftReviewPolicy,
    references,
    paperTrades: paperTrades.value.flatMap((trade) => {
      const observation = contractPaperTradeToObservation(trade)
      return observation ? [observation] : []
    }),
    expectedCycleAts: telemetryEvidence.expectedCycleAts,
    observedCycleAts: telemetryEvidence.observedCycleAts,
    dataGaps: telemetryEvidence.dataGaps,
  }
})
const paperDrift = computed<ContractPaperDriftReport | null>(() =>
  paperDriftInput.value ? analyzeContractPaperDrift(paperDriftInput.value) : null,
)
const currentPaperCohort = computed(
  () => paperDrift.value?.cohorts.find((cohort) => cohort.period === 'month') ?? null,
)
const reviewChecklistEvaluation = computed(() =>
  evaluateTradingReviewChecklist(reviewChecklist.value),
)
const holdoutDays = computed(() => {
  const holdout = backtestEvidence.value?.segments.holdout
  if (!holdout?.startAt || !holdout.endAt) return 0
  return Math.max(1, Math.ceil((Date.parse(holdout.endAt) - Date.parse(holdout.startAt)) / 86_400_000))
})
const tradingReadinessInput = computed<LiveTradingReadinessInput>(() => ({
  thresholds: { ...liveTradingReadinessThresholds },
  backtest: {
    holdoutStatus: backtestEvidence.value?.segments.holdout.metrics.status ?? 'insufficient',
    holdoutSamples: backtestEvidence.value?.segments.holdout.metrics.trades ?? 0,
    holdoutDays: holdoutDays.value,
    averageNetReturnPct:
      backtestEvidence.value?.segments.holdout.metrics.averageNetReturnPct ?? null,
    maximumDrawdownPct:
      backtestEvidence.value?.segments.holdout.metrics.maximumDrawdownPct ?? 0,
  },
  paper: {
    status: currentPaperCohort.value?.status ?? 'insufficient',
    samples: currentPaperCohort.value?.samples ?? 0,
    returnDeltaPct: currentPaperCohort.value?.returnDeltaPct ?? null,
  },
  testnet: {
    readyForPaperComparison: testnetCalibration.value?.readyForPaperComparison ?? false,
    observations: testnetCalibration.value?.observations ?? 0,
    filledObservations: testnetCalibration.value?.filledObservations ?? 0,
    unresolvedOrders:
      (testnetCalibration.value?.timedOut ?? 0) + (testnetCalibration.value?.unknown ?? 0),
  },
  accountControls: reviewChecklistEvaluation.value.accountControls,
  riskControls: reviewChecklistEvaluation.value.riskControls,
  eligibility: reviewChecklistEvaluation.value.eligibility,
}))
const tradingReadiness = computed(() => assessLiveTradingReadiness(tradingReadinessInput.value))

const restoreBacktestEvidence = () => {
  if (typeof window === 'undefined') return
  const serialized = window.localStorage.getItem(backtestEvidenceStorageKey)
  if (!serialized) return
  try {
    const envelope = parseContractBacktestEvidenceEnvelope(serialized)
    assertContractBacktestReviewCostPolicy(envelope.input)
    backtestEvidenceEnvelope.value = envelope
    backtestEvidence.value = envelope.report
  } catch (error) {
    window.localStorage.removeItem(backtestEvidenceStorageKey)
    backtestEvidenceError.value = error instanceof Error ? error.message : '回测证据无法读取'
  }
}

const importBacktestEvidence = async (file: File) => {
  backtestEvidenceError.value = null
  try {
    const serialized = await file.text()
    const envelope = parseContractBacktestEvidenceEnvelope(serialized)
    assertContractBacktestReviewCostPolicy(envelope.input)
    window.localStorage.setItem(backtestEvidenceStorageKey, serialized)
    backtestEvidenceEnvelope.value = envelope
    backtestEvidence.value = envelope.report
  } catch (error) {
    backtestEvidenceError.value = error instanceof Error ? error.message : '回测证据导入失败'
  }
}

const removeBacktestEvidence = () => {
  window.localStorage.removeItem(backtestEvidenceStorageKey)
  backtestEvidenceEnvelope.value = null
  backtestEvidence.value = null
  backtestEvidenceError.value = null
}

const restoreReviewChecklist = () => {
  if (typeof window === 'undefined') return
  const serialized = window.localStorage.getItem(reviewChecklistStorageKey)
  if (!serialized) return
  try {
    reviewChecklist.value = parseTradingReviewChecklist(serialized)
  } catch (error) {
    window.localStorage.removeItem(reviewChecklistStorageKey)
    console.warn('Trading review checklist could not be restored:', error)
  }
}

const persistPaperTelemetry = () => {
  window.localStorage.setItem(paperTelemetryStorageKey, JSON.stringify(paperTelemetry.value))
}

const restorePaperTelemetry = () => {
  if (typeof window === 'undefined') return
  paperTelemetry.value = parseContractPaperTelemetry(
    window.localStorage.getItem(paperTelemetryStorageKey) ?? '',
  )
}

const startMonitoringSession = () => {
  const startedAt = new Date().toISOString()
  monitoringSessionId = window.crypto.randomUUID()
  paperTelemetry.value = startContractPaperMonitoringSession(paperTelemetry.value, {
    id: monitoringSessionId,
    symbol: selectedSymbol.value,
    interval: selectedInterval.value,
    startedAt,
  })
  persistPaperTelemetry()
}

const finishMonitoringSession = () => {
  if (!monitoringSessionId) return
  paperTelemetry.value = finishContractPaperMonitoringSession(
    paperTelemetry.value,
    monitoringSessionId,
    new Date().toISOString(),
  )
  monitoringSessionId = null
  persistPaperTelemetry()
}

const observeMonitoringCycle = (mode: 'observed' | 'gap' | 'heartbeat', reason?: string) => {
  if (!monitoringSessionId) return
  const observedAt = new Date().toISOString()
  paperTelemetry.value = observeContractPaperMonitoring(paperTelemetry.value, {
    id: window.crypto.randomUUID(),
    sessionId: monitoringSessionId,
    observedAt,
    mode,
    evidenceEndAt: latestMarketPointAt.value ?? snapshot.value.updatedAt,
    strategyVersion: `contract-minute-v1-w${decision.value.strategyDiagnostics?.appliedEnsembleWeightPct ?? 0}`,
    signalVersion: decision.value.strategyDiagnostics?.ensembleVersion ?? 'baseline-v1',
    marketSource: 'binance-futures-public',
    reason,
  })
  persistPaperTelemetry()
}

const saveReviewChecklist = (draft: TradingReviewAttestationDraft[]) => {
  const updated = applyTradingReviewChecklistDraft(reviewChecklist.value, draft)
  window.localStorage.setItem(reviewChecklistStorageKey, JSON.stringify(updated))
  reviewChecklist.value = updated
}

const exportReviewChecklist = () => {
  const blob = new Blob([JSON.stringify(reviewChecklist.value, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `trading-review-checklist-${new Date().toISOString().slice(0, 10)}.json`
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

const currentCloudEvidenceBundle = (): TradingEvidenceCloudBundle => ({
  schemaVersion: 1,
  backtest: backtestEvidenceEnvelope.value,
  paperTelemetry: paperTelemetry.value,
  reviewChecklist: reviewChecklist.value,
})
const cloudEvidenceDiff = computed(() => {
  const target = cloudEvidencePreview.value?.bundle ?? cloudEvidenceSnapshot.value?.bundle
  return target ? compareTradingEvidenceBundles(currentCloudEvidenceBundle(), target) : null
})
const cloudEvidenceMutationBlocked = computed(
  () =>
    Boolean(cloudEvidenceSnapshot.value?.bundle) &&
    (!cloudEvidenceAudit.value || cloudEvidenceAudit.value.status === 'broken'),
)

const rejectBlockedCloudEvidenceMutation = () => {
  if (!cloudEvidenceMutationBlocked.value) return false
  cloudEvidenceError.value =
    locale.value === 'zh'
      ? '云端同步审计状态缺失或异常，已拒绝修改；请重新读取并排查审计链。'
      : 'Cloud audit status is missing or broken. Mutation was refused; reload and investigate the audit chain.'
  return true
}

const refreshCloudEvidenceMetadata = async () => {
  const [versions, audit] = await Promise.all([
    quantApi.tradingEvidenceHistory(),
    quantApi.tradingEvidenceAudit(),
  ])
  cloudEvidenceVersions.value = versions
  cloudEvidenceAudit.value = audit
}

const loadCloudEvidence = async () => {
  if (cloudEvidenceBusy.value) return
  cloudEvidenceBusy.value = true
  cloudEvidenceError.value = null
  try {
    const [snapshot, versions, audit] = await Promise.all([
      quantApi.tradingEvidence(),
      quantApi.tradingEvidenceHistory(),
      quantApi.tradingEvidenceAudit(),
    ])
    cloudEvidenceSnapshot.value = snapshot
    cloudEvidenceVersions.value = versions
    cloudEvidenceAudit.value = audit
    cloudEvidencePreview.value = null
  } catch (error) {
    cloudEvidenceError.value = error instanceof Error ? error.message : '云端交易证据读取失败'
  } finally {
    cloudEvidenceBusy.value = false
  }
}

const uploadCloudEvidence = async () => {
  if (cloudEvidenceBusy.value || rejectBlockedCloudEvidenceMutation()) return
  cloudEvidenceBusy.value = true
  cloudEvidenceError.value = null
  try {
    cloudEvidenceSnapshot.value = await quantApi.saveTradingEvidence(
      cloudEvidenceSnapshot.value?.revision ?? 0,
      currentCloudEvidenceBundle(),
    )
    await refreshCloudEvidenceMetadata()
    cloudEvidencePreview.value = null
  } catch (error) {
    cloudEvidenceError.value = error instanceof Error ? error.message : '云端交易证据保存失败'
  } finally {
    cloudEvidenceBusy.value = false
  }
}

const previewCloudEvidenceVersion = async (revision: number) => {
  if (cloudEvidenceBusy.value) return
  cloudEvidenceBusy.value = true
  cloudEvidenceError.value = null
  try {
    cloudEvidencePreview.value = await quantApi.tradingEvidenceVersion(revision)
  } catch (error) {
    cloudEvidenceError.value = error instanceof Error ? error.message : '云端历史版本读取失败'
  } finally {
    cloudEvidenceBusy.value = false
  }
}

const restoreCloudEvidenceVersion = async (revision: number) => {
  if (
    cloudEvidenceBusy.value ||
    !cloudEvidenceSnapshot.value ||
    rejectBlockedCloudEvidenceMutation()
  ) {
    return
  }
  const confirmation =
    locale.value === 'zh'
      ? `恢复云端修订版 ${revision} 会创建一个新的云端修订版，不会立即覆盖本地证据。继续吗？`
      : `Restoring cloud revision ${revision} creates a new cloud revision and does not immediately replace local evidence. Continue?`
  if (!window.confirm(confirmation)) return
  cloudEvidenceBusy.value = true
  cloudEvidenceError.value = null
  try {
    cloudEvidenceSnapshot.value = await quantApi.restoreTradingEvidenceVersion(
      revision,
      cloudEvidenceSnapshot.value.revision,
    )
    await refreshCloudEvidenceMetadata()
    cloudEvidencePreview.value = null
  } catch (error) {
    cloudEvidenceError.value = error instanceof Error ? error.message : '云端历史版本恢复失败'
  } finally {
    cloudEvidenceBusy.value = false
  }
}

const adoptCloudEvidence = () => {
  if (rejectBlockedCloudEvidenceMutation()) return
  const bundle = cloudEvidenceSnapshot.value?.bundle
  if (!bundle) return
  const confirmation =
    locale.value === 'zh'
      ? '采用云端证据会覆盖当前设备的回测、Paper遥测和人工核验。继续吗？'
      : 'Adopting cloud evidence will replace this device’s backtest, Paper telemetry, and human attestations. Continue?'
  if (!window.confirm(confirmation)) {
    return
  }
  finishMonitoringSession()
  backtestEvidenceEnvelope.value = bundle.backtest
  backtestEvidence.value = bundle.backtest?.report ?? null
  if (bundle.backtest) {
    window.localStorage.setItem(backtestEvidenceStorageKey, JSON.stringify(bundle.backtest))
  } else {
    window.localStorage.removeItem(backtestEvidenceStorageKey)
  }
  paperTelemetry.value = bundle.paperTelemetry
  persistPaperTelemetry()
  reviewChecklist.value = bundle.reviewChecklist
  window.localStorage.setItem(reviewChecklistStorageKey, JSON.stringify(bundle.reviewChecklist))
  startMonitoringSession()
}

const exportCloudEvidenceAuditCheckpoint = async () => {
  if (cloudEvidenceBusy.value || rejectBlockedCloudEvidenceMutation()) return
  cloudEvidenceBusy.value = true
  cloudEvidenceError.value = null
  try {
    const checkpoint = await quantApi.tradingEvidenceAuditCheckpoint()
    const blob = new Blob([JSON.stringify(checkpoint, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `trading-evidence-audit-v${checkpoint.revision}-${checkpoint.generatedAt.slice(0, 10)}.json`
    document.body.append(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  } catch (error) {
    cloudEvidenceError.value = error instanceof Error ? error.message : '外部审计检查点导出失败'
  } finally {
    cloudEvidenceBusy.value = false
  }
}

const verifyCloudEvidenceAuditCheckpoint = async (file: File) => {
  if (cloudEvidenceBusy.value) return
  cloudEvidenceBusy.value = true
  cloudEvidenceError.value = null
  try {
    const serialized = await file.text()
    const checkpoint = await parseTradingEvidenceAuditCheckpoint(serialized)
    const verification = await quantApi.verifyTradingEvidenceAuditCheckpoint(serialized)
    cloudEvidenceCheckpointVerification.value = verification
    cloudEvidenceCheckpoint.value = verification.valid ? checkpoint : null
    cloudEvidenceCheckpointVerifiedAt.value = verification.valid ? new Date().toISOString() : null
  } catch (error) {
    cloudEvidenceCheckpointVerification.value = null
    cloudEvidenceCheckpoint.value = null
    cloudEvidenceCheckpointVerifiedAt.value = null
    cloudEvidenceError.value = error instanceof Error ? error.message : '外部审计检查点验证失败'
  } finally {
    cloudEvidenceBusy.value = false
  }
}

const exportTradingReviewPackage = async () => {
  const generatedAt = new Date().toISOString()
  const checklistEvaluation = evaluateTradingReviewChecklist(
    reviewChecklist.value,
    new Date(generatedAt),
  )
  const readinessInput: LiveTradingReadinessInput = {
    ...tradingReadinessInput.value,
    accountControls: checklistEvaluation.accountControls,
    riskControls: checklistEvaluation.riskControls,
    eligibility: checklistEvaluation.eligibility,
  }
  const reviewPackage = await buildTradingReviewPackage({
    generatedAt,
    backtest: backtestEvidenceEnvelope.value,
    paperDrift:
      paperDriftInput.value && paperDrift.value
        ? { input: paperDriftInput.value, report: paperDrift.value }
        : null,
    testnet: testnetCalibrationEvidence.value,
    reviewChecklist: reviewChecklist.value,
    readinessInput,
    readinessReport: assessLiveTradingReadiness(readinessInput),
    cloudAudit:
      cloudEvidenceCheckpoint.value &&
      cloudEvidenceCheckpointVerification.value?.valid &&
      cloudEvidenceCheckpointVerifiedAt.value
        ? {
            checkpoint: cloudEvidenceCheckpoint.value,
            verification: cloudEvidenceCheckpointVerification.value,
            verifiedAt: cloudEvidenceCheckpointVerifiedAt.value,
          }
        : null,
  })
  const blob = new Blob([JSON.stringify(reviewPackage, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `trading-review-package-${generatedAt.slice(0, 10)}.json`
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

const verifyTradingReviewPackage = async (file: File) => {
  try {
    const reviewPackage = await parseTradingReviewPackage(await file.text())
    const packageSummary = `${reviewPackage.generatedAt} · ${reviewPackage.contentDigest}`
    const currency = assessTradingReviewPackageCurrency(reviewPackage)
    const reasonLabels =
      locale.value === 'zh'
        ? {
            'package-age-exceeded': '包龄超过30天',
            'attestations-expired': '人工核验已过期',
            'attestations-not-current': '人工核验当前重算已变化',
            'generated-in-future': '生成时间超出时钟容差',
            'legacy-testnet-not-recomputable': '旧版Testnet汇总无法重算',
            'paper-period-outdated': 'Paper评审周期已切换',
            'testnet-observations-stale': 'Testnet执行观测超过30天',
            'testnet-drills-stale': 'Testnet安全演练超过30天',
            'testnet-observations-in-future': 'Testnet观测时间超出时钟容差',
            'testnet-drills-in-future': 'Testnet演练时间超出时钟容差',
          }
        : {
            'package-age-exceeded': 'package age exceeds 30 days',
            'attestations-expired': 'attestations expired',
            'attestations-not-current': 'current attestation result changed',
            'generated-in-future': 'generated time exceeds clock tolerance',
            'legacy-testnet-not-recomputable': 'legacy Testnet summary cannot be recalculated',
            'paper-period-outdated': 'Paper review period has changed',
            'testnet-observations-stale': 'Testnet observations exceed 30 days',
            'testnet-drills-stale': 'Testnet safety drills exceed 30 days',
            'testnet-observations-in-future': 'Testnet observation time exceeds clock tolerance',
            'testnet-drills-in-future': 'Testnet drill time exceeds clock tolerance',
          }
    const currencyMessage =
      currency.status === 'stale'
        ? `当前时点评估不可作为当前证据：${currency.reasons
            .map((reason) => reasonLabels[reason])
            .join(', ')}${
            currency.expiredKeys.length > 0
              ? ` · 过期核验 ${currency.expiredKeys.join(', ')}`
              : ''
          }`
        : null
    if (!reviewPackage.cloudAudit) {
      reviewPackageVerification.value = {
        status: currencyMessage ? 'stale' : 'local-only',
        message: `${packageSummary} · ${
          currencyMessage ?? '包内一致，未包含云端审计锚点'
        }`,
      }
      return
    }
    try {
      const reverification = await reverifyTradingReviewPackageCloudAudit(
        reviewPackage,
        quantApi.verifyTradingEvidenceAuditCheckpoint,
      )
      reviewPackageVerification.value = {
        status:
          reverification.status !== 'verified'
            ? 'invalid'
            : currencyMessage
              ? 'stale'
              : 'verified',
        message: `${packageSummary} · 云端审计锚点 v${reviewPackage.cloudAudit.checkpoint.revision} · ${reverification.message}${currencyMessage ? ` · ${currencyMessage}` : ''}`,
      }
    } catch (error) {
      reviewPackageVerification.value = {
        status: currencyMessage ? 'stale' : 'local-only',
        message: `${packageSummary} · 包内一致，但云端复验不可用：${
          error instanceof Error ? error.message : '未知错误'
        }${currencyMessage ? ` · ${currencyMessage}` : ''}`,
      }
    }
  } catch (error) {
    reviewPackageVerification.value = {
      status: 'invalid',
      message: error instanceof Error ? error.message : '综合评审包验证失败',
    }
  }
}
const decisionDirection = computed<ContractPositionDirection | null>(() =>
  decision.value.action === 'long' || decision.value.action === 'short'
    ? decision.value.action
    : null,
)
const currentContractPrice = computed(() => snapshot.value.markPrice ?? decision.value.latestPrice)
const positionSimulation = computed(() => {
  const usesDecisionLevels = decisionDirection.value === positionDirection.value
  return simulateContractPosition({
    direction: positionDirection.value,
    entryPrice: currentContractPrice.value,
    stopLoss: usesDecisionLevels ? decision.value.stopLoss : null,
    takeProfit: usesDecisionLevels ? decision.value.takeProfit : null,
    notional: positionNotional.value,
    leverage: positionLeverage.value,
    feeRatePct: paperCostAssumptions.value.feeRatePct,
    slippageRatePct: paperCostAssumptions.value.slippageRatePct,
    fundingRatePct: snapshot.value.fundingRatePct,
    fundingSettlements: positionFundingSettlements.value,
    accountEquity: positionAccountEquity.value,
    maxRiskPct: positionMaxRiskPct.value,
  })
})
const selectedInstrument = computed(
  () =>
    catalog.value.instruments.find((instrument) => instrument.symbol === selectedSymbol.value) ??
    null,
)
const currentOpenPaperTrade = computed(
  () =>
    paperTrades.value.find(
      (trade) => trade.symbol === selectedSymbol.value && trade.status === 'open',
    ) ?? null,
)
const canRecordPaperTrade = computed(
  () =>
    !currentOpenPaperTrade.value &&
    positionSimulation.value.riskStatus === 'within' &&
    decisionDirection.value === positionDirection.value &&
    currentContractPrice.value !== null &&
    decision.value.stopLoss !== null &&
    decision.value.takeProfit !== null &&
    selectedInstrument.value !== null &&
    !paperBusy.value,
)
const paperRecordState = computed(() => {
  if (currentOpenPaperTrade.value) return 'alreadyOpen'
  if (positionSimulation.value.riskStatus === 'over') return 'riskOver'
  if (decisionDirection.value !== positionDirection.value) return 'noAlignedPlan'
  if (positionSimulation.value.riskStatus === 'unavailable') return 'riskUnavailable'
  if (currentContractPrice.value === null) return 'priceUnavailable'
  return 'ready'
})
const categoryCounts = computed(() =>
  catalog.value.instruments.reduce(
    (counts, instrument) => {
      counts[instrument.category] += 1
      return counts
    },
    {
      crypto: 0,
      equity: 0,
      etf: 0,
      commodity: 0,
      fx: 0,
      index: 0,
      other: 0,
    } satisfies Record<ContractInstrumentCategory, number>,
  ),
)
const categoryOptions = computed<Array<{ id: InstrumentFilter; count: number }>>(() => [
  { id: 'all', count: catalog.value.instruments.length },
  ...categoryOrder
    .filter((category) => categoryCounts.value[category] > 0)
    .map((category) => ({ id: category, count: categoryCounts.value[category] })),
])
const matchingInstruments = computed(() => {
  const keyword = instrumentSearch.value.trim().toUpperCase()
  return catalog.value.instruments.filter(
    (instrument) =>
      (instrumentFilter.value === 'all' || instrument.category === instrumentFilter.value) &&
      (!keyword ||
        instrument.symbol.includes(keyword) ||
        instrument.baseAsset.includes(keyword) ||
        instrument.quoteAsset.includes(keyword) ||
        instrument.displayName.toUpperCase().includes(keyword) ||
        instrument.underlyingVenue?.toUpperCase().includes(keyword)),
  )
})
const visibleInstruments = computed(() => {
  if (
    !selectedInstrument.value ||
    matchingInstruments.value.some(
      (instrument) => instrument.symbol === selectedInstrument.value?.symbol,
    )
  )
    return matchingInstruments.value
  return [selectedInstrument.value, ...matchingInstruments.value]
})
const categoryLabel = (category: InstrumentFilter) =>
  t(`assetTechnical.contract.category.${category}`)

const formatNumber = (value: number | null, maximumFractionDigits = 2) =>
  value === null
    ? '—'
    : value.toLocaleString(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
        maximumFractionDigits,
      })
const formatPrice = (value: number | null) =>
  value === null ? '—' : formatNumber(value, value < 1 ? 6 : value < 100 ? 4 : 2)
const formatSigned = (value: number | null, digits = 1, suffix = '%') =>
  value === null ? '—' : `${value > 0 ? '+' : ''}${formatNumber(value, digits)}${suffix}`
const formatMetric = (value: number | null, digits: number, suffix: string) =>
  value === null ? '—' : `${formatNumber(value, digits)}${suffix}`
const formatMoney = (value: number | null, signed = false) =>
  value === null
    ? '—'
    : `${signed && value > 0 ? '+' : ''}${formatNumber(value, 2)} ${snapshot.value.quoteAsset}`
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
const actionClass = (action: ContractTradeAction) =>
  action === 'long' ? 'long' : action === 'short' ? 'short' : 'neutral'
const cssColor = (name: string) => {
  void theme.value
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const executePaperJournalCommand = async (command: ContractPaperJournalCommand) => {
  if (paperBusy.value) return
  paperBusy.value = true
  try {
    paperTrades.value = await activePaperJournalStore.execute(command)
    if (activePaperJournalStore === cloudContractPaperJournalStore) {
      await localPaperJournalStore.replace(paperTrades.value)
      paperSyncStatus.value = 'cloud'
    }
  } catch (error) {
    if (activePaperJournalStore === cloudContractPaperJournalStore) {
      console.warn('Cloud contract paper journal unavailable; using local fallback:', error)
      activePaperJournalStore = localPaperJournalStore
      paperSyncStatus.value = 'local'
      try {
        await localPaperJournalStore.replace(paperTrades.value)
        paperTrades.value = await localPaperJournalStore.execute(command)
      } catch (localError) {
        console.warn('Contract paper journal could not be saved locally:', localError)
      }
    } else {
      console.warn('Contract paper journal command failed:', error)
    }
  } finally {
    paperBusy.value = false
  }
}

const recordPaperTrade = () => {
  const instrument = selectedInstrument.value
  const entryPrice = currentContractPrice.value
  const stopLoss = decision.value.stopLoss
  const takeProfit = decision.value.takeProfit
  const riskBudget = positionSimulation.value.riskBudget
  const enteredRiskAmount = positionSimulation.value.enteredRiskAmount
  if (
    !canRecordPaperTrade.value ||
    !instrument ||
    entryPrice === null ||
    stopLoss === null ||
    takeProfit === null ||
    riskBudget === null ||
    enteredRiskAmount === null
  )
    return
  const id = window.crypto.randomUUID()
  const trade = createContractPaperTrade({
    id,
    symbol: selectedSymbol.value,
    displayName: instrument.displayName,
    quoteAsset: snapshot.value.quoteAsset,
    direction: positionDirection.value,
    interval: selectedInterval.value,
    openedAt: new Date().toISOString(),
    entryPrice,
    stopLoss,
    takeProfit,
    notional: positionNotional.value,
    leverage: positionLeverage.value,
    feeRatePct: paperCostAssumptions.value.feeRatePct,
    fundingRatePct: snapshot.value.fundingRatePct ?? 0,
    fundingSettlements: positionFundingSettlements.value,
    riskBudget,
    enteredRiskAmount,
    signalScore: decision.value.score,
    signalConfidence: decision.value.confidence,
    strategyVersion: `contract-minute-v1-w${decision.value.strategyDiagnostics?.appliedEnsembleWeightPct ?? 0}`,
    signalVersion: decision.value.strategyDiagnostics?.ensembleVersion ?? 'baseline-v1',
    pathId: id,
    marketSource: 'binance-futures-public',
    costModelVersion: paperCostAssumptions.value.version,
    plannedEntryPrice: entryPrice,
    slippageRatePct: paperCostAssumptions.value.slippageRatePct,
  })
  if (trade) void executePaperJournalCommand({ type: 'add', trade })
}

const selectPaperTrade = (trade: ContractPaperTrade) => {
  selectedSymbol.value = trade.symbol
  selectedInterval.value = trade.interval
}

const closePaperTrade = (trade: ContractPaperTrade) => {
  if (trade.symbol !== selectedSymbol.value || currentContractPrice.value === null) return
  void executePaperJournalCommand({
    type: 'close',
    id: trade.id,
    exitPrice: currentContractPrice.value,
    closedAt: new Date().toISOString(),
  })
}

const removePaperTrade = (trade: ContractPaperTrade) => {
  if (trade.status !== 'closed') return
  void executePaperJournalCommand({ type: 'remove', id: trade.id })
}

const chartOption = computed<EChartsCoreOption>(() => {
  const points = snapshot.value.points
  const closes = points.map((point) => point.close)
  const ma20 = simpleMovingAverage(closes, 20)
  const ma60 = simpleMovingAverage(closes, 60)
  const ink = cssColor('--ink')
  const muted = cssColor('--muted')
  const border = cssColor('--border')
  const surface = cssColor('--surface')
  const positive = cssColor('--positive')
  const negative = cssColor('--negative')
  const danger = cssColor('--danger')
  const accent = cssColor('--accent')
  const warning = cssColor('--warning')
  const markLines = [
    decision.value.entryLow !== null && decision.value.entryHigh !== null
      ? {
          name: t('assetTechnical.contract.entry'),
          yAxis: (decision.value.entryLow + decision.value.entryHigh) / 2,
          lineStyle: { color: accent, type: 'dashed' },
        }
      : null,
    decision.value.stopLoss !== null
      ? {
          name: t('assetTechnical.contract.stopLoss'),
          yAxis: decision.value.stopLoss,
          lineStyle: { color: danger, type: 'dashed' },
        }
      : null,
    decision.value.takeProfit !== null
      ? {
          name: t('assetTechnical.contract.takeProfit'),
          yAxis: decision.value.takeProfit,
          lineStyle: { color: positive, type: 'dashed' },
        }
      : null,
  ].filter(Boolean)

  return {
    animation: false,
    backgroundColor: 'transparent',
    textStyle: { color: ink, fontSize: 9 },
    legend: {
      top: 0,
      left: 0,
      textStyle: { color: muted, fontSize: 9 },
      data: [selectedSymbol.value, 'MA20', 'MA60'],
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: surface,
      borderColor: border,
      textStyle: { color: ink },
    },
    axisPointer: { link: [{ xAxisIndex: 'all' }] },
    grid: [
      { left: 56, right: 18, top: 42, height: '61%' },
      { left: 56, right: 18, top: '78%', height: '12%' },
    ],
    xAxis: [
      {
        type: 'category',
        data: points.map((point) => point.date),
        boundaryGap: true,
        axisLine: { lineStyle: { color: border } },
        axisLabel: {
          color: muted,
          hideOverlap: true,
          formatter: (value: string) => value.slice(11, 16),
        },
      },
      {
        type: 'category',
        gridIndex: 1,
        data: points.map((point) => point.date),
        axisLabel: { show: false },
        axisLine: { lineStyle: { color: border } },
      },
    ],
    yAxis: [
      { scale: true, splitLine: { lineStyle: { color: border } }, axisLabel: { color: muted } },
      {
        gridIndex: 1,
        scale: true,
        splitNumber: 2,
        splitLine: { show: false },
        axisLabel: { color: muted },
      },
    ],
    dataZoom: [
      { type: 'inside', xAxisIndex: [0, 1], start: 45, end: 100 },
      {
        type: 'slider',
        xAxisIndex: [0, 1],
        start: 45,
        end: 100,
        bottom: 2,
        height: 16,
        borderColor: border,
      },
    ],
    series: [
      {
        name: selectedSymbol.value,
        type: 'candlestick',
        data: points.map((point) => [point.open, point.close, point.low, point.high]),
        itemStyle: {
          color: positive,
          color0: negative,
          borderColor: positive,
          borderColor0: negative,
        },
        markLine: {
          silent: true,
          symbol: ['none', 'none'],
          label: { color: muted, fontSize: 8 },
          data: markLines,
        },
      },
      {
        name: 'MA20',
        type: 'line',
        data: ma20,
        showSymbol: false,
        smooth: false,
        lineStyle: { color: accent, width: 1.2 },
      },
      {
        name: 'MA60',
        type: 'line',
        data: ma60,
        showSymbol: false,
        smooth: false,
        lineStyle: { color: warning, width: 1.2 },
      },
      {
        name: t('assetTechnical.contract.volume'),
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: points.map((point, index) => ({
          value: point.volume,
          itemStyle: {
            color: index && point.close < points[index - 1]!.close ? negative : positive,
          },
        })),
      },
    ],
  }
})

watch([selectedSymbol, selectedInterval], ([symbol, interval], previous) => {
  if (previous) {
    finishMonitoringSession()
    startMonitoringSession()
  }
  void connect(symbol, interval)
})
watch(selectedSymbol, (symbol) => window.localStorage.setItem(symbolStorageKey, symbol))
watch(
  () => decision.value.action,
  (action) => {
    if (action === 'long' || action === 'short') positionDirection.value = action
  },
)
watch(
  () => latestMarketPointAt.value,
  (latestPoint, previousPoint) => {
    if (latestPoint && latestPoint !== previousPoint && snapshot.value.status === 'live') {
      observeMonitoringCycle('observed')
    }
  },
)
watch(
  () => snapshot.value.status,
  (status, previousStatus) => {
    if (status === previousStatus) return
    if (status === 'restricted' || status === 'error') {
      observeMonitoringCycle('gap', snapshot.value.errorCode ?? status)
    } else if (status === 'live') {
      observeMonitoringCycle('heartbeat')
    }
  },
)

onMounted(async () => {
  restoreBacktestEvidence()
  restoreReviewChecklist()
  restorePaperTelemetry()
  startMonitoringSession()
  try {
    paperTrades.value = await localPaperJournalStore.load()
    paperSyncStatus.value = 'local'
  } catch (error) {
    console.warn('Contract paper trades could not be loaded:', error)
  }
  try {
    await restoreAuth()
    if (can('paper.manage')) {
      paperTrades.value = await synchronizeContractPaperJournal(
        paperTrades.value,
        cloudContractPaperJournalStore,
      )
      activePaperJournalStore = cloudContractPaperJournalStore
      paperSyncStatus.value = 'cloud'
      await localPaperJournalStore.replace(paperTrades.value)
      void loadCloudEvidence()
    }
  } catch (error) {
    activePaperJournalStore = localPaperJournalStore
    paperSyncStatus.value = 'local'
    console.warn('Cloud contract paper journal could not be synchronized:', error)
  }
  void connect(selectedSymbol.value, selectedInterval.value)
  void loadCatalog().then(() => {
    if (!catalog.value.instruments.some((instrument) => instrument.symbol === selectedSymbol.value))
      selectedSymbol.value =
        catalog.value.instruments.find((instrument) => instrument.symbol === 'BTCUSDT')?.symbol ??
        catalog.value.instruments[0]?.symbol ??
        'BTCUSDT'
  })
})

onBeforeUnmount(() => finishMonitoringSession())
</script>

<template>
  <section class="contract-workspace">
    <header class="contract-toolbar">
      <div>
        <span>{{ t('assetTechnical.contract.eyebrow') }}</span>
        <strong>{{ t('assetTechnical.contract.title') }}</strong>
        <small>{{ t('assetTechnical.contract.publicData') }}</small>
        <small class="catalog-note" :class="catalog.status">
          {{
            t(`assetTechnical.contract.catalog.${catalog.status}`, {
              count: catalog.instruments.length,
            })
          }}
        </small>
      </div>
      <div class="contract-controls">
        <div class="instrument-picker">
          <label>
            <span>{{ t('assetTechnical.contract.symbolSearch') }}</span>
            <input
              v-model="instrumentSearch"
              type="search"
              :placeholder="t('assetTechnical.contract.symbolSearchPlaceholder')"
            />
          </label>
          <label>
            <span>{{ t('assetTechnical.contract.symbolCategory') }}</span>
            <select v-model="instrumentFilter">
              <option v-for="option in categoryOptions" :key="option.id" :value="option.id">
                {{ categoryLabel(option.id) }} · {{ option.count }}
              </option>
            </select>
          </label>
          <label>
            <span>{{ t('assetTechnical.contract.symbol') }}</span>
            <select v-model="selectedSymbol">
              <option
                v-for="instrument in visibleInstruments"
                :key="instrument.symbol"
                :value="instrument.symbol"
              >
                {{ instrument.symbol }} · {{ instrument.displayName }} ·
                {{ categoryLabel(instrument.category) }}
              </option>
            </select>
          </label>
        </div>
        <div
          class="interval-switch"
          role="group"
          :aria-label="t('assetTechnical.contract.interval')"
        >
          <button
            v-for="interval in intervals"
            :key="interval"
            :class="{ active: selectedInterval === interval }"
            @click="selectedInterval = interval"
          >
            {{ interval }}
          </button>
        </div>
        <button
          class="reconnect-button"
          :disabled="snapshot.status === 'connecting'"
          @click="reconnect"
        >
          {{ t('assetTechnical.contract.reconnect') }}
        </button>
      </div>
    </header>

    <div class="connection-strip" :class="snapshot.status">
      <span><i></i>{{ t(`assetTechnical.contract.status.${snapshot.status}`) }}</span>
      <small>{{ t('assetTechnical.contract.source') }}</small>
      <small>{{
        t('assetTechnical.contract.updatedAt', { time: formatTime(snapshot.updatedAt) })
      }}</small>
      <small>{{
        t('assetTechnical.contract.latency', { value: snapshot.latencyMs ?? '—' })
      }}</small>
      <b>{{ t('assetTechnical.contract.paperOnly') }}</b>
    </div>

    <section v-if="selectedInstrument" class="instrument-identity">
      <div>
        <span>{{ t('assetTechnical.contract.underlying') }}</span>
        <strong>{{ selectedInstrument.displayName }}</strong>
        <small>{{ selectedInstrument.baseAsset }}</small>
      </div>
      <dl>
        <div>
          <dt>{{ t('assetTechnical.contract.underlyingVenue') }}</dt>
          <dd>{{ selectedInstrument.underlyingVenue ?? '—' }}</dd>
        </div>
        <div>
          <dt>{{ t('assetTechnical.contract.settlementAsset') }}</dt>
          <dd>{{ selectedInstrument.quoteAsset }}</dd>
        </div>
      </dl>
      <ul v-if="selectedInstrument.riskTags.length" class="instrument-risk-tags">
        <li v-for="riskTag in selectedInstrument.riskTags" :key="riskTag">
          {{ t(`assetTechnical.contract.riskTag.${riskTag}`) }}
        </li>
      </ul>
    </section>

    <p
      v-if="selectedInstrument?.category === 'equity' || selectedInstrument?.category === 'etf'"
      class="underlying-risk"
    >
      {{ t('assetTechnical.contract.derivativeRisk') }}
    </p>

    <section
      v-if="snapshot.status === 'restricted' || snapshot.status === 'error'"
      class="feed-error"
      role="alert"
    >
      <span>{{ t('assetTechnical.contract.unavailableEyebrow') }}</span>
      <h2>{{ t(`assetTechnical.contract.error.${snapshot.errorCode ?? 'network'}.title`) }}</h2>
      <p>{{ t(`assetTechnical.contract.error.${snapshot.errorCode ?? 'network'}.body`) }}</p>
      <div>
        <button @click="reconnect">{{ t('assetTechnical.contract.retry') }}</button>
        <a
          href="https://developers.binance.com/en/docs/products/derivatives-trading-usds-futures/Introduction"
          target="_blank"
          rel="noopener noreferrer"
          >{{ t('assetTechnical.contract.officialDocs') }} ↗</a
        >
      </div>
    </section>

    <section v-else-if="!snapshot.points.length" class="feed-loading" aria-live="polite">
      <i></i>
      <div>
        <strong>{{ t('assetTechnical.contract.loading') }}</strong>
        <small>{{ t('assetTechnical.contract.loadingHint') }}</small>
      </div>
    </section>

    <div v-else class="contract-layout">
      <div class="contract-chart-column">
        <section class="contract-chart-card">
          <header>
            <div>
              <span>
                {{ selectedSymbol }} · {{ selectedInterval }} ·
                {{ categoryLabel(selectedInstrument?.category ?? 'other') }}
              </span>
              <strong>{{ formatPrice(snapshot.markPrice) }} {{ snapshot.quoteAsset }}</strong>
            </div>
            <div class="market-metrics">
              <span
                >{{ t('assetTechnical.contract.funding') }}
                <b>{{ formatNumber(snapshot.fundingRatePct, 4) }}%</b></span
              >
              <span
                >{{ t('assetTechnical.contract.openInterest') }}
                <b>{{ formatNumber(snapshot.openInterest, 0) }}</b></span
              >
              <span
                >{{ t('assetTechnical.contract.nextFunding') }}
                <b>{{ formatTime(snapshot.nextFundingTime) }}</b></span
              >
            </div>
          </header>
          <EChart
            class="contract-chart"
            :option="chartOption"
            :label="
              t('assetTechnical.contract.chartLabel', {
                symbol: selectedSymbol,
                interval: selectedInterval,
              })
            "
          />
        </section>

        <section class="execution-context">
          <article class="timeframe-context">
            <header>
              <div>
                <span>{{ t('assetTechnical.contract.contextEyebrow') }}</span>
                <strong>{{ t('assetTechnical.contract.multiTimeframeTitle') }}</strong>
              </div>
              <small>{{ t('assetTechnical.contract.multiTimeframeDescription') }}</small>
            </header>
            <div v-if="decision.timeframes.length" class="timeframe-grid">
              <div
                v-for="reading in decision.timeframes"
                :key="reading.interval"
                :class="reading.signal"
              >
                <span>{{ reading.interval }}</span>
                <strong>{{ t(`assetTechnical.contract.timeframeState.${reading.signal}`) }}</strong>
                <b>{{ reading.score > 0 ? '+' : '' }}{{ reading.score }}</b>
              </div>
            </div>
            <p v-else>{{ t('assetTechnical.contract.contextUnavailable') }}</p>
          </article>

          <article class="microstructure-context">
            <header>
              <div>
                <span>{{ t('assetTechnical.contract.contextEyebrow') }}</span>
                <strong>{{ t('assetTechnical.contract.microstructureTitle') }}</strong>
              </div>
              <small>{{ t('assetTechnical.contract.microstructureDescription') }}</small>
            </header>
            <dl>
              <div>
                <dt>{{ t('assetTechnical.contract.depthImbalance') }}</dt>
                <dd>{{ formatSigned(snapshot.microstructure.orderBookImbalancePct) }}</dd>
              </div>
              <div>
                <dt>{{ t('assetTechnical.contract.spread') }}</dt>
                <dd>{{ formatMetric(snapshot.microstructure.spreadBps, 2, ' bp') }}</dd>
              </div>
              <div>
                <dt>{{ t('assetTechnical.contract.takerBuyRatio') }}</dt>
                <dd>{{ formatMetric(snapshot.microstructure.takerBuyRatioPct, 1, '%') }}</dd>
              </div>
              <div>
                <dt>{{ t('assetTechnical.contract.openInterestChange') }}</dt>
                <dd>{{ formatSigned(snapshot.microstructure.openInterestChangePct, 2) }}</dd>
              </div>
            </dl>
          </article>
        </section>

        <DisclosureCard
          class="indicator-disclosure"
          :default-open="true"
          :eyebrow="t('assetTechnical.contract.indicatorEyebrow')"
          :title="t('assetTechnical.contract.indicatorTitle')"
          :description="t('assetTechnical.contract.indicatorDescription')"
        >
          <template #metric>
            <strong
              >{{
                decision.indicators.filter(
                  (item) => item.signal === 'long' || item.signal === 'short',
                ).length
              }}/{{ decision.indicators.length }}</strong
            >
          </template>
          <div class="indicator-grid">
            <article
              v-for="indicator in decision.indicators"
              :key="indicator.id"
              :class="indicator.signal"
            >
              <header>
                <span>{{ t(`assetTechnical.contract.indicator.${indicator.id}`) }}</span>
                <em>{{ t(`assetTechnical.contract.indicatorSignal.${indicator.signal}`) }}</em>
              </header>
              <strong>{{ indicator.value }}</strong>
              <small>{{ indicator.score > 0 ? '+' : '' }}{{ indicator.score }}</small>
            </article>
          </div>
        </DisclosureCard>

        <DisclosureCard
          class="position-simulator"
          :default-open="true"
          :eyebrow="t('assetTechnical.contract.simulator.eyebrow')"
          :title="t('assetTechnical.contract.simulator.title')"
          :description="t('assetTechnical.contract.simulator.description')"
        >
          <template #metric>
            <strong>{{ formatMoney(positionSimulation.marginRequired) }}</strong>
          </template>
          <div class="simulator-layout">
            <section class="simulator-inputs">
              <div
                class="direction-switch"
                role="group"
                :aria-label="t('assetTechnical.contract.simulator.direction')"
              >
                <button
                  type="button"
                  :class="{ active: positionDirection === 'long' }"
                  @click="positionDirection = 'long'"
                >
                  {{ t('assetTechnical.contract.simulator.long') }}
                </button>
                <button
                  type="button"
                  :class="{ active: positionDirection === 'short' }"
                  @click="positionDirection = 'short'"
                >
                  {{ t('assetTechnical.contract.simulator.short') }}
                </button>
              </div>
              <div class="simulator-fields">
                <label>
                  <span>{{ t('assetTechnical.contract.simulator.notional') }}</span>
                  <input v-model.number="positionNotional" type="number" min="1" step="100" />
                </label>
                <label>
                  <span>{{ t('assetTechnical.contract.simulator.leverage') }}</span>
                  <input
                    v-model.number="positionLeverage"
                    type="number"
                    min="1"
                    max="125"
                    step="1"
                  />
                </label>
                <label>
                  <span>{{ t('assetTechnical.contract.simulator.feeRate') }}</span>
                  <input
                    v-model.number="positionFeeRatePct"
                    type="number"
                    min="0.05"
                    max="5"
                    step="0.001"
                  />
                </label>
                <label>
                  <span>{{ t('assetTechnical.contract.simulator.slippageRate') }}</span>
                  <input
                    v-model.number="positionSlippageRatePct"
                    type="number"
                    min="0.05"
                    max="5"
                    step="0.001"
                  />
                </label>
                <label>
                  <span>{{ t('assetTechnical.contract.simulator.fundingSettlements') }}</span>
                  <input
                    v-model.number="positionFundingSettlements"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                  />
                </label>
                <label>
                  <span>{{ t('assetTechnical.contract.simulator.accountEquity') }}</span>
                  <input v-model.number="positionAccountEquity" type="number" min="1" step="1000" />
                </label>
                <label>
                  <span>{{ t('assetTechnical.contract.simulator.maxRiskPct') }}</span>
                  <input
                    v-model.number="positionMaxRiskPct"
                    type="number"
                    min="0.01"
                    max="100"
                    step="0.1"
                  />
                </label>
              </div>
              <p>{{ t('assetTechnical.contract.simulator.feeHint') }}</p>
              <p>{{ t('assetTechnical.contract.simulator.riskAssumption') }}</p>
            </section>

            <section class="simulator-results">
              <dl>
                <div>
                  <dt>{{ t('assetTechnical.contract.simulator.marginRequired') }}</dt>
                  <dd>{{ formatMoney(positionSimulation.marginRequired) }}</dd>
                </div>
                <div>
                  <dt>{{ t('assetTechnical.contract.simulator.roundTripFee') }}</dt>
                  <dd>{{ formatMoney(positionSimulation.roundTripFee) }}</dd>
                </div>
                <div>
                  <dt>{{ t('assetTechnical.contract.simulator.roundTripSlippage') }}</dt>
                  <dd>{{ formatMoney(positionSimulation.roundTripSlippage) }}</dd>
                </div>
                <div>
                  <dt>{{ t('assetTechnical.contract.simulator.projectedFunding') }}</dt>
                  <dd :class="{ cost: (positionSimulation.projectedFunding ?? 0) > 0 }">
                    {{ formatMoney(positionSimulation.projectedFunding, true) }}
                  </dd>
                </div>
                <div>
                  <dt>{{ t('assetTechnical.contract.simulator.breakEvenMove') }}</dt>
                  <dd>{{ formatSigned(positionSimulation.breakEvenMovePct, 3) }}</dd>
                </div>
              </dl>
              <div class="simulator-outcomes">
                <article class="stop">
                  <span>{{ t('assetTechnical.contract.simulator.stopNetPnl') }}</span>
                  <strong>{{ formatMoney(positionSimulation.stopNetPnl, true) }}</strong>
                  <small>
                    {{ t('assetTechnical.contract.simulator.marginLoss') }}
                    {{ formatMetric(positionSimulation.stopLossMarginPct, 1, '%') }}
                  </small>
                </article>
                <article class="target">
                  <span>{{ t('assetTechnical.contract.simulator.targetNetPnl') }}</span>
                  <strong>{{ formatMoney(positionSimulation.targetNetPnl, true) }}</strong>
                  <small>{{ t('assetTechnical.contract.simulator.afterCosts') }}</small>
                </article>
              </div>
              <section class="position-risk-gate" :class="positionSimulation.riskStatus">
                <header>
                  <span>{{ t('assetTechnical.contract.simulator.riskGate') }}</span>
                  <strong>
                    {{
                      t(
                        `assetTechnical.contract.simulator.riskStatus.${positionSimulation.riskStatus}`,
                      )
                    }}
                  </strong>
                </header>
                <dl>
                  <div>
                    <dt>{{ t('assetTechnical.contract.simulator.riskBudget') }}</dt>
                    <dd>{{ formatMoney(positionSimulation.riskBudget) }}</dd>
                  </div>
                  <div>
                    <dt>{{ t('assetTechnical.contract.simulator.enteredRisk') }}</dt>
                    <dd>{{ formatMoney(positionSimulation.enteredRiskAmount) }}</dd>
                  </div>
                  <div>
                    <dt>{{ t('assetTechnical.contract.simulator.riskUtilization') }}</dt>
                    <dd>{{ formatMetric(positionSimulation.riskUtilizationPct, 1, '%') }}</dd>
                  </div>
                  <div>
                    <dt>{{ t('assetTechnical.contract.simulator.recommendedNotional') }}</dt>
                    <dd>{{ formatMoney(positionSimulation.recommendedNotional) }}</dd>
                  </div>
                  <div>
                    <dt>{{ t('assetTechnical.contract.simulator.recommendedMargin') }}</dt>
                    <dd>{{ formatMoney(positionSimulation.recommendedMargin) }}</dd>
                  </div>
                </dl>
                <p>{{ t('assetTechnical.contract.simulator.riskGateHint') }}</p>
                <div class="risk-gate-record">
                  <button
                    type="button"
                    :disabled="!canRecordPaperTrade || paperBusy"
                    @click="recordPaperTrade"
                  >
                    {{
                      t(
                        currentOpenPaperTrade
                          ? 'assetTechnical.contract.journal.alreadyRecorded'
                          : 'assetTechnical.contract.journal.record',
                      )
                    }}
                  </button>
                  <small>
                    {{ t(`assetTechnical.contract.journal.recordState.${paperRecordState}`) }}
                  </small>
                </div>
              </section>
              <p v-if="decisionDirection !== positionDirection" class="simulator-level-note">
                {{ t('assetTechnical.contract.simulator.levelsUnavailable') }}
              </p>
            </section>
          </div>
          <p class="simulator-disclaimer">
            {{ t('assetTechnical.contract.simulator.disclaimer') }}
          </p>
        </DisclosureCard>
      </div>

      <aside class="decision-panel" :class="actionClass(decision.action)">
        <header>
          <span>{{ t('assetTechnical.contract.currentDecision') }}</span>
          <em>{{ t('assetTechnical.contract.modelBoundary') }}</em>
        </header>
        <div class="decision-headline">
          <strong>{{ t(`assetTechnical.contract.action.${decision.action}`) }}</strong>
          <b>{{ decision.score > 0 ? '+' : '' }}{{ decision.score }}</b>
        </div>
        <div class="confidence-line">
          <span>{{ t('assetTechnical.contract.confidence') }}</span>
          <b>{{ decision.confidence }}%</b>
          <i><em :style="{ width: `${decision.confidence}%` }"></em></i>
        </div>
        <dl class="trade-levels">
          <div>
            <dt>{{ t('assetTechnical.contract.expectedMove') }}</dt>
            <dd>{{ decision.expectedMovePct === null ? '—' : `±${decision.expectedMovePct}%` }}</dd>
          </div>
          <div>
            <dt>{{ t('assetTechnical.contract.entry') }}</dt>
            <dd>{{ formatPrice(decision.entryLow) }} – {{ formatPrice(decision.entryHigh) }}</dd>
          </div>
          <div>
            <dt>{{ t('assetTechnical.contract.stopLoss') }}</dt>
            <dd>{{ formatPrice(decision.stopLoss) }}</dd>
          </div>
          <div>
            <dt>{{ t('assetTechnical.contract.takeProfit') }}</dt>
            <dd>{{ formatPrice(decision.takeProfit) }}</dd>
          </div>
          <div>
            <dt>{{ t('assetTechnical.contract.riskReward') }}</dt>
            <dd>{{ decision.riskReward === null ? '—' : `1:${decision.riskReward}` }}</dd>
          </div>
          <div>
            <dt>{{ t('assetTechnical.contract.invalidation') }}</dt>
            <dd>{{ formatPrice(decision.invalidation) }}</dd>
          </div>
        </dl>
        <section class="decision-evidence">
          <h3>{{ t('assetTechnical.contract.supportingEvidence') }}</h3>
          <p v-if="!decision.reasons.length">{{ t('assetTechnical.contract.noEvidence') }}</p>
          <ul v-else>
            <li v-for="reason in decision.reasons.slice(0, 5)" :key="reason">
              {{ t(`assetTechnical.contract.reason.${reason}`) }}
            </li>
          </ul>
        </section>
        <section class="decision-evidence risks">
          <h3>{{ t('assetTechnical.contract.risks') }}</h3>
          <p v-if="!decision.risks.length">{{ t('assetTechnical.contract.noMajorRisk') }}</p>
          <ul v-else>
            <li v-for="risk in decision.risks" :key="risk">
              {{ t(`assetTechnical.contract.reason.${risk}`) }}
            </li>
          </ul>
        </section>
        <footer>{{ t('assetTechnical.contract.disclaimer') }}</footer>
      </aside>
    </div>

    <TradingReadinessPanel
      :report="tradingReadiness"
      :backtest="backtestEvidence"
      :paper-drift="paperDrift"
      :testnet="testnetCalibration"
      :import-error="backtestEvidenceError"
      :package-verification="reviewPackageVerification"
      @import-backtest="importBacktestEvidence"
      @remove-backtest="removeBacktestEvidence"
      @export-review-package="exportTradingReviewPackage"
      @verify-review-package="verifyTradingReviewPackage"
    />

    <TradingReviewChecklistPanel
      :checklist="reviewChecklist"
      :evaluation="reviewChecklistEvaluation"
      @save="saveReviewChecklist"
      @export="exportReviewChecklist"
    />

    <TradingEvidenceCloudPanel
      v-if="can('paper.manage')"
      :snapshot="cloudEvidenceSnapshot"
      :busy="cloudEvidenceBusy"
      :error="cloudEvidenceError"
      :versions="cloudEvidenceVersions"
      :audit="cloudEvidenceAudit"
      :checkpoint-verification="cloudEvidenceCheckpointVerification"
      :preview="cloudEvidencePreview"
      :diff="cloudEvidenceDiff"
      @refresh="loadCloudEvidence"
      @upload="uploadCloudEvidence"
      @adopt="adoptCloudEvidence"
      @preview="previewCloudEvidenceVersion"
      @restore="restoreCloudEvidenceVersion"
      @export-checkpoint="exportCloudEvidenceAuditCheckpoint"
      @verify-checkpoint="verifyCloudEvidenceAuditCheckpoint"
    />

    <BtcAutoTradingPanel
      v-if="can('autoTrade.manage')"
      @calibration="testnetCalibrationEvidence = $event"
    />

    <ContractPaperJournal
      :trades="paperTrades"
      :current-symbol="selectedSymbol"
      :current-price="currentContractPrice"
      :sync-status="paperSyncStatus"
      :busy="paperBusy"
      @select="selectPaperTrade"
      @close="closePaperTrade"
      @remove="removePaperTrade"
    />
  </section>
</template>

<style scoped>
.contract-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}
.contract-toolbar,
.connection-strip,
.contract-chart-card,
.execution-context article,
.decision-panel,
.feed-error,
.feed-loading {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}
.contract-toolbar {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: stretch;
}
.contract-toolbar > div:first-child {
  display: grid;
  gap: 4px;
}
.contract-toolbar > div:first-child span {
  color: var(--accent);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.12em;
}
.contract-toolbar > div:first-child strong {
  font-size: 15px;
}
.contract-toolbar small,
.connection-strip small {
  color: var(--muted);
  font-size: 8px;
}
.catalog-note {
  display: block;
}
.catalog-note.ready {
  color: var(--positive);
}
.catalog-note.loading {
  color: var(--accent);
}
.catalog-note.fallback {
  color: var(--warning);
}
.contract-controls {
  display: flex;
  gap: 8px;
  align-items: end;
  flex-wrap: wrap;
  justify-content: start;
}
.instrument-picker {
  min-width: 0;
  flex: 1 1 520px;
  display: grid;
  grid-template-columns: minmax(150px, 1fr) 140px minmax(210px, 1.25fr);
  gap: 8px;
}
.contract-controls label {
  min-width: 0;
  display: grid;
  gap: 4px;
}
.contract-controls label span {
  color: var(--muted);
  font-size: 7px;
}
.contract-controls input,
.contract-controls select,
.interval-switch button,
.reconnect-button {
  min-height: 40px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
  color: var(--ink);
  font-size: 9px;
}
.contract-controls input,
.contract-controls select {
  width: 100%;
  min-width: 0;
  padding: 7px 10px;
}
.contract-controls input::placeholder {
  color: var(--muted);
}
.interval-switch {
  display: flex;
  gap: 4px;
}
.interval-switch button,
.reconnect-button {
  padding: 7px 10px;
  cursor: pointer;
}
.interval-switch button.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}
.reconnect-button:disabled {
  opacity: 0.5;
  cursor: wait;
}
.connection-strip {
  min-height: 42px;
  padding: 9px 12px;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.connection-strip span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 9px;
  font-weight: 700;
}
.connection-strip i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--warning);
}
.connection-strip.live i {
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}
.connection-strip.error i,
.connection-strip.restricted i {
  background: var(--danger);
}
.connection-strip b {
  margin-left: auto;
  padding: 4px 7px;
  border-radius: 99px;
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 7px;
}
.instrument-identity {
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  display: grid;
  grid-template-columns: minmax(180px, 1fr) auto minmax(180px, auto);
  gap: 16px;
  align-items: center;
}
.instrument-identity > div:first-child {
  min-width: 0;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  align-items: baseline;
}
.instrument-identity span,
.instrument-identity small,
.instrument-identity dt {
  color: var(--muted);
  font-size: 7px;
}
.instrument-identity strong {
  overflow: hidden;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.instrument-identity dl {
  margin: 0;
  display: flex;
  gap: 14px;
}
.instrument-identity dl div {
  display: grid;
  gap: 3px;
}
.instrument-identity dd {
  margin: 0;
  font-size: 8px;
  font-weight: 700;
}
.instrument-risk-tags {
  margin: 0;
  padding: 0;
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: end;
  list-style: none;
}
.instrument-risk-tags li {
  padding: 4px 6px;
  border: 1px solid var(--border);
  border-radius: 99px;
  background: var(--surface-soft);
  color: var(--warning);
  font-size: 7px;
}
.underlying-risk {
  margin: 0;
  padding: 9px 12px;
  border-left: 3px solid var(--warning);
  background: var(--warning-soft, var(--surface-soft));
  color: var(--muted);
  font-size: 8px;
  line-height: 1.55;
}
.feed-error,
.feed-loading {
  min-height: 280px;
  padding: 36px;
  display: grid;
  align-content: center;
}
.feed-error span {
  color: var(--danger);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.12em;
}
.feed-error h2 {
  margin: 10px 0;
  font:
    500 28px Georgia,
    serif;
}
.feed-error p {
  max-width: 680px;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.7;
}
.feed-error div {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}
.feed-error button,
.feed-error a {
  min-height: 40px;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-size: 9px;
  cursor: pointer;
}
.feed-loading {
  grid-template-columns: 12px 1fr;
  gap: 14px;
  align-items: center;
}
.feed-loading i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  animation: feed-pulse 1s ease-in-out infinite alternate;
}
.feed-loading div {
  display: grid;
  gap: 5px;
}
.feed-loading small {
  color: var(--muted);
}
.contract-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 310px;
  gap: 12px;
  align-items: start;
}
.contract-chart-column {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}
.contract-chart-card {
  min-width: 0;
  padding: 14px;
}
.contract-chart-card > header {
  min-height: 56px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
}
.contract-chart-card > header > div:first-child span,
.contract-chart-card > header > div:first-child strong {
  display: block;
}
.contract-chart-card > header > div:first-child span {
  color: var(--muted);
  font-size: 8px;
}
.contract-chart-card > header > div:first-child strong {
  margin-top: 4px;
  font:
    500 20px Georgia,
    serif;
}
.market-metrics {
  display: flex;
  gap: 16px;
  align-items: start;
  flex-wrap: wrap;
  justify-content: end;
}
.market-metrics span,
.market-metrics b {
  display: block;
}
.market-metrics span {
  color: var(--muted);
  font-size: 7px;
}
.market-metrics b {
  margin-top: 4px;
  color: var(--ink);
  font-size: 9px;
}
.contract-chart {
  height: 570px;
}
.execution-context {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 12px;
}
.execution-context article {
  padding: 14px;
}
.execution-context article > header {
  min-height: 42px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
}
.execution-context article > header div {
  display: grid;
  gap: 4px;
}
.execution-context article > header span {
  color: var(--accent);
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.1em;
}
.execution-context article > header strong {
  font-size: 11px;
}
.execution-context article > header small,
.execution-context article > p {
  max-width: 260px;
  margin: 0;
  color: var(--muted);
  font-size: 8px;
  line-height: 1.55;
}
.timeframe-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
}
.timeframe-grid div {
  min-width: 0;
  padding: 9px;
  border: 1px solid var(--border);
  border-top: 2px solid var(--muted);
  border-radius: 6px;
  background: var(--surface-soft);
  display: grid;
  gap: 5px;
}
.timeframe-grid div.long {
  border-top-color: var(--positive);
}
.timeframe-grid div.short {
  border-top-color: var(--negative);
}
.timeframe-grid span,
.timeframe-grid b {
  color: var(--muted);
  font-size: 7px;
}
.timeframe-grid strong {
  overflow: hidden;
  font-size: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.timeframe-grid b {
  font-weight: 600;
}
.microstructure-context dl {
  margin: 12px 0 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}
.microstructure-context dl div {
  min-width: 0;
  padding: 9px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface-soft);
}
.microstructure-context dt,
.microstructure-context dd {
  margin: 0;
}
.microstructure-context dt {
  color: var(--muted);
  font-size: 7px;
}
.microstructure-context dd {
  margin-top: 6px;
  font-size: 9px;
  font-weight: 700;
}
.indicator-grid {
  padding-top: 16px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 7px;
}
.indicator-grid article {
  padding: 10px;
  border: 1px solid var(--border);
  border-left: 3px solid var(--muted);
  border-radius: 7px;
  background: var(--surface-soft);
}
.indicator-grid article.long {
  border-left-color: var(--positive);
}
.indicator-grid article.short {
  border-left-color: var(--negative);
}
.indicator-grid article.risk {
  border-left-color: var(--danger);
}
.indicator-grid header {
  display: flex;
  justify-content: space-between;
  gap: 6px;
}
.indicator-grid span,
.indicator-grid em,
.indicator-grid strong,
.indicator-grid small {
  display: block;
}
.indicator-grid span,
.indicator-grid em,
.indicator-grid small {
  color: var(--muted);
  font-size: 7px;
}
.indicator-grid em {
  font-style: normal;
}
.indicator-grid strong {
  margin: 7px 0;
  font-size: 9px;
}
.simulator-layout {
  padding-top: 16px;
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(0, 1.2fr);
  gap: 12px;
}
.simulator-inputs,
.simulator-results {
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-soft);
}
.direction-switch {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px;
}
.direction-switch button {
  min-height: 36px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--muted);
  font-size: 8px;
  cursor: pointer;
}
.direction-switch button.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 700;
}
.simulator-fields {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
}
.simulator-fields label {
  min-width: 0;
  display: grid;
  gap: 4px;
}
.simulator-fields span,
.simulator-inputs > p,
.simulator-results dt,
.simulator-outcomes span,
.simulator-outcomes small,
.simulator-level-note,
.simulator-disclaimer {
  color: var(--muted);
  font-size: 7px;
}
.simulator-fields input {
  width: 100%;
  min-width: 0;
  min-height: 38px;
  padding: 7px 9px;
  box-sizing: border-box;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--ink);
  font-size: 9px;
}
.simulator-inputs > p {
  margin: 9px 0 0;
  line-height: 1.55;
}
.simulator-results dl {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}
.simulator-results dl div {
  padding: 9px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
}
.simulator-results dd {
  margin: 6px 0 0;
  font-size: 10px;
  font-weight: 700;
}
.simulator-results dd.cost {
  color: var(--negative);
}
.simulator-outcomes {
  margin-top: 7px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}
.simulator-outcomes article {
  padding: 10px;
  border: 1px solid var(--border);
  border-left: 3px solid var(--muted);
  border-radius: 6px;
  background: var(--surface);
  display: grid;
  gap: 6px;
}
.simulator-outcomes article.stop {
  border-left-color: var(--negative);
}
.simulator-outcomes article.target {
  border-left-color: var(--positive);
}
.simulator-outcomes strong {
  font-size: 11px;
}
.position-risk-gate {
  margin-top: 7px;
  padding: 10px;
  border: 1px solid var(--border);
  border-left: 3px solid var(--muted);
  border-radius: 6px;
  background: var(--surface);
}
.position-risk-gate.within {
  border-left-color: var(--positive);
}
.position-risk-gate.over {
  border-left-color: var(--negative);
}
.position-risk-gate.unavailable {
  border-left-color: var(--warning);
}
.position-risk-gate > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.position-risk-gate > header span,
.position-risk-gate > p {
  color: var(--muted);
  font-size: 7px;
}
.position-risk-gate > header strong {
  font-size: 8px;
}
.position-risk-gate.within > header strong {
  color: var(--positive);
}
.position-risk-gate.over > header strong {
  color: var(--negative);
}
.position-risk-gate.unavailable > header strong {
  color: var(--warning);
}
.position-risk-gate dl {
  margin-top: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.position-risk-gate > p {
  margin: 8px 0 0;
  line-height: 1.5;
}
.risk-gate-record {
  margin-top: 9px;
  padding-top: 9px;
  border-top: 1px solid var(--border);
  display: grid;
  grid-template-columns: minmax(150px, auto) 1fr;
  gap: 8px;
  align-items: center;
}
.risk-gate-record button {
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
.risk-gate-record button:disabled {
  border-color: var(--border);
  background: var(--surface-soft);
  color: var(--muted);
  cursor: not-allowed;
  opacity: 0.7;
}
.risk-gate-record small {
  color: var(--muted);
  font-size: 7px;
  line-height: 1.45;
}
.simulator-level-note {
  margin: 9px 0 0;
  color: var(--warning);
  line-height: 1.5;
}
.simulator-disclaimer {
  margin: 10px 2px 0;
  line-height: 1.6;
}
.decision-panel {
  padding: 16px;
  border-top: 3px solid var(--muted);
  position: sticky;
  top: 76px;
}
.decision-panel.long {
  border-top-color: var(--positive);
}
.decision-panel.short {
  border-top-color: var(--negative);
}
.decision-panel > header {
  display: grid;
  gap: 4px;
}
.decision-panel > header span {
  color: var(--accent);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.1em;
}
.decision-panel > header em {
  color: var(--muted);
  font-size: 7px;
  font-style: normal;
}
.decision-headline {
  margin: 18px 0;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: end;
}
.decision-headline strong {
  font:
    500 25px Georgia,
    'Songti SC',
    serif;
}
.decision-headline b {
  font:
    500 25px Georgia,
    serif;
}
.decision-panel.long .decision-headline b {
  color: var(--positive);
}
.decision-panel.short .decision-headline b {
  color: var(--negative);
}
.confidence-line {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px;
}
.confidence-line span,
.confidence-line b {
  font-size: 8px;
}
.confidence-line span {
  color: var(--muted);
}
.confidence-line > i {
  grid-column: 1/-1;
  height: 5px;
  border-radius: 5px;
  background: var(--surface-soft);
  overflow: hidden;
}
.confidence-line > i > em {
  height: 100%;
  background: var(--accent);
  display: block;
}
.trade-levels {
  margin: 16px 0;
  border-top: 1px solid var(--border);
}
.trade-levels div {
  min-height: 38px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}
.trade-levels dt,
.trade-levels dd {
  margin: 0;
  font-size: 8px;
}
.trade-levels dt {
  color: var(--muted);
}
.trade-levels dd {
  font-weight: 700;
  text-align: right;
}
.decision-evidence {
  padding: 12px 0;
  border-top: 1px solid var(--border);
}
.decision-evidence h3 {
  margin: 0 0 8px;
  font-size: 9px;
}
.decision-evidence ul {
  margin: 0;
  padding-left: 16px;
}
.decision-evidence li,
.decision-evidence p,
.decision-panel footer {
  color: var(--muted);
  font-size: 8px;
  line-height: 1.55;
}
.decision-evidence li + li {
  margin-top: 5px;
}
.decision-evidence.risks li::marker {
  color: var(--danger);
}
.decision-panel footer {
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
@keyframes feed-pulse {
  to {
    opacity: 0.35;
    transform: scale(0.72);
  }
}
@media (prefers-reduced-motion: reduce) {
  .feed-loading i {
    animation: none;
  }
}
@media (max-width: 1080px) {
  .contract-layout {
    grid-template-columns: 1fr;
  }
  .decision-panel {
    position: static;
  }
}
@media (max-width: 880px) {
  .execution-context {
    grid-template-columns: minmax(0, 1fr);
  }
  .simulator-layout {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 760px) {
  .contract-toolbar {
    align-items: stretch;
    flex-direction: column;
  }
  .contract-controls {
    justify-content: stretch;
  }
  .instrument-picker {
    width: 100%;
    flex-basis: auto;
    grid-template-columns: 1fr;
  }
  .contract-controls label,
  .contract-controls select,
  .reconnect-button {
    width: 100%;
  }
  .interval-switch {
    width: 100%;
    overflow-x: auto;
  }
  .interval-switch button {
    min-width: 44px;
    flex: 0 0 auto;
  }
  .connection-strip b {
    margin-left: 0;
  }
  .instrument-identity {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .instrument-identity > div:first-child {
    grid-template-columns: auto 1fr;
  }
  .instrument-identity > div:first-child small {
    grid-column: 2;
  }
  .instrument-risk-tags {
    justify-content: start;
  }
  .contract-chart-card > header {
    flex-direction: column;
  }
  .market-metrics {
    justify-content: start;
  }
  .contract-chart {
    height: 470px;
  }
  .indicator-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .simulator-fields,
  .simulator-results dl,
  .simulator-outcomes,
  .position-risk-gate dl {
    grid-template-columns: 1fr;
  }
  .risk-gate-record {
    grid-template-columns: 1fr;
  }
  .execution-context article > header {
    flex-direction: column;
    gap: 7px;
  }
  .timeframe-grid {
    grid-template-columns: repeat(5, minmax(66px, 1fr));
    overflow-x: auto;
  }
  .feed-error,
  .feed-loading {
    min-height: 240px;
    padding: 22px;
  }
}
</style>
