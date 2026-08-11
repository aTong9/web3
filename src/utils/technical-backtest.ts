import type {
  AssetPricePoint,
  TechnicalBacktestHorizon,
  TechnicalBacktestResult,
  TechnicalIndicatorConfig,
} from '@/types'
import { analyzeTechnicalSignals } from '@/utils/technical-analysis'

const round = (value: number, digits = 2) => Number(value.toFixed(digits))
const median = (values: number[]) => {
  if (!values.length) return null
  const sorted = [...values].sort((left, right) => left - right)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2
    ? sorted[middle]!
    : (sorted[middle - 1]! + sorted[middle]!) / 2
}
const wilsonInterval = (wins: number, samples: number, z = 1.96) => {
  if (!samples) return null
  const rate = wins / samples
  const denominator = 1 + z ** 2 / samples
  const center = (rate + z ** 2 / (2 * samples)) / denominator
  const margin =
    (z * Math.sqrt((rate * (1 - rate) + z ** 2 / (4 * samples)) / samples)) /
    denominator
  return {
    low: round(Math.max(0, center - margin) * 100, 1),
    high: round(Math.min(1, center + margin) * 100, 1),
  }
}

interface BacktestSignal {
  index: number
  direction: 1 | -1
}

interface HistoricalReading {
  score: number
  conflicting: boolean
  components: Partial<Record<'trend' | 'momentum' | 'volatility' | 'volume', number>>
}

interface WeightTemplate {
  id: string
  name: string
  weights: TechnicalIndicatorConfig['weights']
}

const normalizedPriceWeights = (weights: TechnicalIndicatorConfig['weights']) => {
  const total = weights.trend + weights.momentum + weights.volatility + weights.volume
  return {
    trend: total ? weights.trend / total : 0.4,
    momentum: total ? weights.momentum / total : 0.3,
    volatility: total ? weights.volatility / total : 0.2,
    volume: total ? weights.volume / total : 0.1,
    crossAsset: 0,
  }
}

const weightTemplates = (configured: TechnicalIndicatorConfig['weights']): WeightTemplate[] => [
  {
    id: 'configured',
    name: '当前配置',
    weights: normalizedPriceWeights(configured),
  },
  {
    id: 'balanced',
    name: '均衡技术',
    weights: { trend: 0.4, momentum: 0.3, volatility: 0.2, volume: 0.1, crossAsset: 0 },
  },
  {
    id: 'trend',
    name: '趋势优先',
    weights: { trend: 0.55, momentum: 0.2, volatility: 0.15, volume: 0.1, crossAsset: 0 },
  },
  {
    id: 'momentum',
    name: '动量优先',
    weights: { trend: 0.3, momentum: 0.45, volatility: 0.15, volume: 0.1, crossAsset: 0 },
  },
  {
    id: 'defensive',
    name: '波动防守',
    weights: { trend: 0.35, momentum: 0.2, volatility: 0.35, volume: 0.1, crossAsset: 0 },
  },
  {
    id: 'volume',
    name: '成交确认',
    weights: { trend: 0.35, momentum: 0.25, volatility: 0.15, volume: 0.25, crossAsset: 0 },
  },
]

const buildReadings = (
  points: AssetPricePoint[],
  config: TechnicalIndicatorConfig,
  startIndex: number,
  endIndex = points.length,
) => {
  const readings = new Map<number, HistoricalReading>()
  for (let index = startIndex; index < endIndex; index += 1) {
    const reading = analyzeTechnicalSignals(points.slice(0, index + 1), 0, false, config)
    readings.set(index, {
      score: reading.score,
      conflicting: reading.status === 'conflicting',
      components: Object.fromEntries(
        reading.indicators
          .filter((indicator) => indicator.id !== 'crossAsset')
          .map((indicator) => [indicator.id, indicator.score]),
      ),
    })
  }
  return readings
}

