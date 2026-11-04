import type {
  NotionLibrary,
  NotionLibraryEntry,
  NotionReport,
  NotionReportSection,
  NotionWorkProduct,
} from '@/types'

export const notionCategories = [
  '投资与资产',
  '资源与工具',
  '创意与项目',
  '写作与内容',
  '生活与居住',
  '待核实与整理',
]
export const notionDestinations = [
  '/million-action-plan',
  '/personal-finance',
  '/research-workspace',
  '/resources',
  '/income-ledger',
  '/learning-paths',
  '/country-travel-guide',
  '/intelligence/news',
]
export const emptyNotionLibrary = (): NotionLibrary => ({
  version: 1,
  importedAt: '',
  coverage: '',
  entries: [],
})

const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid object')
  return value as Record<string, unknown>
}
const text = (value: unknown, max: number): string => {
  if (typeof value !== 'string' || value.length > max) throw new Error('Invalid text')
  return value
}
const https = (value: unknown): string => {
  const raw = text(value, 2000)
  const url = new URL(raw)
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid URL')
  return raw
}

const strings = (value: unknown, maxItems: number, maxLength: number): string[] => {
  if (!Array.isArray(value) || value.length > maxItems) throw new Error('Invalid list')
  return value.map((item: unknown) => text(item, maxLength))
}
const count = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 10000)
    throw new Error('Invalid count')
  return value
}
const parseWorkProducts = (value: unknown, actionCount: number): NotionWorkProduct[] => {
  if (!Array.isArray(value) || value.length > 30) throw new Error('Invalid work products')
  const seen = new Set<string>()
  return value.map((value: unknown): NotionWorkProduct => {
    const item = object(value)
    const id = text(item.id, 80)
    const actionIndex = count(item.actionIndex)
    const status = item.status
    const columns = strings(item.columns, 8, 200)
    if (
      !/^[a-z][a-z0-9-]*$/.test(id) ||
      seen.has(id) ||
      actionIndex >= actionCount ||
      typeof status !== 'string' ||
      !['prepared', 'needs-input', 'needs-verification'].includes(status) ||
      !columns.length ||
      !Array.isArray(item.rows) ||
      item.rows.length > 60
    )
      throw new Error('Invalid work product')
    seen.add(id)
    const rows = item.rows.map((row: unknown) => {
      const cells = strings(row, 8, 4000)
      if (cells.length !== columns.length) throw new Error('Invalid table row')
      return cells
    })
    return {
      id,
      actionIndex,
      status: status as NotionWorkProduct['status'],
      title: text(item.title, 200),
      result: text(item.result, 4000),
      columns,
      rows,
      nextStep: text(item.nextStep, 4000),
      notes: text(item.notes, 10000),
    }
  })
}

const parseReport = (value: unknown, entryIds: Set<string>): NotionReport => {
  const report = object(value)
  if (!Array.isArray(report.sections) || report.sections.length > 30)
    throw new Error('Invalid report')
  const seen = new Set<string>()
  const sections = report.sections.map((value: unknown): NotionReportSection => {
    const section = object(value)
    const id = text(section.id, 80)
    const title = text(section.title, 200).trim()
    const sourceIds = strings(section.sourceIds, 200, 32)
    if (
      !/^[a-z][a-z0-9-]*$/.test(id) ||
      seen.has(id) ||
      !title ||
      sourceIds.some((sourceId) => !entryIds.has(sourceId))
    )
      throw new Error('Invalid report section')
    seen.add(id)
    return {
      id,
      title,
      sourceIds,
      summary: text(section.summary, 4000),
      paragraphs: strings(section.paragraphs, 30, 10000),
      takeaways: strings(section.takeaways, 40, 4000),
      actions: strings(section.actions, 30, 4000),
      cautions: strings(section.cautions, 30, 4000),
      ...(section.workProducts !== undefined
        ? {
            workProducts: parseWorkProducts(
              section.workProducts,
              strings(section.actions, 30, 4000).length,
            ),
          }
        : {}),
    }
  })
  return {
    title: text(report.title, 200),
    overview: strings(report.overview, 20, 10000),
    pagesRead: count(report.pagesRead),
    databasesRead: count(report.databasesRead),
    dataSourcesSearched: count(report.dataSourcesSearched),
    limits: strings(report.limits, 30, 4000),
    sections,
  }
}

