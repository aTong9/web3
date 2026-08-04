export type DataScheduleId = 'crossAsset' | 'aShare' | 'hotStocks' | 'funds' | 'news' | 'kols'

interface ScheduleSlot {
  hour: number
  minute: number
  weekdaysOnly?: boolean
}

const schedules: Record<DataScheduleId, ScheduleSlot[]> = {
  crossAsset: [{ hour: 7, minute: 20, weekdaysOnly: true }],
  aShare: [{ hour: 18, minute: 30 }],
  hotStocks: [
    { hour: 6, minute: 30, weekdaysOnly: true },
    { hour: 18, minute: 20, weekdaysOnly: true },
  ],
  funds: [{ hour: 9, minute: 15 }],
  news: Array.from({ length: 96 }, (_, index) => ({
    hour: Math.floor(index / 4),
    minute: (index % 4) * 15,
  })),
  kols: [2, 8, 14, 20].map((hour) => ({ hour, minute: 15 })),
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
    next: nextScheduledUpdate(schedule, now),
    pending: !nextAfterUpdate || now.getTime() > nextAfterUpdate.getTime() + 10 * 60 * 1000,
  }
}
