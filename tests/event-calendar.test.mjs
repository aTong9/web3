import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url, {
  alias: { '@': new URL('../src', import.meta.url).pathname },
})
const {
  isCalendarDate,
  calendarEventInstant,
  calendarEventDate,
  calendarEventIsPast,
  buildEarningsCalendar,
  deduplicateCalendarEvents,
  filterCalendarEvents,
  calendarEventsToIcs,
} = jiti('../src/utils/event-calendar.ts')
const { macroCalendarEvents } = jiti('../src/data/macro-calendar.ts')
const event = (overrides = {}) => ({
  id: 'cpi-2026-10-14',
  type: 'inflation',
  title: '美国 CPI',
  titleEn: 'US CPI',
  date: '2026-10-14',
  time: '08:30',
  status: 'scheduled',
  certainty: 'official',
  source: 'BLS',
  sourceUrl: 'https://www.bls.gov/schedule/2026/10_sched.htm',
  checkedAt: '2026-09-26',
  assetIds: ['sp500'],
  details: '官方计划',
  detailsEn: 'Official schedule',
  ...overrides,
})
const filters = (overrides = {}) => ({
  start: '2026-10-01',
  end: '2026-11-30',
  type: 'all',
  query: '',
  onlyWatched: false,
  watchedIds: [],
  timeZone: 'Asia/Shanghai',
  ...overrides,
})

test('US Eastern releases follow DST; date-only events never change their date', () => {
  assert.equal(calendarEventInstant(event()).toISOString(), '2026-10-14T12:30:00.000Z')
  assert.equal(
    calendarEventInstant(event({ date: '2026-11-10' })).toISOString(),
    '2026-11-10T13:30:00.000Z',
  )
  const late = event({ time: '20:30' })
  assert.equal(calendarEventDate(late, 'Asia/Shanghai'), '2026-10-15')
  assert.equal(calendarEventDate(late, 'America/New_York'), '2026-10-14')
  for (const timeZone of ['Asia/Shanghai', 'America/New_York', 'UTC']) {
    assert.equal(calendarEventDate(event({ time: null }), timeZone), '2026-10-14')
  }
  assert.throws(
    () => calendarEventInstant(event({ date: '2026-03-08', time: '02:30' })),
    /nonexistent/,
  )
  assert.throws(
    () => calendarEventInstant(event({ date: '2026-11-01', time: '01:30' })),
    /Ambiguous/,
  )
})

test('invalid dates, unsafe sources and injection IDs are rejected', () => {
  for (const value of [
    '2026-02-30',
    '2025-02-29',
    '0000-01-01',
    '2026-13-01',
    '10/14/2026',
    '2026-01-01\n',
  ])
    assert.equal(isCalendarDate(value), false)
  assert.equal(isCalendarDate('2024-02-29'), true)
  assert.throws(() => calendarEventInstant(event({ time: '24:00' })))
  assert.throws(() => calendarEventInstant(event({ date: '2026-02-30' })))
  for (const sourceUrl of [
    'javascript:alert(1)',
    'https://example.com/\r\nBEGIN:VEVENT',
    '//example.com',
  ])
    assert.throws(() => calendarEventsToIcs([event({ sourceUrl })]))
  assert.throws(() => calendarEventsToIcs([event({ id: 'bad\nEND:VEVENT' })]))
})

test('filters use inclusive display dates, query, type and real watched IDs', () => {
  const late = event({ time: '20:30' })
  assert.equal(
    filterCalendarEvents([late], filters({ start: '2026-10-15', end: '2026-10-15' })).length,
    1,
  )
  assert.equal(
    filterCalendarEvents([late], filters({ start: '2026-10-14', end: '2026-10-14' })).length,
    0,
  )
  assert.equal(
    filterCalendarEvents([event()], filters({ query: 'cpi', type: 'inflation' })).length,
    1,
  )
  assert.equal(filterCalendarEvents([event()], filters({ type: 'earnings' })).length, 0)
  assert.equal(
    filterCalendarEvents([event()], filters({ onlyWatched: true, watchedIds: ['us-aapl'] })).length,
    1,
  )
  assert.equal(
    filterCalendarEvents([event()], filters({ onlyWatched: true, watchedIds: [] })).length,
    0,
  )
  assert.equal(filterCalendarEvents([event()], filters({ start: '2026-12-01' })).length, 0)
  assert.equal(filterCalendarEvents([event()], filters({ start: 'not-a-date' })).length, 0)
  assert.equal(
    filterCalendarEvents(
      [event({ type: 'earnings', assetIds: ['us-aapl'] })],
      filters({ onlyWatched: true, watchedIds: ['us-msft'] }),
    ).length,
    0,
  )
})

