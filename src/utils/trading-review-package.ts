import type {
  ContractBacktestEvidenceEnvelope,
  ContractPaperDriftEvidenceEnvelope,
  LiveTradingReadinessInput,
  LiveTradingReadinessReport,
  TestnetExecutionCalibrationReport,
  TestnetExecutionCalibrationEvidenceEnvelope,
  TradingReviewChecklist,
  TradingReviewPackage,
  TradingReviewPackageCloudAudit,
  TradingEvidenceAuditCheckpoint,
  TradingEvidenceAuditCheckpointVerification,
} from '@/types'
import { assessLiveTradingReadiness } from '@/utils/live-trading-readiness'
import {
  analyzeContractPaperDrift,
  assertContractPaperDriftReviewPolicy,
} from '@/utils/contract-paper-drift'
import { parseContractBacktestEvidenceEnvelope } from '@/utils/trading-evidence'
import { buildTradingEvaluationPeriodBounds } from '@/utils/trading-evidence'
import { assertContractBacktestReviewCostPolicy } from '@/utils/contract-strategy-backtest'
import {
  evaluateTradingReviewChecklist,
  parseTradingReviewChecklist,
  tradingReviewChecklistValidityDays,
} from '@/utils/trading-review-checklist'
import { parseTradingEvidenceAuditCheckpoint } from '@/utils/trading-evidence-checkpoint'
import {
  assessTestnetExecutionCalibrationEvidenceCurrency,
  parseTestnetExecutionCalibrationEvidence,
} from '@/utils/testnet-execution-calibration'

interface TradingReviewPackageInput {
  generatedAt: string
  backtest: ContractBacktestEvidenceEnvelope | null
  paperDrift: ContractPaperDriftEvidenceEnvelope | null
  testnet: TestnetExecutionCalibrationReport | TestnetExecutionCalibrationEvidenceEnvelope | null
  reviewChecklist: TradingReviewChecklist
  readinessInput: LiveTradingReadinessInput
  readinessReport: LiveTradingReadinessReport
  schemaVersion?: 1 | 2 | 3
  cloudAudit?: {
    checkpoint: TradingEvidenceAuditCheckpoint
    verification: TradingEvidenceAuditCheckpointVerification
    verifiedAt: string
  } | null
}

export type TradingReviewPackageCloudAuditReverification =
  | { status: 'not-included'; verification: null; message: string }
  | {
      status: 'verified' | 'rejected'
      verification: TradingEvidenceAuditCheckpointVerification
      message: string
    }

type TradingReviewPackageCheckpointVerifier = (
  serialized: string,
) => Promise<TradingEvidenceAuditCheckpointVerification>

export interface TradingReviewPackageCurrencyAssessment {
  status: 'current' | 'stale'
  reasons: Array<
    | 'package-age-exceeded'
    | 'attestations-expired'
    | 'attestations-not-current'
    | 'generated-in-future'
    | 'legacy-testnet-not-recomputable'
    | 'paper-period-outdated'
    | 'testnet-observations-stale'
    | 'testnet-drills-stale'
    | 'testnet-observations-in-future'
    | 'testnet-drills-in-future'
  >
  expiredKeys: TradingReviewChecklist['attestations'][number]['key'][]
}

interface TradingReviewPackageCurrencyInput {
  schemaVersion?: TradingReviewPackage['schemaVersion']
  generatedAt: string
  evidence: Pick<TradingReviewPackage['evidence'], 'reviewChecklist'> &
    Partial<
      Pick<
        TradingReviewPackage['evidence'],
        'reviewChecklistEvaluation' | 'paperDrift' | 'testnet'
      >
    >
}

const digest = async (value: string) => {
  const bytes = new TextEncoder().encode(value)
  const hash = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  const hex = [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  return `sha256-${hex}`
}

const withoutDigest = (reviewPackage: Omit<TradingReviewPackage, 'contentDigest'>) =>
  JSON.stringify(reviewPackage)

const same = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)

