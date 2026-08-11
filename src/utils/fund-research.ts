import type { FundHistoryPoint } from '@/types'

export interface FundResearchItem {
  code: string
  name: string
  group: string
  latestValue: number | null
  latestDate: string | null
  annualFeePct: number | null
  premiumRatePct: number | null
  trackingErrorPct: number | null
  trackingBenchmark: string | null
  history: FundHistoryPoint[]
}

export interface DatedValue {
  date: string
  value: number
}

const round = (value: number, digits = 4) => Number(value.toFixed(digits))

export const normalizeFundHistory = (history: FundHistoryPoint[]): DatedValue[] => {
  const usable = history.filter((point) => Number.isFinite(point.value) && point.value > 0)
  if (!usable.length) return []
  let indexValue = 100
  return usable.map((point, index) => {
    const previous = usable[index - 1]
    if (previous) {
      const dailyReturn = point.value / previous.value - 1
      if (Math.abs(dailyReturn) <= 0.3) indexValue *= 1 + dailyReturn
    }
    return { date: point.date, value: round(indexValue) }
  })
}

const alignedReturns = (left: FundHistoryPoint[], right: FundHistoryPoint[]) => {
  const rightByDate = new Map(right.map((point) => [point.date, point.value]))
  const common = left.filter((point) => rightByDate.has(point.date))
  const returns: Array<{ date: string; left: number; right: number }> = []
  for (let index = 1; index < common.length; index += 1) {
    const previousPoint = common[index - 1]
    const currentPoint = common[index]
    if (!previousPoint || !currentPoint) continue
    const previousLeft = previousPoint.value
    const currentLeft = currentPoint.value
    const previousRight = rightByDate.get(previousPoint.date)
    const currentRight = rightByDate.get(currentPoint.date)
    if (!previousLeft || !currentLeft || !previousRight || !currentRight) continue
    const leftReturn = currentLeft / previousLeft - 1
    const rightReturn = currentRight / previousRight - 1
    if (Math.abs(leftReturn) > 0.3 || Math.abs(rightReturn) > 0.3) continue
    returns.push({
      date: currentPoint.date,
      left: leftReturn,
      right: rightReturn,
    })
  }
  return returns
}

const pearson = (pairs: Array<{ left: number; right: number }>) => {
  if (pairs.length < 2) return null
  const leftMean = pairs.reduce((sum, point) => sum + point.left, 0) / pairs.length
  const rightMean = pairs.reduce((sum, point) => sum + point.right, 0) / pairs.length
  let covariance = 0
  let leftVariance = 0
  let rightVariance = 0
  for (const point of pairs) {
    const left = point.left - leftMean
    const right = point.right - rightMean
    covariance += left * right
    leftVariance += left ** 2
    rightVariance += right ** 2
  }
  const denominator = Math.sqrt(leftVariance * rightVariance)
  return denominator ? round(covariance / denominator) : null
}

export const rollingFundCorrelation = (
  left: FundHistoryPoint[],
  right: FundHistoryPoint[],
  window: number,
): DatedValue[] => {
  const returns = alignedReturns(left, right)
  const output: DatedValue[] = []
  for (let index = window - 1; index < returns.length; index += 1) {
    const value = pearson(returns.slice(index - window + 1, index + 1))
    const point = returns[index]
    if (value !== null && point) output.push({ date: point.date, value })
  }
  return output
}
