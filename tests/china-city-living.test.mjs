import assert from 'node:assert/strict'
import test from 'node:test'
import cities from '../src/data/china-city-population-2020.json' with { type: 'json' }
import indicators from '../src/data/china-city-indicators.json' with { type: 'json' }
import living from '../src/data/china-city-living-indicators.json' with { type: 'json' }
import {
  askingGrossRentalYield,
  fiveYearPopulationChange,
  referenceRentIncomeRatio,
} from '../src/utils/china-city-living.ts'

test('living indicators match listed cities and retain source pairs', () => {
  const names = new Set(cities.map(([name]) => name))
  assert.equal(living.incomeYear, 2025)
  assert.equal(Object.keys(living.urbanDisposableIncome).length, 306)
  assert.equal(Object.keys(living.yearEndPopulationTenThousand).length, 16)
  assert.deepEqual(
    Object.keys(living.populationSources).sort(),
    Object.keys(living.yearEndPopulationTenThousand).sort(),
  )
  for (const [name, income] of Object.entries(living.urbanDisposableIncome)) {
    assert.ok(names.has(name) && Number.isFinite(income) && income > 0, name)
  }
  for (const [name, values] of Object.entries(living.yearEndPopulationTenThousand)) {
    assert.ok(names.has(name), name)
    assert.equal(values.length, 2, name)
    assert.equal(living.populationSources[name].length, 2, name)
    assert.ok(
      values.every((value) => Number.isFinite(value) && value > 0),
      name,
    )
    assert.ok(
      living.populationSources[name].every((url) => url.startsWith('https://')),
      name,
    )
  }
  assert.equal(living.urbanDisposableIncome['北京市'], 96292)
  assert.deepEqual(living.yearEndPopulationTenThousand['广州市'], [1874.03, 1910.1])
  assert.deepEqual(living.yearEndPopulationTenThousand['上海市'], [2488.36, 2485.41])
  assert.deepEqual(living.yearEndPopulationTenThousand['重庆市'], [3208.93, 3187.26])
  assert.deepEqual(living.yearEndPopulationTenThousand['南京市'], [931.97, 963.85])
  assert.deepEqual(living.yearEndPopulationTenThousand['武汉市'], [1244.77, 1386.19])
  assert.equal(
    Object.keys(indicators.rent).filter((name) => living.urbanDisposableIncome[name]).length,
    50,
  )
})

test('reference ratios calculate only from positive observed inputs', () => {
  assert.equal(referenceRentIncomeRatio(50, 60000), 0.3)
  assert.equal(referenceRentIncomeRatio(undefined, 60000), null)
  assert.equal(referenceRentIncomeRatio(50, 0), null)
  assert.equal(referenceRentIncomeRatio(Number.POSITIVE_INFINITY, 60000), null)
  assert.equal(referenceRentIncomeRatio(50, Number.NaN), null)
  assert.equal(askingGrossRentalYield(50, 20000), 3)
  assert.equal(askingGrossRentalYield(50, undefined), null)
  assert.equal(askingGrossRentalYield(-1, 20000), null)
  assert.equal(askingGrossRentalYield(50, Number.POSITIVE_INFINITY), null)
  assert.equal(fiveYearPopulationChange([100, 105]), 5)
  assert.equal(fiveYearPopulationChange([100, 95]), -5)
  assert.equal(fiveYearPopulationChange(undefined), null)
  assert.equal(fiveYearPopulationChange([0, 100]), null)
  assert.equal(fiveYearPopulationChange([100, 105, 110]), null)
  assert.equal(fiveYearPopulationChange([100, Number.NaN]), null)
})
