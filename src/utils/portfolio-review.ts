import type {
  PortfolioAssetCategory,
  PortfolioCashFlow,
  PortfolioHolding,
  PortfolioReview,
  PortfolioReviewPeriod,
  PortfolioReviewSummary,
  PortfolioSnapshot,
} from '../types/portfolio-review'
import { isCalendarDate } from './event-calendar'

export const portfolioCategories: PortfolioAssetCategory[] = [
  'cash',
  'stocks',
  'funds',
  'bonds',
  'crypto',
  'other',
]
export const emptyPortfolioReview = (): PortfolioReview => ({
  version: 1,
  currency: 'CNY',
  snapshots: [],
  flows: [],
})
const fail = (): never => {
  throw new Error('Invalid portfolio data')
}
const object = (value: unknown, keys: string[]): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fail()
  const item = value as Record<string, unknown>
  if (
    Object.keys(item).length !== keys.length ||
    keys.some((key) => !Object.prototype.hasOwnProperty.call(item, key))
  )
    return fail()
  return item
}
const text = (value: unknown, max: number, required = false): string => {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) return fail()
  return value
}
const date = (value: unknown) => {
  if (typeof value !== 'string' || !isCalendarDate(value)) return fail()
  return value
}
const money = (value: unknown, positive = false): number => {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1e12 ||
    (positive && value === 0) ||
    Number(value.toFixed(2)) !== value
  )
    return fail()
  return value
}
// Input and aggregate bounds keep all monetary arithmetic within safe integer cents.
const cents = (value: number) => Math.round(value * 100)
const totalCents = (values: number[]) =>
  values.reduce((total, amount) => {
    const sum = total + cents(amount)
    if (sum > 1e14) return fail()
    return sum
  }, 0)
const list = <T>(
  value: unknown,
  max: number,
  parse: (item: unknown) => T,
  key: (item: T) => string,
): T[] => {
  if (!Array.isArray(value) || value.length > max) return fail()
  const entries = value.map(parse)
  if (new Set(entries.map(key)).size !== entries.length) return fail()
  return entries
}
const holding = (value: unknown): PortfolioHolding => {
  const item = object(value, ['id', 'name', 'category', 'amount'])
  const category = portfolioCategories.find((category) => category === item.category)
  if (!category) return fail()
  return {
    id: text(item.id, 160, true),
    name: text(item.name, 160, true),
    category,
    amount: money(item.amount),
  }
}
const snapshot = (value: unknown): PortfolioSnapshot => {
  const item = object(value, ['id', 'date', 'holdings', 'notes'])
  const holdings = list(item.holdings, 200, holding, (item) => item.id)
  totalCents(holdings.map((item) => item.amount))
  return {
    id: text(item.id, 160, true),
    date: date(item.date),
    holdings,
    notes: text(item.notes, 5000),
  }
}
const flow = (value: unknown): PortfolioCashFlow => {
  const item = object(value, ['id', 'date', 'kind', 'amount', 'notes'])
  if (item.kind !== 'deposit' && item.kind !== 'withdrawal') return fail()
  return {
    id: text(item.id, 160, true),
    date: date(item.date),
    kind: item.kind,
    amount: money(item.amount, true),
    notes: text(item.notes, 5000),
  }
}
const validate = (value: unknown): PortfolioReview => {
  const item = object(value, ['version', 'currency', 'snapshots', 'flows'])
  const currency = (['CNY', 'USD', 'HKD', 'EUR'] as const).find(
    (currency) => currency === item.currency,
  )
  if (item.version !== 1 || !currency) return fail()
  const snapshots = list(item.snapshots, 1000, snapshot, (item) => item.id)
  if (new Set(snapshots.map((item) => item.date)).size !== snapshots.length) return fail()
  const flows = list(item.flows, 5000, flow, (item) => item.id)
  totalCents(flows.map((item) => item.amount))
  return { version: 1, currency, snapshots, flows }
}
export const parsePortfolioReview = (raw: string): PortfolioReview => {
  if (raw.length > 10_000_000) return fail()
  return validate(JSON.parse(raw))
}

