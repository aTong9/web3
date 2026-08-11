import type { AssetPricePoint, TechnicalIndicatorConfig } from '@/types'
import { exponentialMovingAverage, simpleMovingAverage } from '@/utils/technical-analysis'

const last = <T>(values: T[]) => values[values.length - 1]
const round = (value: number, digits = 2) => Number(value.toFixed(digits))
const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length
const standardDeviation = (values: number[]) => {
  const average = mean(values)
  return Math.sqrt(mean(values.map((value) => (value - average) ** 2)))
}

const latestFinite = (values: Array<number | null>) => {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    if (values[index] !== null && Number.isFinite(values[index])) return values[index]!
  }
  return null
}

const directionalIndex = (points: AssetPricePoint[], period = 14) => {
  if (points.length <= period * 2 || points.some((point) => point.high === undefined || point.low === undefined))
    return null
  const trueRanges: number[] = []
  const plusDm: number[] = []
  const minusDm: number[] = []
  for (let index = 1; index < points.length; index += 1) {
    const point = points[index]!
    const previous = points[index - 1]!
    const upMove = point.high! - previous.high!
    const downMove = previous.low! - point.low!
    trueRanges.push(
      Math.max(
        point.high! - point.low!,
        Math.abs(point.high! - previous.close),
        Math.abs(point.low! - previous.close),
      ),
    )
    plusDm.push(upMove > downMove && upMove > 0 ? upMove : 0)
    minusDm.push(downMove > upMove && downMove > 0 ? downMove : 0)
  }
  const dx = trueRanges.map((_, index) => {
    if (index + 1 < period) return null
    const atr = mean(trueRanges.slice(index + 1 - period, index + 1))
    if (!atr) return null
    const plus = (mean(plusDm.slice(index + 1 - period, index + 1)) / atr) * 100
    const minus = (mean(minusDm.slice(index + 1 - period, index + 1)) / atr) * 100
    return plus + minus ? (Math.abs(plus - minus) / (plus + minus)) * 100 : 0
  })
  const available = dx.filter((value): value is number => value !== null)
  return available.length >= period ? round(mean(available.slice(-period))) : null
}

const stochastic = (points: AssetPricePoint[], period = 14) => {
  if (points.length < period || points.some((point) => point.high === undefined || point.low === undefined))
    return { k: null, d: null, j: null }
  const kSeries = points.map((point, index) => {
    if (index + 1 < period) return null
    const window = points.slice(index + 1 - period, index + 1)
    const high = Math.max(...window.map((item) => item.high!))
    const low = Math.min(...window.map((item) => item.low!))
    return high === low ? 50 : ((point.close - low) / (high - low)) * 100
  })
  const availableK = kSeries.filter((value): value is number => value !== null)
  const k = last(availableK) ?? null
  const d = availableK.length >= 3 ? mean(availableK.slice(-3)) : null
  return { k: k === null ? null : round(k), d: d === null ? null : round(d), j: k === null || d === null ? null : round(3 * k - 2 * d) }
}

const commodityChannelIndex = (points: AssetPricePoint[], period = 20) => {
  if (points.length < period || points.some((point) => point.high === undefined || point.low === undefined))
    return null
  const typical = points.map((point) => (point.high! + point.low! + point.close) / 3)
  const window = typical.slice(-period)
  const average = mean(window)
  const deviation = mean(window.map((value) => Math.abs(value - average)))
  return deviation ? round((last(window)! - average) / (0.015 * deviation)) : null
}

const volumeMetrics = (points: AssetPricePoint[], vwapPeriod: number) => {
  const valid = points.filter((point) => point.volume !== undefined)
  if (valid.length < 2) return { obv: null, vwap20: null }
  let obv = 0
  for (let index = 1; index < valid.length; index += 1) {
    if (valid[index]!.close > valid[index - 1]!.close) obv += valid[index]!.volume!
    else if (valid[index]!.close < valid[index - 1]!.close) obv -= valid[index]!.volume!
  }
  const window = valid.slice(-vwapPeriod)
  const totalVolume = window.reduce((sum, point) => sum + point.volume!, 0)
  const vwap20 = totalVolume
    ? window.reduce(
        (sum, point) =>
          sum + ((point.high ?? point.close) + (point.low ?? point.close) + point.close) / 3 * point.volume!,
        0,
      ) / totalVolume
    : null
  return { obv: round(obv, 0), vwap20: vwap20 === null ? null : round(vwap20, 4) }
}

