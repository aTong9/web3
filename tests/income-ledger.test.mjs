import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url, {
  alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) },
})
const { emptyIncomeLedger, parseIncomeLedger, summarizeIncomeLedger, isIncomeLedgerDate } = jiti(
  '../src/utils/income-ledger.ts',
)
const { useLocalRecord } = jiti('../src/composables/use-local-record.ts')
const entry = (overrides = {}) => ({
  id: 'work-1',
  projectId: 'upwork',
  projectName: 'Upwork',
  date: '2026-09-26',
  hours: 2,
  receivedIncome: 100,
  pendingIncome: 50,
  cost: 20,
  currency: 'USD',
  phase: 'trial',
  notes: 'Completed a delivery',
  conclusion: 'Review the time budget',
  ...overrides,
})
const ledger = (entries = [entry()]) => ({ version: 1, entries })
const parse = (value) => parseIncomeLedger(JSON.stringify(value))

test('ledger round trips including custom projects, removed catalog projects and small crypto amounts', () => {
  for (const entries of [
    [],
    [entry()],
    [
      entry({
        projectId: null,
        projectName: 'My project',
        currency: 'BTC',
        receivedIncome: 0.00000001,
      }),
    ],
    [entry({ projectId: 'removed' })],
  ]) {
    assert.deepEqual(parse(ledger(entries)), ledger(entries))
  }
  const first = emptyIncomeLedger()
  first.entries.push(entry())
  assert.equal(emptyIncomeLedger().entries.length, 0)
})

test('dates, money, hours and imported record shapes are strictly validated', () => {
  for (const date of [
    '2026-02-29',
    '2026-04-31',
    '2026-13-01',
    '2026-00-01',
    '0000-01-01',
    '2026-9-1',
  ]) {
    assert.equal(isIncomeLedgerDate(date), false)
    assert.throws(() => parse(ledger([entry({ date })])))
  }
  assert.equal(isIncomeLedgerDate('2028-02-29'), true)
  for (const overrides of [
    { id: '' },
    { projectName: ' ' },
    { projectId: 1 },
    { projectName: 'a'.repeat(161) },
    { hours: -1 },
    { hours: 24.1 },
    { hours: '2' },
    { receivedIncome: -1 },
    { receivedIncome: null },
    { receivedIncome: '100' },
    { receivedIncome: 1_000_000_001 },
    { receivedIncome: 0.000000001 },
    { pendingIncome: -1 },
    { cost: -1 },
    { currency: 'usd' },
    { currency: '<HTML>' },
    { currency: '' },
    { phase: 'guaranteed' },
    { notes: 'x'.repeat(5001) },
    { conclusion: [] },
    { unexpected: true },
  ])
    assert.throws(() => parse(ledger([entry(overrides)])))
  for (const invalid of [
    null,
    [],
    {},
    { version: 2, entries: [] },
    { version: 1, entries: {} },
    ledger([entry(), entry()]),
    ledger([null]),
  ]) {
    assert.throws(() => parse(invalid))
  }
  assert.throws(() => parseIncomeLedger('{broken'))
})

test('totals separate currencies, exclude pending income and calculate actual hourly income', () => {
  const summaries = summarizeIncomeLedger([
    entry(),
    entry({ id: '2', receivedIncome: 20, pendingIncome: 200, cost: 10, hours: 3 }),
    entry({ id: '3', currency: 'CNY', receivedIncome: 40, pendingIncome: 400, cost: 50, hours: 2 }),
  ])
  assert.deepEqual(summaries, [
    {
      currency: 'CNY',
      receivedIncome: 40,
      pendingIncome: 400,
      cost: 50,
      netIncome: -10,
      hours: 2,
      hourlyIncome: -5,
      count: 1,
    },
    {
      currency: 'USD',
      receivedIncome: 120,
      pendingIncome: 250,
      cost: 30,
      netIncome: 90,
      hours: 5,
      hourlyIncome: 18,
      count: 2,
    },
  ])
  assert.deepEqual(summarizeIncomeLedger([]), [])
})

test('zero hours, zero revenue, cost-only entries and fractional values remain meaningful', () => {
  const [costOnly] = summarizeIncomeLedger([
    entry({ hours: 0, receivedIncome: 0, pendingIncome: 100 }),
  ])
  assert.equal(costOnly.netIncome, -20)
  assert.equal(costOnly.hourlyIncome, null)
  const [timeOnly] = summarizeIncomeLedger([
    entry({ receivedIncome: 0, cost: 0, pendingIncome: 0 }),
  ])
  assert.equal(timeOnly.hourlyIncome, 0)
  const [fractional] = summarizeIncomeLedger([
    entry({ receivedIncome: 0.1, cost: 0, hours: 0.1 }),
    entry({ id: '2', receivedIncome: 0.2, cost: 0, hours: 0.2 }),
  ])
  assert.equal(fractional.receivedIncome, 0.3)
  assert.equal(fractional.hours, 0.3)
  assert.equal(fractional.hourlyIncome, 1)
  const [largeOffset] = summarizeIncomeLedger([
    entry({ receivedIncome: 1_000_000_000, cost: 1_000_000_000 }),
    entry({ id: '2', receivedIncome: 0.01, cost: 0 }),
  ])
  assert.equal(largeOffset.netIncome, 0.01)
  const [largeDecimals] = summarizeIncomeLedger([
    entry({ receivedIncome: 999_999_999.99, cost: 999_999_999.98 }),
  ])
  assert.equal(largeDecimals.netIncome, 0.01)
  const [scientific] = summarizeIncomeLedger([
    entry({ receivedIncome: 0.00000003, cost: 0.00000002 }),
  ])
  assert.equal(scientific.netIncome, 0.00000001)
})

test('bad imports, failed deletion writes and concurrent edits preserve the saved ledger', () => {
  const originalWindow = globalThis.window
  let raw = JSON.stringify(ledger())
  let rejectWrite = false
  globalThis.window = {
    localStorage: {
      getItem: () => raw,
      setItem: (_, value) => {
        if (rejectWrite) throw new Error('Quota exceeded')
        raw = value
      },
    },
  }
  try {
    const state = useLocalRecord('test-ledger', emptyIncomeLedger, parseIncomeLedger)
    assert.equal(state.save({ version: 1, entries: [entry({ cost: -1 })] }), false)
    assert.deepEqual(state.record.value, ledger())
    assert.deepEqual(JSON.parse(raw), ledger())
    rejectWrite = true
    assert.equal(state.save(emptyIncomeLedger()), false)
    assert.equal(state.record.value.entries.length, 1)
    rejectWrite = false
    raw = JSON.stringify(ledger([entry({ id: 'other-tab' })]))
    assert.equal(state.save(emptyIncomeLedger()), false)
    assert.equal(state.error.value, 'conflict')
    state.reload()
    assert.equal(state.record.value.entries[0].id, 'other-tab')
    assert.equal(state.save(emptyIncomeLedger()), true)
    assert.deepEqual(JSON.parse(raw), emptyIncomeLedger())
    raw = '{broken'
    state.reload()
    assert.equal(state.error.value, 'load')
    assert.equal(state.save(ledger()), false)
    assert.equal(raw, '{broken')
  } finally {
    globalThis.window = originalWindow
  }
})
