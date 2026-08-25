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
  prices: IndexDcaPricePoint[]
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
  const dates = [...new Set(cleaned.flatMap((input) => input.points.map((point) => point.date)))].sort()
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

const round = (value: number, digits = 2) => Number(value.toFixed(digits))

const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)

const monthlySchedules = (startDate: string, endDate: string, dayOfMonth: number) => {
  const start = new Date(`${startDate}T00:00:00Z`)
  const end = new Date(`${endDate}T00:00:00Z`)
  const schedules: string[] = []
  let year = start.getUTCFullYear()
  let month = start.getUTCMonth()

  while (year < end.getUTCFullYear() || (year === end.getUTCFullYear() && month <= end.getUTCMonth())) {
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
    input.annualExpenseRatioPct < 0
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
  let totalContributed = 0
  const purchases: Array<{ date: string; amount: number; price: number; shares: number }> = []

  for (const point of prices) {
    if ((point.splitRatio ?? 1) > 0) shares *= point.splitRatio ?? 1
    const purchasePrice = input.purchasePrice === 'open' ? (point.open ?? point.close) : point.close
    const dividend = shares * (point.dividendPerShare ?? 0)
    if (dividend > 0) {
      if (input.reinvestDividends) {
        shares += dividend / purchasePrice
        reinvestedDividends += dividend
      } else {
        cashDividends += dividend
      }
    }

    const purchaseCount = purchasesByDate.get(point.date) ?? 0
    for (let index = 0; index < purchaseCount; index += 1) {
      const purchasedShares = input.contributionAmount / purchasePrice
      shares += purchasedShares
      totalContributed += input.contributionAmount
      purchases.push({
        date: point.date,
        amount: input.contributionAmount,
        price: purchasePrice,
        shares: purchasedShares,
      })
    }
  }

  const finalPrice = prices[prices.length - 1]?.close ?? 0
  const endingValue = shares * finalPrice + cashDividends
  const elapsedDays = Math.max(
    0,
    (Date.parse(`${prices[prices.length - 1]?.date}T00:00:00Z`) -
      Date.parse(`${prices[0]?.date}T00:00:00Z`)) /
      86_400_000,
  )
  const estimatedEmbeddedExpense =
    totalContributed * 0.5 * (input.annualExpenseRatioPct / 100) * (elapsedDays / 365.25)

  return {
    symbol: input.symbol,
    purchases,
    shares: round(shares, 8),
    totalContributed: round(totalContributed),
    cashDividends: round(cashDividends),
    reinvestedDividends: round(reinvestedDividends),
    endingValue: round(endingValue),
    gain: round(endingValue - totalContributed),
    totalReturnPct: totalContributed
      ? round(((endingValue - totalContributed) / totalContributed) * 100)
      : 0,
    annualExpenseRatioPct: input.annualExpenseRatioPct,
    estimatedEmbeddedExpense: round(estimatedEmbeddedExpense),
    expenseTreatment: 'embedded-in-market-price' as const,
  }
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
      input.leaders.some(
        (leader) => !leader.ticker || !Number.isFinite(leader.totalReturnPct),
      ) ||
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