const isTestnetEvidence = (
  value: TestnetExecutionCalibrationReport | TestnetExecutionCalibrationEvidenceEnvelope,
): value is TestnetExecutionCalibrationEvidenceEnvelope =>
  'schemaVersion' in value && value.schemaVersion === 1 && 'input' in value && 'report' in value

const testnetReport = (
  value: TestnetExecutionCalibrationReport | TestnetExecutionCalibrationEvidenceEnvelope | null,
) => (value && isTestnetEvidence(value) ? value.report : value)

const assertBacktestCoversTestnetCosts = (
  backtest: ContractBacktestEvidenceEnvelope | null,
  testnet: TestnetExecutionCalibrationReport | TestnetExecutionCalibrationEvidenceEnvelope | null,
) => {
  const recommendedSlippageRatePct = testnetReport(testnet)?.recommendedCostModel.slippageRatePct
  if (
    backtest &&
    recommendedSlippageRatePct !== null &&
    recommendedSlippageRatePct !== undefined &&
    backtest.input.costModel.slippageRatePct < recommendedSlippageRatePct
  ) {
    throw new Error('综合评审包的回测滑点低于Testnet校准建议')
  }
  const observedFeeRatePct = testnetReport(testnet)?.recommendedCostModel.feeRatePct
  if (
    backtest &&
    observedFeeRatePct !== null &&
    observedFeeRatePct !== undefined &&
    backtest.input.costModel.feeRatePct < observedFeeRatePct
  ) {
    throw new Error(
      testnet !== null && isTestnetEvidence(testnet)
        ? '综合评审包的回测手续费低于Testnet实测费率'
        : '综合评审包的回测手续费低于Testnet校准建议',
    )
  }
}

const assertPaperCoversTestnetCosts = (
  paperDrift: ContractPaperDriftEvidenceEnvelope | null,
  testnet: TestnetExecutionCalibrationReport | TestnetExecutionCalibrationEvidenceEnvelope | null,
) => {
  if (!paperDrift || !testnet) return
  const recommendation = testnetReport(testnet)?.recommendedCostModel
  const recommendedFeeRatePct = recommendation?.feeRatePct
  if (
    recommendedFeeRatePct !== null &&
    recommendedFeeRatePct !== undefined &&
    paperDrift.input.paperTrades.some(
      (trade) =>
        typeof trade.feeRatePct !== 'number' || trade.feeRatePct < recommendedFeeRatePct,
    )
  ) {
    throw new Error('综合评审包的Paper手续费低于Testnet校准建议或缺少成本证据')
  }
  const recommendedSlippageRatePct = recommendation?.slippageRatePct
  if (
    recommendedSlippageRatePct !== null &&
    recommendedSlippageRatePct !== undefined &&
    paperDrift.input.paperTrades.some(
      (trade) =>
        typeof trade.slippageRatePct !== 'number' ||
        trade.slippageRatePct < recommendedSlippageRatePct,
    )
  ) {
    throw new Error('综合评审包的Paper滑点低于Testnet校准建议或缺少成本证据')
  }
}

const validateCloudAudit = async (cloudAudit: TradingReviewPackageCloudAudit) => {
  const checkpoint = await parseTradingEvidenceAuditCheckpoint(
    JSON.stringify(cloudAudit.checkpoint),
  )
  const { verification } = cloudAudit
  if (
    cloudAudit.verificationScope !== 'server-response-not-signature' ||
    !Number.isFinite(Date.parse(cloudAudit.verifiedAt)) ||
    !verification.valid ||
    verification.checkpointRevision !== checkpoint.revision ||
    verification.currentRevision < checkpoint.revision ||
    verification.isCurrentHead !== (verification.currentRevision === checkpoint.revision)
  ) {
    throw new Error('综合评审包的云端审计锚点无效')
  }
}

