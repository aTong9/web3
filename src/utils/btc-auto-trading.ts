import type {
  AssetPricePoint,
  BtcAutoCloseReason,
  BtcAutoEntryGate,
  BtcAutoEquityPoint,
  BtcAutoLegacyStrategyDefinition,
  BtcAutoMarketSource,
  BtcAutoPerformanceSummary,
  BtcAutoRollingHealth,
  BtcAutoStrategyDefinition,
  BtcAutoSignalSnapshot,
  BtcAutoScoreThresholdStudy,
  BtcAutoConsensusStudy,
  BtcAutoStrategyComparison,
  BtcAutoTrade,
  BtcAutoTradingConfig,
  BtcAutoTemporalValidation,
  ContractChartInterval,
  ContractMarketSnapshot,
  ContractTradeDecision,
} from '@/types'

const round = (value: number, digits = 4) => Number(value.toFixed(digits))
const directional = (action: ContractTradeDecision['action']) =>
  action === 'long' || action === 'short'

const intervalMilliseconds: Partial<Record<ContractMarketSnapshot['interval'], number>> = {
  '1m': 60_000,
  '5m': 300_000,
  '15m': 900_000,
  '1h': 3_600_000,
  '4h': 14_400_000,
}

export const validateBtcAutoMarketFreshness = (
  market: ContractMarketSnapshot,
  now = new Date(),
  source: BtcAutoMarketSource = 'binance',
) => {
  if (market.markPrice === null || !Number.isFinite(market.markPrice) || market.markPrice <= 0) {
    return 'BTC标记价不可用'
  }
  const validate = (interval: '1m' | '5m', maximumLagMs: number) => {
    const points = market.timeframes.find((item) => item.interval === interval)?.points ?? []
    const latest = points[points.length - 1]
    const openAt = latest ? Date.parse(latest.date) : Number.NaN
    const closeAt = openAt + (intervalMilliseconds[interval] ?? 0)
    if (!latest || !Number.isFinite(openAt) || !Number.isFinite(latest.close)) {
      return `${interval}行情不可用`
    }
    if (closeAt > now.getTime() + 5_000) return `${interval}行情时间异常`
    if (now.getTime() - closeAt > maximumLagMs) return `${interval}行情已过期`
    return null
  }
  const minuteLag = source === 'coinbase' ? 6 * 60_000 : 3 * 60_000
  return validate('1m', minuteLag) ?? validate('5m', 10 * 60_000)
}

export const nextBtcAutoScheduledRunAt = (now = new Date()) =>
  new Date((Math.floor(now.getTime() / 300_000) + 1) * 300_000).toISOString()

export const btcAutoEstimatedRoundTripCostPct = (feeRatePct: number) => round(feeRatePct * 2)

export const isBtcAutoFeeAdjustedSignalWin = (movePct: number, feeRatePct: number) =>
  movePct > btcAutoEstimatedRoundTripCostPct(feeRatePct)

const automaticResearchFamilyConfidenceLevelPct = 90
const automaticResearchFamilySize = 5
const automaticResearchConfidenceLevelPct =
  100 - (100 - automaticResearchFamilyConfidenceLevelPct) / automaticResearchFamilySize
const automaticResearchOneSidedZScore = 2.054
const automaticResearchWindowSamples = 96
const temporalValidationMaximumSamples = 24
const temporalValidationMinimumSamples = 12

interface BtcAutoTemporalValidationInput {
  baselineSamples: number
  candidateSamples: number
  baselineHitRatePct: number | null
  candidateHitRatePct: number | null
  baselineAverageMovePct: number | null
  candidateAverageMovePct: number | null
}

const evaluateTemporalValidation = (
  input: BtcAutoTemporalValidationInput | undefined,
  feeRatePct: number,
): BtcAutoTemporalValidation => {
  const roundTripCostPct = btcAutoEstimatedRoundTripCostPct(feeRatePct)
  const baselineAverageNetMovePct =
    input?.baselineAverageMovePct === null || input?.baselineAverageMovePct === undefined
      ? null
      : round(input.baselineAverageMovePct - roundTripCostPct)
  const candidateAverageNetMovePct =
    input?.candidateAverageMovePct === null || input?.candidateAverageMovePct === undefined
      ? null
      : round(input.candidateAverageMovePct - roundTripCostPct)
  const hitRateLiftPct =
    input?.baselineHitRatePct === null ||
    input?.baselineHitRatePct === undefined ||
    input.candidateHitRatePct === null
      ? null
      : round(input.candidateHitRatePct - input.baselineHitRatePct, 2)
  const baselineSamples = input?.baselineSamples ?? 0
  const candidateSamples = input?.candidateSamples ?? 0
  const passed =
    baselineSamples >= temporalValidationMinimumSamples &&
    candidateSamples >= temporalValidationMinimumSamples &&
    (hitRateLiftPct ?? Number.NEGATIVE_INFINITY) > 0 &&
    (candidateAverageNetMovePct ?? Number.NEGATIVE_INFINITY) > 0 &&
    (candidateAverageNetMovePct ?? Number.NEGATIVE_INFINITY) > (baselineAverageNetMovePct ?? 0)
  return {
    maximumSamples: temporalValidationMaximumSamples,
    minimumSamples: temporalValidationMinimumSamples,
    baselineSamples,
    candidateSamples,
    baselineHitRatePct:
      input?.baselineHitRatePct === null || input?.baselineHitRatePct === undefined
        ? null
        : round(input.baselineHitRatePct, 2),
    candidateHitRatePct:
      input?.candidateHitRatePct === null || input?.candidateHitRatePct === undefined
        ? null
        : round(input.candidateHitRatePct, 2),
    baselineAverageNetMovePct,
    candidateAverageNetMovePct,
    hitRateLiftPct,
    passed,
  }
}

