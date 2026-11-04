export interface NotionLibraryEntry {
  id: string
  title: string
  category: string
  status: string
  summary: string
  nextAction: string
  sourceUrl: string
  sourceUpdatedAt: string
  externalUrl: string
  destination: string
}

export interface NotionLibrary {
  version: 1
  importedAt: string
  coverage: string
  entries: NotionLibraryEntry[]
  report?: NotionReport
}

export interface NotionReportSection {
  id: string
  title: string
  summary: string
  paragraphs: string[]
  takeaways: string[]
  actions: string[]
  cautions: string[]
  sourceIds: string[]
  workProducts?: NotionWorkProduct[]
}

export interface NotionReport {
  title: string
  overview: string[]
  pagesRead: number
  databasesRead: number
  dataSourcesSearched: number
  limits: string[]
  sections: NotionReportSection[]
}

export interface NotionWorkProduct {
  id: string
  actionIndex: number
  title: string
  status: 'prepared' | 'needs-input' | 'needs-verification'
  result: string
  columns: string[]
  rows: string[][]
  nextStep: string
  notes: string
}
