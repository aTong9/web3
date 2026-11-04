import assert from 'node:assert/strict'
import test from 'node:test'
import cities from '../src/data/china-city-population-2020.json' with { type: 'json' }
import model from '../src/data/china-city-housing-assumption-2020.json' with { type: 'json' }
import { estimateCityHousingUnits } from '../src/utils/china-city-housing.ts'

test('city housing estimate uses census totals and one explicit national assumption', () => {
  assert.equal(model.mainlandPopulation, 1411778724)
  assert.equal(model.familyHouseholdPopulation, 1292809300)
  assert.equal(model.familyHouseholds, 494157423)
  assert.equal(model.defaultUnitsPerHousehold, 1.08)
  assert.equal(model.familyHouseholdPopulation + 118969424, model.mainlandPopulation)

  const units = cities.map(([, , population]) =>
    estimateCityHousingUnits(population, model.defaultUnitsPerHousehold),
  )
  assert.equal(units.length, 337)
  assert.ok(units.every((value) => Number.isFinite(value) && value > 0))
  assert.ok(
    cities.every(
      ([, , population], index) =>
        Math.abs(
          population / units[index] -
            model.mainlandPopulation / (model.familyHouseholds * model.defaultUnitsPerHousehold),
        ) < 1e-10,
    ),
  )
  assert.equal(estimateCityHousingUnits(1000, 0), null)
  assert.equal(estimateCityHousingUnits(1000, -1), null)
  assert.equal(estimateCityHousingUnits(1000, Number.NaN), null)
})
