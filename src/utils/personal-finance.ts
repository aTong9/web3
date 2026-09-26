import type {
  PersonalFinanceAsset,
  PersonalFinanceLiability,
  PersonalFinanceRecord,
  PersonalFinanceScenario,
  PersonalFinanceSummary,
} from '@/types/personal-finance'

export const emptyPersonalFinance = (): PersonalFinanceRecord => ({
  version: 1,
  currency: 'CNY',
  assets: [],
  liabilities: [],
  monthlyIncome: null,
  monthlyExpenses: null,
  annualTargetExpenses: null,
  annualRetirementIncome: null,
  withdrawalRate: 3.5,
  nominalReturn: 5,
  inflationRate: 2,
  scenarioSpread: 2,
  horizonYears: 40,
})

const invalid = (field: string): never => {
  throw new Error(`Invalid personal finance data: ${field}`)
}

export const financeInputNumber = (value: string | number): number => {
  if (
    (typeof value !== 'string' && typeof value !== 'number') ||
    (typeof value === 'string' &&
      !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(value.trim())) ||
    !Number.isFinite(Number(value))
  )
    return invalid('number')
  return Number(value)
}

const number = (value: unknown, field: string, min = 0, max = 1e12): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    return invalid(field)
  }
  return value
}

const object = (value: unknown, keys: string[]): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid('object')
  const data = value as Record<string, unknown>
  if (
    Object.keys(data).length !== keys.length ||
    keys.some((key) => !Object.prototype.hasOwnProperty.call(data, key))
  )
    return invalid('fields')
  return data
}

const text = (value: unknown, max: number): string => {
  if (typeof value !== 'string' || !value.trim() || value.length > max) return invalid('text')
  return value
}

const entries = (
  raw: unknown,
  assets: boolean,
): (PersonalFinanceAsset | PersonalFinanceLiability)[] => {
  if (!Array.isArray(raw) || raw.length > 500) return invalid('entries')
  const parsed = raw.map((value) => {
    const item = object(value, assets ? ['id', 'name', 'amount', 'kind'] : ['id', 'name', 'amount'])
    const entry = {
      id: text(item.id, 160),
      name: text(item.name, 160),
      amount: number(item.amount, 'amount'),
    }
    if (!assets) return entry
    if (item.kind !== 'investable' && item.kind !== 'home' && item.kind !== 'other')
      return invalid('asset kind')
    return { ...entry, kind: item.kind }
  })
  if (new Set(parsed.map((entry) => entry.id)).size !== parsed.length)
    return invalid('duplicate IDs')
  return parsed
}

const validatePersonalFinance = (value: unknown): PersonalFinanceRecord => {
  const data = object(value, [
    'version',
    'currency',
    'assets',
    'liabilities',
    'monthlyIncome',
    'monthlyExpenses',
    'annualTargetExpenses',
    'annualRetirementIncome',
    'withdrawalRate',
    'nominalReturn',
    'inflationRate',
    'scenarioSpread',
    'horizonYears',
  ])
  if (data.version !== 1) return invalid('version')
  if (
    data.currency !== 'CNY' &&
    data.currency !== 'USD' &&
    data.currency !== 'HKD' &&
    data.currency !== 'EUR'
  )
    return invalid('currency')
  const optionalAmount = (field: string) =>
    data[field] === null ? null : number(data[field], field)
  const horizonYears = number(data.horizonYears, 'horizonYears', 1, 100)
  if (!Number.isInteger(horizonYears)) return invalid('horizonYears')
  return {
    version: 1,
    currency: data.currency,
    assets: entries(data.assets, true) as PersonalFinanceAsset[],
    liabilities: entries(data.liabilities, false),
    monthlyIncome: optionalAmount('monthlyIncome'),
    monthlyExpenses: optionalAmount('monthlyExpenses'),
    annualTargetExpenses: optionalAmount('annualTargetExpenses'),
    annualRetirementIncome: optionalAmount('annualRetirementIncome'),
    withdrawalRate: number(data.withdrawalRate, 'withdrawalRate', 0.1, 20),
    nominalReturn: number(data.nominalReturn, 'nominalReturn', -50, 50),
    inflationRate: number(data.inflationRate, 'inflationRate', -20, 50),
    scenarioSpread: number(data.scenarioSpread, 'scenarioSpread', 0, 30),
    horizonYears,
  }
}

export const parsePersonalFinance = (raw: string): PersonalFinanceRecord => {
  if (raw.length > 2_000_000) return invalid('file size')
  return validatePersonalFinance(JSON.parse(raw))
}

export const calculatePersonalFinance = (record: PersonalFinanceRecord): PersonalFinanceSummary => {
  const data = validatePersonalFinance(record)
  const totalAssets = data.assets.reduce((sum, asset) => sum + asset.amount, 0)
  const totalLiabilities = data.liabilities.reduce((sum, debt) => sum + debt.amount, 0)
  const investableAssets = data.assets
    .filter((asset) => asset.kind === 'investable')
    .reduce((sum, asset) => sum + asset.amount, 0)
  const fireCapital = investableAssets - totalLiabilities
  const monthlyCashFlow =
    data.monthlyIncome === null || data.monthlyExpenses === null
      ? null
      : data.monthlyIncome - data.monthlyExpenses
  const savingsRate =
    data.monthlyIncome === null || data.monthlyIncome === 0 || monthlyCashFlow === null
      ? null
      : (monthlyCashFlow / data.monthlyIncome) * 100
  const targetCapital =
    data.annualTargetExpenses === null || data.annualRetirementIncome === null
      ? null
      : Math.max(0, data.annualTargetExpenses - data.annualRetirementIncome) /
        (data.withdrawalRate / 100)
  const scenarios: PersonalFinanceScenario[] = []
  if (monthlyCashFlow !== null && targetCapital !== null) {
    for (const [id, shift] of [
      ['cautious', -1],
      ['base', 0],
      ['higher', 1],
    ] as const) {
      const nominalReturn = data.nominalReturn + shift * data.scenarioSpread
      const realReturn = ((1 + nominalReturn / 100) / (1 + data.inflationRate / 100) - 1) * 100
      const monthlyRate = (1 + realReturn / 100) ** (1 / 12) - 1
      let balance = fireCapital
      let monthsToTarget: number | null = balance >= targetCapital ? 0 : null
      const balances = [balance]
      for (let month = 1; month <= data.horizonYears * 12; month++) {
        // ponytail: deterministic accumulation only; debt interest and retirement drawdown need separate schedules.
        balance += Math.max(0, balance) * monthlyRate + monthlyCashFlow
        if (monthsToTarget === null && balance >= targetCapital) monthsToTarget = month
        if (month % 12 === 0) balances.push(balance)
      }
      scenarios.push({
        id,
        nominalReturn,
        realReturn,
        monthsToTarget,
        endBalance: balance,
        balances,
      })
    }
  }
  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
    investableAssets,
    fireCapital,
    monthlyCashFlow,
    savingsRate,
    targetCapital,
    fundingGap: targetCapital === null ? null : Math.max(0, targetCapital - fireCapital),
    scenarios,
  }
}
