export interface WeightedHolding {
  ticker: string
  weightPct: number
}

export interface IndexProfileComparisonInput {
  id: string
  productType: 'ETF' | 'Index'
  constituentCount: number
  top10WeightPct: number
  technologyWeightPct: number
}

export const calculateHoldingConcentration = <T extends WeightedHolding>(
  holdings: T[],
  limit = 10,
) => {
  const topHoldings = [...holdings]
    .sort((left, right) => right.weightPct - left.weightPct)
    .slice(0, Math.max(0, limit))
  const topWeightPct = Number(
    topHoldings.reduce((total, holding) => total + holding.weightPct, 0).toFixed(2),
  )

  return {
    topHoldings,
    topWeightPct,
    remainderWeightPct: Number(Math.max(0, 100 - topWeightPct).toFixed(2)),
  }
}

export const compareIndexProfiles = (
  left: IndexProfileComparisonInput,
  right: IndexProfileComparisonInput,
) => ({
  concentrationDifferencePctPoints: Number((left.top10WeightPct - right.top10WeightPct).toFixed(2)),
  technologyDifferencePctPoints: Number(
    (left.technologyWeightPct - right.technologyWeightPct).toFixed(2),
  ),
  constituentCountDifference: left.constituentCount - right.constituentCount,
  sameProductType: left.productType === right.productType,
})
