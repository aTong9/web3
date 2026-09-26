export interface PersonalFinanceAsset {
  id: string
  name: string
  amount: number
  kind: 'investable' | 'home' | 'other'
}

export interface PersonalFinanceLiability {
  id: string
  name: string
  amount: number
}

export interface PersonalFinanceRecord {
  version: 1
  currency: 'CNY' | 'USD' | 'HKD' | 'EUR'
  assets: PersonalFinanceAsset[]
  liabilities: PersonalFinanceLiability[]
  monthlyIncome: number | null
  monthlyExpenses: number | null
  annualTargetExpenses: number | null
  annualRetirementIncome: number | null
  withdrawalRate: number
  nominalReturn: number
  inflationRate: number
  scenarioSpread: number
  horizonYears: number
}

export interface PersonalFinanceScenario {
  id: 'cautious' | 'base' | 'higher'
  nominalReturn: number
  realReturn: number
  monthsToTarget: number | null
  endBalance: number
  balances: number[]
}

export interface PersonalFinanceSummary {
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  investableAssets: number
  fireCapital: number
  monthlyCashFlow: number | null
  savingsRate: number | null
  targetCapital: number | null
  fundingGap: number | null
  scenarios: PersonalFinanceScenario[]
}