export interface AdvancedTechnicalSnapshot {
  movingAverages: Record<'ma5' | 'ma10' | 'ma120' | 'ma250' | 'ema20', number | null>
  adx14: number | null
  stochastic: { k: number | null; d: number | null; j: number | null }
  roc12Pct: number | null
  cci20: number | null
  historicalVolatility20Pct: number | null
  bollingerBandwidthPct: number | null
  obv: number | null
  vwap20: number | null
  position52WeekPct: number | null
  latestGapPct: number | null
  structure: 'uptrend' | 'downtrend' | 'range' | 'insufficient'
}

export const analyzeAdvancedTechnicals = (
  points: AssetPricePoint[],
  config: TechnicalIndicatorConfig,
): AdvancedTechnicalSnapshot => {
  const { parameters } = config
  const closes = points.map((point) => point.close)
  const latest = last(closes)
  const ma = (period: number) => latestFinite(simpleMovingAverage(closes, period))
  const ma20 = ma(parameters.bollingerPeriod)
  const deviations =
    closes.length >= parameters.bollingerPeriod
      ? closes.slice(-parameters.bollingerPeriod)
      : []
  const bandwidth =
    ma20 && deviations.length === parameters.bollingerPeriod
      ? (standardDeviation(deviations) * parameters.bollingerMultiplier * 2 * 100) / ma20
      : null
  const returns = closes
    .slice(1)
    .map((value, index) => Math.log(value / closes[index]!))
    .slice(-parameters.historicalVolatilityPeriod)
  const historicalVolatility =
    returns.length >= parameters.historicalVolatilityPeriod
      ? standardDeviation(returns) * Math.sqrt(252) * 100
      : null
  const yearWindow = points.slice(-parameters.highLowWindow)
  const yearHigh = yearWindow.length ? Math.max(...yearWindow.map((point) => point.high ?? point.close)) : null
  const yearLow = yearWindow.length ? Math.min(...yearWindow.map((point) => point.low ?? point.close)) : null
  const position52Week = latest !== undefined && yearHigh !== null && yearLow !== null && yearHigh > yearLow
    ? ((latest - yearLow) / (yearHigh - yearLow)) * 100
    : null
  const recent = points.slice(-parameters.gapLookback)
  let latestGapPct: number | null = null
  for (let index = 1; index < recent.length; index += 1) {
    const current = recent[index]!
    const previous = recent[index - 1]!
    if (current.low !== undefined && previous.high !== undefined && current.low > previous.high)
      latestGapPct = ((current.low / previous.high) - 1) * 100
    if (current.high !== undefined && previous.low !== undefined && current.high < previous.low)
      latestGapPct = ((current.high / previous.low) - 1) * 100
  }
  const ma60 = ma(parameters.maLongPeriod)
  const structure =
    latest === undefined || ma20 === null || ma60 === null
      ? 'insufficient'
      : latest > ma20 && ma20 > ma60
        ? 'uptrend'
        : latest < ma20 && ma20 < ma60
          ? 'downtrend'
          : 'range'
  const stochasticReading = stochastic(points, parameters.stochasticPeriod)
  const volume = volumeMetrics(points, parameters.vwapPeriod)
  return {
    movingAverages: {
      ma5: ma(parameters.maFastPeriod),
      ma10: ma(parameters.maMediumPeriod),
      ma120: ma(parameters.maTrendPeriod),
      ma250: ma(parameters.maAnnualPeriod),
      ema20: latestFinite(exponentialMovingAverage(closes, parameters.emaPeriod)),
    },
    adx14: directionalIndex(points, parameters.adxPeriod),
    stochastic: stochasticReading,
    roc12Pct:
      closes.length > parameters.rocPeriod
        ? round((latest! / closes[closes.length - parameters.rocPeriod - 1]! - 1) * 100)
        : null,
    cci20: commodityChannelIndex(points, parameters.cciPeriod),
    historicalVolatility20Pct: historicalVolatility === null ? null : round(historicalVolatility),
    bollingerBandwidthPct: bandwidth === null ? null : round(bandwidth),
    obv: volume.obv,
    vwap20: volume.vwap20,
    position52WeekPct: position52Week === null ? null : round(position52Week),
    latestGapPct: latestGapPct === null ? null : round(latestGapPct),
    structure,
  }
}
