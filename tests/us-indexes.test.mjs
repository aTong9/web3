import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url, {
  alias: { '@': new URL('../src', import.meta.url).pathname },
})
const { calculateHoldingConcentration, compareIndexProfiles } = jiti('../src/utils/us-indexes.ts')

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
