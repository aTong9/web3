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

export interface IndexDcaPricePoint {
  date: string
  open?: number
  close: number
  dividendPerShare?: number
  splitRatio?: number
}

export interface IndexDcaInput {
  symbol: string
  startDate: string
  endDate: string
  contributionAmount: number
  frequency: 'monthly'
  dayOfMonth: number
  executionRule: 'next-trading-day' | 'previous-trading-day'
  purchasePrice?: 'open' | 'close'
  reinvestDividends: boolean
  annualExpenseRatioPct: number
  purchaseFeePct?: number
  purchaseFeeFixed?: number
  dividendTaxPct?: number
  liquidationFeePct?: number
  annualCustodyFeePct?: number
  prices: IndexDcaPricePoint[]
}

export interface IndexDcaComparisonInput {
  startDate: string
  endDate: string
  contributionAmount: number
  dayOfMonth: number
  executionRule: IndexDcaInput['executionRule']
  purchasePrice?: IndexDcaInput['purchasePrice']
  reinvestDividends: boolean
  purchaseFeePct?: number
  purchaseFeeFixed?: number
  dividendTaxPct?: number
  liquidationFeePct?: number
  annualCustodyFeePct?: number
  products: Array<{
    id: string
    symbol: string
    annualExpenseRatioPct: number
    prices: IndexDcaPricePoint[]
  }>
}

export interface LeaderPeriodInput {
  snapshotDate: string
  endDate: string
  leaders: Array<{ ticker: string; totalReturnPct: number }>
  benchmarkTotalReturnPct: number
}

export interface PerformanceSeriesInput {
  id: string
  points: Array<{ date: string; close: number }>
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

export const normalizePerformanceSeries = (
  inputs: PerformanceSeriesInput[],
  startDate: string,
  endDate: string,
  sampling: 'daily' | 'monthly' = 'daily',
) => {
  if (!validDate(startDate) || !validDate(endDate) || startDate > endDate || !inputs.length) {
    throw new Error('收益率图参数无效')
  }
  const cleaned = inputs.map((input) => ({
    id: input.id,
    points: input.points
      .filter(
        (point) =>
          validDate(point.date) &&
          point.date >= startDate &&
          point.date <= endDate &&
          Number.isFinite(point.close) &&
          point.close > 0,
      )
      .sort((left, right) => left.date.localeCompare(right.date)),
  }))
  if (cleaned.some((input) => !input.points.length)) throw new Error('收益率图区间缺少行情')
  if (sampling === 'monthly') {
    const monthly = cleaned.map((input) => {
      const points = new Map<string, { date: string; close: number }>()
      input.points.forEach((point) => points.set(point.date.slice(0, 7), point))
      return { id: input.id, points }
    })
    const months = [...monthly[0]!.points.keys()].filter((month) =>
      monthly.every((input) => input.points.has(month)),
    )
    if (!months.length) throw new Error('收益率图区间没有共同月份')
    return {
      dates: months,
      series: monthly.map((input) => {
        const base = input.points.get(months[0]!)!.close
        return {
          id: input.id,
          values: months.map((month) => round((input.points.get(month)!.close / base) * 100)),
        }
      }),
    }
  }
  const dates = [
    ...new Set(cleaned.flatMap((input) => input.points.map((point) => point.date))),
  ].sort()
  return {
    dates,
    series: cleaned.map((input) => {
      const byDate = new Map(input.points.map((point) => [point.date, point.close]))
      const base = input.points[0]!.close
      let latest = base
      return {
        id: input.id,
        values: dates.map((date) => {
          latest = byDate.get(date) ?? latest
          return round((latest / base) * 100)
        }),
      }
    }),
  }
}

const round = (value: number, digits = 2) => {
  const rounded = Number(value.toFixed(digits))
  return Object.is(rounded, -0) ? 0 : rounded
}

const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)

const annualizedMoneyWeightedReturn = (
  cashFlows: Array<{ date: string; amount: number }>,
): number | null => {
  if (cashFlows.length < 2) return null
  const ordered = [...cashFlows].sort((left, right) => left.date.localeCompare(right.date))
  const start = Date.parse(`${ordered[0]!.date}T00:00:00Z`)
  const end = Date.parse(`${ordered[ordered.length - 1]!.date}T00:00:00Z`)
  if (
    end <= start ||
    !ordered.some((flow) => flow.amount < 0) ||
    !ordered.some((flow) => flow.amount > 0)
  )
    return null
  const npv = (rate: number) =>
    ordered.reduce(
      (total, flow) =>
        total +
        flow.amount /
          (1 + rate) ** ((Date.parse(`${flow.date}T00:00:00Z`) - start) / 31_557_600_000),
      0,
    )
  let low = -0.9999
  let high = 1
  let lowValue = npv(low)
  let highValue = npv(high)
  while (lowValue * highValue > 0 && high < 1_000_000) {
    high *= 2
    highValue = npv(high)
  }
  if (!Number.isFinite(lowValue) || !Number.isFinite(highValue) || lowValue * highValue > 0)
    return null
  for (let iteration = 0; iteration < 120; iteration += 1) {
    const middle = (low + high) / 2
    const middleValue = npv(middle)
    if (Math.abs(middleValue) < 1e-8) return middle
    if (lowValue * middleValue <= 0) {
      high = middle
    } else {
      low = middle
      lowValue = middleValue
    }
  }
  return (low + high) / 2
}

