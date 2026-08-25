export type DataScheduleId =
  | 'crossAsset'
  | 'aShare'
  | 'hotStocks'
  | 'funds'
  | 'news'
  | 'kols'
  | 'usIndexes'
  | 'norwayFund'

interface ScheduleSlot {
  hour: number
  minute: number
  weekdaysOnly?: boolean
  weekdays?: number[]
}

const schedules: Record<DataScheduleId, ScheduleSlot[]> = {
  // GitHub cron runs Monday-Friday at 23:20 UTC, which is Tuesday-Saturday in China.
  crossAsset: [{ hour: 7, minute: 20, weekdays: [2, 3, 4, 5, 6] }],
  aShare: [{ hour: 18, minute: 30 }],
  hotStocks: [
    // 22:30 UTC Monday-Friday becomes 06:30 Tuesday-Saturday in China.
    { hour: 6, minute: 30, weekdays: [2, 3, 4, 5, 6] },
    { hour: 18, minute: 20, weekdays: [1, 2, 3, 4, 5] },
  ],
  funds: [{ hour: 9, minute: 15 }],
  news: Array.from({ length: 96 }, (_, index) => ({
    hour: Math.floor(index / 4),
    minute: (index % 4) * 15,
  })),
  kols: [2, 8, 14, 20].map((hour) => ({ hour, minute: 15 })),
  // US close data is archived at 02:30 UTC Tuesday-Saturday.
  usIndexes: [{ hour: 10, minute: 30, weekdays: [2, 3, 4, 5, 6] }],
  norwayFund: [{ hour: 11, minute: 15, weekdays: [1] }],
}

const chinaParts = (value: Date) => {
  const shifted = new Date(value.getTime() + 8 * 60 * 60 * 1000)
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    date: shifted.getUTCDate(),
  }
}

const chinaTimestamp = (year: number, month: number, date: number, hour: number, minute: number) =>
  Date.UTC(year, month, date, hour - 8, minute)

export const nextScheduledUpdate = (schedule: DataScheduleId, after: Date) => {
  const base = chinaParts(after)
  for (let dayOffset = 0; dayOffset < 9; dayOffset += 1) {
    const calendar = new Date(Date.UTC(base.year, base.month, base.date + dayOffset))
    const weekday = calendar.getUTCDay()
    for (const slot of schedules[schedule]) {
      if (slot.weekdaysOnly && (weekday === 0 || weekday === 6)) continue
      if (slot.weekdays && !slot.weekdays.includes(weekday)) continue
      const timestamp = chinaTimestamp(
        calendar.getUTCFullYear(),
        calendar.getUTCMonth(),
        calendar.getUTCDate(),
        slot.hour,
        slot.minute,
      )
      if (timestamp > after.getTime()) return new Date(timestamp)
    }
  }
  return null
}

export const getDataScheduleState = (
  updatedAt: string,
  schedule: DataScheduleId,
  now = new Date(),
) => {
  const updated = new Date(updatedAt)
  const nextAfterUpdate = Number.isNaN(updated.getTime())
    ? null
    : nextScheduledUpdate(schedule, updated)
  return {
    updated: Number.isNaN(updated.getTime()) ? null : updated,
    expected: nextAfterUpdate,
    next: nextScheduledUpdate(schedule, now),
    pending: !nextAfterUpdate || now.getTime() > nextAfterUpdate.getTime() + 10 * 60 * 1000,
  }
}