const conservativeHitRateLiftLowerBoundPct = (
  baselineHitRatePct: number | null,
  baselineSamples: number,
  candidateHitRatePct: number | null,
  candidateSamples: number,
) => {
  if (
    baselineHitRatePct === null ||
    candidateHitRatePct === null ||
    baselineSamples <= 0 ||
    candidateSamples <= 0
  )
    return null
  const baselineRate = baselineHitRatePct / 100
  const candidateRate = candidateHitRatePct / 100
  const standardErrorPct =
    Math.sqrt(
      (baselineRate * (1 - baselineRate)) / baselineSamples +
        (candidateRate * (1 - candidateRate)) / candidateSamples,
    ) * 100
  return round(
    candidateHitRatePct - baselineHitRatePct - automaticResearchOneSidedZScore * standardErrorPct,
    2,
  )
}

export const evaluateBtcAutoStrategyComparison = (input: {
  minimumSamples?: number
  pairedSamples: number
  baselineOnlyWins: number
  ensembleOnlyWins: number
  baselineSamples: number
  baselineHitRatePct: number | null
  baselineAverageMovePct: number | null
  ensembleSamples: number
  ensembleHitRatePct: number | null
  ensembleAverageMovePct: number | null
  feeRatePct: number
  temporalValidation?: BtcAutoTemporalValidationInput
}): BtcAutoStrategyComparison => {
  const minimumSamples = input.minimumSamples ?? 48
  const maximumSamples = automaticResearchWindowSamples
  const temporalValidation = evaluateTemporalValidation(input.temporalValidation, input.feeRatePct)
  const confidenceLevelPct = automaticResearchConfidenceLevelPct
  const oneSidedZScore = automaticResearchOneSidedZScore
  const estimatedRoundTripCostPct = btcAutoEstimatedRoundTripCostPct(input.feeRatePct)
  const baselineAverageNetMovePct =
    input.baselineAverageMovePct === null
      ? null
      : round(input.baselineAverageMovePct - estimatedRoundTripCostPct)
  const ensembleAverageNetMovePct =
    input.ensembleAverageMovePct === null
      ? null
      : round(input.ensembleAverageMovePct - estimatedRoundTripCostPct)
  const hitRateAdvantagePct =
    input.baselineHitRatePct === null || input.ensembleHitRatePct === null
      ? null
      : round(input.ensembleHitRatePct - input.baselineHitRatePct, 2)
  const discordantSamples = input.baselineOnlyWins + input.ensembleOnlyWins
  const discordantDifference = input.ensembleOnlyWins - input.baselineOnlyWins
  const hitRateDifferenceStandardErrorPct =
    input.baselineHitRatePct === null ||
    input.ensembleHitRatePct === null ||
    input.pairedSamples <= 0
      ? null
      : Math.sqrt(
          Math.max(
            0,
            discordantSamples - (discordantDifference * discordantDifference) / input.pairedSamples,
          ) /
            (input.pairedSamples * input.pairedSamples),
        ) * 100
  const hitRateAdvantageLowerBoundPct =
    hitRateAdvantagePct === null || hitRateDifferenceStandardErrorPct === null
      ? null
      : round(hitRateAdvantagePct - oneSidedZScore * hitRateDifferenceStandardErrorPct, 2)
  const hitRateAdvantageUpperBoundPct =
    hitRateAdvantagePct === null || hitRateDifferenceStandardErrorPct === null
      ? null
      : round(hitRateAdvantagePct + oneSidedZScore * hitRateDifferenceStandardErrorPct, 2)
  const enough = input.pairedSamples >= minimumSamples
  const verdict: BtcAutoStrategyComparison['verdict'] = !enough
    ? 'collecting'
    : (hitRateAdvantagePct ?? 0) >= 3 &&
        (hitRateAdvantageLowerBoundPct ?? Number.NEGATIVE_INFINITY) > 0 &&
        (ensembleAverageNetMovePct ?? Number.NEGATIVE_INFINITY) > 0 &&
        (ensembleAverageNetMovePct ?? Number.NEGATIVE_INFINITY) >
          (baselineAverageNetMovePct ?? 0) &&
        temporalValidation.passed
      ? 'outperforming'
      : (hitRateAdvantageUpperBoundPct ?? Number.POSITIVE_INFINITY) < 0 &&
          (ensembleAverageNetMovePct ?? 0) <= (baselineAverageNetMovePct ?? 0)
        ? 'underperforming'
        : 'mixed'
  const recommendedEnsembleWeightPct = verdict === 'outperforming' ? 35 : 0
  return {
    horizon: '1h',
    minimumSamples,
    maximumSamples,
    confidenceLevelPct,
    pairedSamples: input.pairedSamples,
    baselineOnlyWins: input.baselineOnlyWins,
    ensembleOnlyWins: input.ensembleOnlyWins,
    baselineSamples: input.baselineSamples,
    baselineHitRatePct:
      input.baselineHitRatePct === null ? null : round(input.baselineHitRatePct, 2),
    baselineAverageMovePct:
      input.baselineAverageMovePct === null ? null : round(input.baselineAverageMovePct),
    baselineAverageNetMovePct,
    ensembleSamples: input.ensembleSamples,
    ensembleHitRatePct:
      input.ensembleHitRatePct === null ? null : round(input.ensembleHitRatePct, 2),
    ensembleAverageMovePct:
      input.ensembleAverageMovePct === null ? null : round(input.ensembleAverageMovePct),
    ensembleAverageNetMovePct,
    estimatedRoundTripCostPct,
    hitRateAdvantagePct,
    hitRateAdvantageLowerBoundPct,
    hitRateAdvantageUpperBoundPct,
    verdict,
    recommendedEnsembleWeightPct,
    temporalValidation,
  }
}