export const calculatePortfolioReview = (record: PortfolioReview): PortfolioReviewSummary => {
  const data = validate(record)
  const snapshots = [...data.snapshots].sort((a, b) => a.date.localeCompare(b.date))
  const first = snapshots[0]
  const latest = snapshots[snapshots.length - 1]
  const valueOf = (item: PortfolioSnapshot) =>
    totalCents(item.holdings.map((holding) => holding.amount))
  const netOf = (item: PortfolioCashFlow) => cents(item.amount) * (item.kind === 'deposit' ? 1 : -1)
  const inRange = data.flows.filter(
    (flow) => first && latest && flow.date > first.date && flow.date <= latest.date,
  )
  const netCents = inRange.reduce((total, flow) => total + netOf(flow), 0)
  const periods: PortfolioReviewPeriod[] = []
  const series: PortfolioReviewSummary['series'] = first
    ? [{ date: first.date, value: valueOf(first) / 100, index: 100, drawdownPct: 0 }]
    : []
  let index: number | null = 100
  let peak = 100
  for (let i = 1; i < snapshots.length; i++) {
    const start = snapshots[i - 1]!
    const end = snapshots[i]!
    const startValue = valueOf(start)
    const endValue = valueOf(end)
    const endTime = Date.parse(`${end.date}T00:00:00Z`)
    const duration = endTime - Date.parse(`${start.date}T00:00:00Z`)
    const flows = inRange.filter((flow) => flow.date > start.date && flow.date <= end.date)
    const netFlow = flows.reduce((sum, flow) => sum + netOf(flow), 0)
    const weightedCapital =
      startValue +
      flows.reduce(
        (sum, flow) =>
          sum + (netOf(flow) * (endTime - Date.parse(`${flow.date}T00:00:00Z`))) / duration,
        0,
      )
    const profit = endValue - startValue - netFlow
    const rate = weightedCapital > 0 ? profit / weightedCapital : null
    const issue = rate === null ? 'nonpositive-capital' : rate < -1 ? 'return-below-minus100' : null
    const returnPct = issue || rate === null ? null : rate * 100
    periods.push({
      startDate: start.date,
      endDate: end.date,
      startValue: startValue / 100,
      endValue: endValue / 100,
      netFlow: netFlow / 100,
      profit: profit / 100,
      weightedCapital: weightedCapital / 100,
      returnPct,
      issue,
    })
    index = index === null || returnPct === null ? null : index * (1 + returnPct / 100)
    if (index !== null && !Number.isFinite(index)) index = null
    if (index !== null) peak = Math.max(peak, index)
    series.push({
      date: end.date,
      value: endValue / 100,
      index,
      drawdownPct: index === null ? null : (index / peak - 1) * 100,
    })
  }
  const previous = snapshots[snapshots.length - 2]
  const latestValue = latest ? valueOf(latest) : null
  const previousValue = previous ? valueOf(previous) : null
  const allocation = portfolioCategories
    .map((category) => {
      const amount = latest
        ? totalCents(
            latest.holdings.filter((item) => item.category === category).map((item) => item.amount),
          )
        : 0
      const prior = previous
        ? totalCents(
            previous.holdings
              .filter((item) => item.category === category)
              .map((item) => item.amount),
          )
        : 0
      return {
        category,
        amount: amount / 100,
        prior,
        weightPct: latestValue ? (amount / latestValue) * 100 : null,
        previousWeightPct: previousValue ? (prior / previousValue) * 100 : null,
      }
    })
    .filter((row) => row.amount > 0 || row.prior > 0)
    .map(({ category, amount, weightPct, previousWeightPct }) => ({
      category,
      amount,
      weightPct,
      previousWeightPct,
    }))
  const validSeries = periods.length > 0 && index !== null
  return {
    startDate: first?.date ?? null,
    latestDate: latest?.date ?? null,
    latestValue: latestValue === null ? null : latestValue / 100,
    startValue: first ? valueOf(first) / 100 : null,
    netContributions: netCents / 100,
    profit:
      first && latest && periods.length
        ? (valueOf(latest) - valueOf(first) - netCents) / 100
        : null,
    returnPct: validSeries ? index! - 100 : null,
    maxDrawdownPct: validSeries ? Math.min(...series.map((point) => point.drawdownPct!)) : null,
    excludedFlowCount: data.flows.length - inRange.length,
    periods,
    series,
    allocation,
  }
}