export const reverifyTradingReviewPackageCloudAudit = async (
  reviewPackage: Pick<TradingReviewPackage, 'cloudAudit'>,
  verify: TradingReviewPackageCheckpointVerifier,
): Promise<TradingReviewPackageCloudAuditReverification> => {
  const checkpoint = reviewPackage.cloudAudit?.checkpoint
  if (!checkpoint) {
    return {
      status: 'not-included',
      verification: null,
      message: '综合评审包未包含云端审计锚点',
    }
  }
  const verification = await verify(JSON.stringify(checkpoint))
  const matchesCheckpoint =
    verification.checkpointRevision === checkpoint.revision &&
    verification.currentRevision >= checkpoint.revision &&
    verification.isCurrentHead === (verification.currentRevision === checkpoint.revision)
  const status = verification.valid && matchesCheckpoint ? 'verified' : 'rejected'
  return {
    status,
    verification,
    message:
      status === 'verified'
        ? verification.message
        : matchesCheckpoint
          ? verification.message
          : '服务端复验结果与综合评审包检查点不一致',
  }
}

export const assessTradingReviewPackageCurrency = (
  reviewPackage: TradingReviewPackageCurrencyInput,
  now = new Date(),
): TradingReviewPackageCurrencyAssessment => {
  const evaluation = evaluateTradingReviewChecklist(reviewPackage.evidence.reviewChecklist, now)
  const maximumAgeMs = tradingReviewChecklistValidityDays * 86_400_000
  const clockSkewToleranceMs = 5 * 60_000
  const generatedTime = Date.parse(reviewPackage.generatedAt)
  const reasons: TradingReviewPackageCurrencyAssessment['reasons'] = []
  if (generatedTime - now.getTime() > clockSkewToleranceMs) {
    reasons.push('generated-in-future')
  } else if (now.getTime() - generatedTime > maximumAgeMs) {
    reasons.push('package-age-exceeded')
  }
  if (evaluation.expiredKeys.length > 0) reasons.push('attestations-expired')
  if (
    reviewPackage.evidence.reviewChecklistEvaluation &&
    !same(evaluation, reviewPackage.evidence.reviewChecklistEvaluation)
  ) {
    reasons.push('attestations-not-current')
  }
  const paperPeriodOutdated = reviewPackage.evidence.paperDrift?.report.cohorts.some((cohort) => {
    const current = buildTradingEvaluationPeriodBounds(cohort.period, now)
    return cohort.startAt !== current.startAt || cohort.endAt !== current.endAt
  })
  if (paperPeriodOutdated) reasons.push('paper-period-outdated')
  if (
    reviewPackage.schemaVersion !== undefined &&
    reviewPackage.schemaVersion < 3 &&
    reviewPackage.evidence.testnet
  ) {
    reasons.push('legacy-testnet-not-recomputable')
  }
  const testnet = reviewPackage.evidence.testnet
  if (testnet && isTestnetEvidence(testnet)) {
    const testnetCurrency = assessTestnetExecutionCalibrationEvidenceCurrency(testnet, now)
    const reasonMap = {
      'observations-stale': 'testnet-observations-stale',
      'observations-in-future': 'testnet-observations-in-future',
      'drills-stale': 'testnet-drills-stale',
      'drills-in-future': 'testnet-drills-in-future',
    } as const
    for (const reason of testnetCurrency.reasons) {
      reasons.push(reasonMap[reason])
    }
  }
  return {
    status: reasons.length > 0 ? 'stale' : 'current',
    reasons,
    expiredKeys: evaluation.expiredKeys,
  }
}