export const evaluateBtcAutoScoreThresholdStudy = (input: {
  minimumSamples?: number
  currentThreshold: number
  candidateThreshold: number
  currentSamples: number
  candidateSamples: number
  currentHitRatePct: number | null
  candidateHitRatePct: number | null
  currentAverageMovePct: number | null
  candidateAverageMovePct: number | null
  feeRatePct: number
  temporalValidation?: BtcAutoTemporalValidationInput
}): BtcAutoScoreThresholdStudy => {
  const minimumSamples = input.minimumSamples ?? 30
  const confidenceLevelPct = automaticResearchConfidenceLevelPct
  const temporalValidation = evaluateTemporalValidation(input.temporalValidation, input.feeRatePct)
  const roundTripCostPct = input.feeRatePct * 2
  const currentAverageNetMovePct =
    input.currentAverageMovePct === null
      ? null
      : round(input.currentAverageMovePct - roundTripCostPct)
  const candidateAverageNetMovePct =
    input.candidateAverageMovePct === null
      ? null
      : round(input.candidateAverageMovePct - roundTripCostPct)
  const candidateCoveragePct = input.currentSamples
    ? round((input.candidateSamples / input.currentSamples) * 100, 2)
    : null
  const hitRateLiftPct =
    input.currentHitRatePct === null || input.candidateHitRatePct === null
      ? null
      : round(input.candidateHitRatePct - input.currentHitRatePct, 2)
  const hitRateLiftLowerBoundPct = conservativeHitRateLiftLowerBoundPct(
    input.currentHitRatePct,
    input.currentSamples,
    input.candidateHitRatePct,
    input.candidateSamples,
  )
  const enough = input.currentSamples >= minimumSamples && input.candidateSamples >= minimumSamples
  const verdict: BtcAutoScoreThresholdStudy['verdict'] = !enough
    ? 'collecting'
    : (hitRateLiftPct ?? 0) >= 5 &&
        (hitRateLiftLowerBoundPct ?? Number.NEGATIVE_INFINITY) > 0 &&
        (candidateAverageNetMovePct ?? Number.NEGATIVE_INFINITY) > 0 &&
        (candidateAverageNetMovePct ?? Number.NEGATIVE_INFINITY) >
          (currentAverageNetMovePct ?? 0) &&
        (candidateCoveragePct ?? 0) >= 30 &&
        temporalValidation.passed
      ? 'raise'
      : (hitRateLiftPct ?? 0) <= 0 ||
          (candidateAverageNetMovePct ?? 0) <= (currentAverageNetMovePct ?? 0)
        ? 'keep'
        : 'mixed'
  return {
    horizon: '1h',
    minimumSamples,
    confidenceLevelPct,
    currentThreshold: input.currentThreshold,
    candidateThreshold: input.candidateThreshold,
    currentSamples: input.currentSamples,
    candidateSamples: input.candidateSamples,
    currentHitRatePct: input.currentHitRatePct === null ? null : round(input.currentHitRatePct, 2),
    candidateHitRatePct:
      input.candidateHitRatePct === null ? null : round(input.candidateHitRatePct, 2),
    currentAverageNetMovePct,
    candidateAverageNetMovePct,
    candidateCoveragePct,
    hitRateLiftPct,
    hitRateLiftLowerBoundPct,
    verdict,
    temporalValidation,
  }
}

export const evaluateBtcAutoConsensusStudy = (input: {
  minimumSamples?: number
  baselineSamples: number
  consensusSamples: number
  baselineHitRatePct: number | null
  consensusHitRatePct: number | null
  baselineAverageMovePct: number | null
  consensusAverageMovePct: number | null
  feeRatePct: number
  temporalValidation?: BtcAutoTemporalValidationInput
}): BtcAutoConsensusStudy => {
  const minimumSamples = input.minimumSamples ?? 30
  const confidenceLevelPct = automaticResearchConfidenceLevelPct
  const temporalValidation = evaluateTemporalValidation(input.temporalValidation, input.feeRatePct)
  const roundTripCostPct = btcAutoEstimatedRoundTripCostPct(input.feeRatePct)
  const baselineAverageNetMovePct =
    input.baselineAverageMovePct === null
      ? null
      : round(input.baselineAverageMovePct - roundTripCostPct)
  const consensusAverageNetMovePct =
    input.consensusAverageMovePct === null
      ? null
      : round(input.consensusAverageMovePct - roundTripCostPct)
  const consensusCoveragePct = input.baselineSamples
    ? round((input.consensusSamples / input.baselineSamples) * 100, 2)
    : null
  const hitRateLiftPct =
    input.baselineHitRatePct === null || input.consensusHitRatePct === null
      ? null
      : round(input.consensusHitRatePct - input.baselineHitRatePct, 2)
  const hitRateLiftLowerBoundPct = conservativeHitRateLiftLowerBoundPct(
    input.baselineHitRatePct,
    input.baselineSamples,
    input.consensusHitRatePct,
    input.consensusSamples,
  )
  const enough = input.baselineSamples >= minimumSamples && input.consensusSamples >= minimumSamples
  const verdict: BtcAutoConsensusStudy['verdict'] = !enough
    ? 'collecting'
    : (hitRateLiftPct ?? 0) >= 5 &&
        (hitRateLiftLowerBoundPct ?? Number.NEGATIVE_INFINITY) > 0 &&
        (consensusAverageNetMovePct ?? Number.NEGATIVE_INFINITY) > 0 &&
        (consensusAverageNetMovePct ?? Number.NEGATIVE_INFINITY) >
          (baselineAverageNetMovePct ?? 0) &&
        (consensusCoveragePct ?? 0) >= 30 &&
        temporalValidation.passed
      ? 'promote'
      : (hitRateLiftPct ?? 0) <= 0 ||
          (consensusAverageNetMovePct ?? 0) <= (baselineAverageNetMovePct ?? 0)
        ? 'keep'
        : 'mixed'
  return {
    horizon: '1h',
    minimumSamples,
    confidenceLevelPct,
    baselineSamples: input.baselineSamples,
    consensusSamples: input.consensusSamples,
    baselineHitRatePct:
      input.baselineHitRatePct === null ? null : round(input.baselineHitRatePct, 2),
    consensusHitRatePct:
      input.consensusHitRatePct === null ? null : round(input.consensusHitRatePct, 2),
    baselineAverageNetMovePct,
    consensusAverageNetMovePct,
    consensusCoveragePct,
    hitRateLiftPct,
    hitRateLiftLowerBoundPct,
    verdict,
    consensusRequired: verdict === 'promote',
    temporalValidation,
  }
}

