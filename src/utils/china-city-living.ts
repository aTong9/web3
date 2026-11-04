export const referenceRentIncomeRatio = (
  rent: number | undefined,
  annualIncome: number | undefined,
) =>
  rent &&
  annualIncome &&
  Number.isFinite(rent) &&
  Number.isFinite(annualIncome) &&
  rent > 0 &&
  annualIncome > 0
    ? (rent * 30 * 12) / annualIncome
    : null

export const askingGrossRentalYield = (rent: number | undefined, resale: number | undefined) =>
  rent && resale && Number.isFinite(rent) && Number.isFinite(resale) && rent > 0 && resale > 0
    ? (rent * 12 * 100) / resale
    : null

export const fiveYearPopulationChange = (values: number[] | undefined) => {
  const [start, end] = values ?? []
  return start &&
    end &&
    values?.length === 2 &&
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    start > 0 &&
    end > 0
    ? ((end - start) / start) * 100
    : null
}
