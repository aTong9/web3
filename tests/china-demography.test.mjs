import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'
import source from '../src/data/china-demography.json' with { type: 'json' }
import earlySource from '../src/data/china-demography-early.json' with { type: 'json' }
import historySource from '../src/data/china-demography-history.json' with { type: 'json' }

const jiti = createJiti(import.meta.url, {
  alias: { '@': new URL('../src', import.meta.url).pathname },
})
const {
  CHINA_HISTORICAL_YEARS,
  CHINA_2025_OFFICIAL,
  CHINA_2025_HOUSEHOLD_SAMPLE,
  DEFAULT_CHINA_HOUSING_ASSUMPTIONS,
  projectChinaDemography,
} = jiti('../src/utils/china-demography.ts')

test('1900–2026 history keeps source periods and unavailable fields distinct', () => {
  assert.equal(CHINA_HISTORICAL_YEARS.length, 127)
  assert.deepEqual(
    CHINA_HISTORICAL_YEARS.map(({ year }) => year),
    Array.from({ length: 127 }, (_, index) => 1900 + index),
  )
  assert.equal(earlySource.length, 50)
  assert.equal(historySource.length, 77)
  for (const row of CHINA_HISTORICAL_YEARS) {
    assert.equal(row.residentialUnitsWan, null)
    assert.equal(row.residentialFloorAreaBillionM2, null)
    if (row.year < 1950) {
      const sourceRow = earlySource[row.year - 1900]
      assert.equal(row.populationWan, sourceRow.populationJuly1Wan)
      assert.equal(row.populationDate, '1 July')
      assert.equal(row.basis, 'mpd-2020-estimate')
      assert.equal(row.birthsWan, null)
      assert.equal(row.deathsWan, null)
      assert.equal(row.netMigrationWan, null)
    } else {
      const sourceRow = historySource[row.year - 1950]
      assert.equal(row.populationWan, sourceRow.populationJan1Wan)
      assert.equal(row.birthsWan, sourceRow.birthsWan)
      assert.equal(row.deathsWan, sourceRow.deathsWan)
      assert.equal(row.populationDate, '1 January')
      assert.equal(
        row.basis,
        row.year <= 2023 ? 'un-wpp-2024-estimate' : 'un-wpp-2024-medium-projection',
      )
    }
  }
})

test('2025 statistical anchors and annual WPP variants retain their source values', () => {
  assert.equal(CHINA_2025_OFFICIAL.populationWan, 140489)
  assert.equal(CHINA_2025_OFFICIAL.birthsWan, 792)
  assert.equal(CHINA_2025_OFFICIAL.deathsWan, 1131)
  assert.equal(CHINA_2025_OFFICIAL.urbanizationPercent, 67.89)
  assert.equal(CHINA_2025_HOUSEHOLD_SAMPLE.familyHouseholdsWan, 51465)
  assert.equal(CHINA_2025_HOUSEHOLD_SAMPLE.familyHouseholdPopulationWan, 129685)
  assert.equal(CHINA_2025_HOUSEHOLD_SAMPLE.date, '2025-11-01')

  for (const variant of ['Low', 'Medium', 'High']) {
    const annual = source[`wpp2024${variant}`]
    assert.equal(annual.length, 75)
    assert.deepEqual(
      annual.map(({ year }) => year),
      Array.from({ length: 75 }, (_, i) => 2026 + i),
    )
    const projected = projectChinaDemography(variant.toLowerCase())
    assert.equal(projected.length, 100)
    assert.equal(projected[0].year, 2026)
    assert.equal(projected[99].year, 2125)
    for (let i = 0; i < 74; i++) {
      assert.equal(projected[i].populationWan, Number(annual[i + 1].populationJan1Wan.toFixed(2)))
      assert.equal(projected[i].birthsWan, Number(annual[i].birthsWan.toFixed(2)))
      assert.equal(projected[i].deathsWan, Number(annual[i].deathsWan.toFixed(2)))
      assert.equal(projected[i].populationBasis, `un-wpp-2024-${variant.toLowerCase()}`)
      const flowEnd =
        annual[i].populationJan1Wan +
        annual[i].birthsWan -
        annual[i].deathsWan +
        annual[i].netMigrationWan
      assert.ok(Math.abs(flowEnd - annual[i + 1].populationJan1Wan) < 0.01)
    }
    const final = annual[74]
    const end2100 =
      final.populationJan1Wan + final.birthsWan - final.deathsWan + final.netMigrationWan
    assert.equal(projected[74].populationWan, Number(end2100.toFixed(2)))
    assert.equal(projected[75].populationBasis, 'custom-extension')
    assert.ok(
      Math.abs(
        projected[75].populationWan -
          (projected[74].populationWan +
            projected[75].birthsWan -
            projected[75].deathsWan +
            projected[75].netMigrationWan),
      ) < 0.03,
    )
  }
})

