import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)
const {
  buildReminders,
  countPendingReminders,
  emptyReminderStore,
  filterReminders,
  parseReminderStore,
  reminderToday,
  setReminderState,
  shiftReminderDate,
} = jiti('../src/utils/reminders.ts')
const { buildEarningsCalendar } = jiti('../src/utils/event-calendar.ts')
const { useLocalRecord } = jiti('../src/composables/use-local-record.ts')
const now = new Date('2026-09-26T08:00:00Z')
const note = (extra = {}) => ({
  id: 'note-1',
  assetId: 'us-aapl',
  title: 'Recheck cash flow',
  thesis: '',
  invalidation: '',
  reviewDate: '2026-09-25',
  conclusion: '',
  createdAt: '2026-09-24T08:00:00Z',
  updatedAt: '2026-09-24T08:00:00Z',
  sources: [],
  status: 'active',
  paperTradeId: null,
  ...extra,
})
const workspace = (notes = [note()]) => ({ version: 1, watchlist: [], notes })
const event = (extra = {}) => ({
  id: 'gdp-2026-09-30',
  type: 'gdp',
  title: 'GDP',
  titleEn: 'GDP',
  date: '2026-09-30',
  time: '08:30',
  status: 'scheduled',
  certainty: 'official',
  source: 'BEA',
  sourceUrl: 'https://www.bea.gov/news/schedule',
  checkedAt: '2026-09-26',
  assetIds: ['sp500'],
  details: '',
  detailsEn: '',
  ...extra,
})
const build = (options = {}) =>
  buildReminders({
    workspace: workspace(),
    events: [event()],
    state: emptyReminderStore(),
    now,
    ...options,
  })
const filters = (extra = {}) => ({
  status: 'pending',
  source: 'all',
  days: 30,
  query: '',
  onlyWatched: false,
  includeUnwatchedEarnings: false,
  watchedIds: ['us-aapl'],
  ...extra,
})

test('active dated notes and scheduled events aggregate without inventing unknown earnings dates', () => {
  const earnings = buildEarningsCalendar(
    [
      {
        symbol: 'AAPL',
        name: 'Apple',
        url: 'https://www.nasdaq.com',
        earnings: { nextEarningsDate: null, lastReportedDate: '09/20/2026' },
      },
      {
        symbol: 'AMD',
        name: 'AMD',
        url: 'https://www.nasdaq.com',
        earnings: { nextEarningsDate: '2026-10-10', lastReportedDate: null },
      },
    ],
    '2026-09-26',
  )
  const items = build({
    workspace: workspace([
      note(),
      note({ id: 'inactive', status: 'reviewed' }),
      note({ id: 'undated', reviewDate: '' }),
    ]),
    events: [...earnings.events, event()],
  })
  assert.equal(items.length, 3)
  assert.equal(items.find((item) => item.source === 'note').due, true)
  assert.equal(
    items.some((item) => item.id.includes('aapl')),
    false,
  )
  assert.equal(earnings.undated.length, 1)
})

test('revision changes revive handled notes and rescheduled events, but source verification alone does not', () => {
  const original = build()
  let state = setReminderState(emptyReminderStore(), original[0], 'done', null, now)
  state = setReminderState(state, original[1], 'done', null, now)
  assert.equal(
    build({ state }).every((item) => item.status === 'done'),
    true,
  )
  const changed = build({
    state,
    workspace: workspace([note({ updatedAt: '2026-09-26T09:00:00Z', reviewDate: '2026-09-28' })]),
    events: [event({ time: '09:00' })],
  })
  assert.equal(
    changed.every((item) => item.status === 'pending'),
    true,
  )
  assert.equal(build({ state, events: [event({ checkedAt: '2026-09-27' })] })[1].status, 'done')
  assert.equal(
    build({ state, workspace: workspace([note({ status: 'reviewed' })]) }).some(
      (item) => item.source === 'note',
    ),
    false,
  )
})

test('separate calendar occurrences never share handled state', () => {
  const first = build({ workspace: workspace([]) })[0]
  const state = setReminderState(emptyReminderStore(), first, 'done', null, now)
  const items = build({
    state,
    events: [event(), event({ id: 'gdp-2026-10-29', date: '2026-10-29' })],
    workspace: workspace([]),
  })
  assert.deepEqual(
    items.map((item) => item.status),
    ['done', 'pending'],
  )
})

test('timed plans remain before, at and after the exact instant without implying publication', () => {
  for (const [time, due, past] of [
    ['12:29:59', false, false],
    ['12:30:00', true, false],
    ['12:30:01', true, true],
  ]) {
    const items = build({ workspace: workspace([]), now: new Date(`2026-09-30T${time}Z`) })
    assert.equal(items.length, 1)
    assert.equal(items[0].instant, '2026-09-30T12:30:00.000Z')
    assert.equal(items[0].due, due)
    assert.equal(items[0].scheduledTimePassed, past)
    assert.equal(items[0].status, 'pending')
  }
  assert.equal(
    build({ events: [event({ status: 'reported' })], workspace: workspace([]) }).length,
    0,
  )
})

