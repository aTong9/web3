import type { MarketCalendarId, TechnicalChartAsset } from '@/types'

interface CalendarConfig {
  timeZone: string
  closeMinutes: number
  publicationDelayMinutes: number
  allowedLagSessions: number
}

export interface AssetFreshness {
  calendar: MarketCalendarId
  expectedDate: string
  latestDate: string | null
  lagSessions: number
  stale: boolean
  nextExpectedAt: string
}

const configs: Record<Exclude<MarketCalendarId, 'crypto-24x7' | 'monthly'>, CalendarConfig> = {
  nyse: {
    timeZone: 'America/New_York',
    closeMinutes: 16 * 60,
    publicationDelayMinutes: 180,
    allowedLagSessions: 2,
  },
  sse: {
    timeZone: 'Asia/Shanghai',
    closeMinutes: 15 * 60,
    publicationDelayMinutes: 120,
    allowedLagSessions: 2,
  },
  hkex: {
    timeZone: 'Asia/Hong_Kong',
    closeMinutes: 16 * 60,
    publicationDelayMinutes: 120,
    allowedLagSessions: 2,
  },
  jpx: {
    timeZone: 'Asia/Tokyo',
    closeMinutes: 15 * 60 + 30,
    publicationDelayMinutes: 120,
    allowedLagSessions: 2,
  },
  europe: {
    timeZone: 'Europe/Paris',
    closeMinutes: 17 * 60 + 30,
    publicationDelayMinutes: 180,
    allowedLagSessions: 2,
  },
  'fred-business': {
    timeZone: 'America/Chicago',
    closeMinutes: 18 * 60,
    publicationDelayMinutes: 0,
    allowedLagSessions: 5,
  },
}

const shiftDate = (date: string, days: number) => {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}
const isWeekday = (date: string) => {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay()
  return day !== 0 && day !== 6
}
const previousWeekday = (date: string) => {
  let candidate = date
  do candidate = shiftDate(candidate, -1)
  while (!isWeekday(candidate))
  return candidate
}
const nextWeekday = (date: string) => {
  let candidate = date
  do candidate = shiftDate(candidate, 1)
  while (!isWeekday(candidate))
  return candidate
}
const zonedParts = (now: Date, timeZone: string) => {
  const values = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    minutes: Number(values.hour) * 60 + Number(values.minute),
  }
}
const businessSessionsBetween = (from: string | null, to: string) => {
  if (!from || from >= to) return 0
  let sessions = 0
  let cursor = from
  while (cursor < to && sessions < 366) {
    cursor = shiftDate(cursor, 1)
    if (isWeekday(cursor)) sessions += 1
  }
  return sessions
}
const zonedDateTimeToIso = (date: string, minutes: number, timeZone: string) => {
  const [year, month, day] = date.split('-').map(Number)
  const hour = Math.floor(minutes / 60)
  const minute = minutes % 60
  const guess = new Date(Date.UTC(year!, month! - 1, day!, hour, minute))
  const represented = zonedParts(guess, timeZone)
  const representedUtc = Date.parse(`${represented.date}T${String(Math.floor(represented.minutes / 60)).padStart(2, '0')}:${String(represented.minutes % 60).padStart(2, '0')}:00Z`)
  const offset = representedUtc - guess.getTime()
  return new Date(guess.getTime() - offset).toISOString()
}

export const evaluateAssetFreshness = (
  asset: Pick<TechnicalChartAsset, 'calendar' | 'date' | 'stale'>,
  now = new Date(),
): AssetFreshness => {
  const latestDate = asset.date
  if (asset.calendar === 'crypto-24x7') {
    const expectedDate = now.toISOString().slice(0, 10)
    const lagSessions = latestDate
      ? Math.max(
          0,
          Math.floor(
            (Date.parse(`${expectedDate}T00:00:00Z`) - Date.parse(`${latestDate}T00:00:00Z`)) /
              86_400_000,
          ),
        )
      : 999
    return {
      calendar: asset.calendar,
      expectedDate,
      latestDate,
      lagSessions,
      stale: asset.stale || lagSessions > 2,
      nextExpectedAt: `${shiftDate(expectedDate, 1)}T00:15:00Z`,
    }
  }
  if (asset.calendar === 'monthly') {
    const expectedDate = now.toISOString().slice(0, 10)
    const lagSessions = latestDate
      ? Math.max(
          0,
          Math.floor((now.getTime() - Date.parse(`${latestDate}T00:00:00Z`)) / 86_400_000),
        )
      : 999
    return {
      calendar: asset.calendar,
      expectedDate,
      latestDate,
      lagSessions,
      stale: asset.stale || lagSessions > 45,
      nextExpectedAt: `${shiftDate(expectedDate.slice(0, 7) + '-01', 32).slice(0, 7)}-05T12:00:00Z`,
    }
  }

  const config = configs[asset.calendar]
  const local = zonedParts(now, config.timeZone)
  const readyMinutes = config.closeMinutes + config.publicationDelayMinutes
  const expectedDate =
    isWeekday(local.date) && local.minutes >= readyMinutes
      ? local.date
      : previousWeekday(local.date)
  const lagSessions = businessSessionsBetween(latestDate, expectedDate)
  const nextLocalDate =
    isWeekday(local.date) && local.minutes < readyMinutes
      ? local.date
      : nextWeekday(local.date)
  return {
    calendar: asset.calendar,
    expectedDate,
    latestDate,
    lagSessions,
    stale: asset.stale || !latestDate || lagSessions > config.allowedLagSessions,
    nextExpectedAt: zonedDateTimeToIso(nextLocalDate, readyMinutes, config.timeZone),
  }
}
