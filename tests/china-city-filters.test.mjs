import assert from 'node:assert/strict'
import test from 'node:test'
import { inBand, matchesCityFilters } from '../src/utils/china-city-filters.ts'

const all = {
  search: '',
  province: '',
  population: '',
  gdp: '',
  resale: '',
  rent: '',
  rentIncomeRatio: '',
  grossYield: '',
  populationChange: '',
  complete: false,
}
const city = {
  rank: 8,
  name: '甲市',
  province: '甲省',
  population: 5_000_000,
  gdp: 10_000,
  resale: 20_000,
  rent: 40,
  income: 60_000,
  rentIncomeRatio: 0.24,
  grossYield: 2.4,
  populationChange: 0,
}

test('bands include each lower bound once and exclude missing values when active', () => {
  for (const [value, expected] of [
    [999_999, '0'],
    [1_000_000, '1'],
    [5_000_000, '2'],
    [10_000_000, '3'],
  ]) {
    assert.equal(inBand(value, expected, [1_000_000, 5_000_000, 10_000_000]), true)
    assert.equal(
      inBand(value, String(Number(expected) + 1), [1_000_000, 5_000_000, 10_000_000]),
      false,
    )
  }
  assert.equal(inBand(undefined, '', [20, 40]), true)
  assert.equal(inBand(undefined, '0', [20, 40]), false)
  assert.equal(inBand(Number.NaN, '0', [20, 40]), false)
  assert.equal(inBand(0.3, '2', [0.2, 0.3]), true)
})

test('filters combine without changing national rank or treating missing data as complete', () => {
  const cities = [{ ...city, rank: 3, name: '乙市', rent: undefined }, city]
  assert.deepEqual(
    cities.filter((item) => matchesCityFilters(item, all)).map((item) => item.rank),
    [3, 8],
  )
  assert.deepEqual(
    cities
      .filter((item) =>
        matchesCityFilters(item, {
          ...all,
          province: '甲省',
          population: '2',
          gdp: '2',
          rent: '2',
          complete: true,
        }),
      )
      .map((item) => item.rank),
    [8],
  )
  assert.equal(matchesCityFilters(city, { ...all, populationChange: 'same' }), true)
  assert.equal(matchesCityFilters(city, { ...all, populationChange: 'growth' }), false)
  assert.equal(
    matchesCityFilters({ ...city, populationChange: null }, { ...all, complete: true }),
    false,
  )
  assert.equal(
    matchesCityFilters({ ...city, income: Number.NaN }, { ...all, complete: true }),
    false,
  )
  assert.equal(matchesCityFilters({ ...city, rent: undefined }, { ...all, rent: '0' }), false)
  assert.equal(matchesCityFilters(city, { ...all, search: '乙' }), false)
})
