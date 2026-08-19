import type { AssetPricePoint, ContractMarketSnapshot } from '@/types'

export type ContractMarketRegime = 'trending' | 'ranging' | 'volatile'
export type ContractStrategyId =
  | 'timeSeriesMomentum'
  | 'breakout'
  | 'meanReversion'
  | 'microstructure'

export interface ContractStrategyContribution {
  id: ContractStrategyId
  rawScore: number
  weight: number
  weightedScore: number
}

export interface ContractStrategyEnsemble {
  version: 'regime-ensemble-v1'
  regime: ContractMarketRegime
  score: number
  confidence: number
  contributions: ContractStrategyContribution[]
}

type ContractMarketInput = Pick<ContractMarketSnapshot, 'microstructure'> & {
  points: readonly AssetPricePoint[]
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value))
const round = (value: number, digits = 2) => Number(value.toFixed(digits))
const average = (values: readonly number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
const standardDeviation = (values: readonly number[]) => {
  if (values.length < 2) return 0
  const mean = average(values)
  return Math.sqrt(average(values.map((value) => (value - mean) ** 2)))
}
const normalizedDirection = (value: number, scale: number) =>
  round(clamp((value / Math.max(scale, Number.EPSILON)) * 100, -100, 100))

const closeReturns = (points: readonly AssetPricePoint[]) =>
  points.slice(1).flatMap((point, index) => {
    const previous = points[index]?.close
    return previous && previous > 0 ? [(point.close - previous) / previous] : []
  })

const marketRegime = (points: readonly AssetPricePoint[]): ContractMarketRegime => {
  const closes = points.slice(-61).map((point) => point.close)
  const returns = closeReturns(points.slice(-61))
  if (closes.length < 21 || returns.length < 20) return 'ranging'
  const recentVolatility = standardDeviation(returns.slice(-20))
  const baselineVolatility = standardDeviation(returns)
  if (baselineVolatility > 0 && recentVolatility >= baselineVolatility * 1.45) return 'volatile'
  const fast = average(closes.slice(-12))
  const slow = average(closes.slice(-48))
  const trendStrength = Math.abs(fast - slow) / Math.max(standardDeviation(closes.slice(-48)), 1e-8)
  return trendStrength >= 0.8 ? 'trending' : 'ranging'
}

const timeSeriesMomentumScore = (points: readonly AssetPricePoint[]) => {
  const closes = points.map((point) => point.close)
  if (closes.length < 49) return 0
  const latest = closes[closes.length - 1]!
  const medium = closes[closes.length - 13]!
  const slow = closes[closes.length - 49]!
  const returns = closeReturns(points.slice(-49))
  const volatility = standardDeviation(returns) * Math.sqrt(12)
  const momentum = ((latest - medium) / medium) * 0.65 + ((latest - slow) / slow) * 0.35
  return normalizedDirection(momentum, Math.max(volatility, 0.001))
}

const breakoutScore = (points: readonly AssetPricePoint[]) => {
  if (points.length < 22) return 0
  const latest = points[points.length - 1]!
  const prior = points.slice(-21, -1)
  const high = Math.max(...prior.map((point) => point.high ?? point.close))
  const low = Math.min(...prior.map((point) => point.low ?? point.close))
  const range = Math.max(high - low, latest.close * 0.001)
  if (latest.close > high) return normalizedDirection(latest.close - high + range * 0.5, range)
  if (latest.close < low) return normalizedDirection(latest.close - low - range * 0.5, range)
  return normalizedDirection(latest.close - (high + low) / 2, range)
}

const meanReversionScore = (points: readonly AssetPricePoint[]) => {
  const closes = points.slice(-20).map((point) => point.close)
  if (closes.length < 20) return 0
  const deviation = standardDeviation(closes)
  if (!deviation) return 0
  const zScore = (closes[closes.length - 1]! - average(closes)) / deviation
  return round(clamp(-zScore * 45, -100, 100))
}

const microstructureScore = (market: ContractMarketInput) => {
  const orderBook = market.microstructure.orderBookImbalancePct
  const takerBuy = market.microstructure.takerBuyRatioPct
  const openInterest = market.microstructure.openInterestChangePct
  const components = [
    orderBook === null ? null : clamp(orderBook * 4, -100, 100),
    takerBuy === null ? null : clamp((takerBuy - 50) * 8, -100, 100),
    openInterest === null ? null : clamp(openInterest * 20, -100, 100),
  ].filter((value): value is number => value !== null)
  return round(average(components))
}

const regimeWeights: Record<ContractMarketRegime, Record<ContractStrategyId, number>> = {
  trending: { timeSeriesMomentum: 0.45, breakout: 0.35, meanReversion: 0.05, microstructure: 0.15 },
  ranging: { timeSeriesMomentum: 0.15, breakout: 0.1, meanReversion: 0.55, microstructure: 0.2 },
  volatile: { timeSeriesMomentum: 0.25, breakout: 0.3, meanReversion: 0.15, microstructure: 0.3 },
}

export const buildContractStrategyEnsemble = (
  market: ContractMarketInput,
): ContractStrategyEnsemble => {
  const regime = marketRegime(market.points)
  const scores: Record<ContractStrategyId, number> = {
    timeSeriesMomentum: timeSeriesMomentumScore(market.points),
    breakout: breakoutScore(market.points),
    meanReversion: meanReversionScore(market.points),
    microstructure: microstructureScore(market),
  }
  const contributions = (Object.keys(scores) as ContractStrategyId[]).map((id) => ({
    id,
    rawScore: scores[id],
    weight: regimeWeights[regime][id],
    weightedScore: round(scores[id] * regimeWeights[regime][id]),
  }))
  const score = round(
    clamp(
      contributions.reduce((sum, item) => sum + item.weightedScore, 0),
      -100,
      100,
    ),
  )
  const directional = contributions.filter((item) => Math.abs(item.rawScore) >= 12)
  const agreeing = directional.filter(
    (item) => Math.sign(item.rawScore) === Math.sign(score),
  ).length
  const confidence = Math.round(
    clamp(directional.length ? (agreeing / directional.length) * 100 : 0, 0, 100),
  )
  return { version: 'regime-ensemble-v1', regime, score, confidence, contributions }
}
