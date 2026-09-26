export type PortfolioCurrency = 'CNY' | 'USD' | 'HKD' | 'EUR'
export type PortfolioAssetCategory = 'cash' | 'stocks' | 'funds' | 'bonds' | 'crypto' | 'other'

export interface PortfolioHolding {
  id: string
  name: string
  category: PortfolioAssetCategory
  amount: number
}

export interface PortfolioSnapshot {
  id: string
  date: string
  holdings: PortfolioHolding[]
  notes: string
}

export interface PortfolioCashFlow {
  id: string
  date: string
  kind: 'deposit' | 'withdrawal'
  amount: number
  notes: string
}

export interface PortfolioReview {
  version: 1
  currency: PortfolioCurrency
  snapshots: PortfolioSnapshot[]
  flows: PortfolioCashFlow[]
}

export interface PortfolioReviewPeriod {
  startDate: string
  endDate: string
  startValue: number
  endValue: number
  netFlow: number
  profit: number
  weightedCapital: number
  returnPct: number | null
  issue: 'nonpositive-capital' | 'return-below-minus100' | null
}

export interface PortfolioReviewSummary {
  startDate: string | null
  latestDate: string | null
  latestValue: number | null
  startValue: number | null
  netContributions: number
  profit: number | null
  returnPct: number | null
  maxDrawdownPct: number | null
  excludedFlowCount: number
  periods: PortfolioReviewPeriod[]
  series: { date: string; value: number; index: number | null; drawdownPct: number | null }[]
  allocation: {
    category: PortfolioAssetCategory
    amount: number
    weightPct: number | null
    previousWeightPct: number | null
  }[]
}
