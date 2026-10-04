import demographyData from '@/data/china-demography.json'

export type ChinaScenario = 'low' | 'medium' | 'high'

export interface ChinaHousingAssumptions {
  householdSize2025: number
  householdSize2125: number
  familyHouseholdPopulationShare: number
  urbanizationCeilingPercent: number
  initialUnitsPerHousehold: number
  targetUnitsPerHousehold: number
  annualRetirementRatePercent: number
  annualSupplyResponsePercent: number
  averageUnitAreaM2: number
}

export interface ChinaAnnualProjection {
  year: number
  scenario: ChinaScenario
  populationBasis:
    | 'un-wpp-2024-low'
    | 'un-wpp-2024-medium'
    | 'un-wpp-2024-high'
    | 'custom-extension'
  populationWan: number
  birthsWan: number
  deathsWan: number
  netMigrationWan: number
  age0to15Wan: number
  age16to59Wan: number
  age60to64Wan: number
  age65PlusWan: number
  urbanPopulationWan: number
  urbanizationPercent: number
  householdSize: number
  householdsWan: number
  residentialUnitsWan: number
  unitsAddedWan: number
  unitsRetiredWan: number
  residentialFloorAreaBillionM2: number
  unitsMinusHouseholdsWan: number
}

export const CHINA_DEMOGRAPHY_SOURCES = demographyData.sources
export const CHINA_2025_OFFICIAL = demographyData.official2025
export const CHINA_2025_HOUSEHOLD_SAMPLE = demographyData.sample2025

export const DEFAULT_CHINA_HOUSING_ASSUMPTIONS: ChinaHousingAssumptions = {
  householdSize2025: demographyData.sample2025.averageFamilyHouseholdSize,
  householdSize2125: 2.1,
  familyHouseholdPopulationShare:
    demographyData.sample2025.familyHouseholdPopulationWan /
    demographyData.sample2025.populationWan,
  urbanizationCeilingPercent: 85,
  initialUnitsPerHousehold: 1.08,
  targetUnitsPerHousehold: 1.08,
  annualRetirementRatePercent: 0.6,
  annualSupplyResponsePercent: 12,
  averageUnitAreaM2: 90,
}

type AgeBands = {
  age0to15Wan: number
  age16to59Wan: number
  age60to64Wan: number
  age65PlusWan: number
}

const round = (value: number, digits = 2): number => Number(value.toFixed(digits))
const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

function validateAssumptions(value: ChinaHousingAssumptions): ChinaHousingAssumptions {
  for (const [name, number] of Object.entries(value)) {
    if (!Number.isFinite(number)) throw new RangeError(`${name} must be finite`)
  }
  if (value.householdSize2025 <= 0 || value.householdSize2125 <= 0) {
    throw new RangeError('Household size must be positive')
  }
  if (value.familyHouseholdPopulationShare <= 0 || value.familyHouseholdPopulationShare > 1) {
    throw new RangeError('Family household population share must be within (0, 1]')
  }
  if (
    value.urbanizationCeilingPercent < CHINA_2025_OFFICIAL.urbanizationPercent ||
    value.urbanizationCeilingPercent > 100
  ) {
    throw new RangeError('Urbanization ceiling must be between the 2025 rate and 100')
  }
  if (value.initialUnitsPerHousehold <= 0 || value.targetUnitsPerHousehold <= 0) {
    throw new RangeError('Units per household must be positive')
  }
  if (
    value.annualRetirementRatePercent < 0 ||
    value.annualRetirementRatePercent > 100 ||
    value.annualSupplyResponsePercent < 0 ||
    value.annualSupplyResponsePercent > 100 ||
    value.averageUnitAreaM2 <= 0
  ) {
    throw new RangeError('Housing rates must be 0–100 and area must be positive')
  }
  return value
}

// Illustrative wide-band transitions; WPP does not supply these age series in the bundled table.
function nextAgeBands(
  previous: AgeBands,
  birthsWan: number,
  deathsWan: number,
  netMigrationWan: number,
  targetPopulationWan: number,
): AgeBands {
  const mortalityWeights = [
    previous.age0to15Wan * 0.0005,
    previous.age16to59Wan * 0.002,
    previous.age60to64Wan * 0.006,
    previous.age65PlusWan * 0.04,
  ]
  const totalWeight = mortalityWeights.reduce((sum, weight) => sum + weight, 0)
  const deaths = mortalityWeights.map((weight) => (deathsWan * weight) / totalWeight)
  const move16 = previous.age0to15Wan / 16
  const move60 = previous.age16to59Wan / 44
  const move65 = previous.age60to64Wan / 5
  const bands = [
    previous.age0to15Wan + birthsWan - (deaths[0] ?? 0) - move16 + netMigrationWan * 0.15,
    previous.age16to59Wan + move16 - (deaths[1] ?? 0) - move60 + netMigrationWan * 0.75,
    previous.age60to64Wan + move60 - (deaths[2] ?? 0) - move65 + netMigrationWan * 0.05,
    previous.age65PlusWan + move65 - (deaths[3] ?? 0) + netMigrationWan * 0.05,
  ].map((value) => Math.max(0, value))
  const scale = targetPopulationWan / bands.reduce((sum, value) => sum + value, 0)
  return {
    age0to15Wan: (bands[0] ?? 0) * scale,
    age16to59Wan: (bands[1] ?? 0) * scale,
    age60to64Wan: (bands[2] ?? 0) * scale,
    age65PlusWan: (bands[3] ?? 0) * scale,
  }
}