const assertEvidenceMatchesReadiness = (reviewPackage: Omit<TradingReviewPackage, 'contentDigest'>) => {
  const { backtest, paperDrift, reviewChecklistEvaluation } = reviewPackage.evidence
  const testnet = testnetReport(reviewPackage.evidence.testnet)
  const holdout = backtest?.report.segments.holdout
  const month = paperDrift?.report.cohorts.find((cohort) => cohort.period === 'month')
  const expectedBacktest = {
    holdoutStatus: holdout?.metrics.status ?? 'insufficient',
    holdoutSamples: holdout?.metrics.trades ?? 0,
    holdoutDays:
      holdout?.startAt && holdout.endAt
        ? Math.max(1, Math.ceil((Date.parse(holdout.endAt) - Date.parse(holdout.startAt)) / 86_400_000))
        : 0,
    averageNetReturnPct: holdout?.metrics.averageNetReturnPct ?? null,
    maximumDrawdownPct: holdout?.metrics.maximumDrawdownPct ?? 0,
  }
  const expectedPaper = {
    status: month?.status ?? 'insufficient',
    samples: month?.samples ?? 0,
    returnDeltaPct: month?.returnDeltaPct ?? null,
  }
  const expectedTestnet = {
    readyForPaperComparison: testnet?.readyForPaperComparison ?? false,
    observations: testnet?.observations ?? 0,
    filledObservations: testnet?.filledObservations ?? 0,
    unresolvedOrders: (testnet?.timedOut ?? 0) + (testnet?.unknown ?? 0),
  }
  if (
    !same(reviewPackage.readinessInput.backtest, expectedBacktest) ||
    !same(reviewPackage.readinessInput.paper, expectedPaper) ||
    !same(reviewPackage.readinessInput.testnet, expectedTestnet) ||
    !same(reviewPackage.readinessInput.accountControls, reviewChecklistEvaluation.accountControls) ||
    !same(reviewPackage.readinessInput.riskControls, reviewChecklistEvaluation.riskControls) ||
    !same(reviewPackage.readinessInput.eligibility, reviewChecklistEvaluation.eligibility)
  ) {
    throw new Error('综合评审包的证据与闸门输入不一致')
  }
}

export const buildTradingReviewPackage = async (
  input: TradingReviewPackageInput,
): Promise<TradingReviewPackage> => {
  if (!Number.isFinite(Date.parse(input.generatedAt))) throw new Error('综合评审包生成时间无效')
  const schemaVersion = input.schemaVersion ?? 3
  if (schemaVersion === 1 && input.cloudAudit) {
    throw new Error('综合评审包v1不支持云端审计锚点')
  }
  if (input.testnet) {
    const hasEvidence = isTestnetEvidence(input.testnet)
    if (schemaVersion === 3 && !hasEvidence) {
      throw new Error('综合评审包v3要求可重算的Testnet校准证据')
    }
    if (schemaVersion < 3 && hasEvidence) {
      throw new Error('综合评审包v1/v2不支持Testnet校准证据包')
    }
    if (hasEvidence) {
      parseTestnetExecutionCalibrationEvidence(JSON.stringify(input.testnet))
    }
  }
  if (input.paperDrift) {
    assertContractPaperDriftReviewPolicy(input.paperDrift.input)
    if (!same(analyzeContractPaperDrift(input.paperDrift.input), input.paperDrift.report)) {
      throw new Error('综合评审包的Paper偏差证据无法重算')
    }
  }
  if (input.backtest) {
    assertContractBacktestReviewCostPolicy(input.backtest.input)
    parseContractBacktestEvidenceEnvelope(JSON.stringify(input.backtest))
  }
  assertBacktestCoversTestnetCosts(input.backtest, input.testnet)
  assertPaperCoversTestnetCosts(input.paperDrift, input.testnet)
  const base: Omit<TradingReviewPackage, 'contentDigest'> = {
    schemaVersion,
    generatedAt: input.generatedAt,
    authorization: 'human-review-only',
    evidence: {
      backtest: input.backtest,
      paperDrift: input.paperDrift,
      testnet: input.testnet,
      reviewChecklist: input.reviewChecklist,
      reviewChecklistEvaluation: evaluateTradingReviewChecklist(
        input.reviewChecklist,
        new Date(input.generatedAt),
      ),
    },
    readinessInput: input.readinessInput,
    readinessReport: input.readinessReport,
    ...(schemaVersion >= 2
      ? {
          cloudAudit: input.cloudAudit
            ? {
                ...input.cloudAudit,
                verificationScope: 'server-response-not-signature' as const,
              }
            : null,
        }
      : {}),
  }
  if (base.cloudAudit) await validateCloudAudit(base.cloudAudit)
  assertEvidenceMatchesReadiness(base)
  if (!same(assessLiveTradingReadiness(base.readinessInput), base.readinessReport)) {
    throw new Error('综合评审包的闸门结论无法重算')
  }
  return { ...base, contentDigest: await digest(withoutDigest(base)) }
}

