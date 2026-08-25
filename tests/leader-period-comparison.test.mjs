import assert from 'node:assert/strict'
import test from 'node:test'
import { buildLeaderPeriodComparison } from '../scripts/lib/leader-period-comparison.mjs'

const snapshot = (period, capturedAt, leaders) => ({
  period,
  capturedAt,
  indexes: ['qqq', 'sp500'].map((id) => ({
    id,
    benchmarkTicker: id === 'qqq' ? 'QQQ' : 'SPY',
    leaders: leaders.map((leader, index) => ({
      rank: index + 1,
      ticker: `${id}-${leader.ticker}`,
      name: leader.ticker,
      weightPct: leader.weightPct,
    })),
  })),
})

const leaders = Array.from({ length: 10 }, (_, index) => ({
  ticker: `L${index + 1}`,
  weightPct: 10 - index / 2,
}))

test('leader comparison uses only closes after the first archive and before the next archive', () => {
  const previous = snapshot('2026-01', '2026-01-10T12:00:00.000Z', leaders)
  const current = snapshot('2026-02', '2026-02-10T12:00:00.000Z', leaders)
  const seriesBySymbol = {}
  for (const index of previous.indexes) {
    seriesBySymbol[index.benchmarkTicker] = [
      { date: '2026-01-10', adjClose: 50 },
      { date: '2026-01-12', adjClose: 100 },
      { date: '2026-02-09', adjClose: 105 },
      { date: '2026-02-10', adjClose: 500 },
    ]
    index.leaders.forEach((leader, position) => {
      seriesBySymbol[leader.ticker] = [
        { date: '2026-01-10', adjClose: 10 },
        { date: '2026-01-12', adjClose: 100 },
        { date: '2026-02-09', adjClose: 110 + position },
        { date: '2026-02-10', adjClose: 1 },
      ]
    })
  }

  const result = buildLeaderPeriodComparison(previous, current, seriesBySymbol, 0.2)
  assert.equal(result.indexes[0].startDate, '2026-01-12')
  assert.equal(result.indexes[0].endDate, '2026-02-09')
  const topOne = result.indexes[0].strategies.find(
    (strategy) => strategy.size === 1 && strategy.weighting === 'equal',
  )
  assert.equal(topOne.netReturnPct, 9.8)
  assert.equal(topOne.benchmarkNetReturnPct, 4.8)
  assert.equal(topOne.excessReturnPctPoints, 5)
  assert.equal(topOne.outperformed, true)
})

test('leader comparison distinguishes equal weighting from archived official weighting', () => {
  const previous = snapshot('2026-01', '2026-01-01T00:00:00.000Z', leaders)
  const current = snapshot('2026-02', '2026-02-01T00:00:00.000Z', leaders)
  const seriesBySymbol = {}
  for (const index of previous.indexes) {
    seriesBySymbol[index.benchmarkTicker] = [
      { date: '2026-01-02', adjClose: 100 },
      { date: '2026-01-30', adjClose: 100 },
    ]
    index.leaders.forEach((leader, position) => {
      seriesBySymbol[leader.ticker] = [
        { date: '2026-01-02', adjClose: 100 },
        { date: '2026-01-30', adjClose: position === 0 ? 200 : 100 },
      ]
    })
  }
  const result = buildLeaderPeriodComparison(previous, current, seriesBySymbol, 0)
  const strategies = result.indexes[0].strategies.filter((strategy) => strategy.size === 3)
  assert.notEqual(strategies[0].netReturnPct, strategies[1].netReturnPct)
})

test('leader comparison refuses an incomplete common trading window', () => {
  const previous = snapshot('2026-01', '2026-01-01T00:00:00.000Z', leaders)
  const current = snapshot('2026-02', '2026-02-01T00:00:00.000Z', leaders)
  assert.throws(() => buildLeaderPeriodComparison(previous, current, {}, 0.2))
})

