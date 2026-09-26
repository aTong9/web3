export type CalendarEventType = 'fomc' | 'inflation' | 'employment' | 'gdp' | 'pce' | 'earnings'
export type CalendarTimeZone = 'Asia/Shanghai' | 'America/New_York' | 'UTC'

export interface CalendarEvent {
  id: string
  type: CalendarEventType
  title: string
  titleEn: string
  date: string
  time: string | null
  status: 'scheduled' | 'reported'
  certainty: 'official' | 'estimated' | 'aggregated'
  source: string
  sourceUrl: string
  checkedAt: string
  assetIds: string[]
  details: string
  detailsEn: string
}

export interface CalendarEarningsCompany {
  symbol: string
  name: string
  url: string
  earnings: { nextEarningsDate: string | null; lastReportedDate: string | null }
}

export interface CalendarFilters {
  start: string
  end: string
  type: CalendarEventType | 'all'
  query: string
  onlyWatched: boolean
  watchedIds: string[]
  timeZone: CalendarTimeZone
}
