import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)
const { dataHealthDefinitions, inspectDataHealth, dataHealthStatus } = jiti(
  '../src/utils/data-health.ts',
)
const definition = dataHealthDefinitions.find((item) => item.id === 'reddit-monitor')
const snapshot = {
  updatedAt: '2026-09-25T01:10:00Z',
  markets: { us: { rows: [{}], status: 'ok' }, crypto: { rows: [], status: 'ok' } },
}

test('health metadata distinguishes schedule, source errors, missing collections and data time from attempts', () => {
  const result = inspectDataHealth(definition, snapshot)
  assert.equal(result.count, 1)
  assert.equal(dataHealthStatus(result, new Date('2026-09-26T01:05:00Z')), 'current')
  assert.equal(dataHealthStatus(result, new Date('2026-09-26T01:11:00Z')), 'overdue')
  assert.equal(
    dataHealthStatus(
      inspectDataHealth(definition, {
        ...snapshot,
        sourceStatus: [{ source: 'Reddit', status: 'failed' }],
      }),
      new Date('2026-09-25T02:00:00Z'),
    ),
    'attention',
  )
  assert.equal(dataHealthStatus(inspectDataHealth(definition, null)), 'unavailable')
  assert.equal(inspectDataHealth(definition, { ...snapshot, markets: {} }).count, null)
  assert.equal(
    inspectDataHealth(definition, {
      ...snapshot,
      dataUpdatedAt: null,
      attemptedAt: snapshot.updatedAt,
    }).updatedAt,
    null,
  )
  assert.equal(dataHealthStatus(result, new Date('2026-09-24T01:05:00Z')), 'attention')
  for (const updatedAt of ['2026-02-30T01:10:00Z', '2026-09-25T01:10:00', '2026-09-25T24:00:00Z']) {
    assert.equal(inspectDataHealth(definition, { ...snapshot, updatedAt }).updatedAt, null)
  }
  assert.equal(
    dataHealthDefinitions.find((item) => item.id === 'technical-events').route,
    '/asset-technical',
  )
})

test('health index covers valid files without bundling their histories and treats unavailable options honestly', () => {
  assert.equal(new Set(dataHealthDefinitions.map((item) => item.id)).size, 19)
  for (const definition of dataHealthDefinitions) {
    const raw = readFileSync(`src/data/${definition.id}.json`, 'utf8')
    const data = JSON.parse(raw)
    const projected = inspectDataHealth(definition, data)
    assert.ok(projected.count > 0, definition.id)
    assert.ok(
      !projected.issues.some((issue) => issue.startsWith('missing-collection:')),
      definition.id,
    )
    assert.ok(JSON.stringify(projected).length < 12_000, definition.id)
    if (definition.id === 'option-market' && data.dataUpdatedAt === null) {
      assert.equal(projected.updatedAt, null)
      assert.ok(projected.attemptedAt)
      assert.ok(projected.sourceIssues.length > 0)
    }
  }
})