export const buildBtcAutoOrderParameters = (input: {
  kind: 'open' | 'close'
  direction: 'long' | 'short'
  quantity: number
  clientOrderId: string
  hedgeMode: boolean
}) => {
  const side =
    input.kind === 'open'
      ? input.direction === 'long'
        ? 'BUY'
        : 'SELL'
      : input.direction === 'long'
        ? 'SELL'
        : 'BUY'
  return {
    symbol: 'BTCUSDT',
    side,
    type: 'MARKET',
    quantity: String(input.quantity),
    newClientOrderId: input.clientOrderId,
    newOrderRespType: 'RESULT',
    ...(input.hedgeMode
      ? { positionSide: input.direction === 'long' ? 'LONG' : 'SHORT' }
      : input.kind === 'close'
        ? { reduceOnly: 'true' }
        : {}),
  }
}

export const calculateBtcAutoDirectionalMove = (
  action: ContractTradeDecision['action'],
  entryPrice: number,
  outcomePrice: number,
) => {
  if (!directional(action) || entryPrice <= 0 || outcomePrice <= 0) return null
  const multiplier = action === 'long' ? 1 : -1
  return round(((outcomePrice - entryPrice) / entryPrice) * 100 * multiplier)
}

export interface BtcAutoShadowPathOutcome {
  grossMovePct: number
  exitPrice: number
  reason: 'stopLoss' | 'takeProfit' | 'timeStop'
}

export const calculateBtcAutoShadowPathOutcome = (input: {
  action: ContractTradeDecision['action']
  entryPrice: number
  stopDistancePct: number
  targetDistancePct: number
  observedAt: string
  targetAt: number
  minutePoints: readonly AssetPricePoint[]
  endpointPrice: number
}): BtcAutoShadowPathOutcome | null => {
  if (
    !directional(input.action) ||
    input.entryPrice <= 0 ||
    input.endpointPrice <= 0 ||
    input.stopDistancePct <= 0 ||
    input.targetDistancePct <= 0
  )
    return null
  const direction = input.action === 'long' ? 1 : -1
  const stopPrice = input.entryPrice * (1 - direction * (input.stopDistancePct / 100))
  const targetPrice = input.entryPrice * (1 + direction * (input.targetDistancePct / 100))
  const firstMinute = firstFullMinuteStart(input.observedAt)
  const eligiblePoints = input.minutePoints
    .filter((point) => {
      const openedAt = Date.parse(point.date)
      return openedAt >= firstMinute && openedAt < input.targetAt
    })
    .sort((left, right) => Date.parse(left.date) - Date.parse(right.date))
  for (const point of eligiblePoints) {
    const candleOpen = point.open ?? point.close
    const high = point.high ?? point.close
    const low = point.low ?? point.close
    const stopHit = input.action === 'long' ? low <= stopPrice : high >= stopPrice
    const targetHit = input.action === 'long' ? high >= targetPrice : low <= targetPrice
    // OHLC cannot reveal intraminute order. Stop-first prevents optimistic shadow results.
    if (stopHit) {
      const exitPrice =
        input.action === 'long' ? Math.min(stopPrice, candleOpen) : Math.max(stopPrice, candleOpen)
      return {
        grossMovePct: calculateBtcAutoDirectionalMove(input.action, input.entryPrice, exitPrice)!,
        exitPrice: round(exitPrice, 2),
        reason: 'stopLoss',
      }
    }
    if (targetHit) {
      return {
        grossMovePct: calculateBtcAutoDirectionalMove(input.action, input.entryPrice, targetPrice)!,
        exitPrice: round(targetPrice, 2),
        reason: 'takeProfit',
      }
    }
  }
  return {
    grossMovePct: calculateBtcAutoDirectionalMove(
      input.action,
      input.entryPrice,
      input.endpointPrice,
    )!,
    exitPrice: round(input.endpointPrice, 2),
    reason: 'timeStop',
  }
}

export const selectBtcAutoOutcomePoint = (
  market: ContractMarketSnapshot,
  targetAt: number,
  intervals: readonly ContractChartInterval[],
  now: number,
) => {
  for (const interval of intervals) {
    const intervalMs = intervalMilliseconds[interval]
    if (!intervalMs) continue
    const point = (market.timeframes.find((item) => item.interval === interval)?.points ?? [])
      .filter((item) => {
        const closeAt = Date.parse(item.date) + intervalMs
        return closeAt >= targetAt && closeAt <= now && closeAt - targetAt <= intervalMs * 2
      })
      .sort((left, right) => Date.parse(left.date) - Date.parse(right.date))[0]
    if (point) {
      return {
        price: point.close,
        observedAt: new Date(Date.parse(point.date) + intervalMs).toISOString(),
      }
    }
  }
  return null
}

const strategyAlgorithmRevision = 'btc-auto-v23'
const legacyStrategyAlgorithmRevision = 'btc-auto-v4'
export const btcAutoSignalModelVersion = 'btc-signal-model-v2'
export const btcAutoEvidencePolicyVersion = 'btc-evidence-v9-path-realized'
export const btcAutoPerformanceCohortVersion = 'btc-performance-v2-minute-strategy'

