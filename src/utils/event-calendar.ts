import type {
  CalendarEarningsCompany,
  CalendarEvent,
  CalendarFilters,
  CalendarTimeZone,
} from '../types/event-calendar'

export const isCalendarDate = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number(value.slice(0, 4)) > 0 &&
  Number.isFinite(Date.parse(`${value}T00:00:00Z`)) &&
  new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value

const dateParts = (date: Date, timeZone: CalendarTimeZone) =>
  Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  )

export const calendarDateInZone = (date: Date, zone: CalendarTimeZone): string => {
  const parts = dateParts(date, zone)
  return `${parts.year}-${parts.month}-${parts.day}`
}

export const calendarEventInstant = (event: Pick<CalendarEvent, 'date' | 'time'>): Date | null => {
  if (!isCalendarDate(event.date)) throw new Error('Invalid event date')
  if (event.time === null) return null
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(event.time)) throw new Error('Invalid event time')
  const nominal = Date.parse(`${event.date}T${event.time}:00Z`)
  const offsets = new Set<number>()
  for (const shift of [-86_400_000, 0, 86_400_000]) {
    const instant = new Date(nominal + shift)
    const parts = dateParts(instant, 'America/New_York')
    offsets.add(
      Date.parse(`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:00Z`) -
        instant.getTime(),
    )
  }
  const candidates = [...offsets]
    .map((offset) => new Date(nominal - offset))
    .filter((date) => {
      const parts = dateParts(date, 'America/New_York')
      return (
        `${parts.year}-${parts.month}-${parts.day}` === event.date &&
        `${parts.hour}:${parts.minute}` === event.time
      )
    })
  if (candidates.length !== 1) throw new Error('Ambiguous or nonexistent US Eastern time')
  return candidates[0]!
}

export const calendarEventDate = (event: CalendarEvent, zone: CalendarTimeZone): string => {
  const instant = calendarEventInstant(event)
  return instant ? calendarDateInZone(instant, zone) : event.date
}

export const calendarEventIsPast = (event: CalendarEvent, now = new Date()): boolean => {
  const instant = calendarEventInstant(event)
  return instant ? instant < now : event.date < calendarDateInZone(now, 'America/New_York')
}

const safeUrl = (value: string) => {
  try {
    return (
      /^https?:\/\//i.test(value) &&
      ['http:', 'https:'].includes(new URL(value).protocol) &&
      !/[\r\n]/.test(value)
    )
  } catch {
    return false
  }
}

export const deduplicateCalendarEvents = (events: CalendarEvent[]): CalendarEvent[] => {
  const result = new Map<string, CalendarEvent>()
  for (const event of events) {
    calendarEventInstant(event)
    if (
      !/^[a-z0-9-]{1,160}$/i.test(event.id) ||
      !safeUrl(event.sourceUrl) ||
      !isCalendarDate(event.checkedAt)
    )
      throw new Error('Invalid calendar source or ID')
    const previous = result.get(event.id)
    if (
      !previous ||
      (event.status === 'reported' && previous.status !== 'reported') ||
      (event.status === previous.status && event.checkedAt > previous.checkedAt)
    )
      result.set(event.id, event)
  }
  return [...result.values()]
}

const reportedDate = (raw: string | null): string | null => {
  if (!raw) return null
  if (isCalendarDate(raw)) return raw
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw)
  if (!match) return null
  const date = `${match[3]}-${match[1]!.padStart(2, '0')}-${match[2]!.padStart(2, '0')}`
  return isCalendarDate(date) ? date : null
}