const reweightReadings = (
  readings: Map<number, HistoricalReading>,
  weights: TechnicalIndicatorConfig['weights'],
  enabled: TechnicalIndicatorConfig['enabled'],
) => {
  const active = {
    trend: enabled.maShort || enabled.maLong || enabled.macd,
    momentum: enabled.rsi,
    volatility: enabled.atr || enabled.bollinger,
    volume: enabled.volume,
  }
  const activeWeight = Object.entries(active).reduce(
    (sum, [id, isEnabled]) =>
      sum + (isEnabled ? weights[id as keyof typeof active] : 0),
    0,
  )
  return new Map(
    [...readings].map(([index, reading]) => {
      const weightedScore = Object.entries(active).reduce(
        (sum, [id, isEnabled]) =>
          sum +
          (isEnabled
            ? (reading.components[id as keyof typeof active] ?? 0) *
              weights[id as keyof typeof active]
            : 0),
        0,
      )
      return [
        index,
        {
          ...reading,
          score: activeWeight ? round(weightedScore / activeWeight) : 0,
        },
      ]
    }),
  )
}

const collectSignals = (
  readings: Map<number, HistoricalReading>,
  startIndex: number,
  lastEligibleIndex: number,
  signalThreshold: number,
  samplingInterval: number,
) => {
  const signals: BacktestSignal[] = []
  let previousSignalIndex = startIndex - samplingInterval
  for (let index = startIndex; index <= lastEligibleIndex; index += 1) {
    if (index - previousSignalIndex < samplingInterval) continue
    const reading = readings.get(index)
    const score = reading?.score ?? 0
    if (Math.abs(score) < signalThreshold || reading?.conflicting) continue
    signals.push({ index, direction: score > 0 ? 1 : -1 })
    previousSignalIndex = index
  }
  return signals
}

const directionalReturns = (
  points: AssetPricePoint[],
  signals: BacktestSignal[],
  observations: number,
) =>
  signals.flatMap((signal) => {
    const entry = points[signal.index]?.close
    const exit = points[signal.index + observations]?.close
    return entry && exit ? [((exit / entry - 1) * 100) * signal.direction] : []
  })

const horizonResult = (
  points: AssetPricePoint[],
  signals: BacktestSignal[],
  readings: Map<number, HistoricalReading>,
  observations: TechnicalBacktestHorizon['observations'],
  minimumSamples: number,
): TechnicalBacktestHorizon => {
  const returns: number[] = []
  const adverseExcursions: number[] = []
  const invalidationBars: number[] = []

  signals.forEach((signal) => {
    const entry = points[signal.index]?.close
    const exit = points[signal.index + observations]?.close
    if (!entry || !exit) return
    returns.push(((exit / entry - 1) * 100) * signal.direction)

    let worstDirectionalMove = 0
    let invalidatedAt: number | null = null
    for (let offset = 1; offset <= observations; offset += 1) {
      const point = points[signal.index + offset]
      if (!point) break
      const directionalMove = ((point.close / entry - 1) * 100) * signal.direction
      worstDirectionalMove = Math.min(worstDirectionalMove, directionalMove)
      if (invalidatedAt === null) {
        const subsequentScore = readings.get(signal.index + offset)?.score
        if (
          (signal.direction === 1 && subsequentScore !== undefined && subsequentScore <= -30) ||
          (signal.direction === -1 && subsequentScore !== undefined && subsequentScore >= 30)
        ) {
          invalidatedAt = offset
        }
      }
    }
    adverseExcursions.push(worstDirectionalMove)
    if (invalidatedAt !== null) invalidationBars.push(invalidatedAt)
  })

  const enough = returns.length >= minimumSamples
  const wins = returns.filter((value) => value > 0).length
  const winRatePct = enough ? round((wins / returns.length) * 100, 1) : null
  const winRateIntervalPct = enough ? wilsonInterval(wins, returns.length) : null
  const status = !enough
    ? 'insufficient'
    : returns.length >= 30 && winRateIntervalPct && winRateIntervalPct.low > 50
      ? 'supported'
      : returns.length >= 30 && winRateIntervalPct && winRateIntervalPct.high < 50
        ? 'contradicted'
        : 'watch'
  return {
    observations,
    sampleSize: returns.length,
    winRatePct,
    winRateIntervalPct,
    liftVsRandomPct: winRatePct === null ? null : round(winRatePct - 50, 1),
    averageDirectionalReturnPct: enough
      ? round(returns.reduce((sum, value) => sum + value, 0) / returns.length)
      : null,
    medianDirectionalReturnPct: enough ? round(median(returns) ?? 0) : null,
    maximumAdverseExcursionPct: enough ? round(Math.min(...adverseExcursions)) : null,
    medianInvalidationBars:
      enough && invalidationBars.length ? round(median(invalidationBars) ?? 0, 1) : null,
    status,
  }
}