const fnv1a = (value: string) => {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export const btcAutoStrategyDefinition = (
  config: BtcAutoTradingConfig,
): BtcAutoStrategyDefinition => ({
  executionMode: config.executionMode,
  riskControlsEnabled: config.riskControlsEnabled,
  hedgeModeEnabled: config.hedgeModeEnabled,
  maxPositionsPerDirection: config.maxPositionsPerDirection,
  symbol: config.symbol,
  interval: config.interval,
  notionalUsdt: config.notionalUsdt,
  leverage: config.leverage,
  minimumConfidence: config.minimumConfidence,
  minimumDirectionalScore: config.minimumDirectionalScore,
  requiredConfirmations: config.requiredConfirmations,
  cooldownMinutes: config.cooldownMinutes,
  dailyLossLimitUsdt: config.dailyLossLimitUsdt,
  maxConsecutiveLosses: config.maxConsecutiveLosses,
  lossPauseMinutes: config.lossPauseMinutes,
  performanceWindowTrades: config.performanceWindowTrades,
  minimumRollingProfitFactor: config.minimumRollingProfitFactor,
  maximumRollingDrawdownUsdt: config.maximumRollingDrawdownUsdt,
  performancePauseMinutes: config.performancePauseMinutes,
  maximumHoldingMinutes: config.maximumHoldingMinutes,
  feeRatePct: config.feeRatePct,
})

const strategyDefinitionKeys: Array<keyof BtcAutoStrategyDefinition> = [
  'executionMode',
  'riskControlsEnabled',
  'hedgeModeEnabled',
  'maxPositionsPerDirection',
  'symbol',
  'interval',
  'notionalUsdt',
  'leverage',
  'minimumConfidence',
  'minimumDirectionalScore',
  'requiredConfirmations',
  'cooldownMinutes',
  'dailyLossLimitUsdt',
  'maxConsecutiveLosses',
  'lossPauseMinutes',
  'performanceWindowTrades',
  'minimumRollingProfitFactor',
  'maximumRollingDrawdownUsdt',
  'performancePauseMinutes',
  'maximumHoldingMinutes',
  'feeRatePct',
]

const legacyStrategyDefinitionKeys = strategyDefinitionKeys.filter(
  (key) => !['riskControlsEnabled', 'hedgeModeEnabled', 'maxPositionsPerDirection'].includes(key),
)

export const isBtcAutoStrategyDefinition = (value: unknown): value is BtcAutoStrategyDefinition => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  if (
    !['paper', 'testnet'].includes(String(record.executionMode)) ||
    record.symbol !== 'BTCUSDT' ||
    record.interval !== '5m'
  )
    return false
  if (
    typeof record.riskControlsEnabled !== 'boolean' ||
    typeof record.hedgeModeEnabled !== 'boolean'
  )
    return false
  const numberKeys = strategyDefinitionKeys.filter(
    (key) =>
      !['executionMode', 'symbol', 'interval', 'riskControlsEnabled', 'hedgeModeEnabled'].includes(
        key,
      ),
  )
  if (!numberKeys.every((key) => typeof record[key] === 'number' && Number.isFinite(record[key]))) {
    return false
  }
  return Object.keys(record).sort().join('|') === [...strategyDefinitionKeys].sort().join('|')
}

export const isBtcAutoLegacyStrategyDefinition = (
  value: unknown,
): value is BtcAutoLegacyStrategyDefinition => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  if (
    !['paper', 'testnet'].includes(String(record.executionMode)) ||
    record.symbol !== 'BTCUSDT' ||
    record.interval !== '5m'
  )
    return false
  const numberKeys = legacyStrategyDefinitionKeys.filter(
    (key) => !['executionMode', 'symbol', 'interval'].includes(key),
  )
  return (
    numberKeys.every((key) => typeof record[key] === 'number' && Number.isFinite(record[key])) &&
    Object.keys(record).sort().join('|') === [...legacyStrategyDefinitionKeys].sort().join('|')
  )
}

export const btcAutoStrategyVersionFromDefinition = (definition: BtcAutoStrategyDefinition) => {
  const behavior = [
    strategyAlgorithmRevision,
    definition.executionMode,
    definition.riskControlsEnabled,
    definition.hedgeModeEnabled,
    definition.maxPositionsPerDirection,
    definition.symbol,
    definition.interval,
    definition.notionalUsdt,
    definition.leverage,
    definition.minimumConfidence,
    definition.minimumDirectionalScore,
    definition.requiredConfirmations,
    definition.cooldownMinutes,
    definition.dailyLossLimitUsdt,
    definition.maxConsecutiveLosses,
    definition.lossPauseMinutes,
    definition.performanceWindowTrades,
    definition.minimumRollingProfitFactor,
    definition.maximumRollingDrawdownUsdt,
    definition.performancePauseMinutes,
    definition.maximumHoldingMinutes,
    definition.feeRatePct,
  ].join('|')
  return `${strategyAlgorithmRevision}-${fnv1a(behavior)}`
}

export const btcAutoLegacyStrategyVersionFromDefinition = (
  definition: BtcAutoLegacyStrategyDefinition,
) => {
  const behavior = [
    legacyStrategyAlgorithmRevision,
    definition.executionMode,
    definition.symbol,
    definition.interval,
    definition.notionalUsdt,
    definition.leverage,
    definition.minimumConfidence,
    definition.minimumDirectionalScore,
    definition.requiredConfirmations,
    definition.cooldownMinutes,
    definition.dailyLossLimitUsdt,
    definition.maxConsecutiveLosses,
    definition.lossPauseMinutes,
    definition.performanceWindowTrades,
    definition.minimumRollingProfitFactor,
    definition.maximumRollingDrawdownUsdt,
    definition.performancePauseMinutes,
    definition.maximumHoldingMinutes,
    definition.feeRatePct,
  ].join('|')
  return `${legacyStrategyAlgorithmRevision}-${fnv1a(behavior)}`
}

export const btcAutoStrategyVersion = (config: BtcAutoTradingConfig) =>
  btcAutoStrategyVersionFromDefinition(btcAutoStrategyDefinition(config))

export const countConsecutiveBtcAutoLosses = (trades: readonly BtcAutoTrade[]) => {
  const closed = trades
    .filter((trade) => trade.status === 'closed' && trade.closedAt && trade.netPnl !== null)
    .sort((left, right) => Date.parse(right.closedAt ?? '') - Date.parse(left.closedAt ?? ''))
  let losses = 0
  for (const trade of closed) {
    if ((trade.netPnl ?? 0) >= 0) break
    losses += 1
  }
  return { losses, lastClosedAt: closed[0]?.closedAt ?? null }
}