export const parseNotionLibrary = (raw: string): NotionLibrary => {
  if (raw.length > 2_000_000) throw new Error('Import too large')
  const data = object(JSON.parse(raw))
  if (data.version !== 1 || !Array.isArray(data.entries) || data.entries.length > 1000)
    throw new Error('Invalid library')
  const importedAt = text(data.importedAt, 40)
  if (
    importedAt &&
    (!Number.isFinite(Date.parse(importedAt)) || new Date(importedAt).toISOString() !== importedAt)
  )
    throw new Error('Invalid date')
  const coverage = text(data.coverage, 4000)
  const seen = new Set<string>()
  const entries = data.entries.map((value: unknown): NotionLibraryEntry => {
    const entry = object(value)
    const id = text(entry.id, 32)
    const title = text(entry.title, 200).trim()
    const category = text(entry.category, 40)
    const status = text(entry.status, 40)
    const sourceUrl = https(entry.sourceUrl)
    const url = new URL(sourceUrl)
    const sourceUpdatedAt = text(entry.sourceUpdatedAt, 40)
    const externalUrl = entry.externalUrl === '' ? '' : https(entry.externalUrl)
    const destination = text(entry.destination, 100)
    if (
      !/^[a-f0-9]{32}$/.test(id) ||
      seen.has(id) ||
      !title ||
      !notionCategories.includes(category) ||
      !['资料收藏', '待评估', '待核实', '已关联'].includes(status) ||
      !['app.notion.com', 'www.notion.so', 'notion.so'].includes(url.hostname) ||
      !url.pathname.replace(/-/g, '').endsWith(id) ||
      url.search ||
      url.hash ||
      (destination && !notionDestinations.includes(destination)) ||
      (sourceUpdatedAt &&
        (!Number.isFinite(Date.parse(sourceUpdatedAt)) ||
          new Date(sourceUpdatedAt).toISOString() !== sourceUpdatedAt))
    )
      throw new Error('Invalid entry')
    seen.add(id)
    return {
      id,
      title,
      category,
      status,
      summary: text(entry.summary, 4000),
      nextAction: text(entry.nextAction, 2000),
      sourceUrl,
      sourceUpdatedAt,
      externalUrl,
      destination,
    }
  })
  const result: NotionLibrary = { version: 1, importedAt, coverage, entries }
  if (data.report !== undefined) result.report = parseReport(data.report, seen)
  return result
}

export const mergeNotionLibrary = (
  current: NotionLibrary,
  incoming: NotionLibrary,
): NotionLibrary =>
  parseNotionLibrary(
    JSON.stringify({
      ...incoming,
      ...((incoming.report ?? current.report) ? { report: incoming.report ?? current.report } : {}),
      entries: [
        ...new Map(
          [...current.entries, ...incoming.entries].map((entry) => [entry.id, entry]),
        ).values(),
      ],
    }),
  )

export const filterNotionEntries = (
  entries: NotionLibraryEntry[],
  category: string,
  query: string,
) => {
  const needle = query.trim().toLocaleLowerCase()
  return entries.filter(
    (entry) =>
      (!category || entry.category === category) &&
      (!needle ||
        [entry.title, entry.summary, entry.nextAction, entry.status]
          .join(' ')
          .toLocaleLowerCase()
          .includes(needle)),
  )
}

// Public planning material remains accessible without importing private Notion records.
export const integrateNotionWealthSection = (
  sections: NotionReportSection[] = [],
): NotionReportSection[] => {
  const wealth: NotionReportSection = {
    id: 'wealth',
    title: '资产规划与50万—100万用途',
    summary: '先留生活底座，再比较账户、投资资格与生活用途；同一笔资金只计一次。',
    paragraphs: [],
    takeaways: [],
    actions: [],
    cautions: ['公开用途目录不代表本人资产、已获资格或办理结果，机构条款仍需办理前核实。'],
    sourceIds: [],
  }
  const existing = sections.find((section) => section.id === 'wealth')
  return [
    existing ? { ...existing, title: wealth.title, summary: wealth.summary } : wealth,
    ...sections.filter((section) => section.id !== 'wealth'),
  ]
}
