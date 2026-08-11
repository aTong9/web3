import type { AssetPricePoint } from '@/types'

const round = (value: number, digits = 2) => Number(value.toFixed(digits))

export const historicalVolatilityPercentile = (
  points: AssetPricePoint[],
  period = 20,
) => {
  const returns = points.slice(1).map((point, index) => Math.log(point.close / points[index]!.close))
  const history: number[] = []
  for (let index = period - 1; index < returns.length; index += 1) {
    const window = returns.slice(index + 1 - period, index + 1)
    const mean = window.reduce((sum, value) => sum + value, 0) / window.length
    const variance = window.reduce((sum, value) => sum + (value - mean) ** 2, 0) / window.length
    history.push(Math.sqrt(variance) * Math.sqrt(252) * 100)
  }
  if (history.length < 20) return null
  const currentVolatilityPct = history[history.length - 1]!
  const percentilePct =
    (history.filter((value) => value <= currentVolatilityPct).length / history.length) * 100
  return {
    currentVolatilityPct: round(currentVolatilityPct),
    percentilePct: round(percentilePct),
    observations: history.length,
  }
}

export const technicalDivergence = (
  points: AssetPricePoint[],
  rsi: Array<number | null>,
  minimumRsiDifference = 5,
) => {
  const paired = points
    .map((point, index) => ({ point, rsi: rsi[index] }))
    .filter((item): item is { point: AssetPricePoint; rsi: number } => item.rsi !== null)
    .slice(-50)
  if (paired.length < 20) return null
  const split = Math.floor(paired.length / 2)
  const previous = paired.slice(0, split)
  const recent = paired.slice(split)
  const highest = (values: typeof paired) =>
    values.reduce((best, item) => (item.point.close > best.point.close ? item : best))
  const lowest = (values: typeof paired) =>
    values.reduce((best, item) => (item.point.close < best.point.close ? item : best))
  const previousHigh = highest(previous)
  const recentHigh = highest(recent)
  const previousLow = lowest(previous)
  const recentLow = lowest(recent)
  const bearishRsiDifference = previousHigh.rsi - recentHigh.rsi
  const bullishRsiDifference = recentLow.rsi - previousLow.rsi
  const bearish =
    recentHigh.point.close >= previousHigh.point.close * 1.002 &&
    bearishRsiDifference >= minimumRsiDifference
  const bullish =
    recentLow.point.close <= previousLow.point.close * 0.998 &&
    bullishRsiDifference >= minimumRsiDifference
  if (!bearish && !bullish) return null
  if (bearish && (!bullish || bearishRsiDifference >= bullishRsiDifference)) {
    return {
      direction: 'bearish' as const,
      priceFrom: previousHigh.point.close,
      priceTo: recentHigh.point.close,
      rsiFrom: round(previousHigh.rsi),
      rsiTo: round(recentHigh.rsi),
      rsiDifference: round(bearishRsiDifference),
    }
  }
  return {
    direction: 'bullish' as const,
    priceFrom: previousLow.point.close,
    priceTo: recentLow.point.close,
    rsiFrom: round(previousLow.rsi),
    rsiTo: round(recentLow.rsi),
    rsiDifference: round(bullishRsiDifference),
  }
}