export const calculateBtcAutoRollingHealth = (
  config: BtcAutoTradingConfig,
  trades: readonly BtcAutoTrade[],
  now = new Date(),
  strategyVersion?: string,
  performanceCohortVersion?: string,
): BtcAutoRollingHealth => {
  const currentVersionTrades = performanceCohortVersion
    ? trades.filter((trade) => trade.performanceCohortVersion === performanceCohortVersion)
    : strategyVersion
      ? trades.filter((trade) => trade.strategyVersion === strategyVersion)
      : trades
  const closed = trades
    .filter((trade) => trade.status === 'closed' && trade.closedAt && trade.netPnl !== null)
    .sort((left, right) => Date.parse(right.closedAt ?? '') - Date.parse(left.closedAt ?? ''))
  const currentVersion = currentVersionTrades
    .filter((trade) => trade.status === 'closed' && trade.closedAt && trade.netPnl !== null)
    .sort((left, right) => Date.parse(right.closedAt ?? '') - Date.parse(left.closedAt ?? ''))
  const sampleScope: BtcAutoRollingHealth['sampleScope'] =
    performanceCohortVersion && currentVersion.length > 0
      ? 'performanceCohort'
      : strategyVersion && currentVersion.length > 0
        ? 'currentVersion'
        : 'allHistoryFallback'
  const sample = (sampleScope !== 'allHistoryFallback' ? currentVersion : closed).slice(
    0,
    config.performanceWindowTrades,
  )
  const grossProfit = sample.reduce((sum, trade) => sum + Math.max(0, trade.netPnl ?? 0), 0)
  const grossLoss = Math.abs(sample.reduce((sum, trade) => sum + Math.min(0, trade.netPnl ?? 0), 0))
  const profitFactor = grossLoss > 0 ? round(grossProfit / grossLoss, 2) : null
  let equity = 0
  let peak = 0
  let maxDrawdownUsdt = 0
  sample
    .slice()
    .sort((left, right) => Date.parse(left.closedAt ?? '') - Date.parse(right.closedAt ?? ''))
    .forEach((trade) => {
      equity += trade.netPnl ?? 0
      peak = Math.max(peak, equity)
      maxDrawdownUsdt = Math.max(maxDrawdownUsdt, peak - equity)
    })
  const reasons: BtcAutoRollingHealth['reasons'] = []
  if (
    sample.length >= config.performanceWindowTrades &&
    profitFactor !== null &&
    profitFactor < config.minimumRollingProfitFactor
  )
    reasons.push('lowProfitFactor')
  if (
    sample.length >= config.performanceWindowTrades &&
    maxDrawdownUsdt >= config.maximumRollingDrawdownUsdt
  )
    reasons.push('excessiveDrawdown')
  const lastClosedAt = sample[0]?.closedAt ?? null
  const resumeAt =
    reasons.length && lastClosedAt
      ? new Date(Date.parse(lastClosedAt) + config.performancePauseMinutes * 60_000).toISOString()
      : null
  const status: BtcAutoRollingHealth['status'] =
    strategyVersion && currentVersionTrades.length === 0
      ? 'newVersionProbeEligible'
      : sample.length < config.performanceWindowTrades
        ? 'insufficientSample'
        : !reasons.length
          ? 'healthy'
          : resumeAt && Date.parse(resumeAt) > now.getTime()
            ? 'paused'
            : 'probeEligible'
  return {
    sampleSize: sample.length,
    currentVersionSampleSize: currentVersion.length,
    requiredSampleSize: config.performanceWindowTrades,
    sampleScope,
    profitFactor,
    minimumProfitFactor: config.minimumRollingProfitFactor,
    maxDrawdownUsdt: round(maxDrawdownUsdt),
    maximumDrawdownUsdt: config.maximumRollingDrawdownUsdt,
    status,
    reasons,
    resumeAt,
  }
}

export const evaluateBtcAutoEntryGate = (input: {
  config: BtcAutoTradingConfig
  signal: BtcAutoSignalSnapshot | null
  trades: readonly BtcAutoTrade[]
  hasActivePosition: boolean
  activePositionsInDirection?: number
  cooldownUntil: string | null
  dailyNetPnl: number
  now?: Date
  strategyVersion?: string
  performanceCohortVersion?: string
  consensusEligible?: boolean
}): BtcAutoEntryGate => {
  const now = input.now ?? new Date()
  const streak = countConsecutiveBtcAutoLosses(input.trades)
  const rollingHealth = calculateBtcAutoRollingHealth(
    input.config,
    input.trades,
    now,
    input.strategyVersion,
    input.performanceCohortVersion,
  )
  const lossResumeAt = streak.lastClosedAt
    ? new Date(
        Date.parse(streak.lastClosedAt) + input.config.lossPauseMinutes * 60_000,
      ).toISOString()
    : null
  const lossPauseActive =
    streak.losses >= input.config.maxConsecutiveLosses &&
    lossResumeAt !== null &&
    Date.parse(lossResumeAt) > now.getTime()
  const cooldownActive =
    input.cooldownUntil !== null && Date.parse(input.cooldownUntil) > now.getTime()
  const result = (reason: BtcAutoEntryGate['reason'], resumeAt: string | null = null) => ({
    reason,
    eligible: reason === 'ready',
    consecutiveLosses: streak.losses,
    resumeAt,
  })
  if (!input.config.enabled) return result('disabled')
  const directionalSignal = input.signal && directional(input.signal.action)
  if (
    directionalSignal &&
    (input.activePositionsInDirection ?? (input.hasActivePosition ? 1 : 0)) >=
      input.config.maxPositionsPerDirection
  )
    return result(input.config.maxPositionsPerDirection === 1 ? 'positionOpen' : 'positionLimit')
  if (!input.config.riskControlsEnabled) {
    return directionalSignal ? result('ready') : result('waitingDirection')
  }
  if (input.dailyNetPnl <= -input.config.dailyLossLimitUsdt) return result('dailyLossLimit')
  if (lossPauseActive) return result('consecutiveLossPause', lossResumeAt)
  if (rollingHealth.status === 'paused')
    return result('rollingPerformancePause', rollingHealth.resumeAt)
  if (cooldownActive) return result('cooldown', input.cooldownUntil)
  if (!input.signal || !directional(input.signal.action)) return result('waitingDirection')
  if (Math.abs(input.signal.score) < input.config.minimumDirectionalScore)
    return result('weakScore')
  if (input.signal.confidence < input.config.minimumConfidence) return result('lowConfidence')
  if (input.signal.confirmations < input.config.requiredConfirmations) return result('confirming')
  if (input.consensusEligible === false) return result('strategyConsensusConflict')
  return result('ready')
}

