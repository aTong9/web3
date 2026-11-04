import source from '../data/china-city-housing-assumption-2020.json' with { type: 'json' }

export const estimateCityHousingUnits = (population: number, unitsPerHousehold: number) => {
  if (
    !Number.isFinite(population) ||
    population <= 0 ||
    !Number.isFinite(unitsPerHousehold) ||
    unitsPerHousehold <= 0
  )
    return null
  const units =
    (population * source.familyHouseholds * unitsPerHousehold) / source.mainlandPopulation
  return Number.isFinite(units) && units > 0 ? units : null
}
