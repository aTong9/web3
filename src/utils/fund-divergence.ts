import type { FundTransmissionDataset } from '@/types'
import type { FundResearchItem } from '@/utils/fund-research'

export type FundDivergenceStatus = 'confirming' | 'diverging' | 'insufficient'

export interface FundDivergenceReading {
  status: FundDivergenceStatus
  fundMovePct: number | null
  marketMovePct: number | null
  relativeGapPct: number | null
  netContribution: number | null
  marketName: string
  marketDate: string | null
  reasons: string[]
  drivers: FundTransmissionDataset['markets'][number]['drivers']
  chains: FundTransmissionDataset['chains']
}

const round = (value: number) => Number(value.toFixed(2))
const sameDirection = (left: number, right: number) => Math.sign(left) === Math.sign(right)

const latestFundMove = (fund: FundResearchItem) => {
  const points = fund.history.filter((point) => Number.isFinite(point.value) && point.value > 0)
  const latest = points[points.length - 1]
  const previous = points[points.length - 2]
  if (!latest || !previous) return null
  const value = (latest.value / previous.value - 1) * 100
  return Math.abs(value) > 30 ? null : round(value)
}

const datesNear = (left: string | undefined, right: string | null) => {
  if (!left || !right) return false
  const distance = Math.abs(new Date(left).getTime() - new Date(right).getTime())
  return Number.isFinite(distance) && distance <= 7 * 86400000
}

export const evaluateFundDivergence = (
  fund: FundResearchItem,
  dataset: FundTransmissionDataset,
): FundDivergenceReading => {
  const market = dataset.markets.find((item) => item.id === fund.marketId)
  const fundMovePct = latestFundMove(fund)
  const marketMovePct = market?.dailyMove ?? null
  const latestFundDate = fund.history[fund.history.length - 1]?.date
  const drivers = market?.drivers.slice(0, 3) ?? []
  const chains = dataset.chains
    .filter(
      (chain) =>
        (chain.left === fund.marketId || chain.right === fund.marketId) &&
        chain.status !== 'dormant' &&
        chain.status !== 'unavailable',
    )
    .sort(
      (left, right) =>
        Number(right.strength === 'strong') - Number(left.strength === 'strong') ||
        Math.abs(right.signal ?? 0) - Math.abs(left.signal ?? 0),
    )
    .slice(0, 3)
  const netContribution = market?.dailyAttribution.netContribution ?? null
  const relativeGapPct =
    fundMovePct !== null && marketMovePct !== null ? round(fundMovePct - marketMovePct) : null
  const reasons: string[] = []

  if (!market || fundMovePct === null || !datesNear(latestFundDate, market.date)) {
    reasons.push('missing-or-misaligned-observation')
    return {
      status: 'insufficient',
      fundMovePct,
      marketMovePct,
      relativeGapPct,
      netContribution,
      marketName: market?.name ?? fund.marketProxyLabel,
      marketDate: market?.date ?? null,
      reasons,
      drivers,
      chains,
    }
  }

  if (Math.abs(fundMovePct) < 0.05) {
    reasons.push('fund-move-below-threshold')
    return {
      status: 'insufficient',
      fundMovePct,
      marketMovePct,
      relativeGapPct,
      netContribution,
      marketName: market.name,
      marketDate: market.date,
      reasons,
      drivers,
      chains,
    }
  }

  const hasMarketSignal = marketMovePct !== null && Math.abs(marketMovePct) >= 0.05
  const hasDriverSignal = netContribution !== null && Math.abs(netContribution) >= 0.05
  const marketAligned = hasMarketSignal ? sameDirection(fundMovePct, marketMovePct) : null
  const driverAligned = hasDriverSignal ? sameDirection(fundMovePct, netContribution) : null
  if (marketAligned === false) reasons.push('market-proxy-opposite')
  if (driverAligned === false) reasons.push('driver-opposite')
  if (marketAligned === true) reasons.push('market-proxy-aligned')
  if (driverAligned === true) reasons.push('driver-aligned')

  return {
    status:
      marketAligned === false || driverAligned === false
        ? 'diverging'
        : marketAligned === true || driverAligned === true
          ? 'confirming'
          : 'insufficient',
    fundMovePct,
    marketMovePct,
    relativeGapPct,
    netContribution,
    marketName: market.name,
    marketDate: market.date,
    reasons,
    drivers,
    chains,
  }
}