export const evolveBtcAutoSignal = (
  previous: BtcAutoSignalSnapshot | null,
  decision: ContractTradeDecision,
  observedAt: string,
  marketSource: BtcAutoSignalSnapshot['marketSource'],
  strategyVersion: string,
): BtcAutoSignalSnapshot => {
  const sameVersion = previous?.strategyVersion === strategyVersion
  const sameDirection =
    sameVersion && previous?.action === decision.action && directional(decision.action)
  const oppositeDirection =
    sameVersion &&
    previous &&
    directional(previous.action) &&
    directional(decision.action) &&
    previous.action !== decision.action
  const confirmations = sameDirection
    ? previous.confirmations + 1
    : directional(decision.action)
      ? 1
      : 0
  let evolution: BtcAutoSignalSnapshot['evolution'] = sameVersion ? 'unchanged' : 'new'
  if (oppositeDirection) evolution = 'falsified'
  else if (previous && sameDirection) {
    if (
      decision.confidence >= previous.confidence + 3 ||
      Math.abs(decision.score) >= Math.abs(previous.score) + 5
    )
      evolution = 'strengthened'
    else if (
      decision.confidence <= previous.confidence - 3 ||
      Math.abs(decision.score) <= Math.abs(previous.score) - 5
    )
      evolution = 'weakened'
  } else if (
    sameVersion &&
    previous &&
    directional(previous.action) &&
    !directional(decision.action)
  ) {
    evolution = 'weakened'
  }
  return {
    strategyVersion,
    action: decision.action,
    score: decision.score,
    confidence: decision.confidence,
    price: decision.latestPrice,
    evolution,
    confirmations,
    reasons: decision.reasons,
    risks: decision.risks,
    observedAt,
    marketSource,
  }
}

export const decideBtcAutoClose = (
  trade: BtcAutoTrade,
  signal: BtcAutoSignalSnapshot,
  minimumConfidence: number,
): BtcAutoCloseReason | null => {
  if (signal.price === null || trade.status !== 'open') return null
  if (
    (trade.direction === 'long' && signal.price <= trade.stopLoss) ||
    (trade.direction === 'short' && signal.price >= trade.stopLoss)
  )
    return 'stopLoss'
  if (
    (trade.direction === 'long' && signal.price >= trade.takeProfit) ||
    (trade.direction === 'short' && signal.price <= trade.takeProfit)
  )
    return 'takeProfit'
  if (
    signal.confidence >= minimumConfidence &&
    ((trade.direction === 'long' && signal.action === 'short') ||
      (trade.direction === 'short' && signal.action === 'long'))
  )
    return 'signalFalsified'
  return null
}

export interface BtcAutoCloseTrigger {
  reason: BtcAutoCloseReason
  referencePrice: number
  source: 'minuteCandle' | 'markPrice' | 'signal' | 'time'
}

const firstFullMinuteStart = (openedAt: string) => Math.ceil(Date.parse(openedAt) / 60_000) * 60_000

export const resolveBtcAutoCloseTrigger = (
  trade: BtcAutoTrade,
  signal: BtcAutoSignalSnapshot,
  minutePoints: readonly AssetPricePoint[],
  minimumConfidence: number,
  maximumHoldingMinutes = 0,
): BtcAutoCloseTrigger | null => {
  if (trade.status !== 'open') return null
  const eligiblePoints = minutePoints
    .filter((point) => Date.parse(point.date) >= firstFullMinuteStart(trade.openedAt))
    .sort((left, right) => Date.parse(left.date) - Date.parse(right.date))
  for (const point of eligiblePoints) {
    const high = point.high ?? point.close
    const low = point.low ?? point.close
    const stopHit = trade.direction === 'long' ? low <= trade.stopLoss : high >= trade.stopLoss
    const targetHit =
      trade.direction === 'long' ? high >= trade.takeProfit : low <= trade.takeProfit
    // OHLC cannot reveal the intraminute path. Stop-first avoids optimistic backfill.
    if (stopHit) {
      const candleOpen = point.open ?? trade.stopLoss
      const referencePrice =
        trade.direction === 'long'
          ? Math.min(trade.stopLoss, candleOpen)
          : Math.max(trade.stopLoss, candleOpen)
      return { reason: 'stopLoss', referencePrice, source: 'minuteCandle' }
    }
    if (targetHit)
      return { reason: 'takeProfit', referencePrice: trade.takeProfit, source: 'minuteCandle' }
  }
  const markReason = decideBtcAutoClose(trade, signal, Number.POSITIVE_INFINITY)
  if (markReason === 'stopLoss' || markReason === 'takeProfit') {
    const result: BtcAutoCloseTrigger = {
      reason: markReason,
      referencePrice: markReason === 'stopLoss' ? trade.stopLoss : trade.takeProfit,
      source: 'markPrice',
    }
    if (markReason === 'stopLoss' && signal.price !== null) {
      result.referencePrice =
        trade.direction === 'long'
          ? Math.min(result.referencePrice, signal.price)
          : Math.max(result.referencePrice, signal.price)
    }
    return result
  }
  const signalReason = decideBtcAutoClose(trade, signal, minimumConfidence)
  if (signalReason === 'signalFalsified' && signal.price !== null) {
    return { reason: signalReason, referencePrice: signal.price, source: 'signal' }
  }
  if (
    maximumHoldingMinutes > 0 &&
    signal.price !== null &&
    Date.parse(signal.observedAt) - Date.parse(trade.openedAt) >= maximumHoldingMinutes * 60_000
  ) {
    return { reason: 'timeStop', referencePrice: signal.price, source: 'time' }
  }
  return null
}

export const calculateBtcAutoTradeResult = (
  trade: BtcAutoTrade,
  exitPrice: number,
  feeRatePct: number,
) => {
  if (trade.entryPrice === null || exitPrice <= 0) return null
  const multiplier = trade.direction === 'long' ? 1 : -1
  const grossPnl = (exitPrice - trade.entryPrice) * trade.quantity * multiplier
  const fees = (trade.entryPrice + exitPrice) * trade.quantity * (feeRatePct / 100)
  const netPnl = grossPnl - fees
  return {
    grossPnl: round(grossPnl),
    fees: round(fees),
    netPnl: round(netPnl),
    returnPct: round((netPnl / trade.notionalUsdt) * 100),
  }
}

export const calculateBtcAutoReconciledResult = (
  trade: BtcAutoTrade,
  grossPnl: number,
  fees: number,
  fundingFee: number,
) => {
  if (![grossPnl, fees, fundingFee].every(Number.isFinite) || fees < 0) return null
  const netPnl = grossPnl - fees + fundingFee
  return {
    grossPnl: round(grossPnl),
    fees: round(fees),
    fundingFee: round(fundingFee),
    netPnl: round(netPnl),
    returnPct: round((netPnl / trade.notionalUsdt) * 100),
  }
}