const monthlySchedules = (startDate: string, endDate: string, dayOfMonth: number) => {
  const start = new Date(`${startDate}T00:00:00Z`)
  const end = new Date(`${endDate}T00:00:00Z`)
  const schedules: string[] = []
  let year = start.getUTCFullYear()
  let month = start.getUTCMonth()

  while (
    year < end.getUTCFullYear() ||
    (year === end.getUTCFullYear() && month <= end.getUTCMonth())
  ) {
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
    const date = new Date(Date.UTC(year, month, Math.min(dayOfMonth, lastDay)))
    const isoDate = date.toISOString().slice(0, 10)
    if (isoDate >= startDate && isoDate <= endDate) schedules.push(isoDate)
    month += 1
    if (month === 12) {
      month = 0
      year += 1
    }
  }

  return schedules
}

export const simulateIndexDca = (input: IndexDcaInput) => {
  const purchaseFeePct = input.purchaseFeePct ?? 0
  const purchaseFeeFixed = input.purchaseFeeFixed ?? 0
  const dividendTaxPct = input.dividendTaxPct ?? 0
  const liquidationFeePct = input.liquidationFeePct ?? 0
  const annualCustodyFeePct = input.annualCustodyFeePct ?? 0
  if (
    !validDate(input.startDate) ||
    !validDate(input.endDate) ||
    input.startDate > input.endDate ||
    !Number.isFinite(input.contributionAmount) ||
    input.contributionAmount <= 0 ||
    !Number.isInteger(input.dayOfMonth) ||
    input.dayOfMonth < 1 ||
    input.dayOfMonth > 31 ||
    !Number.isFinite(input.annualExpenseRatioPct) ||
    input.annualExpenseRatioPct < 0 ||
    !Number.isFinite(purchaseFeePct) ||
    purchaseFeePct < 0 ||
    purchaseFeePct >= 100 ||
    !Number.isFinite(purchaseFeeFixed) ||
    purchaseFeeFixed < 0 ||
    purchaseFeeFixed + input.contributionAmount * (purchaseFeePct / 100) >=
      input.contributionAmount ||
    !Number.isFinite(dividendTaxPct) ||
    dividendTaxPct < 0 ||
    dividendTaxPct > 100 ||
    !Number.isFinite(liquidationFeePct) ||
    liquidationFeePct < 0 ||
    liquidationFeePct >= 100 ||
    !Number.isFinite(annualCustodyFeePct) ||
    annualCustodyFeePct < 0 ||
    annualCustodyFeePct >= 100
  ) {
    throw new Error('定投参数无效')
  }

  const prices = [...input.prices]
    .filter(
      (point) =>
        validDate(point.date) &&
        point.date >= input.startDate &&
        point.date <= input.endDate &&
        Number.isFinite(point.close) &&
        point.close > 0 &&
        Number.isFinite(point.dividendPerShare ?? 0) &&
        (point.dividendPerShare ?? 0) >= 0,
    )
    .sort((left, right) => left.date.localeCompare(right.date))
  if (!prices.length) throw new Error('定投区间没有有效交易日')

  const scheduleDates = monthlySchedules(input.startDate, input.endDate, input.dayOfMonth)
  const purchasesByDate = new Map<string, number>()
  for (const scheduledDate of scheduleDates) {
    const execution =
      input.executionRule === 'previous-trading-day'
        ? [...prices].reverse().find((point) => point.date <= scheduledDate)
        : prices.find((point) => point.date >= scheduledDate)
    if (execution)
      purchasesByDate.set(execution.date, (purchasesByDate.get(execution.date) ?? 0) + 1)
  }

  let shares = 0
  let cashDividends = 0
  let reinvestedDividends = 0
  let grossDividends = 0
  let dividendTaxes = 0
  let totalContributed = 0
  let totalPurchaseFees = 0
  let totalCustodyFees = 0
  let totalInvested = 0
  let previousPriceDate: string | null = null
  const purchases: Array<{
    date: string
    amount: number
    investedAmount: number
    transactionFee: number
    price: number
    shares: number
  }> = []

  for (const point of prices) {
    if ((point.splitRatio ?? 1) > 0) shares *= point.splitRatio ?? 1
    if (previousPriceDate && shares > 0 && annualCustodyFeePct > 0) {
      const elapsedDays =
        (Date.parse(`${point.date}T00:00:00Z`) - Date.parse(`${previousPriceDate}T00:00:00Z`)) /
        86_400_000
      const remainingFactor = (1 - annualCustodyFeePct / 100) ** (elapsedDays / 365.2425)
      const feeShares = shares * (1 - remainingFactor)
      shares -= feeShares
      totalCustodyFees += feeShares * point.close
    }
    previousPriceDate = point.date
    const purchasePrice = input.purchasePrice === 'open' ? (point.open ?? point.close) : point.close
    const grossDividend = shares * (point.dividendPerShare ?? 0)
    if (grossDividend > 0) {
      const dividendTax = grossDividend * (dividendTaxPct / 100)
      const netDividend = grossDividend - dividendTax
      grossDividends += grossDividend
      dividendTaxes += dividendTax
      if (input.reinvestDividends) {
        shares += netDividend / purchasePrice
        reinvestedDividends += netDividend
      } else {
        cashDividends += netDividend
      }
    }

    const purchaseCount = purchasesByDate.get(point.date) ?? 0
    for (let index = 0; index < purchaseCount; index += 1) {
      const transactionFee = input.contributionAmount * (purchaseFeePct / 100) + purchaseFeeFixed
      const investedAmount = input.contributionAmount - transactionFee
      const purchasedShares = investedAmount / purchasePrice
      shares += purchasedShares
      totalContributed += input.contributionAmount
      totalInvested += investedAmount
      totalPurchaseFees += transactionFee
      purchases.push({
        date: point.date,
        amount: input.contributionAmount,
        investedAmount,
        transactionFee,
        price: purchasePrice,
        shares: purchasedShares,
      })
    }
  }

  const finalPrice = prices[prices.length - 1]?.close ?? 0
  const endingMarketValue = shares * finalPrice
  const estimatedLiquidationFee = endingMarketValue * (liquidationFeePct / 100)
  const endingValue = endingMarketValue - estimatedLiquidationFee + cashDividends
  const elapsedDays = Math.max(
    0,
    (Date.parse(`${prices[prices.length - 1]?.date}T00:00:00Z`) -
      Date.parse(`${prices[0]?.date}T00:00:00Z`)) /
      86_400_000,
  )
  const estimatedEmbeddedExpense =
    totalInvested * 0.5 * (input.annualExpenseRatioPct / 100) * (elapsedDays / 365.25)
  const moneyWeightedReturn = annualizedMoneyWeightedReturn([
    ...purchases.map((purchase) => ({ date: purchase.date, amount: -purchase.amount })),
    { date: prices[prices.length - 1]!.date, amount: endingValue },
  ])

  return {
    symbol: input.symbol,
    purchases,
    shares: round(shares, 8),
    totalContributed: round(totalContributed),
    totalInvested: round(totalInvested),
    totalPurchaseFees: round(totalPurchaseFees),
    totalCustodyFees: round(totalCustodyFees),
    grossDividends: round(grossDividends),
    dividendTaxes: round(dividendTaxes),
    netDividends: round(grossDividends - dividendTaxes),
    cashDividends: round(cashDividends),
    reinvestedDividends: round(reinvestedDividends),
    endingMarketValue: round(endingMarketValue),
    estimatedLiquidationFee: round(estimatedLiquidationFee),
    endingValue: round(endingValue),
    gain: round(endingValue - totalContributed),
    totalReturnPct: totalContributed
      ? round(((endingValue - totalContributed) / totalContributed) * 100)
      : 0,
    annualizedMoneyWeightedReturnPct:
      moneyWeightedReturn === null ? null : round(moneyWeightedReturn * 100),
    annualExpenseRatioPct: input.annualExpenseRatioPct,
    purchaseFeePct,
    purchaseFeeFixed,
    dividendTaxPct,
    liquidationFeePct,
    annualCustodyFeePct,
    estimatedEmbeddedExpense: round(estimatedEmbeddedExpense),
    expenseTreatment: 'embedded-in-market-price' as const,
  }
}

