import type { ResearchNote, ResearchWatchEntry, ResearchWorkspace } from '@/types'

export const emptyResearchWorkspace = (): ResearchWorkspace => ({
  version: 1,
  watchlist: [],
  notes: [],
})

const fail = (field: string): never => {
  throw new Error(`研究资料格式无效：${field}`)
}

const object = (value: unknown, keys: string[], field: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fail(field)
  const result = value as Record<string, unknown>
  if (
    Object.keys(result).length !== keys.length ||
    keys.some((key) => !Object.prototype.hasOwnProperty.call(result, key))
  ) {
    return fail(field)
  }
  return result
}

const string = (value: unknown, max: number, field: string, required = false): string => {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) {
    return fail(field)
  }
  return value
}

const isCalendarDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const year = Number(value.slice(0, 4))
  const month = Number(value.slice(5, 7))
  const day = Number(value.slice(8, 10))
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]!
}

const timestamp = (value: unknown, field: string): string => {
  const result = string(value, 35, field, true)
  const match =
    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.exec(result)
  if (
    !match ||
    !isCalendarDate(match[1]!) ||
    Number(match[2]) > 23 ||
    Number(match[3]) > 59 ||
    Number(match[4]) > 59 ||
    !Number.isFinite(Date.parse(result))
  ) {
    return fail(field)
  }
  return result
}

const list = <T>(
  value: unknown,
  max: number,
  field: string,
  parse: (item: unknown) => T,
  key: (item: T) => string,
): T[] => {
  if (!Array.isArray(value) || value.length > max) return fail(field)
  const entries = value.map(parse)
  if (new Set(entries.map(key)).size !== entries.length) return fail(`${field} 存在重复记录`)
  return entries
}

const watchEntry = (value: unknown): ResearchWatchEntry => {
  const item = object(
    value,
    ['id', 'assetId', 'group', 'reason', 'createdAt', 'updatedAt'],
    '自选资产',
  )
  return {
    id: string(item.id, 160, '自选 ID', true),
    assetId: string(item.assetId, 160, '资产 ID', true),
    group: string(item.group, 60, '分组'),
    reason: string(item.reason, 2000, '关注理由'),
    createdAt: timestamp(item.createdAt, '创建时间'),
    updatedAt: timestamp(item.updatedAt, '更新时间'),
  }
}

const note = (value: unknown): ResearchNote => {
  const item = object(
    value,
    [
      'id',
      'assetId',
      'title',
      'thesis',
      'invalidation',
      'reviewDate',
      'conclusion',
      'createdAt',
      'updatedAt',
      'sources',
      'status',
      'paperTradeId',
    ],
    '研究笔记',
  )
  const reviewDate = string(item.reviewDate, 10, '复查日期')
  if (reviewDate && !isCalendarDate(reviewDate)) return fail('复查日期')
  if (
    typeof item.status !== 'string' ||
    !['active', 'reviewed', 'invalidated'].includes(item.status)
  ) {
    return fail('笔记状态')
  }
  if (!Array.isArray(item.sources) || item.sources.length > 20) return fail('资料来源')
  const sources = item.sources.map((value) => {
    const source = string(value, 2048, '资料来源 URL', true)
    try {
      if (
        !/^https?:\/\//i.test(source) ||
        !['https:', 'http:'].includes(new URL(source).protocol)
      ) {
        return fail('资料来源 URL')
      }
    } catch {
      return fail('资料来源 URL')
    }
    return source
  })
  return {
    id: string(item.id, 160, '笔记 ID', true),
    assetId: string(item.assetId, 160, '资产 ID', true),
    title: string(item.title, 160, '笔记标题', true),
    thesis: string(item.thesis, 10000, '研究观点'),
    invalidation: string(item.invalidation, 10000, '失效条件'),
    reviewDate,
    conclusion: string(item.conclusion, 10000, '复盘结论'),
    createdAt: timestamp(item.createdAt, '创建时间'),
    updatedAt: timestamp(item.updatedAt, '更新时间'),
    sources,
    status: item.status as ResearchNote['status'],
    paperTradeId:
      item.paperTradeId === null ? null : string(item.paperTradeId, 160, '模拟交易 ID', true),
  }
}

export const parseResearchWorkspace = (raw: string): ResearchWorkspace => {
  if (raw.length > 10_000_000) return fail('文件内容过大')
  const value: unknown = JSON.parse(raw)
  const data = object(value, ['version', 'watchlist', 'notes'], '工作台')
  if (data.version !== 1) return fail('不支持的数据版本')
  const watchlist = list(data.watchlist, 1000, '自选资产', watchEntry, (item) => item.assetId)
  if (new Set(watchlist.map((item) => item.id)).size !== watchlist.length) {
    return fail('自选 ID 存在重复记录')
  }
  return {
    version: 1,
    watchlist,
    notes: list(data.notes, 5000, '研究笔记', note, (item) => item.id),
  }
}

export const mergeResearchWorkspaces = (
  current: ResearchWorkspace,
  incoming: ResearchWorkspace,
): ResearchWorkspace => {
  const left = parseResearchWorkspace(JSON.stringify(current))
  const right = parseResearchWorkspace(JSON.stringify(incoming))
  const merge = <T extends { updatedAt: string }>(
    a: T[],
    b: T[],
    key: (entry: T) => string,
  ): T[] => {
    const records = new Map<string, T>()
    for (const entry of [...a, ...b]) {
      const existing = records.get(key(entry))
      const difference = existing ? Date.parse(entry.updatedAt) - Date.parse(existing.updatedAt) : 1
      if (
        !existing ||
        difference > 0 ||
        (difference === 0 && JSON.stringify(entry) > JSON.stringify(existing))
      ) {
        records.set(key(entry), entry)
      }
    }
    return [...records.entries()]
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([, value]) => value)
  }
  return parseResearchWorkspace(
    JSON.stringify({
      version: 1,
      watchlist: merge(left.watchlist, right.watchlist, (entry) => entry.assetId),
      notes: merge(left.notes, right.notes, (entry) => entry.id),
    }),
  )
}

export const isResearchNoteDue = (note: ResearchNote, today: string): boolean =>
  note.status === 'active' &&
  isCalendarDate(today) &&
  isCalendarDate(note.reviewDate) &&
  note.reviewDate <= today