export const buildBtcAutoTestnetCommissionUpdates = (
  orders: Array<{
    clientOrderId: string
    fills: Array<{
      id?: number
      commission?: string
      commissionAsset?: string
    }>
  }>,
) => {
  const seenFillIds = new Set<string>()
  const observations = orders.map((order) => {
    if (!order.clientOrderId.trim()) throw new Error('Testnet佣金缺少客户端订单ID')
    let commission = 0
    order.fills.forEach((fill, index) => {
      const fillId = fill.id === undefined ? `${order.clientOrderId}-${index}` : String(fill.id)
      if (seenFillIds.has(fillId)) return
      seenFillIds.add(fillId)
      const value = Number(fill.commission ?? 0)
      if (!Number.isFinite(value)) throw new Error('Testnet佣金包含无效数值')
      if (fill.commissionAsset !== 'USDT' && value !== 0) {
        throw new Error('Testnet成交佣金不是USDT，暂不自动换算')
      }
      commission += Math.abs(value)
    })
    return { clientOrderId: order.clientOrderId, commission: round(commission) }
  })
  return {
    totalCommission: round(observations.reduce((sum, item) => sum + item.commission, 0)),
    observations,
  }
}

const shanghaiDateParts = (value: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((item) => item.type === type)?.value ?? 0)
  return { year: part('year'), month: part('month'), day: part('day') }
}

const shanghaiMidnightUtc = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month - 1, day, -8))

const periodStarts = (now: Date) => {
  const { year, month, day } = shanghaiDateParts(now)
  const dayStart = shanghaiMidnightUtc(year, month, day)
  const localCalendarDay = new Date(Date.UTC(year, month - 1, day))
  const mondayOffset = (localCalendarDay.getUTCDay() + 6) % 7
  const weekStart = new Date(dayStart.getTime() - mondayOffset * 86_400_000)
  const monthStart = shanghaiMidnightUtc(year, month, 1)
  return { day: dayStart, week: weekStart, month: monthStart }
}

export const btcAutoMonthStartAt = (now = new Date()) => periodStarts(now).month.toISOString()

export const btcAutoPerformanceQueryStartAt = (now = new Date()) => {
  const starts = periodStarts(now)
  return new Date(Math.min(starts.week.getTime(), starts.month.getTime())).toISOString()
}

export const summarizeBtcAutoPerformance = (
  trades: readonly BtcAutoTrade[],
  now = new Date(),
): BtcAutoPerformanceSummary[] => {
  const starts = periodStarts(now)
  return (['day', 'week', 'month'] as const).map((period) => {
    const selected = trades.filter(
      (trade) =>
        trade.status === 'closed' &&
        trade.closedAt !== null &&
        trade.netPnl !== null &&
        Date.parse(trade.closedAt) >= starts[period].getTime(),
    )
    const wins = selected.filter((trade) => (trade.netPnl ?? 0) > 0)
    const losses = selected.filter((trade) => (trade.netPnl ?? 0) < 0)
    const grossProfit = wins.reduce((sum, trade) => sum + (trade.netPnl ?? 0), 0)
    const grossLoss = Math.abs(losses.reduce((sum, trade) => sum + (trade.netPnl ?? 0), 0))
    const averageWin = wins.length ? grossProfit / wins.length : null
    const averageLoss = losses.length ? grossLoss / losses.length : null
    const ordered = [...selected].sort(
      (left, right) => Date.parse(left.closedAt ?? '') - Date.parse(right.closedAt ?? ''),
    )
    let equity = 0
    let peak = 0
    let maxDrawdown = 0
    ordered.forEach((trade) => {
      equity += trade.netPnl ?? 0
      peak = Math.max(peak, equity)
      maxDrawdown = Math.max(maxDrawdown, peak - equity)
    })
    return {
      period,
      startAt: starts[period].toISOString(),
      endAt: now.toISOString(),
      trades: selected.length,
      reconciledTrades: selected.filter((trade) => trade.pnlSource === 'reconciled').length,
      estimatedTrades: selected.filter((trade) => trade.pnlSource !== 'reconciled').length,
      wins: wins.length,
      losses: losses.length,
      winRatePct: selected.length ? round((wins.length / selected.length) * 100, 2) : null,
      grossProfit: round(grossProfit),
      grossLoss: round(grossLoss),
      netPnl: round(grossProfit - grossLoss),
      averageWinLossRatio:
        averageWin !== null && averageLoss !== null && averageLoss > 0
          ? round(averageWin / averageLoss, 2)
          : null,
      profitFactor: grossLoss > 0 ? round(grossProfit / grossLoss, 2) : null,
      expectancyUsdt: selected.length ? round((grossProfit - grossLoss) / selected.length) : null,
      maxDrawdownUsdt: round(maxDrawdown),
    }
  })
}

export const buildBtcAutoEquityCurve = (trades: readonly BtcAutoTrade[]): BtcAutoEquityPoint[] => {
  const closed = trades
    .filter((trade) => trade.status === 'closed' && trade.closedAt && trade.netPnl !== null)
    .sort((left, right) => Date.parse(left.closedAt ?? '') - Date.parse(right.closedAt ?? ''))
  const points = new Map<string, BtcAutoEquityPoint>()
  let equity = 0
  let peak = 0
  for (const trade of closed) {
    const closedAt = new Date(trade.closedAt!)
    const { year, month, day } = shanghaiDateParts(closedAt)
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const netPnl = trade.netPnl ?? 0
    equity += netPnl
    peak = Math.max(peak, equity)
    const drawdown = peak - equity
    const current = points.get(date)
    points.set(date, {
      date,
      trades: (current?.trades ?? 0) + 1,
      netPnl: round((current?.netPnl ?? 0) + netPnl),
      cumulativeNetPnl: round(equity),
      drawdownUsdt: round(Math.max(current?.drawdownUsdt ?? 0, drawdown)),
    })
  }
  return [...points.values()]
}