test('elapsed schedules remain scheduled; reported records require source evidence', () => {
  const scheduled = event()
  assert.equal(calendarEventIsPast(scheduled, new Date('2026-10-15T00:00:00Z')), true)
  assert.equal(scheduled.status, 'scheduled')
  assert.equal(calendarEventIsPast(event({ time: null }), new Date('2026-10-14T23:59:00Z')), false)
})

test('earnings retain aggregator provenance and unknown dates without inventing midnight events', () => {
  const companies = [
    {
      symbol: 'AAPL',
      name: 'Apple',
      url: 'https://www.nasdaq.com/market-activity/stocks/aapl',
      earnings: { lastReportedDate: '7/30/2026', nextEarningsDate: '2026-10-29' },
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA',
      url: 'https://www.nasdaq.com/market-activity/stocks/nvda',
      earnings: { lastReportedDate: 'bad', nextEarningsDate: null },
    },
    {
      symbol: 'UNKNOWN',
      name: 'Unknown',
      url: 'https://example.com',
      earnings: { lastReportedDate: null, nextEarningsDate: '2026-02-30' },
    },
  ]
  const result = buildEarningsCalendar(companies, '2026-09-25T00:39:54Z')
  assert.equal(result.events.length, 2)
  assert.deepEqual(
    result.undated.map((company) => company.symbol),
    ['NVDA', 'UNKNOWN'],
  )
  assert.equal(result.events[0].date, '2026-07-30')
  assert.equal(result.events[0].status, 'reported')
  assert.equal(result.events[1].certainty, 'estimated')
  assert.equal(result.events[1].time, null)
  assert.equal(result.events[1].source, 'StockAnalysis')
  assert.deepEqual(result.events[1].assetIds, ['us-aapl'])
})

test('duplicate event IDs collapse and reported evidence wins over an estimate', () => {
  assert.equal(deduplicateCalendarEvents([event(), event()]).length, 1)
  assert.equal(
    deduplicateCalendarEvents([event({ status: 'reported' }), event()])[0].status,
    'reported',
  )
  assert.equal(
    deduplicateCalendarEvents([event(), event({ status: 'reported' })])[0].status,
    'reported',
  )
  assert.equal(
    deduplicateCalendarEvents([
      event({ status: 'reported', checkedAt: '2026-09-26' }),
      event({ status: 'reported', checkedAt: '2026-09-20' }),
    ])[0].checkedAt,
    '2026-09-26',
  )
})

test('ICS exports stable UID, UTC instants, full-day dates, escaped text and UTF-8 line folds', () => {
  const entries = [
    event({ title: '含逗号,分号;反斜线\\与换行\nBEGIN:VEVENT' + '很长的中文'.repeat(30) }),
    event({ id: 'date-only', time: null, certainty: 'estimated' }),
  ]
  const ics = calendarEventsToIcs(entries)
  assert.equal(ics, calendarEventsToIcs(entries))
  assert.ok(ics.includes('UID:cpi-2026-10-14@fire-research.local\r\n'))
  assert.ok(ics.includes('DTSTART:20261014T123000Z\r\n'))
  assert.ok(ics.includes('DTSTART;VALUE=DATE:20261014\r\nDTEND;VALUE=DATE:20261015'))
  assert.ok(ics.includes('STATUS:TENTATIVE'))
  assert.equal(ics.split('\r\nBEGIN:VEVENT\r\n').length - 1, 2)
  const unfolded = ics.replace(/\r\n /g, '')
  assert.ok(unfolded.includes('含逗号\\,分号\\;反斜线\\\\与换行\\nBEGIN:VEVENT'))
  assert.ok(ics.split('\r\n').every((line) => Buffer.byteLength(line, 'utf8') <= 75))
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'))
  assert.equal(
    calendarEventsToIcs([event({ date: '2026-11-10' })]).includes('DTSTART:20261110T133000Z'),
    true,
  )
})

test('verified official snapshot contains usable October and November BLS, BEA and Fed dates', () => {
  const events = deduplicateCalendarEvents(macroCalendarEvents)
  assert.equal(events.length, 11)
  assert.equal(events.filter((item) => item.date.startsWith('2026-11')).length, 4)
  assert.ok(
    events.some((item) => item.type === 'fomc' && item.date === '2026-10-28' && item.time === null),
  )
  assert.ok(events.every((item) => item.status === 'scheduled' && item.certainty === 'official'))
})
