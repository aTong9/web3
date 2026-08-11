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

interface BacktestSignal {
  index: number
  direction: 1 | -1
}

interface HistoricalReading {
  score: number
  conflicting: boolean
}

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
  return {
    observations,
    sampleSize: returns.length,
    winRatePct: enough
      ? round((returns.filter((value) => value > 0).length / returns.length) * 100, 1)
      : null,
    averageDirectionalReturnPct: enough
      ? round(returns.reduce((sum, value) => sum + value, 0) / returns.length)
      : null,
    medianDirectionalReturnPct: enough ? round(median(returns) ?? 0) : null,
    maximumAdverseExcursionPct: enough ? round(Math.min(...adverseExcursions)) : null,
    medianInvalidationBars:
      enough && invalidationBars.length ? round(median(invalidationBars) ?? 0, 1) : null,
    status: enough ? 'available' : 'insufficient',
  }
}

export const backtestTechnicalSignals = (
  points: AssetPricePoint[],
  config: TechnicalIndicatorConfig,
  now = new Date(),
): TechnicalBacktestResult => {
  const backtestConfig: TechnicalIndicatorConfig = {
    ...config,
    enabled: { ...config.enabled, crossAsset: false },
  }
  const minimumSamples = 12
  const signalThreshold = 30
  const samplingInterval = 5
  const maximumHorizon = 63
  const warmup = Math.max(
    backtestConfig.parameters.maLongPeriod,
    backtestConfig.parameters.macdSlowPeriod + backtestConfig.parameters.macdSignalPeriod,
    backtestConfig.parameters.bollingerPeriod,
    backtestConfig.parameters.atrPeriod,
  )
  const splitIndex = Math.max(warmup, Math.floor(points.length * 0.7))
  const lastEligibleIndex = points.length - maximumHorizon - 1
  const signals: BacktestSignal[] = []
  const readings = new Map<number, HistoricalReading>()
  let previousSignalIndex = -samplingInterval

  for (let index = splitIndex; index < points.length; index += 1) {
    const reading = analyzeTechnicalSignals(points.slice(0, index + 1), 0, false, backtestConfig)
    readings.set(index, { score: reading.score, conflicting: reading.status === 'conflicting' })
  }

  for (let index = splitIndex; index <= lastEligibleIndex; index += 1) {
    if (index - previousSignalIndex < samplingInterval) continue
    const reading = readings.get(index)
    const score = reading?.score ?? 0
    if (Math.abs(score) < signalThreshold || reading?.conflicting) continue
    signals.push({ index, direction: score > 0 ? 1 : -1 })
    previousSignalIndex = index
  }

  return {
    formulaVersion: backtestConfig.formulaVersion,
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
    horizons: ([5, 21, 63] as const).map((observations) =>
      horizonResult(points, signals, readings, observations, minimumSamples),
    ),
    limitations: [
      'The holdout is chronological and is not used to fit indicator parameters.',
      'Signals are sampled at least five observations apart to reduce overlap, but samples are not independent.',
      'Returns exclude fees, slippage, taxes, financing, dividends, and tradability constraints.',
      'Cross-asset confirmation is excluded because point-in-time historical driver snapshots are not yet available.',
    ],
  }
}
