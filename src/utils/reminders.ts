import type { ResearchWorkspace } from '../types'
import type { CalendarEvent } from '../types/event-calendar'
import type {
  ReminderFilter,
  ReminderItem,
  ReminderState,
  ReminderStatus,
  ReminderStore,
} from '../types/reminders'
import {
  calendarDateInZone,
  calendarEventDate,
  calendarEventInstant,
  calendarEventIsPast,
  isCalendarDate,
} from './event-calendar'

export const reminderStorageKey = 'market-desk-reminders-v1'
export const emptyReminderStore = (): ReminderStore => ({ version: 1, states: [] })
export const reminderToday = (now = new Date()): string => calendarDateInZone(now, 'Asia/Shanghai')
export const shiftReminderDate = (date: string, days: number): string => {
  if (!isCalendarDate(date) || !Number.isInteger(days)) throw new Error('Invalid reminder date')
  const result = new Date(`${date}T00:00:00Z`)
  result.setUTCDate(result.getUTCDate() + days)
  return result.toISOString().slice(0, 10)
}

const fail = (): never => {
  throw new Error('Invalid reminder backup')
}
const object = (value: unknown, keys: string[]): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fail()
  const result = value as Record<string, unknown>
  if (Object.keys(result).length !== keys.length || keys.some((key) => !(key in result)))
    return fail()
  return result
}
const text = (value: unknown, max: number): string =>
  typeof value === 'string' && value.trim() && value.length <= max ? value : fail()
const timestamp = (value: unknown): string => {
  const result = text(value, 35)
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?Z$/.exec(result)
  if (
    !match ||
    !isCalendarDate(match[1]!) ||
    Number(match[2]) > 23 ||
    Number(match[3]) > 59 ||
    Number(match[4]) > 59 ||
    !Number.isFinite(Date.parse(result))
  )
    return fail()
  return result
}

export const parseReminderStore = (raw: string): ReminderStore => {
  if (raw.length > 5_000_000) return fail()
  const data = object(JSON.parse(raw), ['version', 'states'])
  if (data.version !== 1 || !Array.isArray(data.states) || data.states.length > 10000) return fail()
  const states = data.states.map((value): ReminderState => {
    const item = object(value, ['id', 'revision', 'status', 'snoozedUntil', 'updatedAt'])
    const id = text(item.id, 200)
    if (!/^(note|calendar):.+$/.test(id)) return fail()
    if (typeof item.status !== 'string' || !['pending', 'done', 'snoozed'].includes(item.status))
      return fail()
    const status = item.status as ReminderStatus
    if (
      status === 'snoozed'
        ? typeof item.snoozedUntil !== 'string' || !isCalendarDate(item.snoozedUntil)
        : item.snoozedUntil !== null
    )
      return fail()
    return {
      id,
      revision: text(item.revision, 2000),
      status,
      snoozedUntil: item.snoozedUntil as string | null,
      updatedAt: timestamp(item.updatedAt),
    }
  })
  if (new Set(states.map((item) => item.id)).size !== states.length) return fail()
  return { version: 1, states }
}

