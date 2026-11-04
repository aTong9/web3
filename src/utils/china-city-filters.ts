export interface CityFilterFields {
  name: string
  province: string
  population: number
  gdp?: number
  resale?: number
  rent?: number
  income?: number
  rentIncomeRatio: number | null
  grossYield: number | null
  populationChange: number | null
}

export interface CityFilters {
  search: string
  province: string
  population: string
  gdp: string
  resale: string
  rent: string
  rentIncomeRatio: string
  grossYield: string
  populationChange: string
  complete: boolean
}

// Bands are ascending and half-open; the last band includes its lower bound.
export const inBand = (value: number | null | undefined, band: string, edges: number[]) =>
  !band ||
  (Number(band) >= 0 &&
    Number(band) <= edges.length &&
    value != null &&
    Number.isFinite(value) &&
    value >= (edges[Number(band) - 1] ?? -Infinity) &&
    value < (edges[Number(band)] ?? Infinity))

export const matchesCityFilters = (city: CityFilterFields, filters: CityFilters) => {
  const term = filters.search.trim().toLowerCase()
  return (
    (!filters.province || city.province === filters.province) &&
    (!term ||
      city.name.toLowerCase().includes(term) ||
      city.province.toLowerCase().includes(term)) &&
    (!filters.complete ||
      (Number.isFinite(city.gdp) &&
        Number.isFinite(city.income) &&
        Number.isFinite(city.resale) &&
        Number.isFinite(city.rent) &&
        Number.isFinite(city.populationChange))) &&
    inBand(city.population, filters.population, [1_000_000, 5_000_000, 10_000_000]) &&
    inBand(city.gdp, filters.gdp, [5_000, 10_000]) &&
    inBand(city.resale, filters.resale, [10_000, 20_000, 40_000]) &&
    inBand(city.rent, filters.rent, [20, 40, 60]) &&
    inBand(city.rentIncomeRatio, filters.rentIncomeRatio, [0.2, 0.3]) &&
    inBand(city.grossYield, filters.grossYield, [2, 3]) &&
    (!filters.populationChange ||
      (city.populationChange !== null &&
        Number.isFinite(city.populationChange) &&
        (filters.populationChange === 'growth'
          ? city.populationChange > 0
          : filters.populationChange === 'decline'
            ? city.populationChange < 0
            : city.populationChange === 0)))
  )
}