test('date-only schedules keep source dates, New York due dates and correct DST for timed events', () => {
  const dateOnly = event({ time: null })
  const beforeNyDay = build({
    events: [dateOnly],
    workspace: workspace([]),
    now: new Date('2026-09-29T18:00:00Z'),
  })[0]
  assert.equal(beforeNyDay.date, '2026-09-30')
  assert.equal(beforeNyDay.instant, null)
  assert.equal(beforeNyDay.due, false)
  const stillNyDay = build({
    events: [dateOnly],
    workspace: workspace([]),
    now: new Date('2026-09-30T18:00:00Z'),
  })[0]
  assert.equal(stillNyDay.scheduledTimePassed, false)
  assert.equal(stillNyDay.due, true)
  const november = build({ events: [event({ date: '2026-11-25' })], workspace: workspace([]) })[0]
  assert.equal(november.instant, '2026-11-25T13:30:00.000Z')
})

test('snooze expires on the chosen Beijing date, retains past sources and restores pending', () => {
  const item = build()[1]
  const state = setReminderState(emptyReminderStore(), item, 'snoozed', '2026-10-02', now)
  let reminder = build({ state, now: new Date('2026-10-01T15:59:59Z') })[1]
  assert.equal(reminder.status, 'snoozed')
  assert.equal(reminder.scheduledTimePassed, true)
  reminder = build({ state, now: new Date('2026-10-01T16:00:00Z') })[1]
  assert.equal(reminder.status, 'pending')
  assert.equal(reminder.due, true)
  const restored = setReminderState(state, reminder, 'pending', null, now)
  assert.equal(restored.states[0].snoozedUntil, null)
  assert.throws(() => setReminderState(state, item, 'snoozed', '2026-09-26', now))
  assert.throws(() => setReminderState(state, item, 'snoozed', '2026-02-30', now))
  assert.equal(
    build({ state, events: [event({ status: 'reported' })] }).some(
      (item) => item.source === 'macro',
    ),
    false,
  )
})

test('horizons keep overdue work and default to macro plus watched earnings; search and watch-only intersect', () => {
  const items = build({
    events: [
      event(),
      event({
        id: 'earn-aapl',
        type: 'earnings',
        assetIds: ['us-aapl'],
        time: null,
        title: 'Apple',
      }),
      event({ id: 'earn-amd', type: 'earnings', assetIds: ['us-amd'], time: null, title: 'AMD' }),
      event({ id: 'late', date: '2026-11-01' }),
    ],
  })
  assert.equal(filterReminders(items, filters(), now).length, 3)
  assert.equal(filterReminders(items, filters({ includeUnwatchedEarnings: true }), now).length, 4)
  assert.equal(
    filterReminders(items, filters({ watchedIds: [], onlyWatched: true }), now).length,
    0,
  )
  assert.equal(
    filterReminders(items, filters({ source: 'earnings', query: 'apple' }), now).length,
    1,
  )
  assert.equal(filterReminders(items, filters({ days: 90 }), now).length, 4)
  assert.equal(countPendingReminders(items, ['us-aapl'], now), 3)
  assert.equal(reminderToday(new Date('2026-09-26T16:00:00Z')), '2026-09-27')
  assert.equal(shiftReminderDate('2028-02-28', 1), '2028-02-29')
})

test('backup validation rejects invalid types, dates, duplicate IDs, unknown versions and oversized files', () => {
  const state = setReminderState(emptyReminderStore(), build()[0], 'done', null, now)
  assert.deepEqual(parseReminderStore(JSON.stringify(state)), state)
  for (const status of [['done'], {}, 1, true, 'unknown']) {
    assert.throws(() =>
      parseReminderStore(JSON.stringify({ version: 1, states: [{ ...state.states[0], status }] })),
    )
  }
  for (const extra of [
    { updatedAt: '2026-02-30T00:00:00Z' },
    { updatedAt: '2026-09-26T00:00:00' },
    { status: 'snoozed', snoozedUntil: '2026-02-30' },
    { snoozedUntil: '2026-10-01' },
    { revision: '' },
    { id: 'javascript:alert(1)' },
  ]) {
    assert.throws(() =>
      parseReminderStore(
        JSON.stringify({ version: 1, states: [{ ...state.states[0], ...extra }] }),
      ),
    )
  }
  assert.throws(() =>
    parseReminderStore(JSON.stringify({ version: 1, states: [state.states[0], state.states[0]] })),
  )
  assert.throws(() => parseReminderStore(JSON.stringify({ version: 2, states: [] })))
  assert.throws(() => parseReminderStore(' '.repeat(5_000_001)))
})

test('reminder persistence preserves saved values on quota failure, stale tabs and corrupt storage', () => {
  const previous = globalThis.window
  let raw = JSON.stringify(emptyReminderStore())
  let failWrite = false
  globalThis.window = {
    localStorage: {
      getItem: () => raw,
      setItem: (_, value) => {
        if (failWrite) throw new Error('Quota')
        raw = value
      },
    },
  }
  try {
    const local = useLocalRecord('reminders', emptyReminderStore, parseReminderStore)
    const done = setReminderState(emptyReminderStore(), build()[0], 'done', null, now)
    failWrite = true
    assert.equal(local.save(done), false)
    assert.deepEqual(local.record.value, emptyReminderStore())
    failWrite = false
    raw = JSON.stringify(done)
    assert.equal(local.save(emptyReminderStore()), false)
    assert.equal(local.error.value, 'conflict')
    local.reload()
    assert.deepEqual(local.record.value, done)
    raw = '{corrupt'
    local.reload()
    assert.equal(local.save(emptyReminderStore()), false)
    assert.equal(raw, '{corrupt')
  } finally {
    globalThis.window = previous
  }
})