/**
 * Annual 2026–2125 views. All three variants through 2100 are UN WPP 2024;
 * all years after 2100 are explicitly illustrative extensions.
 */
export function projectChinaDemography(
  scenario: ChinaScenario = 'medium',
  overrides: Partial<ChinaHousingAssumptions> = {},
): ChinaAnnualProjection[] {
  if (!['low', 'medium', 'high'].includes(scenario)) throw new RangeError('Unknown scenario')
  const assumptions = validateAssumptions({ ...DEFAULT_CHINA_HOUSING_ASSUMPTIONS, ...overrides })
  const wpp =
    scenario === 'low'
      ? demographyData.wpp2024Low
      : scenario === 'high'
        ? demographyData.wpp2024High
        : demographyData.wpp2024Medium
  // The 2025 NBS level and the WPP 2024 vintage differ. Retain the UN level unchanged.
  const firstWppYear = wpp[0]
  if (!firstWppYear) throw new Error('WPP China series is empty')
  let populationWan = firstWppYear.populationJan1Wan
  const initialScale = populationWan / CHINA_2025_OFFICIAL.populationWan
  let ages: AgeBands = {
    age0to15Wan: CHINA_2025_OFFICIAL.age0to15Wan * initialScale,
    age16to59Wan: CHINA_2025_OFFICIAL.age16to59Wan * initialScale,
    age60to64Wan: CHINA_2025_OFFICIAL.age60to64Wan * initialScale,
    age65PlusWan: CHINA_2025_OFFICIAL.age65PlusWan * initialScale,
  }
  let residentialUnitsWan =
    CHINA_2025_HOUSEHOLD_SAMPLE.familyHouseholdsWan * assumptions.initialUnitsPerHousehold
  let urbanizationPercent = CHINA_2025_OFFICIAL.urbanizationPercent
  const rows: ChinaAnnualProjection[] = []

  for (let year = 2026; year <= 2125; year++) {
    const officialPeriod = year <= 2100
    const source = officialPeriod ? wpp[year - 2026] : wpp[wpp.length - 1]
    if (!source) throw new Error(`Missing WPP China source year ${year}`)
    let birthsWan: number
    let deathsWan: number
    let netMigrationWan: number
    let populationEndWan: number

    if (officialPeriod) {
      birthsWan = source.birthsWan
      deathsWan = source.deathsWan
      netMigrationWan = source.netMigrationWan
      // Next 1 January is the UN's year-end stock, except in its final year.
      const nextSource = wpp[year - 2025]
      populationEndWan = nextSource
        ? nextSource.populationJan1Wan
        : source.populationJan1Wan + birthsWan - deathsWan + netMigrationWan
    } else {
      // Hold each WPP variant's 2100 crude rates fixed after its published horizon.
      const rateBase = source.populationJan1Wan
      const birthRate = source.birthsWan / rateBase
      const deathRate = source.deathsWan / rateBase
      const migrationRate = source.netMigrationWan / rateBase
      birthsWan = populationWan * birthRate
      deathsWan = populationWan * deathRate
      netMigrationWan = populationWan * migrationRate
      populationEndWan = populationWan + birthsWan - deathsWan + netMigrationWan
    }

    ages = nextAgeBands(ages, birthsWan, deathsWan, netMigrationWan, populationEndWan)
    const progress = (year - 2025) / 100
    const householdSize =
      assumptions.householdSize2025 +
      (assumptions.householdSize2125 - assumptions.householdSize2025) * progress
    const householdsWan =
      (populationEndWan * assumptions.familyHouseholdPopulationShare) / householdSize
    urbanizationPercent += (assumptions.urbanizationCeilingPercent - urbanizationPercent) * 0.03
    const unitsRetiredWan = (residentialUnitsWan * assumptions.annualRetirementRatePercent) / 100
    const targetUnitsWan = householdsWan * assumptions.targetUnitsPerHousehold
    const unitsAddedWan = Math.max(
      0,
      unitsRetiredWan +
        ((targetUnitsWan - residentialUnitsWan) * assumptions.annualSupplyResponsePercent) / 100,
    )
    residentialUnitsWan = Math.max(0, residentialUnitsWan - unitsRetiredWan + unitsAddedWan)

    rows.push({
      year,
      scenario,
      populationBasis: officialPeriod ? `un-wpp-2024-${scenario}` : 'custom-extension',
      populationWan: round(populationEndWan),
      birthsWan: round(birthsWan),
      deathsWan: round(deathsWan),
      netMigrationWan: round(netMigrationWan),
      age0to15Wan: round(ages.age0to15Wan),
      age16to59Wan: round(ages.age16to59Wan),
      age60to64Wan: round(ages.age60to64Wan),
      age65PlusWan: round(ages.age65PlusWan),
      urbanPopulationWan: round((populationEndWan * urbanizationPercent) / 100),
      urbanizationPercent: round(clamp(urbanizationPercent, 0, 100)),
      householdSize: round(householdSize, 3),
      householdsWan: round(householdsWan),
      residentialUnitsWan: round(residentialUnitsWan),
      unitsAddedWan: round(unitsAddedWan),
      unitsRetiredWan: round(unitsRetiredWan),
      residentialFloorAreaBillionM2: round(
        (residentialUnitsWan * assumptions.averageUnitAreaM2) / 100000,
      ),
      unitsMinusHouseholdsWan: round(residentialUnitsWan - householdsWan),
    })
    populationWan = populationEndWan
  }
  return rows
}