export const backtestTechnicalSignals = (
  points: AssetPricePoint[],
  config: TechnicalIndicatorConfig,
  now = new Date(),
): TechnicalBacktestResult => {
  const baseBacktestConfig: TechnicalIndicatorConfig = {
    ...config,
    enabled: { ...config.enabled, crossAsset: false },
  }
  const minimumSamples = 12
  const signalThreshold = 30
  const samplingInterval = 5
  const maximumHorizon = 63
  const warmup = Math.max(
    baseBacktestConfig.parameters.maLongPeriod,
    baseBacktestConfig.parameters.macdSlowPeriod + baseBacktestConfig.parameters.macdSignalPeriod,
    baseBacktestConfig.parameters.bollingerPeriod,
    baseBacktestConfig.parameters.atrPeriod,
  )
  const splitIndex = Math.max(warmup, Math.floor(points.length * 0.7))
  const lastEligibleIndex = points.length - maximumHorizon - 1
  const componentReadings = buildReadings(points, baseBacktestConfig, warmup)
  const candidates = weightTemplates(config.weights).map((template) => {
    const readings = reweightReadings(
      componentReadings,
      template.weights,
      baseBacktestConfig.enabled,
    )
    const trainingSignals = collectSignals(
      readings,
      warmup,
      Math.max(warmup - 1, splitIndex - 22),
      signalThreshold,
      samplingInterval,
    )
    const returns = directionalReturns(points, trainingSignals, 21)
    const wins = returns.filter((value) => value > 0).length
    const interval = wilsonInterval(wins, returns.length)
    return {
      template,
      readings,
      returns,
      winRatePct: returns.length ? round((wins / returns.length) * 100, 1) : null,
      interval,
      averageDirectionalReturnPct: returns.length
        ? round(returns.reduce((sum, value) => sum + value, 0) / returns.length)
        : null,
    }
  })
  const eligibleCandidates = candidates.filter(
    (candidate) =>
      candidate.returns.length >= minimumSamples &&
      (candidate.averageDirectionalReturnPct ?? -Infinity) > 0,
  )
  const selected =
    (eligibleCandidates.length
      ? [...eligibleCandidates].sort(
          (left, right) =>
            (right.interval?.low ?? -1) - (left.interval?.low ?? -1) ||
            (right.averageDirectionalReturnPct ?? -Infinity) -
              (left.averageDirectionalReturnPct ?? -Infinity) ||
            right.returns.length - left.returns.length,
        )[0]
      : candidates[0]) ?? candidates[0]!
  const readings = selected.readings
  const signals = collectSignals(
    readings,
    splitIndex,
    lastEligibleIndex,
    signalThreshold,
    samplingInterval,
  )

  return {
    formulaVersion: `${baseBacktestConfig.formulaVersion}:${selected.template.id}`,
    methodology: 'chronological-holdout',
    generatedAt: now.toISOString(),
    trainingEndDate: points[splitIndex - 1]?.date ?? null,
    holdoutStartDate: points[splitIndex]?.date ?? null,
    holdoutEndDate: points[lastEligibleIndex]?.date ?? null,
    minimumSamples,
    signalThreshold,
    samplingInterval,
    totalSignals: signals.length,
    bullishSignals: signals.filter((signal) => signal.direction === 1).length,
    bearishSignals: signals.filter((signal) => signal.direction === -1).length,
    calibration: {
      candidateCount: candidates.length,
      status: eligibleCandidates.length ? 'calibrated' : 'fallback',
      selectedTemplate: selected.template,
      training: {
        sampleSize: selected.returns.length,
        winRatePct: selected.winRatePct,
        winRateIntervalPct: selected.interval,
        averageDirectionalReturnPct: selected.averageDirectionalReturnPct,
      },
      appliedToHoldout: true,
    },
    horizons: ([5, 21, 63] as const).map((observations) =>
      horizonResult(points, signals, readings, observations, minimumSamples),
    ),
    limitations: [
      'Indicator weights are selected on the first 70% training segment only; the chronological holdout is never used for selection.',
      'Signals are sampled at least five observations apart to reduce overlap, but samples are not independent.',
      'Returns exclude fees, slippage, taxes, financing, dividends, and tradability constraints.',
      'Cross-asset confirmation is excluded because point-in-time historical driver snapshots are not yet available.',
    ],
  }
}