export const compareIndexDcaPlans = (input: IndexDcaComparisonInput) => {
  if (!input.products.length) throw new Error('定投对照缺少产品')
  const availableRanges = input.products.map((product) => {
    const dates = product.prices
      .filter((point) => validDate(point.date) && Number.isFinite(point.close) && point.close > 0)
      .map((point) => point.date)
      .sort()
    if (!dates.length) throw new Error(`${product.symbol}缺少有效行情`)
    return { first: dates[0]!, last: dates[dates.length - 1]! }
  })
  const startDates = [input.startDate, ...availableRanges.map((range) => range.first)].sort()
  const commonStartDate = startDates[startDates.length - 1]!
  const commonEndDate = [input.endDate, ...availableRanges.map((range) => range.last)].sort()[0]!
  if (commonStartDate > commonEndDate) throw new Error('四资产没有共同定投区间')

  const results = input.products.map((product) => ({
    id: product.id,
    result: simulateIndexDca({
      symbol: product.symbol,
      startDate: commonStartDate,
      endDate: commonEndDate,
      contributionAmount: input.contributionAmount,
      frequency: 'monthly',
      dayOfMonth: input.dayOfMonth,
      executionRule: input.executionRule,
      purchasePrice: input.purchasePrice,
      reinvestDividends: input.reinvestDividends,
      annualExpenseRatioPct: product.annualExpenseRatioPct,
      purchaseFeePct: input.purchaseFeePct,
      purchaseFeeFixed: input.purchaseFeeFixed,
      dividendTaxPct: input.dividendTaxPct,
      liquidationFeePct: input.liquidationFeePct,
      annualCustodyFeePct: input.annualCustodyFeePct,
      prices: product.prices,
    }),
  }))
  const contributionTotals = new Set(results.map(({ result }) => result.totalContributed))

  return {
    commonStartDate,
    commonEndDate,
    comparableCashFlows: contributionTotals.size === 1,
    results: [...results].sort((left, right) => right.result.endingValue - left.result.endingValue),
  }
}