export const buildEarningsCalendar = (companies: CalendarEarningsCompany[], checkedAt: string) => {
  const events: CalendarEvent[] = []
  const undated: CalendarEarningsCompany[] = []
  for (const company of companies) {
    const upcoming = company.earnings.nextEarningsDate
    if (!upcoming || !isCalendarDate(upcoming)) undated.push(company)
    for (const [date, status] of [
      [reportedDate(company.earnings.lastReportedDate), 'reported'],
      [upcoming && isCalendarDate(upcoming) ? upcoming : null, 'scheduled'],
    ] as const) {
      if (!date) continue
      const expected = status === 'scheduled'
      const ticker = company.symbol.toLowerCase()
      events.push({
        id: `earnings-${ticker.replace(/[^a-z0-9]/g, '-')}-${date}`,
        type: 'earnings',
        title: `${company.symbol} 财报${expected ? '预计日期' : '已报告'}`,
        titleEn: `${company.symbol} earnings ${expected ? 'expected' : 'reported'}`,
        date,
        time: null,
        status,
        certainty: expected ? 'estimated' : 'aggregated',
        source: expected ? 'StockAnalysis' : 'Nasdaq',
        sourceUrl: expected
          ? `https://stockanalysis.com/stocks/${ticker.replace(/[/.]/g, '-')}/statistics/`
          : company.url,
        checkedAt: checkedAt.slice(0, 10),
        assetIds: [`us-${ticker}`],
        details: `${company.name} · ${expected ? '聚合来源预计日期，未获公司官方确认，具体时间未知。' : '聚合来源记录的报告日期，具体时间未知；未在此验证报告内容。'}`,
        detailsEn: `${company.name} · ${expected ? 'Aggregator estimate, not company-confirmed. Time unknown.' : 'Report date recorded by an aggregator. Time unknown; report contents not verified here.'}`,
      })
    }
  }
  return { events: deduplicateCalendarEvents(events), undated }
}

export const calendarEventMatchesWatchlist = (event: CalendarEvent, ids: string[]): boolean =>
  ids.some(
    (id) => event.assetIds.includes(id) || (event.type !== 'earnings' && id.startsWith('us-')),
  )

export const filterCalendarEvents = (
  events: CalendarEvent[],
  filter: CalendarFilters,
): CalendarEvent[] => {
  if (
    (filter.start && !isCalendarDate(filter.start)) ||
    (filter.end && !isCalendarDate(filter.end)) ||
    (filter.start && filter.end && filter.start > filter.end)
  )
    return []
  const query = filter.query.trim().toLocaleLowerCase()
  return events
    .filter((event) => {
      const date = calendarEventDate(event, filter.timeZone)
      return (
        (!filter.start || date >= filter.start) &&
        (!filter.end || date <= filter.end) &&
        (filter.type === 'all' || event.type === filter.type) &&
        (!filter.onlyWatched || calendarEventMatchesWatchlist(event, filter.watchedIds)) &&
        (!query ||
          [
            event.title,
            event.titleEn,
            event.source,
            event.details,
            event.detailsEn,
            ...event.assetIds,
          ]
            .join(' ')
            .toLocaleLowerCase()
            .includes(query))
      )
    })
    .sort(
      (a, b) =>
        calendarEventDate(a, filter.timeZone).localeCompare(
          calendarEventDate(b, filter.timeZone),
        ) ||
        (a.time ?? '').localeCompare(b.time ?? '') ||
        a.id.localeCompare(b.id),
    )
}

const icsText = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '')
const foldLine = (line: string): string => {
  const encoder = new TextEncoder()
  let result = '',
    length = 0
  for (const character of line) {
    const size = encoder.encode(character).length
    if (length + size > 75) {
      result += '\r\n '
      length = 1
    }
    result += character
    length += size
  }
  return result
}
const utcStamp = (date: Date) =>
  date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')

export const calendarEventsToIcs = (events: CalendarEvent[], english = false): string => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FIRE Research//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]
  for (const event of deduplicateCalendarEvents(events)) {
    const instant = calendarEventInstant(event)
    const nextDay = new Date(`${event.date}T00:00:00Z`)
    nextDay.setUTCDate(nextDay.getUTCDate() + 1)
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@fire-research.local`,
      `DTSTAMP:${event.checkedAt.replace(/-/g, '')}T000000Z`,
      instant
        ? `DTSTART:${utcStamp(instant)}`
        : `DTSTART;VALUE=DATE:${event.date.replace(/-/g, '')}`,
      ...(instant
        ? []
        : [`DTEND;VALUE=DATE:${nextDay.toISOString().slice(0, 10).replace(/-/g, '')}`]),
      `SUMMARY:${icsText(english ? event.titleEn : event.title)}`,
      `DESCRIPTION:${icsText(`${english ? event.detailsEn : event.details}\n${event.source} · ${event.checkedAt}\n${event.sourceUrl}`)}`,
      `URL:${event.sourceUrl}`,
      `STATUS:${event.certainty === 'estimated' ? 'TENTATIVE' : 'CONFIRMED'}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return `${lines.map(foldLine).join('\r\n')}\r\n`
}
