import type {
  DataHealthDefinition,
  DataHealthSnapshot,
  DataHealthStatus,
} from '../types/data-health'
import { getDataScheduleState } from './data-schedule'
import { isCalendarDate } from './event-calendar'

export const dataHealthDefinitions: DataHealthDefinition[] = [
  {
    id: 'cross-asset',
    title: '跨资产',
    titleEn: 'Cross asset',
    route: '/cross-asset',
    workflow: 'cross-asset',
    schedule: 'crossAsset',
    collections: ['assets'],
  },
  {
    id: 'market-home',
    title: '首页传导链',
    titleEn: 'Home transmission',
    route: '/',
    workflow: 'cross-asset',
    schedule: 'crossAsset',
    collections: ['transmissionChains'],
  },
  {
    id: 'asset-technical-signals',
    title: '资产技术信号',
    titleEn: 'Asset technicals',
    route: '/asset-technical',
    workflow: 'cross-asset',
    schedule: 'crossAsset',
    collections: ['assets'],
  },
  {
    id: 'cross-asset-forecast-history',
    title: '预测历史账本',
    titleEn: 'Forecast history',
    route: '/cross-asset',
    workflow: 'cross-asset',
    schedule: 'crossAsset',
    collections: ['records'],
  },
  {
    id: 'fund-transmission',
    title: '基金传导',
    titleEn: 'Fund transmission',
    route: '/funds',
    workflow: 'cross-asset',
    schedule: 'crossAsset',
    collections: ['chains'],
  },
  {
    id: 'technical-events',
    title: '技术与公司事件',
    titleEn: 'Technical / corporate events',
    route: '/asset-technical',
    workflow: 'cross-asset',
    schedule: 'crossAsset',
    collections: ['events', 'corporateEvents', 'macroEvents'],
  },
  {
    id: 'a-share-sectors',
    title: 'A 股行业',
    titleEn: 'A-share sectors',
    route: '/a-share',
    workflow: 'a-share-sectors',
    schedule: 'aShare',
    collections: ['sectors', 'funds'],
  },
  {
    id: 'us-funds',
    title: '境内美股基金',
    titleEn: 'China-listed US funds',
    route: '/funds',
    workflow: 'us-funds',
    schedule: 'funds',
    collections: ['funds'],
  },
  {
    id: 'technical-funds',
    title: '基金技术信号',
    titleEn: 'Fund technicals',
    route: '/asset-technical',
    workflow: 'us-funds',
    schedule: 'technicalFunds',
    collections: ['assets'],
  },
  {
    id: 'hot-stocks',
    title: '热门股票',
    titleEn: 'Active stocks',
    route: '/funds',
    workflow: 'hot-stocks',
    schedule: 'hotStocks',
    collections: ['markets.aShare.daily', 'markets.us.daily'],
  },
  {
    id: 'us-megacaps',
    title: '美股大市值公司',
    titleEn: 'US megacaps',
    route: '/funds',
    workflow: 'hot-stocks',
    schedule: 'hotStocks',
    collections: ['stocks'],
  },
  {
    id: 'us-stock-technical-signals',
    title: '美股技术信号',
    titleEn: 'US stock technicals',
    route: '/asset-technical',
    workflow: 'hot-stocks',
    schedule: 'hotStocks',
    collections: ['assets'],
  },
  {
    id: 'option-market',
    title: '期权数据',
    titleEn: 'Options data',
    route: '/quant-signals',
    workflow: 'hot-stocks',
    schedule: 'hotStocks',
    collections: ['symbols'],
  },
  {
    id: 'us-index-research',
    title: '核心资产研究',
    titleEn: 'Core asset research',
    route: '/us-indexes',
    workflow: 'us-indexes',
    schedule: 'usIndexes',
    collections: ['products'],
  },
  {
    id: 'us-index-daily',
    title: '核心资产日线',
    titleEn: 'Core asset daily series',
    route: '/us-indexes',
    workflow: 'us-indexes',
    schedule: 'usIndexes',
    collections: ['marketSeries'],
  },
  {
    id: 'market-news',
    title: '市场快讯',
    titleEn: 'Market news',
    route: '/intelligence/news',
    workflow: 'market-news',
    schedule: 'news',
    collections: ['articles'],
  },
  {
    id: 'kol-monitor',
    title: 'KOL 监控',
    titleEn: 'KOL monitor',
    route: '/intelligence/kols',
    workflow: 'kols',
    schedule: 'kols',
    collections: ['kols'],
  },
  {
    id: 'reddit-monitor',
    title: 'Reddit 监控',
    titleEn: 'Reddit monitor',
    route: '/reddit-monitor',
    workflow: 'reddit-monitor',
    schedule: 'reddit',
    collections: ['markets.us.rows', 'markets.crypto.rows'],
  },
  {
    id: 'norway-fund-snapshot',
    title: '挪威主权基金',
    titleEn: 'Norway sovereign fund',
    route: '/norway-sovereign-fund',
    workflow: 'norway-fund',
    schedule: 'norwayFund',
    collections: ['topHoldings'],
  },
]