export const buildReminders = ({
  workspace,
  events,
  state,
  now = new Date(),
}: {
  workspace: ResearchWorkspace
  events: CalendarEvent[]
  state: ReminderStore
  now?: Date
}): ReminderItem[] => {
  const today = reminderToday(now)
  const stored = new Map(state.states.map((item) => [item.id, item]))
  const result = new Map<string, ReminderItem>()
  const add = (item: Omit<ReminderItem, 'status' | 'snoozedUntil' | 'effectiveDate' | 'due'>) => {
    const saved = stored.get(item.id)
    const matching = saved?.revision === item.revision ? saved : undefined
    const snoozedUntil = matching?.status === 'snoozed' ? matching.snoozedUntil : null
    const status =
      matching?.status === 'done'
        ? 'done'
        : snoozedUntil && snoozedUntil > today
          ? 'snoozed'
          : 'pending'
    const effectiveDate = snoozedUntil ?? item.date
    const due =
      status === 'pending' &&
      (snoozedUntil
        ? snoozedUntil <= today
        : item.instant
          ? Date.parse(item.instant) <= now.getTime()
          : item.date <=
            (item.source === 'note' ? today : calendarDateInZone(now, 'America/New_York')))
    result.set(item.id, { ...item, status, snoozedUntil, effectiveDate, due })
  }
  for (const note of workspace.notes) {
    if (note.status !== 'active' || !isCalendarDate(note.reviewDate)) continue
    add({
      id: `note:${note.id}`,
      revision: JSON.stringify([note.updatedAt, note.reviewDate, note.status]),
      source: 'note',
      title: note.title,
      titleEn: note.title,
      assetIds: [note.assetId],
      date: note.reviewDate,
      instant: null,
      scheduledTimePassed: false,
      estimated: false,
      sourceName: 'Research workspace',
      sourceUrl: null,
      checkedAt: note.updatedAt,
    })
  }
  for (const event of events) {
    if (event.status === 'reported') continue
    const instant = calendarEventInstant(event)
    add({
      // Calendar IDs include the occurrence date. Do not merge distinct releases by ticker/type.
      id: `calendar:${event.id}`,
      revision: JSON.stringify([
        event.date,
        event.time,
        event.status,
        event.certainty,
        event.title,
        event.sourceUrl,
        [...event.assetIds].sort(),
      ]),
      source: event.type === 'earnings' ? 'earnings' : 'macro',
      title: event.title,
      titleEn: event.titleEn,
      assetIds: [...event.assetIds],
      date: calendarEventDate(event, 'Asia/Shanghai'),
      instant: instant?.toISOString() ?? null,
      scheduledTimePassed: calendarEventIsPast(event, now),
      estimated: event.certainty === 'estimated',
      sourceName: event.source,
      sourceUrl: event.sourceUrl,
      checkedAt: event.checkedAt,
    })
  }
  return [...result.values()].sort(
    (a, b) =>
      a.effectiveDate.localeCompare(b.effectiveDate) ||
      (a.instant ?? '').localeCompare(b.instant ?? '') ||
      a.id.localeCompare(b.id),
  )
}

export const filterReminders = (
  items: ReminderItem[],
  filter: ReminderFilter,
  now = new Date(),
): ReminderItem[] => {
  const end = shiftReminderDate(reminderToday(now), filter.days - 1)
  const query = filter.query.trim().toLocaleLowerCase()
  return items.filter((item) => {
    const watched = filter.watchedIds.some(
      (id) => item.assetIds.includes(id) || (item.source === 'macro' && id.startsWith('us-')),
    )
    return (
      item.effectiveDate <= end &&
      (filter.status === 'all' || item.status === filter.status) &&
      (filter.source === 'all' || item.source === filter.source) &&
      (!filter.onlyWatched || watched) &&
      (item.source !== 'earnings' || filter.includeUnwatchedEarnings || watched) &&
      (!query ||
        [item.title, item.titleEn, item.sourceName, ...item.assetIds]
          .join(' ')
          .toLocaleLowerCase()
          .includes(query))
    )
  })
}

export const countPendingReminders = (
  items: ReminderItem[],
  watchedIds: string[],
  now = new Date(),
): number =>
  filterReminders(
    items,
    {
      status: 'pending',
      source: 'all',
      days: 30,
      query: '',
      onlyWatched: false,
      includeUnwatchedEarnings: false,
      watchedIds,
    },
    now,
  ).length

export const setReminderState = (
  store: ReminderStore,
  item: ReminderItem,
  status: ReminderStatus,
  snoozedUntil: string | null = null,
  now = new Date(),
): ReminderStore => {
  if (status === 'snoozed' && (!snoozedUntil || snoozedUntil <= reminderToday(now)))
    throw new Error('Choose a future Beijing date')
  return parseReminderStore(
    JSON.stringify({
      version: 1,
      states: [
        ...store.states.filter((entry) => entry.id !== item.id),
        {
          id: item.id,
          revision: item.revision,
          status,
          snoozedUntil,
          updatedAt: now.toISOString(),
        },
      ],
    }),
  )
}