const csvCell = (value: string | number) => {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export const buildIndexDcaCsv = (result: ReturnType<typeof simulateIndexDca>) => {
  const summary = [
    ['symbol', result.symbol],
    ['total_contributed', result.totalContributed],
    ['ending_value', result.endingValue],
    ['total_return_pct', result.totalReturnPct],
    ['annualized_money_weighted_return_pct', result.annualizedMoneyWeightedReturnPct ?? ''],
    ['total_purchase_fees', result.totalPurchaseFees],
    ['total_custody_fees', result.totalCustodyFees],
    ['dividend_taxes', result.dividendTaxes],
    ['estimated_liquidation_fee', result.estimatedLiquidationFee],
  ]
  const rows: Array<Array<string | number>> = [
    ['metric', 'value'],
    ...summary,
    [],
    ['purchase_date', 'contribution', 'invested_amount', 'transaction_fee', 'price', 'shares'],
    ...result.purchases.map((purchase) => [
      purchase.date,
      purchase.amount,
      purchase.investedAmount,
      purchase.transactionFee,
      purchase.price,
      purchase.shares,
    ]),
  ]
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`
}

export const compareLeaderPeriods = (inputs: LeaderPeriodInput[]) => {
  let leaderGrowth = 1
  let benchmarkGrowth = 1
  const periods = inputs.map((input) => {
    if (
      !validDate(input.snapshotDate) ||
      !validDate(input.endDate) ||
      input.snapshotDate >= input.endDate ||
      !input.leaders.length ||
      input.leaders.some((leader) => !leader.ticker || !Number.isFinite(leader.totalReturnPct)) ||
      !Number.isFinite(input.benchmarkTotalReturnPct)
    ) {
      throw new Error('龙头对照周期无效')
    }
    const leaderReturnPct = round(
      input.leaders.reduce((total, leader) => total + leader.totalReturnPct, 0) /
        input.leaders.length,
    )
    leaderGrowth *= 1 + leaderReturnPct / 100
    benchmarkGrowth *= 1 + input.benchmarkTotalReturnPct / 100
    return {
      snapshotDate: input.snapshotDate,
      endDate: input.endDate,
      leaderTickers: input.leaders.map((leader) => leader.ticker),
      leaderReturnPct,
      benchmarkTotalReturnPct: input.benchmarkTotalReturnPct,
      excessReturnPctPoints: round(leaderReturnPct - input.benchmarkTotalReturnPct),
    }
  })
  const leaderCompoundedReturnPct = round((leaderGrowth - 1) * 100)
  const benchmarkCompoundedReturnPct = round((benchmarkGrowth - 1) * 100)
  const excessReturnPctPoints = round(leaderCompoundedReturnPct - benchmarkCompoundedReturnPct)

  return {
    periods,
    leaderCompoundedReturnPct,
    benchmarkCompoundedReturnPct,
    excessReturnPctPoints,
    outperformed: excessReturnPctPoints > 0,
  }
}
