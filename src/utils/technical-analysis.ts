import type {
  AssetPricePoint,
  TechnicalAnalysisResult,
  TechnicalHorizonReading,
  TechnicalIndicatorReading,
  TechnicalIndicatorConfig,
  TechnicalSignalStatus,
} from '@/types'
import { defaultTechnicalIndicatorConfig } from './technical-config-default'

const round = (value: number, digits = 2) => Number(value.toFixed(digits))
const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value))
const last = <T>(values: T[], offset = 1) => values[values.length - offset]

const statusFromScore = (score: number, conflicting = false): TechnicalSignalStatus => {
  if (conflicting) return 'conflicting'
  if (score >= 65) return 'strongBullish'
  if (score >= 30) return 'weakBullish'
  if (score >= 10) return 'rangeBullish'
  if (score <= -65) return 'strongBearish'
  if (score <= -30) return 'weakBearish'
  if (score <= -10) return 'rangeBearish'
  return 'neutral'
}

const changeDirection = (values: Array<number | null>) => {
  const recent = values.filter((value): value is number => value !== null).slice(-3)
  if (recent.length < 2) return 'unavailable' as const
  const delta = last(recent)! - recent[0]!
  if (Math.abs(delta) < Math.max(Math.abs(recent[0]!) * 0.0005, 0.0001)) return 'flat' as const
  return delta > 0 ? ('rising' as const) : ('falling' as const)
}

export const simpleMovingAverage = (values: number[], period: number) =>
  values.map((_, index) => {
    if (index + 1 < period) return null
    const window = values.slice(index + 1 - period, index + 1)
    return round(window.reduce((sum, value) => sum + value, 0) / period, 6)
  })

export const exponentialMovingAverage = (values: number[], period: number) => {
  const multiplier = 2 / (period + 1)
  let previous: number | null = null
  return values.map((value, index) => {
    if (previous === null) {
      if (index + 1 < period) return null
      previous = values.slice(0, period).reduce((sum, item) => sum + item, 0) / period
      return round(previous, 6)
    }
    previous = (value - previous) * multiplier + previous
    return round(previous, 6)
  })
}

export const relativeStrengthIndex = (values: number[], period = 14) => {
  let averageGain = 0
  let averageLoss = 0
  return values.map((value, index) => {
    if (index === 0) return null
    const change = value - values[index - 1]!
    if (index <= period) {
      averageGain += Math.max(change, 0)
      averageLoss += Math.max(-change, 0)
      if (index < period) return null
      averageGain /= period
      averageLoss /= period
    } else {
      averageGain = (averageGain * (period - 1) + Math.max(change, 0)) / period
      averageLoss = (averageLoss * (period - 1) + Math.max(-change, 0)) / period
    }
    if (averageLoss === 0) return 100
    return round(100 - 100 / (1 + averageGain / averageLoss), 4)
  })
}

const standardDeviation = (values: number[]) => {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  return Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length)
}

const bollingerBands = (values: number[], period = 20, multiplier = 2) => {
  const middle = simpleMovingAverage(values, period)
  const upper = values.map((_, index) => {
    if (index + 1 < period || middle[index] === null) return null
    return round(
      middle[index]! + standardDeviation(values.slice(index + 1 - period, index + 1)) * multiplier,
      6,
    )
  })
  const lower = values.map((_, index) => {
    if (index + 1 < period || middle[index] === null) return null
    return round(
      middle[index]! - standardDeviation(values.slice(index + 1 - period, index + 1)) * multiplier,
      6,
    )
  })
  return { upper, lower }
}

const averageTrueRange = (points: AssetPricePoint[], period = 14) => {
  const trueRanges = points.map((point, index) => {
    if (index === 0) return 0
    const previousClose = points[index - 1]!.close
    if (point.high !== undefined && point.low !== undefined) {
      return Math.max(
        point.high - point.low,
        Math.abs(point.high - previousClose),
        Math.abs(point.low - previousClose),
      )
    }
    return Math.abs(point.close - previousClose)
  })
  return simpleMovingAverage(trueRanges, period)
}

const horizonDefinitions: Array<{
  id: TechnicalHorizonReading['id']
  observations: number
}> = [
  { id: 'day', observations: 1 },
  { id: 'week', observations: 5 },
  { id: 'month', observations: 21 },
  { id: 'quarter', observations: 63 },
  { id: 'halfYear', observations: 126 },
  { id: 'year', observations: 252 },
]

const horizonReadings = (values: number[]): TechnicalHorizonReading[] =>
  horizonDefinitions.map(({ id, observations }) => {
    if (values.length <= observations) {
      return { id, observations, returnPct: null, score: 0, status: 'insufficient' }
    }
    const returnPct = (last(values)! / last(values, observations + 1)! - 1) * 100
    const scaledScore = clamp(
      returnPct * (observations <= 5 ? 12 : observations <= 21 ? 6 : 2.5),
      -100,
      100,
    )
    return {
      id,
      observations,
      returnPct: round(returnPct),
      score: round(scaledScore),
      status: statusFromScore(scaledScore),
    }
  })