test('household and residential assumptions do not change official demographic paths', () => {
  const baseline = projectChinaDemography('medium')
  const changed = projectChinaDemography('medium', {
    householdSize2125: 1.7,
    familyHouseholdPopulationShare: 0.87,
    initialUnitsPerHousehold: 1.2,
    targetUnitsPerHousehold: 1.3,
    annualRetirementRatePercent: 1.1,
    annualSupplyResponsePercent: 25,
    averageUnitAreaM2: 110,
  })
  for (let i = 0; i < baseline.length; i++) {
    for (const field of ['populationWan', 'birthsWan', 'deathsWan', 'netMigrationWan']) {
      assert.equal(changed[i][field], baseline[i][field])
    }
    assert.ok(changed[i].householdsWan > 0)
    assert.ok(changed[i].residentialUnitsWan >= 0)
    assert.ok(changed[i].unitsAddedWan >= 0)
    assert.ok(changed[i].unitsRetiredWan >= 0)
    assert.ok(changed[i].urbanizationPercent <= 100)
    const ageTotal =
      changed[i].age0to15Wan +
      changed[i].age16to59Wan +
      changed[i].age60to64Wan +
      changed[i].age65PlusWan
    assert.ok(Math.abs(ageTotal - changed[i].populationWan) < 0.03)
    const previousStock =
      i === 0
        ? CHINA_2025_HOUSEHOLD_SAMPLE.familyHouseholdsWan * 1.2
        : changed[i - 1].residentialUnitsWan
    assert.ok(
      Math.abs(
        changed[i].residentialUnitsWan -
          (previousStock - changed[i].unitsRetiredWan + changed[i].unitsAddedWan),
      ) < 0.03,
    )
  }
  assert.notEqual(changed[99].householdsWan, baseline[99].householdsWan)
  assert.notEqual(changed[99].residentialUnitsWan, baseline[99].residentialUnitsWan)
  assert.equal(DEFAULT_CHINA_HOUSING_ASSUMPTIONS.householdSize2025, 2.52)
  assert.equal(DEFAULT_CHINA_HOUSING_ASSUMPTIONS.familyHouseholdPopulationShare, 129685 / 140545)
})

test('official fertility variants remain ordered by population after 2025', () => {
  const low = projectChinaDemography('low')
  const medium = projectChinaDemography('medium')
  const high = projectChinaDemography('high')
  for (let i = 0; i < 100; i++) {
    assert.ok(low[i].populationWan < medium[i].populationWan)
    assert.ok(medium[i].populationWan < high[i].populationWan)
  }
})

test('invalid housing assumptions are rejected', () => {
  assert.throws(() => projectChinaDemography('medium', { householdSize2125: 0 }), RangeError)
  assert.throws(
    () => projectChinaDemography('medium', { familyHouseholdPopulationShare: 1.1 }),
    RangeError,
  )
  assert.throws(
    () => projectChinaDemography('medium', { annualRetirementRatePercent: -1 }),
    RangeError,
  )
})
