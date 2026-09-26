import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'
const jiti = createJiti(import.meta.url)
const { emptyPortfolioReview, parsePortfolioReview, calculatePortfolioReview } = jiti(
  '../src/utils/portfolio-review.ts',
)
const point = (date, amount, category = 'funds') => ({
  id: date,
  date,
  holdings: [{ id: 'position', name: 'Portfolio', category, amount }],
  notes: '',
})
const flow = (date, amount, kind = 'deposit', id = date) => ({ id, date, kind, amount, notes: '' })
const record = (snapshots = [], flows = []) => ({ ...emptyPortfolioReview(), snapshots, flows })
const close = (actual, expected) =>
  assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`)

test('portfolio parsing rejects malformed imports, duplicate days, mixed data and unsafe monetary precision', () => {
  const data = record([point('2026-09-01', 100)], [flow('2026-09-05', 10)])
  assert.deepEqual(parsePortfolioReview(JSON.stringify(data)), data)
  assert.deepEqual(calculatePortfolioReview(emptyPortfolioReview()).series, [])
  for (const value of [
    null,
    {},
    { ...data, version: 2 },
    { ...data, currency: ['USD'] },
    { ...data, currency: 'BTC' },
    { ...data, extra: true },
    record([point('2026-02-30', 100)]),
    record([point('2026-09-01', NaN)]),
    record([point('2026-09-01', -1)]),
    record([point('2026-09-01', 0.001)]),
    record([point('2026-09-01', 1e12 + 1)]),
    record([point('2026-09-01', 100, 'unknown')]),
    record([point('2026-09-01', 100), { ...point('2026-09-01', 200), id: 'different' }]),
    record([point('2026-09-01', 100)], [flow('2026-09-03', 0)]),
    record([], [flow('2026-09-03', 1e12), flow('2026-09-04', 0.01)]),
    record([
      {
        ...point('2026-09-01', 100),
        holdings: [point('2026-09-01', 100).holdings[0], point('2026-09-01', 100).holdings[0]],
      },
    ]),
  ])
    assert.throws(() => parsePortfolioReview(JSON.stringify(value)))
  assert.throws(() => parsePortfolioReview('{bad'))
  assert.equal(calculatePortfolioReview(record([point('2026-09-01', 100)])).returnPct, null)
  assert.equal(calculatePortfolioReview(record([point('2026-09-01', 100)])).maxDrawdownPct, null)
})

test('Modified Dietz weights end-of-day external flows while excluding opening-day and out-of-range flows', () => {
  // A 10-day interval: deposit 100 halfway, final value 220 => profit 20 / weighted capital 150.
  const data = record(
    [point('2026-09-01', 100), point('2026-09-11', 220)],
    [flow('2026-09-06', 100), flow('2026-09-01', 5), flow('2026-09-12', 8)],
  )
  const before = JSON.stringify(data)
  const result = calculatePortfolioReview(data)
  assert.equal(result.profit, 20)
  assert.equal(result.netContributions, 100)
  assert.equal(result.excludedFlowCount, 2)
  assert.equal(result.periods[0].weightedCapital, 150)
  close(result.returnPct, (20 / 150) * 100)
  assert.equal(JSON.stringify(data), before)
  const terminal = calculatePortfolioReview(
    record([point('2026-09-01', 100), point('2026-09-11', 220)], [flow('2026-09-11', 100)]),
  )
  assert.equal(terminal.periods[0].weightedCapital, 100)
  close(terminal.returnPct, 20)
  const zeroStart = calculatePortfolioReview(
    record([point('2026-09-01', 0), point('2026-09-11', 110)], [flow('2026-09-06', 100)]),
  )
  close(zeroStart.returnPct, 20)
  // GIPS handbook end-of-day cash-flow example: June 6 withdrawal and June 11 deposit.
  const handbook = calculatePortfolioReview(
    record(
      [point('2026-05-31', 100000), point('2026-06-30', 135000)],
      [flow('2026-06-06', 2000, 'withdrawal'), flow('2026-06-11', 20000)],
    ),
  )
  close(handbook.periods[0].weightedCapital, 111066.66666666667)
  close(handbook.returnPct, 15.306122448979592)
})

test('linked estimated returns and observed drawdowns ignore deposits and retain economic losses', () => {
  const result = calculatePortfolioReview(
    record([point('2026-09-21', 90), point('2026-09-01', 100), point('2026-09-11', 120)]),
  )
  close(result.returnPct, -10)
  close(result.maxDrawdownPct, -25)
  assert.equal(result.profit, -10)
  const deposit = calculatePortfolioReview(
    record([point('2026-09-01', 100), point('2026-09-11', 200)], [flow('2026-09-11', 100)]),
  )
  close(deposit.returnPct, 0)
  close(deposit.maxDrawdownPct, 0)
  assert.equal(deposit.profit, 0)
  const withdraw = calculatePortfolioReview(
    record(
      [point('2026-09-01', 100), { id: 'empty', date: '2026-09-11', holdings: [], notes: '' }],
      [flow('2026-09-11', 100, 'withdrawal')],
    ),
  )
  close(withdraw.returnPct, 0)
  close(withdraw.maxDrawdownPct, 0)
  assert.equal(withdraw.latestValue, 0)
  const wipeout = calculatePortfolioReview(
    record([point('2026-09-01', 100), point('2026-09-11', 0)]),
  )
  assert.equal(wipeout.returnPct, -100)
  assert.equal(wipeout.maxDrawdownPct, -100)
})

test('unusable periods break the cumulative series rather than silently restarting the return base', () => {
  const result = calculatePortfolioReview(
    record(
      [point('2026-09-01', 0), point('2026-09-11', 100), point('2026-09-21', 110)],
      [flow('2026-09-11', 100)],
    ),
  )
  assert.equal(result.periods[0].issue, 'nonpositive-capital')
  assert.equal(result.returnPct, null)
  assert.equal(result.maxDrawdownPct, null)
  close(result.periods[1].returnPct, 10)
  assert.equal(result.series[2].index, null)
  assert.equal(result.profit, 10)
  const belowMinus100 = calculatePortfolioReview(
    record([point('2026-09-01', 100), point('2026-09-11', 0)], [flow('2026-09-11', 100)]),
  )
  assert.equal(belowMinus100.periods[0].issue, 'return-below-minus100')
  assert.equal(belowMinus100.returnPct, null)
})

test('allocation compares the latest two dates and monetary subtraction retains exact cents at large amounts', () => {
  const data = record([
    point('2026-09-01', 100, 'funds'),
    {
      ...point('2026-09-11', 50, 'cash'),
      holdings: [
        { id: 'cash', name: 'Cash', category: 'cash', amount: 50 },
        { id: 'fund', name: 'Fund', category: 'funds', amount: 150 },
      ],
    },
  ])
  const result = calculatePortfolioReview(data)
  assert.deepEqual(result.allocation, [
    { category: 'cash', amount: 50, weightPct: 25, previousWeightPct: 0 },
    { category: 'funds', amount: 150, weightPct: 75, previousWeightPct: 100 },
  ])
  const tiny = calculatePortfolioReview(
    record([point('2026-09-01', 999999999.98), point('2026-09-11', 999999999.99)]),
  )
  assert.equal(tiny.profit, 0.01)
  const flowCancellation = calculatePortfolioReview(
    record(
      [point('2026-09-01', 100), point('2026-09-11', 100.01)],
      [
        flow('2026-09-11', 999999999.99, 'deposit', 'in'),
        flow('2026-09-11', 999999999.98, 'withdrawal', 'out'),
      ],
    ),
  )
  assert.equal(flowCancellation.netContributions, 0.01)
  assert.equal(flowCancellation.profit, 0)
})
