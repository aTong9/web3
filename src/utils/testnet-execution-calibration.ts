import type {
  TestnetDrillType,
  TestnetExecutionCalibrationInput,
  TestnetExecutionCalibrationEvidenceEnvelope,
  TestnetExecutionCalibrationReport,
  TestnetExecutionObservation,
  TestnetSafetyDrill,
} from '@/types'

const drillTypes: TestnetDrillType[] = [
  'emergencyClose',
  'disableEntries',
  'staleMarketCircuitBreaker',
  'continuousReconciliation',
]
const executionCommands = new Set(['open', 'close'])
const executionStatuses = new Set([
  'filled',
  'partial',
  'rejected',
  'timeout',
  'unknown',
  'reconciled',
])
const testnetEvidenceMaximumAgeMs = 30 * 86_400_000
const testnetEvidenceClockSkewToleranceMs = 5 * 60_000
const roundTripQuantityRelativeTolerance = 0.000001
export const testnetExecutionCalibrationPolicy = Object.freeze({
  minimumFilledObservations: 100,
  minimumFilledObservationsPerCommand: 40,
  minimumCompletedRoundTrips: 40,
  minimumCommissionObservedFillRatePct: 80,
  minimumAggregateFillRatePct: 95,
  maximumP95SubmissionLatencyMs: 2_000,
  maximumP95AcknowledgementLatencyMs: 2_000,
  maximumRejectionRatePct: 5,
  maximumRecoveryDependencyRatePct: 5,
})
export const testnetExecutionEvidenceWindowStartAt = (now = new Date()) =>
  new Date(now.getTime() - testnetEvidenceMaximumAgeMs).toISOString()
