import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url, {
  alias: { '@': new URL('../src', import.meta.url).pathname },
})
const {
  calculateHoldingConcentration,
  buildIndexDcaCsv,
  compareIndexDcaPlans,
  compareIndexProfiles,
  compareLeaderPeriods,
  normalizePerformanceSeries,
  simulateIndexDca,
} = jiti('../src/utils/us-indexes.ts')

test('定投明细CSV同时保留汇总、实际成交日、价格和费用', () => {
  const result = simulateIndexDca({
    symbol: 'QQQ',
    startDate: '2026-01-01',
    endDate: '2026-02-01',
    contributionAmount: 100,
    frequency: 'monthly',
    dayOfMonth: 1,
    executionRule: 'next-trading-day',
    reinvestDividends: false,
    annualExpenseRatioPct: 0.18,
    purchaseFeePct: 1,
    prices: [
      { date: '2026-01-02', close: 100 },
      { date: '2026-02-02', close: 110 },
    ],
  })
  const csv = buildIndexDcaCsv(result)

  assert.ok(csv.startsWith('\uFEFFmetric,value\n'))
  assert.match(csv, /symbol,QQQ/)
  assert.match(csv, /purchase_date,contribution,invested_amount,transaction_fee,price,shares/)
  assert.match(csv, /2026-01-02,100,99,1,100,0.99/)
})

test('四资产定投对照使用共同可投资区间并按期末资产排序', () => {
  const comparison = compareIndexDcaPlans({
    startDate: '2020-01-01',
    endDate: '2020-03-31',
    contributionAmount: 100,
    dayOfMonth: 1,
    executionRule: 'next-trading-day',
    reinvestDividends: true,
    products: [
      {
        id: 'older',
        symbol: 'OLD',
        annualExpenseRatioPct: 0.1,
        prices: [
          { date: '2020-01-01', close: 100 },
          { date: '2020-02-01', close: 100 },
          { date: '2020-03-01', close: 100 },
          { date: '2020-03-31', close: 100 },
        ],
      },
      {
        id: 'newer',
        symbol: 'NEW',
        annualExpenseRatioPct: 0,
        prices: [
          { date: '2020-02-01', close: 100 },
          { date: '2020-03-01', close: 200 },
          { date: '2020-03-31', close: 200 },
        ],
      },
    ],
  })

  assert.equal(comparison.commonStartDate, '2020-02-01')
  assert.equal(comparison.commonEndDate, '2020-03-31')
  assert.equal(comparison.comparableCashFlows, true)
  assert.deepEqual(
    comparison.results.map((item) => item.id),
    ['newer', 'older'],
  )
  assert.deepEqual(
    comparison.results.map((item) => item.result.totalContributed),
    [200, 200],
  )
})

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

  assert.deepEqual(
    result.purchases.map((purchase) => purchase.date),
    ['2026-01-01', '2026-01-30'],
  )
  assert.equal(result.shares, 4)
  assert.equal(result.endingValue, 200)
  assert.equal(result.totalReturnPct, 0)
  assert.equal(result.annualizedMoneyWeightedReturnPct, 0)
})

test('定投从每期预算扣除交易费并对股息税和退出费分别记账', () => {
  const result = simulateIndexDca({
    symbol: 'QQQ',
    startDate: '2026-01-01',
    endDate: '2026-02-01',
    contributionAmount: 100,
    frequency: 'monthly',
    dayOfMonth: 1,
    executionRule: 'next-trading-day',
    reinvestDividends: true,
    annualExpenseRatioPct: 0.18,
    purchaseFeePct: 1,
    purchaseFeeFixed: 1,
    dividendTaxPct: 15,
    liquidationFeePct: 0.5,
    prices: [
      { date: '2026-01-01', close: 100 },
      { date: '2026-02-01', close: 100, dividendPerShare: 10 },
    ],
  })

  assert.equal(result.totalContributed, 200)
  assert.equal(result.totalInvested, 196)
  assert.equal(result.totalPurchaseFees, 4)
  assert.equal(result.grossDividends, 9.8)
  assert.equal(result.dividendTaxes, 1.47)
  assert.equal(result.netDividends, 8.33)
  assert.equal(result.reinvestedDividends, 8.33)
  assert.equal(result.endingMarketValue, 204.33)
  assert.equal(result.estimatedLiquidationFee, 1.02)
  assert.equal(result.endingValue, 203.31)
  assert.equal(result.gain, 3.31)
  assert.ok(result.annualizedMoneyWeightedReturnPct > result.totalReturnPct)
})

test('定投拒绝会耗尽单期预算的交易费用', () => {
  assert.throws(() =>
    simulateIndexDca({
      symbol: 'BTC-USD',
      startDate: '2026-01-01',
      endDate: '2026-01-01',
      contributionAmount: 100,
      frequency: 'monthly',
      dayOfMonth: 1,
      executionRule: 'next-trading-day',
      reinvestDividends: false,
      annualExpenseRatioPct: 0,
      purchaseFeePct: 10,
      purchaseFeeFixed: 90,
      prices: [{ date: '2026-01-01', close: 100 }],
    }),
  )
})

test('额外年化托管费按持有天数扣减份额并单独披露', () => {
  const result = simulateIndexDca({
    symbol: 'BTC-USD',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    contributionAmount: 100,
    frequency: 'monthly',
    dayOfMonth: 1,
    executionRule: 'next-trading-day',
    reinvestDividends: false,
    annualExpenseRatioPct: 0,
    annualCustodyFeePct: 10,
    prices: [
      { date: '2026-01-01', close: 100 },
      { date: '2026-12-31', close: 100 },
    ],
  })

  assert.equal(result.totalContributed, 1200)
  assert.ok(result.totalCustodyFees > 9.9 && result.totalCustodyFees < 10.1)
  assert.ok(result.shares < 12)
  assert.ok(result.endingValue < result.totalContributed)
  assert.equal(result.annualCustodyFeePct, 10)
})

test('四资产收益曲线从共同起点归一到100并在休市日延续上一收盘值', () => {
  const result = normalizePerformanceSeries(
    [
      {
        id: 'ETF',
        points: [
          { date: '2026-01-02', close: 10 },
          { date: '2026-01-05', close: 11 },
        ],
      },
      {
        id: 'BTC',
        points: [
          { date: '2026-01-02', close: 20 },
          { date: '2026-01-03', close: 22 },
          { date: '2026-01-05', close: 18 },
        ],
      },
    ],
    '2026-01-02',
    '2026-01-05',
  )

  assert.deepEqual(result.dates, ['2026-01-02', '2026-01-03', '2026-01-05'])
  assert.deepEqual(result.series[0], { id: 'ETF', values: [100, 100, 110] })
  assert.deepEqual(result.series[1], { id: 'BTC', values: [100, 110, 90] })
})
