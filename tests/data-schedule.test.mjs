import assert from 'node:assert/strict'
import test from 'node:test'
import { getDataScheduleState, nextScheduledUpdate } from '../src/utils/data-schedule.ts'

test('data schedule exposes the missed run that made a snapshot overdue', () => {
  const state = getDataScheduleState(
    '2026-08-24T23:42:40.922Z',
    'crossAsset',
    new Date('2026-08-26T00:00:00.000Z'),
  )

  assert.equal(state.pending, true)
  assert.equal(state.expected?.toISOString(), '2026-08-25T23:20:00.000Z')
  assert.equal(state.updated?.toISOString(), '2026-08-24T23:42:40.922Z')
})

test('data schedule keeps a recently refreshed snapshot healthy until its next run is missed', () => {
  const state = getDataScheduleState(
    '2026-08-24T23:42:40.922Z',
    'crossAsset',
    new Date('2026-08-25T00:00:00.000Z'),
  )

  assert.equal(state.pending, false)
  assert.equal(state.expected?.toISOString(), '2026-08-25T23:20:00.000Z')
})

test('Norway fund schedule advances to Monday 11:15 in Asia Shanghai', () => {
  const next = nextScheduledUpdate('norwayFund', new Date('2026-08-24T04:00:00.000Z'))
  assert.equal(next?.toISOString(), '2026-08-31T03:15:00.000Z')
})

test('US index schedule includes the Saturday China run produced by Friday US trading', () => {
  const next = nextScheduledUpdate('usIndexes', new Date('2026-08-28T03:00:00.000Z'))
  assert.equal(next?.toISOString(), '2026-08-29T02:30:00.000Z')
})

test('cross-asset schedule includes Saturday morning after the Friday UTC cron', () => {
  const next = nextScheduledUpdate('crossAsset', new Date('2026-08-28T00:00:00.000Z'))
  assert.equal(next?.toISOString(), '2026-08-28T23:20:00.000Z')
})

test('hot-stock morning and evening slots preserve their different China weekdays', () => {
  const saturdayMorning = nextScheduledUpdate(
    'hotStocks',
    new Date('2026-08-28T11:00:00.000Z'),
  )
  const mondayEvening = nextScheduledUpdate(
    'hotStocks',
    new Date('2026-08-28T23:00:00.000Z'),
  )

  assert.equal(saturdayMorning?.toISOString(), '2026-08-28T22:30:00.000Z')
  assert.equal(mondayEvening?.toISOString(), '2026-08-31T10:20:00.000Z')
})