const round = (value: number, digits = 4) => Number(value.toFixed(digits))
const fnv1a = (value: string) => {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`
}
const percentile = (values: readonly number[], fraction: number) => {
  if (!values.length) return null
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)]!
}

const validate = (input: TestnetExecutionCalibrationInput) => {
  const ids = new Set<string>()
  for (const observation of input.observations) {
    if (!observation.id || ids.has(observation.id)) throw new Error('Testnet观察ID必须唯一')
    ids.add(observation.id)
    if (!observation.tradeId?.trim()) throw new Error('Testnet观察必须关联交易ID')
    if (!observation.idempotencyKey) throw new Error('Testnet命令必须包含幂等键')
    if (!observation.costModelVersion.trim()) throw new Error('Testnet成本模型版本不能为空')
    if (
      !executionCommands.has(observation.command) ||
      !executionStatuses.has(observation.status)
    ) {
      throw new Error('Testnet观察命令或状态无效')
    }
    if (
      !Number.isFinite(Date.parse(observation.plannedAt)) ||
      !Number.isFinite(Date.parse(observation.submittedAt)) ||
      (observation.acknowledgedAt !== null &&
        !Number.isFinite(Date.parse(observation.acknowledgedAt))) ||
      (observation.reconciledAt !== null &&
        !Number.isFinite(Date.parse(observation.reconciledAt)))
    ) {
      throw new Error('Testnet观察时间无效')
    }
    const plannedAt = Date.parse(observation.plannedAt)
    const submittedAt = Date.parse(observation.submittedAt)
    const acknowledgedAt = observation.acknowledgedAt
      ? Date.parse(observation.acknowledgedAt)
      : null
    const reconciledAt = observation.reconciledAt ? Date.parse(observation.reconciledAt) : null
    if (
      plannedAt > submittedAt ||
      (acknowledgedAt !== null && acknowledgedAt < submittedAt) ||
      (reconciledAt !== null && reconciledAt < submittedAt)
    ) {
      throw new Error('Testnet观察时间顺序无效')
    }
    if ((observation.status === 'reconciled') !== (reconciledAt !== null)) {
      throw new Error('Testnet观察的对账状态与时间不一致')
    }
    if (
      !Number.isFinite(observation.plannedPrice) ||
      observation.plannedPrice <= 0 ||
      !Number.isFinite(observation.plannedQuantity) ||
      observation.plannedQuantity <= 0 ||
      (observation.averageFillPrice !== null &&
        (!Number.isFinite(observation.averageFillPrice) || observation.averageFillPrice <= 0)) ||
      !Number.isFinite(observation.filledQuantity) ||
      observation.filledQuantity < 0 ||
      observation.filledQuantity > observation.plannedQuantity ||
      !Number.isFinite(observation.commission) ||
      observation.commission < 0
    ) {
      throw new Error('Testnet价格、数量或手续费无效')
    }
    if (
      (observation.status === 'rejected' ||
        observation.status === 'timeout' ||
        observation.status === 'unknown') &&
      (observation.averageFillPrice !== null ||
        observation.filledQuantity !== 0 ||
        observation.commission !== 0)
    ) {
      throw new Error('Testnet执行状态与成交数据不一致')
    }
    if (
      (observation.status === 'filled' ||
        observation.status === 'partial' ||
        observation.status === 'reconciled') &&
      (observation.averageFillPrice === null || observation.filledQuantity <= 0)
    ) {
      throw new Error('Testnet执行状态与成交数据不一致')
    }
  }
  for (const drill of input.drills) {
    if (
      !drillTypes.includes(drill.type) ||
      typeof drill.costModelVersion !== 'string' ||
      !drill.costModelVersion.trim() ||
      !Number.isFinite(Date.parse(drill.performedAt)) ||
      typeof drill.passed !== 'boolean' ||
      typeof drill.evidence !== 'string' ||
      drill.evidence.trim().length < 1 ||
      drill.evidence.length > 500
    ) {
      throw new Error('Testnet安全演练记录无效')
    }
  }
}

const idempotencyConflicts = (observations: readonly TestnetExecutionObservation[]) => {
  const firstByKey = new Map<string, TestnetExecutionObservation>()
  const conflicts = new Set<string>()
  for (const observation of observations) {
    const first = firstByKey.get(observation.idempotencyKey)
    if (!first) {
      firstByKey.set(observation.idempotencyKey, observation)
      continue
    }
    if (
      first.command !== observation.command ||
      first.plannedPrice !== observation.plannedPrice ||
      first.plannedQuantity !== observation.plannedQuantity
    ) {
      conflicts.add(observation.idempotencyKey)
    }
  }
  return [...conflicts].sort()
}

const duplicateIdempotencyKeys = (observations: readonly TestnetExecutionObservation[]) => {
  const counts = new Map<string, number>()
  for (const observation of observations) {
    counts.set(observation.idempotencyKey, (counts.get(observation.idempotencyKey) ?? 0) + 1)
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([key]) => key)
    .sort()
}

const latestDrills = (drills: readonly TestnetSafetyDrill[]) =>
  Object.fromEntries(
    drillTypes.map((type) => [
      type,
      [...drills]
        .filter((drill) => drill.type === type)
        .sort((left, right) => Date.parse(right.performedAt) - Date.parse(left.performedAt))[0] ??
        null,
    ]),
  ) as Record<TestnetDrillType, TestnetSafetyDrill | null>

const evidenceFingerprint = (input: TestnetExecutionCalibrationInput) =>
  fnv1a(
    JSON.stringify([...input.observations].sort((left, right) => left.id.localeCompare(right.id))),
  )

export const calculateTestnetObservedFeeRatePct = (
  observations: readonly TestnetExecutionObservation[],
) => {
  const feeRates = observations.flatMap((observation) => {
    if (
      observation.commission <= 0 ||
      observation.averageFillPrice === null ||
      observation.filledQuantity <= 0
    ) {
      return []
    }
    return [
      (observation.commission /
        (observation.averageFillPrice * observation.filledQuantity)) *
        100,
    ]
  })
  const p95FeeRatePct = percentile(feeRates, 0.95)
  return p95FeeRatePct === null ? null : round(p95FeeRatePct)
}

export const calibrateTestnetExecution = (
  input: TestnetExecutionCalibrationInput,
): TestnetExecutionCalibrationReport => {
  validate(input)
  const conflicts = idempotencyConflicts(input.observations)
  const duplicateKeys = duplicateIdempotencyKeys(input.observations)
  const uniqueCommands = new Set(input.observations.map((item) => item.idempotencyKey)).size
  const fills = input.observations.filter(
    (item) => item.averageFillPrice !== null && item.filledQuantity > 0,
  )
  const filledOpenObservations = fills.filter((item) => item.command === 'open').length
  const filledCloseObservations = fills.filter((item) => item.command === 'close').length
  const commissionObservedFillRatePct = fills.length
    ? round((fills.filter((item) => item.commission > 0).length / fills.length) * 100)
    : null
  const filledOpens = fills.filter((item) => item.command === 'open')
  const filledCloses = fills.filter((item) => item.command === 'close')
  const filledOpenTradeIds = new Set(filledOpens.map((item) => item.tradeId))
  const filledCloseTradeIds = new Set(filledCloses.map((item) => item.tradeId))
  const pairedTradeIds = [...filledOpenTradeIds].filter((tradeId) =>
    filledCloseTradeIds.has(tradeId),
  )
  const timeOrderedRoundTripTradeIds = pairedTradeIds.filter((tradeId) => {
    const openAcknowledgements = filledOpens
      .filter((item) => item.tradeId === tradeId && item.acknowledgedAt !== null)
      .map((item) => Date.parse(item.acknowledgedAt!))
    const closeSubmissions = filledCloses
      .filter((item) => item.tradeId === tradeId)
      .map((item) => Date.parse(item.submittedAt))
    return (
      openAcknowledgements.length > 0 &&
      Math.max(...closeSubmissions) >= Math.min(...openAcknowledgements)
    )
  })
  const invalidRoundTripTradeIds = pairedTradeIds
    .filter((tradeId) => !timeOrderedRoundTripTradeIds.includes(tradeId))
    .sort()
  const invalidRoundTripQuantityTradeIds = timeOrderedRoundTripTradeIds
    .filter((tradeId) => {
      const openedQuantity = filledOpens
        .filter((item) => item.tradeId === tradeId)
        .reduce((sum, item) => sum + item.filledQuantity, 0)
      const closedQuantity = filledCloses
        .filter((item) => item.tradeId === tradeId)
        .reduce((sum, item) => sum + item.filledQuantity, 0)
      return (
        Math.abs(openedQuantity - closedQuantity) >
        Math.max(1e-8, openedQuantity * roundTripQuantityRelativeTolerance)
      )
    })
    .sort()
  const completedRoundTrips =
    timeOrderedRoundTripTradeIds.length - invalidRoundTripQuantityTradeIds.length
  const signedSlippageBps = fills.map(
    (item) => (item.averageFillPrice! / item.plannedPrice - 1) * 10_000,
  )
  const absoluteSlippageBps = signedSlippageBps.map(Math.abs)
  const submissionLatencies = input.observations.map(
    (item) => Date.parse(item.submittedAt) - Date.parse(item.plannedAt),
  )
  const p95SubmissionLatencyMs = percentile(submissionLatencies, 0.95)
  const latencies = fills.flatMap((item) =>
    item.acknowledgedAt === null
      ? []
      : [Date.parse(item.acknowledgedAt) - Date.parse(item.submittedAt)],
  )
  const p95AcknowledgementLatencyMs = percentile(latencies, 0.95)
  const plannedQuantity = input.observations.reduce((sum, item) => sum + item.plannedQuantity, 0)
  const filledQuantity = input.observations.reduce((sum, item) => sum + item.filledQuantity, 0)
  const aggregateFillRatePct = plannedQuantity
    ? round((filledQuantity / plannedQuantity) * 100)
    : null
  const unresolved = input.observations.filter(
    (item) => (item.status === 'unknown' || item.status === 'timeout') && !item.reconciledAt,
  )
  const uncertain = input.observations.filter(
    (item) =>
      item.status === 'unknown' || item.status === 'timeout' || item.status === 'reconciled',
  )
  const recovered = uncertain.filter((item) => item.reconciledAt !== null)
  const recoveryDependencyRatePct = input.observations.length
    ? round((recovered.length / input.observations.length) * 100)
    : null
  const drills = latestDrills(input.drills)
  const rejected = input.observations.filter((item) => item.status === 'rejected').length
  const rejectionRatePct = input.observations.length
    ? round((rejected / input.observations.length) * 100)
    : null
  const blockers: string[] = []
  if (!input.observations.length) blockers.push('尚无Testnet成交观察')
  if (
    input.observations.some(
      (observation) => observation.costModelVersion !== input.currentCostModelVersion,
    )
  ) {
    blockers.push('Testnet观察的成本模型版本不一致')
  }
  if (fills.length < testnetExecutionCalibrationPolicy.minimumFilledObservations) {
    blockers.push(
      `Testnet有效成交样本不足${testnetExecutionCalibrationPolicy.minimumFilledObservations}笔`,
    )
  }
  if (
    filledOpenObservations <
    testnetExecutionCalibrationPolicy.minimumFilledObservationsPerCommand
  ) {
    blockers.push(
      `Testnet开仓有效成交样本不足${testnetExecutionCalibrationPolicy.minimumFilledObservationsPerCommand}笔`,
    )
  }
  if (
    filledCloseObservations <
    testnetExecutionCalibrationPolicy.minimumFilledObservationsPerCommand
  ) {
    blockers.push(
      `Testnet平仓有效成交样本不足${testnetExecutionCalibrationPolicy.minimumFilledObservationsPerCommand}笔`,
    )
  }
  if (completedRoundTrips < testnetExecutionCalibrationPolicy.minimumCompletedRoundTrips) {
    blockers.push(
      `Testnet完整往返交易不足${testnetExecutionCalibrationPolicy.minimumCompletedRoundTrips}笔`,
    )
  }
  if (
    commissionObservedFillRatePct === null ||
    commissionObservedFillRatePct <
      testnetExecutionCalibrationPolicy.minimumCommissionObservedFillRatePct
  ) {
    blockers.push(
      `Testnet手续费证据覆盖率低于${testnetExecutionCalibrationPolicy.minimumCommissionObservedFillRatePct}%`,
    )
  }
  if (invalidRoundTripTradeIds.length) {
    blockers.push('存在平仓早于开仓确认的往返交易时间顺序无效')
  }
  if (invalidRoundTripQuantityTradeIds.length) {
    blockers.push('存在开仓与平仓成交数量不一致，往返交易数量未闭合')
  }
  if (
    aggregateFillRatePct === null ||
    aggregateFillRatePct < testnetExecutionCalibrationPolicy.minimumAggregateFillRatePct
  ) {
    blockers.push(
      `Testnet总成交率低于${testnetExecutionCalibrationPolicy.minimumAggregateFillRatePct}%`,
    )
  }
  if (
    p95SubmissionLatencyMs !== null &&
    p95SubmissionLatencyMs > testnetExecutionCalibrationPolicy.maximumP95SubmissionLatencyMs
  ) {
    blockers.push(
      `Testnet P95提交延迟超过${testnetExecutionCalibrationPolicy.maximumP95SubmissionLatencyMs}毫秒`,
    )
  }
  if (
    p95AcknowledgementLatencyMs !== null &&
    p95AcknowledgementLatencyMs >
      testnetExecutionCalibrationPolicy.maximumP95AcknowledgementLatencyMs
  ) {
    blockers.push(
      `Testnet P95确认延迟超过${testnetExecutionCalibrationPolicy.maximumP95AcknowledgementLatencyMs}毫秒`,
    )
  }
  if (latencies.length < fills.length) {
    blockers.push('Testnet有效成交的确认延迟证据不完整')
  }
  if (
    rejectionRatePct !== null &&
    rejectionRatePct > testnetExecutionCalibrationPolicy.maximumRejectionRatePct
  ) {
    blockers.push(
      `Testnet命令拒绝率超过${testnetExecutionCalibrationPolicy.maximumRejectionRatePct}%`,
    )
  }
  if (conflicts.length) blockers.push('存在幂等键对应不同命令参数')
  if (duplicateKeys.length) blockers.push('存在重复幂等键，Testnet样本不是一条命令一条观测')
  if (unresolved.length) blockers.push('存在未完成对账的超时或未知订单')
  if (
    recoveryDependencyRatePct !== null &&
    recoveryDependencyRatePct >
      testnetExecutionCalibrationPolicy.maximumRecoveryDependencyRatePct
  ) {
    blockers.push(
      `Testnet异常恢复依赖率超过${testnetExecutionCalibrationPolicy.maximumRecoveryDependencyRatePct}%`,
    )
  }
  for (const type of drillTypes) {
    if (!drills[type]?.passed || !drills[type]?.evidence.trim()) {
      blockers.push(`缺少通过的${type}演练证据`)
    } else if (drills[type]?.costModelVersion !== input.currentCostModelVersion) {
      blockers.push(`${type}安全演练成本模型版本不一致`)
    }
  }
  const p95Slippage = percentile(absoluteSlippageBps, 0.95)
  const observedFeeRatePct = calculateTestnetObservedFeeRatePct(fills)
  const fingerprint = evidenceFingerprint(input)
  return {
    observations: input.observations.length,
    filledObservations: fills.length,
    filledOpenObservations,
    filledCloseObservations,
    commissionObservedFillRatePct,
    completedRoundTrips,
    invalidRoundTripTradeIds,
    invalidRoundTripQuantityTradeIds,
    uniqueCommands,
    duplicateIdempotencyKeys: duplicateKeys,
    idempotencyConflicts: conflicts,
    averageSignedSlippageBps: signedSlippageBps.length
      ? round(signedSlippageBps.reduce((sum, value) => sum + value, 0) / signedSlippageBps.length)
      : null,
    p95AbsoluteSlippageBps: p95Slippage === null ? null : round(p95Slippage),
    p95SubmissionLatencyMs,
    averageAcknowledgementLatencyMs: latencies.length
      ? round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length)
      : null,
    p95AcknowledgementLatencyMs,
    aggregateFillRatePct,
    rejected,
    rejectionRatePct,
    timedOut: input.observations.filter((item) => item.status === 'timeout').length,
    unknown: input.observations.filter((item) => item.status === 'unknown').length,
    recoveredUnknown: recovered.length,
    recoveryDependencyRatePct,
    reconciliationRecoveryPct: uncertain.length
      ? round((recovered.length / uncertain.length) * 100)
      : null,
    recommendedCostModel: {
      version: `${input.currentCostModelVersion}-testnet-${input.observations.length}-${fingerprint}`,
      feeRatePct: observedFeeRatePct,
      slippageRatePct: p95Slippage === null ? null : round(p95Slippage / 100),
      sourceObservations: fills.length,
      feeSourceObservations: fills.filter((item) => item.commission > 0).length,
    },
    drills,
    readyForPaperComparison: blockers.length === 0,
    blockers,
  }
}

export const buildTestnetExecutionCalibrationEvidence = (
  input: TestnetExecutionCalibrationInput,
): TestnetExecutionCalibrationEvidenceEnvelope => ({
  schemaVersion: 1,
  input,
  report: calibrateTestnetExecution(input),
})

export type TestnetExecutionEvidenceCurrencyReason =
  | 'observations-stale'
  | 'observations-in-future'
  | 'drills-stale'
  | 'drills-in-future'

export const assessTestnetExecutionCalibrationEvidenceCurrency = (
  evidence: TestnetExecutionCalibrationEvidenceEnvelope,
  now = new Date(),
) => {
  const reasons: TestnetExecutionEvidenceCurrencyReason[] = []
  if (evidence.input.observations.length > 0) {
    const submittedTimes = evidence.input.observations.map((observation) =>
      Date.parse(observation.submittedAt),
    )
    const futureObservationTimes = evidence.input.observations.flatMap((observation) => [
      Date.parse(observation.plannedAt),
      Date.parse(observation.submittedAt),
      ...(observation.acknowledgedAt === null
        ? []
        : [Date.parse(observation.acknowledgedAt)]),
      ...(observation.reconciledAt === null
        ? []
        : [Date.parse(observation.reconciledAt)]),
    ])
    if (
      futureObservationTimes.some(
        (observedAt) => observedAt - now.getTime() > testnetEvidenceClockSkewToleranceMs,
      )
    ) {
      reasons.push('observations-in-future')
    }
    if (
      submittedTimes.some(
        (observedAt) => now.getTime() - observedAt > testnetEvidenceMaximumAgeMs,
      )
    ) {
      reasons.push('observations-stale')
    }
  }
  const currentDrills = Object.values(evidence.report.drills).filter((drill) => drill !== null)
  if (
    currentDrills.some(
      (drill) =>
        Date.parse(drill.performedAt) - now.getTime() > testnetEvidenceClockSkewToleranceMs,
    )
  ) {
    reasons.push('drills-in-future')
  } else if (
    currentDrills.some(
      (drill) => now.getTime() - Date.parse(drill.performedAt) > testnetEvidenceMaximumAgeMs,
    )
  ) {
    reasons.push('drills-stale')
  }
  return { status: reasons.length > 0 ? ('stale' as const) : ('current' as const), reasons }
}

export const parseTestnetExecutionCalibrationEvidence = (
  serialized: string,
): TestnetExecutionCalibrationEvidenceEnvelope => {
  let parsed: unknown
  try {
    parsed = JSON.parse(serialized)
  } catch {
    throw new Error('Testnet校准证据不是有效JSON')
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('Testnet校准证据结构或版本无效')
  const evidence = parsed as TestnetExecutionCalibrationEvidenceEnvelope
  if (evidence.schemaVersion !== 1 || !evidence.input || !evidence.report) {
    throw new Error('Testnet校准证据结构或版本无效')
  }
  const recalculated = calibrateTestnetExecution(evidence.input)
  if (JSON.stringify(recalculated) !== JSON.stringify(evidence.report)) {
    throw new Error('Testnet校准证据与原始输入重算结果不一致')
  }
  return evidence
}
