import type { DataScheduleId } from '../utils/data-schedule'

export interface DataHealthDefinition {
  id: string
  title: string
  titleEn: string
  route: string
  workflow: string
  schedule: DataScheduleId
  collections: string[]
}

export interface DataHealthSnapshot extends DataHealthDefinition {
  updatedAt: string | null
  attemptedAt: string | null
  count: number | null
  issues: string[]
  sourceIssues: string[]
  source: string
  sourceUrl: string | null
}

export type DataHealthStatus = 'current' | 'overdue' | 'attention' | 'unavailable'
