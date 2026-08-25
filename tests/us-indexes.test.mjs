import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url, {
  alias: { '@': new URL('../src', import.meta.url).pathname },
})
const {
  calculateHoldingConcentration,
  compareIndexProfiles,
  compareLeaderPeriods,
  simulateIndexDca,
} = jiti('../src/utils/us-indexes.ts')

test('成分集中度按权重降序计算前十大覆盖率而不把剩余成分伪装成零', () => {
  const result = calculateHoldingConcentration(
    [
      { ticker: 'B', weightPct: 18 },
      { ticker: 'A', weightPct: 24 },
      { ticker: 'C', weightPct: 12 },
    ],
    3,
  )

  assert.deepEqual(
    result.topHoldings.map((holding) => holding.ticker),
    ['A', 'B', 'C'],
  )
  assert.equal(result.topWeightPct, 54)
  assert.equal(result.remainderWeightPct, 46)
})

test('指数对照保留 ETF 与指数的产品类型差异', () => {
  const result = compareIndexProfiles(
    {
      id: 'qqq',
      productType: 'ETF',
      constituentCount: 100,
      top10WeightPct: 51.2,
      technologyWeightPct: 63.1,
    },
    {
      id: 'sp500',
      productType: 'Index',
      constituentCount: 503,
      top10WeightPct: 36.4,
      technologyWeightPct: 34.5,
    },
  )

  assert.equal(result.concentrationDifferencePctPoints, 14.8)
  assert.equal(result.technologyDifferencePctPoints, 28.6)
  assert.equal(result.sameProductType, false)
})

test('定投顺延到下一个交易日并分别核算投入、分红和嵌入费率', () => {
  const result = simulateIndexDca({
    symbol: 'QQQ',
    startDate: '2026-01-01',
    endDate: '2026-03-03',
    contributionAmount: 100,
    frequency: 'monthly',
    dayOfMonth: 1,
    executionRule: 'next-trading-day',
    reinvestDividends: false,
    annualExpenseRatioPct: 0.18,
    prices: [
      { date: '2026-01-02', close: 100, dividendPerShare: 0 },
      { date: '2026-02-03', close: 100, dividendPerShare: 10 },
      { date: '2026-03-03', close: 110, dividendPerShare: 0 },
    ],
  })

  assert.deepEqual(
    result.purchases.map((purchase) => purchase.date),
    ['2026-01-02', '2026-02-03', '2026-03-03'],
  )
  assert.equal(result.totalContributed, 300)
  assert.equal(result.cashDividends, 10)
  assert.equal(result.endingValue, 330)
  assert.equal(result.totalReturnPct, 10)
  assert.equal(result.expenseTreatment, 'embedded-in-market-price')
})

test('每期龙头对照逐期复利且不会用下一期名单回填上一期', () => {
  const result = compareLeaderPeriods([
    {
      snapshotDate: '2026-03-31',
      endDate: '2026-06-30',
      leaders: [
        { ticker: 'A', totalReturnPct: 10 },
        { ticker: 'B', totalReturnPct: 0 },
      ],
      benchmarkTotalReturnPct: 4,
    },
    {
      snapshotDate: '2026-06-30',
      endDate: '2026-09-30',
      leaders: [
        { ticker: 'C', totalReturnPct: -2 },
        { ticker: 'D', totalReturnPct: 2 },
      ],
      benchmarkTotalReturnPct: 1,
    },
  ])

  assert.deepEqual(
    result.periods.map((period) => period.leaderTickers),
    [
      ['A', 'B'],
      ['C', 'D'],
    ],
  )
  assert.equal(result.leaderCompoundedReturnPct, 5)
  assert.equal(result.benchmarkCompoundedReturnPct, 5.04)
  assert.equal(result.excessReturnPctPoints, -0.04)
  assert.equal(result.outperformed, false)
})

test('定投支持前移交易日、开盘价和拆股且拆股本身不制造收益', () => {
  const result = simulateIndexDca({
    symbol: 'SPY',
    startDate: '2026-01-01',
    endDate: '2026-02-01',
    contributionAmount: 100,
    frequency: 'monthly',
    dayOfMonth: 1,
    executionRule: 'previous-trading-day',
    purchasePrice: 'open',
    reinvestDividends: false,
    annualExpenseRatioPct: 0.0945,
    prices: [
      { date: '2026-01-01', open: 100, close: 100 },
      { date: '2026-01-30', open: 50, close: 50, splitRatio: 2 },
    ],
  })

  assert.deepEqual(result.purchases.map((purchase) => purchase.date), ['2026-01-01', '2026-01-30'])
  assert.equal(result.shares, 4)
  assert.equal(result.endingValue, 200)
  assert.equal(result.totalReturnPct, 0)
})