export const parseTradingReviewPackage = async (serialized: string): Promise<TradingReviewPackage> => {
  let parsed: unknown
  try {
    parsed = JSON.parse(serialized)
  } catch {
    throw new Error('综合评审包不是有效JSON')
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('综合评审包结构无效')
  const reviewPackage = parsed as TradingReviewPackage
  if (
    (reviewPackage.schemaVersion !== 1 &&
      reviewPackage.schemaVersion !== 2 &&
      reviewPackage.schemaVersion !== 3) ||
    reviewPackage.authorization !== 'human-review-only' ||
    !Number.isFinite(Date.parse(reviewPackage.generatedAt)) ||
    typeof reviewPackage.contentDigest !== 'string' ||
    !reviewPackage.evidence ||
    !reviewPackage.readinessInput ||
    !reviewPackage.readinessReport
  ) {
    throw new Error('综合评审包结构或版本无效')
  }
  const { contentDigest, ...base } = reviewPackage
  if ((await digest(withoutDigest(base))) !== contentDigest) {
    throw new Error('综合评审包内容摘要不匹配')
  }
  const hasCloudAudit = Object.prototype.hasOwnProperty.call(base, 'cloudAudit')
  if (base.schemaVersion === 1 && hasCloudAudit) {
    throw new Error('综合评审包v1不能包含云端审计锚点')
  }
  if (base.schemaVersion >= 2 && !hasCloudAudit) {
    throw new Error(`综合评审包v${base.schemaVersion}缺少云端审计字段`)
  }
  if (base.cloudAudit) await validateCloudAudit(base.cloudAudit)
  if (base.evidence.testnet) {
    const hasEvidence = isTestnetEvidence(base.evidence.testnet)
    if (base.schemaVersion === 3 && !hasEvidence) {
      throw new Error('综合评审包v3要求可重算的Testnet校准证据')
    }
    if (base.schemaVersion < 3 && hasEvidence) {
      throw new Error('综合评审包v1/v2不支持Testnet校准证据包')
    }
    if (hasEvidence) {
      parseTestnetExecutionCalibrationEvidence(JSON.stringify(base.evidence.testnet))
    }
  }
  const checklist = parseTradingReviewChecklist(JSON.stringify(base.evidence.reviewChecklist))
  const checklistEvaluation = evaluateTradingReviewChecklist(
    checklist,
    new Date(base.generatedAt),
  )
  if (!same(checklistEvaluation, base.evidence.reviewChecklistEvaluation)) {
    throw new Error('综合评审包的人工核验结果无法重算')
  }
  if (base.evidence.backtest) {
    assertContractBacktestReviewCostPolicy(base.evidence.backtest.input)
    const recalculated = parseContractBacktestEvidenceEnvelope(
      JSON.stringify(base.evidence.backtest),
    )
    if (!same(recalculated, base.evidence.backtest)) throw new Error('综合评审包的回测证据无法重算')
  }
  assertBacktestCoversTestnetCosts(base.evidence.backtest, base.evidence.testnet)
  if (base.evidence.paperDrift) {
    assertContractPaperDriftReviewPolicy(base.evidence.paperDrift.input)
    if (
      !same(
        analyzeContractPaperDrift(base.evidence.paperDrift.input),
        base.evidence.paperDrift.report,
      )
    ) {
      throw new Error('综合评审包的Paper偏差证据无法重算')
    }
  }
  assertPaperCoversTestnetCosts(base.evidence.paperDrift, base.evidence.testnet)
  assertEvidenceMatchesReadiness(base)
  if (!same(assessLiveTradingReadiness(base.readinessInput), base.readinessReport)) {
    throw new Error('综合评审包的闸门结论无法重算')
  }
  return reviewPackage
}
