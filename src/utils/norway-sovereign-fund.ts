export interface NorwayFundAllocationItem {
  id: string
  label: string
  weightPct: number
}

export interface NorwayFundTimelineItem {
  year: number
  title: string
  isTurningPoint: boolean
}

export interface NorwayFundAllocationBreakdown<T extends NorwayFundAllocationItem> {
  items: T[]
  totalWeightPct: number
  largest: T | null
}

export const buildAllocationBreakdown = <T extends NorwayFundAllocationItem>(
  allocations: T[],
): NorwayFundAllocationBreakdown<T> => {
  const items = [...allocations].sort((a, b) => b.weightPct - a.weightPct)
  const totalWeightPct = Number(items.reduce((total, item) => total + item.weightPct, 0).toFixed(2))

  return { items, totalWeightPct, largest: items[0] ?? null }
}

export const getTurningPoints = <T extends NorwayFundTimelineItem>(timeline: T[]): T[] =>
  timeline.filter((item) => item.isTurningPoint)
