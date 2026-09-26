export type ReminderSource = 'note' | 'macro' | 'earnings'
export type ReminderStatus = 'pending' | 'done' | 'snoozed'

export interface ReminderState {
  id: string
  revision: string
  status: ReminderStatus
  snoozedUntil: string | null
  updatedAt: string
}

export interface ReminderStore {
  version: 1
  states: ReminderState[]
}

export interface ReminderItem {
  id: string
  revision: string
  source: ReminderSource
  title: string
  titleEn: string
  assetIds: string[]
  date: string
  instant: string | null
  effectiveDate: string
  status: ReminderStatus
  snoozedUntil: string | null
  due: boolean
  scheduledTimePassed: boolean
  estimated: boolean
  sourceName: string
  sourceUrl: string | null
  checkedAt: string
}

export interface ReminderFilter {
  status: ReminderStatus | 'all'
  source: ReminderSource | 'all'
  days: 7 | 30 | 90
  query: string
  onlyWatched: boolean
  includeUnwatchedEarnings: boolean
  watchedIds: string[]
}