const object = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const date = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const match =
    /^(\d{4}-\d{2}-\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.exec(
      value,
    )
  return match && isCalendarDate(match[1]!) && Number.isFinite(Date.parse(value)) ? value : null
}
const at = (data: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((value, key) => object(value)[key], data)

// Only project metadata at build time; the health page never downloads price histories.
export const inspectDataHealth = (
  definition: DataHealthDefinition,
  input: unknown,
): DataHealthSnapshot => {
  const data = object(input)
  const issues: string[] = []
  const updatedAt = date(
    'dataUpdatedAt' in data ? data.dataUpdatedAt : (data.updatedAt ?? data.generatedAt),
  )
  if (!updatedAt) issues.push('missing-time')
  const rows: unknown[] = []
  let count: number | null = 0
  for (const path of definition.collections) {
    const collection = at(data, path)
    if (!Array.isArray(collection)) {
      issues.push(`missing-collection:${path}`)
      count = null
    } else {
      rows.push(...collection)
      if (count !== null) count += collection.length
    }
  }
  if (count === 0) issues.push('empty')
  const statusRows = [
    data,
    ...rows,
    ...Object.values(object(data.markets)),
    ...(Array.isArray(data.sourceStatus) ? data.sourceStatus : []),
  ]
  const sourceIssues = statusRows.flatMap((value) => {
    const item = object(value)
    const status =
      typeof item.status === 'string' ? item.status : item.stale === true ? 'stale' : ''
    if (
      ![
        'failed',
        'partial',
        'stale',
        'unavailable',
        'error',
        'missing',
        'degraded',
        'not_configured',
      ].includes(status)
    )
      return []
    const label = [item.name, item.symbol, item.id, item.source].find(
      (value) => typeof value === 'string',
    )
    return [`${label ? String(label).slice(0, 120) : definition.id}: ${status}`]
  })
  let sourceUrl: string | null = null
  if (typeof data.sourceUrl === 'string') {
    try {
      if (['http:', 'https:'].includes(new URL(data.sourceUrl).protocol)) sourceUrl = data.sourceUrl
    } catch {
      /* invalid source URLs are not linked */
    }
  }
  const source =
    typeof data.source === 'string'
      ? data.source
      : typeof object(data.source).marketData === 'string'
        ? String(object(data.source).marketData)
        : ''
  return {
    ...definition,
    updatedAt,
    attemptedAt: date(data.attemptedAt),
    count,
    issues,
    sourceIssues: [...new Set(sourceIssues)],
    source,
    sourceUrl,
  }
}

export const dataHealthStatus = (
  snapshot: DataHealthSnapshot,
  now = new Date(),
): DataHealthStatus => {
  if (snapshot.issues.length) return 'unavailable'
  if (
    snapshot.sourceIssues.length ||
    Date.parse(snapshot.updatedAt ?? '') > now.getTime() + 600_000
  )
    return 'attention'
  return getDataScheduleState(snapshot.updatedAt ?? '', snapshot.schedule, now).pending
    ? 'overdue'
    : 'current'
}
