const round = (value, digits = 2) => {
  const rounded = Number(value.toFixed(digits))
  return Object.is(rounded, -0) ? 0 : rounded
}

const returnBetween = (points, startDate, endDate) => {
  const start = points.find((point) => point.date === startDate)?.adjClose
  const end = points.find((point) => point.date === endDate)?.adjClose
  if (!Number.isFinite(start) || start <= 0 || !Number.isFinite(end) || end <= 0)
    throw new Error(`Missing adjusted prices for ${startDate} to ${endDate}`)
  return (end / start - 1) * 100
}

const commonTradingRange = (symbols, seriesBySymbol, afterDate, beforeDate) => {
  const dateSets = symbols.map((symbol) => {
    const points = seriesBySymbol[symbol]
    if (!Array.isArray(points) || points.length < 2) throw new Error(`Missing return series for ${symbol}`)
    return new Set(
      points
        .filter(
          (point) =>
            /^\d{4}-\d{2}-\d{2}$/.test(point.date) &&
            point.date > afterDate &&
            point.date < beforeDate &&
            Number.isFinite(point.adjClose) &&
            point.adjClose > 0,
        )
        .map((point) => point.date),
    )
  })
  const commonDates = [...dateSets[0]].filter((date) =>
    dateSets.every((dates) => dates.has(date)),
  )
  commonDates.sort()
  if (commonDates.length < 2) throw new Error('Leader period has fewer than two common trading days')
  return { startDate: commonDates[0], endDate: commonDates[commonDates.length - 1] }
}

export const buildLeaderPeriodComparison = (
  previousSnapshot,
  currentSnapshot,
  seriesBySymbol,
  roundTripCostPct = 0.2,
) => {
  if (
    !/^\d{4}-\d{2}$/.test(previousSnapshot?.period ?? '') ||
    !/^\d{4}-\d{2}$/.test(currentSnapshot?.period ?? '') ||
    previousSnapshot.period >= currentSnapshot.period ||
    !Number.isFinite(roundTripCostPct) ||
    roundTripCostPct < 0
  )
    throw new Error('Invalid leader comparison period')
  const afterDate = previousSnapshot.capturedAt.slice(0, 10)
  const beforeDate = currentSnapshot.capturedAt.slice(0, 10)
  const indexes = previousSnapshot.indexes.map((previousIndex) => {
    const leaders = previousIndex.leaders.slice(0, 10)
    if (leaders.length !== 10) throw new Error(`${previousIndex.id} does not have ten archived leaders`)
    const symbols = [previousIndex.benchmarkTicker, ...leaders.map((leader) => leader.ticker)]
    const { startDate, endDate } = commonTradingRange(symbols, seriesBySymbol, afterDate, beforeDate)
    const benchmarkGrossReturnPct = returnBetween(
      seriesBySymbol[previousIndex.benchmarkTicker],
      startDate,
      endDate,
    )
    const benchmarkNetReturnPct = benchmarkGrossReturnPct - roundTripCostPct
    const strategies = [1, 3, 5, 10].flatMap((size) => {
      const selected = leaders.slice(0, size)
      const returns = selected.map((leader) => ({
        ...leader,
        returnPct: returnBetween(seriesBySymbol[leader.ticker], startDate, endDate),
      }))
      const officialWeightTotal = selected.reduce((total, leader) => total + leader.weightPct, 0)
      return ['equal', 'official'].map((weighting) => {
        const grossReturnPct =
          weighting === 'equal'
            ? returns.reduce((total, leader) => total + leader.returnPct, 0) / returns.length
            : returns.reduce(
                (total, leader) =>
                  total + leader.returnPct * (leader.weightPct / officialWeightTotal),
                0,
              )
        const netReturnPct = grossReturnPct - roundTripCostPct
        return {
          size,
          weighting,
          leaderTickers: selected.map((leader) => leader.ticker),
          grossReturnPct: round(grossReturnPct),
          netReturnPct: round(netReturnPct),
          benchmarkNetReturnPct: round(benchmarkNetReturnPct),
          excessReturnPctPoints: round(netReturnPct - benchmarkNetReturnPct),
          outperformed: netReturnPct > benchmarkNetReturnPct,
        }
      })
    })
    return {
      id: previousIndex.id,
      benchmarkTicker: previousIndex.benchmarkTicker,
      startDate,
      endDate,
      strategies,
    }
  })
  return {
    fromPeriod: previousSnapshot.period,
    toPeriod: currentSnapshot.period,
    generatedAt: new Date().toISOString(),
    status: 'complete',
    priceBasis: 'adjusted-close',
    executionRule: 'first common close after archive to last common close before next archive',
    roundTripCostPct,
    indexes,
  }
}