export const analyzeTechnicalSignals = (
  points: AssetPricePoint[],
  crossAssetScore = 0,
  stale = false,
  config: TechnicalIndicatorConfig = defaultTechnicalIndicatorConfig,
): TechnicalAnalysisResult => {
  const values = points.map((point) => point.close).filter(Number.isFinite)
  const { parameters, enabled, weights } = config
  const minimumObservations = Math.max(
    parameters.maShortPeriod,
    parameters.rsiPeriod,
    parameters.bollingerPeriod,
    parameters.atrPeriod,
    parameters.macdSlowPeriod + parameters.macdSignalPeriod,
  )
  if (values.length < minimumObservations) {
    const empty = Array.from({ length: values.length }, () => null)
    return {
      status: 'insufficient',
      score: 0,
      confidence: 0,
      latest: last(values) ?? null,
      ma20: empty,
      ma60: empty,
      macd: empty,
      macdSignal: empty,
      rsi14: empty,
      bollingerUpper: empty,
      bollingerLower: empty,
      atr14: empty,
      support: null,
      resistance: null,
      indicators: [],
      horizons: horizonReadings(values),
    }
  }

  const ma20 = simpleMovingAverage(values, parameters.maShortPeriod)
  const ma60 = simpleMovingAverage(values, parameters.maLongPeriod)
  const ema12 = exponentialMovingAverage(values, parameters.macdFastPeriod)
  const ema26 = exponentialMovingAverage(values, parameters.macdSlowPeriod)
  const macd = values.map((_, index) =>
    ema12[index] === null || ema26[index] === null ? null : round(ema12[index]! - ema26[index]!, 6),
  )
  const macdValues = macd.map((value) => value ?? 0)
  const rawMacdSignal = exponentialMovingAverage(macdValues, parameters.macdSignalPeriod)
  const macdSignal = rawMacdSignal.map((value, index) => (macd[index] === null ? null : value))
  const rsi14 = relativeStrengthIndex(values, parameters.rsiPeriod)
  const { upper: bollingerUpper, lower: bollingerLower } = bollingerBands(
    values,
    parameters.bollingerPeriod,
    parameters.bollingerMultiplier,
  )
  const atr14 = averageTrueRange(points, parameters.atrPeriod)

  const latest = last(values)!
  const latestMa20 = last(ma20) ?? null
  const latestMa60 = last(ma60) ?? null
  const latestMacd = last(macd) ?? null
  const latestMacdSignal = last(macdSignal) ?? null
  const latestRsi = last(rsi14) ?? null
  const latestAtr = last(atr14) ?? null
  const previousMa20 = last(ma20, 6) ?? null
  const ma20Slope = latestMa20 && previousMa20 ? (latestMa20 / previousMa20 - 1) * 100 : 0

  let trendScore = 0
  if (enabled.maShort && latestMa20 !== null) trendScore += latest >= latestMa20 ? 30 : -30
  if (enabled.maLong && latestMa60 !== null) trendScore += latest >= latestMa60 ? 25 : -25
  if (enabled.maShort) trendScore += clamp(ma20Slope * 12, -25, 25)
  if (enabled.macd && latestMacd !== null && latestMacdSignal !== null)
    trendScore += latestMacd >= latestMacdSignal ? 20 : -20
  trendScore = clamp(trendScore, -100, 100)

  const momentumScore =
    latestRsi === null
      ? 0
      : latestRsi >= parameters.rsiOverbought
        ? 45
        : latestRsi >= 55
          ? clamp((latestRsi - 50) * 4, 0, 70)
          : latestRsi <= parameters.rsiOversold
            ? -45
            : latestRsi <= 45
              ? clamp((latestRsi - 50) * 4, -70, 0)
              : 0

  const atrPct = latestAtr === null ? null : (latestAtr / Math.abs(latest)) * 100
  const recentAtrPct = atr14
    .slice(-60)
    .filter((value): value is number => value !== null)
    .map((value) => (value / Math.abs(latest)) * 100)
  const medianAtrPct = recentAtrPct.sort((left, right) => left - right)[
    Math.floor(recentAtrPct.length / 2)
  ]
  const volatilityScore =
    atrPct === null || !medianAtrPct ? 0 : clamp((medianAtrPct / atrPct - 1) * 50, -80, 40)

  const volumes = points
    .map((point) => point.volume)
    .filter((value): value is number => value !== undefined)
  const volumeScore =
    volumes.length >= 20
      ? clamp(
          (last(volumes)! / (last(simpleMovingAverage(volumes, 20)) ?? last(volumes)!) - 1) * 35,
          -35,
          35,
        )
      : 0
  const boundedCrossAssetScore = clamp(crossAssetScore, -100, 100)
  const weightedScores = [
    {
      enabled: enabled.maShort || enabled.maLong || enabled.macd,
      weight: weights.trend,
      score: trendScore,
    },
    { enabled: enabled.rsi, weight: weights.momentum, score: momentumScore },
    {
      enabled: enabled.atr || enabled.bollinger,
      weight: weights.volatility,
      score: volatilityScore,
    },
    { enabled: enabled.volume, weight: weights.volume, score: volumeScore },
    { enabled: enabled.crossAsset, weight: weights.crossAsset, score: boundedCrossAssetScore },
  ]
  const activeWeight = weightedScores.reduce(
    (sum, item) => sum + (item.enabled ? item.weight : 0),
    0,
  )
  const score = round(
    activeWeight
      ? weightedScores.reduce(
          (sum, item) => sum + (item.enabled ? item.score * item.weight : 0),
          0,
        ) / activeWeight
      : 0,
  )
  const conflicting =
    Math.sign(trendScore) !== Math.sign(momentumScore) &&
    Math.abs(trendScore) >= 45 &&
    Math.abs(momentumScore) >= 35
  const status = statusFromScore(score, conflicting)
  const window = values.slice(-parameters.supportResistanceWindow)
  const support = Math.min(...window)
  const resistance = Math.max(...window)

  const allIndicators: TechnicalIndicatorReading[] = [
    {
      id: 'trend',
      value: latestMa20,
      score: round(trendScore),
      status: statusFromScore(trendScore),
      change: changeDirection(ma20),
      evidence: ['priceVsMa20', 'priceVsMa60', 'macd'],
    },
    {
      id: 'momentum',
      value: latestRsi,
      score: round(momentumScore),
      status: statusFromScore(momentumScore),
      change: changeDirection(rsi14),
      evidence: ['rsi14'],
    },
    {
      id: 'volatility',
      value: atrPct === null ? null : round(atrPct),
      score: round(volatilityScore),
      status: statusFromScore(volatilityScore),
      change: changeDirection(atr14),
      evidence: ['atr14', 'bollinger'],
    },
    {
      id: 'volume',
      value: last(volumes) ?? null,
      score: round(volumeScore),
      status: volumes.length >= 20 ? statusFromScore(volumeScore) : 'insufficient',
      change: volumes.length >= 3 ? changeDirection(volumes) : 'unavailable',
      evidence: ['volumeVs20'],
    },
    {
      id: 'crossAsset',
      value: boundedCrossAssetScore,
      score: boundedCrossAssetScore,
      status: statusFromScore(boundedCrossAssetScore),
      change: 'unavailable',
      evidence: ['transmissionChains'],
    },
  ]
  const indicators = allIndicators.filter((indicator) => {
    if (indicator.id === 'trend') return enabled.maShort || enabled.maLong || enabled.macd
    if (indicator.id === 'momentum') return enabled.rsi
    if (indicator.id === 'volatility') return enabled.atr || enabled.bollinger
    if (indicator.id === 'volume') return enabled.volume
    return enabled.crossAsset
  })

  const availableIndicators = indicators.filter(
    (indicator) => indicator.status !== 'insufficient',
  ).length
  const confidence = clamp(
    Math.round(
      Math.min(values.length / 252, 1) * 55 +
        (availableIndicators / Math.max(indicators.length, 1)) * 35 +
        (stale ? 0 : 10),
    ),
    0,
    100,
  )

  return {
    status,
    score,
    confidence,
    latest,
    ma20,
    ma60,
    macd,
    macdSignal,
    rsi14,
    bollingerUpper,
    bollingerLower,
    atr14,
    support: round(support, 6),
    resistance: round(resistance, 6),
    indicators,
    horizons: horizonReadings(values),
  }
}

export const rollingCorrelation = (left: number[], right: number[], window = 60) => {
  const size = Math.min(left.length, right.length)
  const offsetLeft = left.length - size
  const offsetRight = right.length - size
  return Array.from({ length: size }, (_, index) => {
    if (index + 1 < window) return null
    const leftWindow = left.slice(offsetLeft + index + 1 - window, offsetLeft + index + 1)
    const rightWindow = right.slice(offsetRight + index + 1 - window, offsetRight + index + 1)
    const leftMean = leftWindow.reduce((sum, value) => sum + value, 0) / window
    const rightMean = rightWindow.reduce((sum, value) => sum + value, 0) / window
    let covariance = 0
    let leftVariance = 0
    let rightVariance = 0
    for (let cursor = 0; cursor < window; cursor += 1) {
      const leftDelta = leftWindow[cursor]! - leftMean
      const rightDelta = rightWindow[cursor]! - rightMean
      covariance += leftDelta * rightDelta
      leftVariance += leftDelta ** 2
      rightVariance += rightDelta ** 2
    }
    const denominator = Math.sqrt(leftVariance * rightVariance)
    return denominator ? round(covariance / denominator, 4) : null
  })
}
