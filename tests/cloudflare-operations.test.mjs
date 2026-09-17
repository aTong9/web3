import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { DatabaseSync } from 'node:sqlite'
import { createJiti } from 'jiti'

const { cloudflareFetch } = await createJiti(import.meta.url).import(
  '../src/utils/cloudflare-fetch.ts',
)

test('panel throttles automatic refresh but permits explicit refresh', async () => {
  const source = fs.readFileSync(
    new URL('../src/components/BtcAutoTradingPanel.vue', import.meta.url),
    'utf8',
  )
  const loadSource = source.match(/const load = async \(silent = false\) => \{[\s\S]*?\n\}/)[0]
  let reads = 0
  const clock = { now: () => 1_000_000 }
  const load = new Function(
    'quantApi',
    'Date',
    `
    const refreshing = { value: false }, busy = { value: false }, loading = { value: false }, error = { value: null };
    const refreshIntervalMs = 300_000;
    let lastAutomaticLoad = 0;
    const hydrate = () => {}, loadCalibration = () => {}, t = () => '';
    ${loadSource}
    return load;
  `,
  )(
    {
      btcAutoTrading: async () => {
        reads += 1
      },
    },
    clock,
  )
  await load()
  await load(true)
  await load(true)
  assert.equal(reads, 1)
  await load()
  assert.equal(reads, 2)
  clock.now = () => 1_300_000
  await load(true)
  assert.equal(reads, 3)
})

test('Cloudflare coalesces identical reads, isolates credentials, and never reuses reads across writes', async () => {
  const original = globalThis.fetch
  const calls = []
  globalThis.fetch = (url, options) =>
    new Promise((resolve, reject) => calls.push({ url, options, resolve, reject }))
  try {
    const first = cloudflareFetch('/data', { headers: { Authorization: 'Bearer a' } })
    const second = cloudflareFetch('/data', { headers: { authorization: 'Bearer a' } })
    assert.equal(calls.length, 1)
    calls[0].resolve(new Response('{"ok":true}'))
    assert.deepEqual(await (await first).json(), { ok: true })
    assert.deepEqual(await (await second).json(), { ok: true })

    const oldRead = cloudflareFetch('/data')
    const otherUser = cloudflareFetch('/data', { headers: { Authorization: 'Bearer b' } })
    const write = cloudflareFetch('/data', { method: 'POST' })
    const newRead = cloudflareFetch('/data')
    assert.equal(calls.length, 5)
    for (const call of calls.slice(1)) call.resolve(new Response('ok'))
    await Promise.all([oldRead, otherUser, write, newRead])

    const failed = cloudflareFetch('/failure')
    calls.at(-1).reject(new Error('offline'))
    await assert.rejects(failed, /offline/)
    const retry = cloudflareFetch('/failure')
    assert.equal(calls.length, 7)
    calls.at(-1).resolve(new Response('recovered'))
    assert.equal(await (await retry).text(), 'recovered')
  } finally {
    globalThis.fetch = original
  }
})

test('unchanged quant snapshots do not write rows, changed payload with same timestamp does', () => {
  const db = new DatabaseSync(':memory:')
  try {
    db.exec(
      'CREATE TABLE quant_snapshots(id TEXT, generated_at TEXT, source_updated_at TEXT, payload TEXT, created_at INTEGER PRIMARY KEY)',
    )
    const source = fs.readFileSync(new URL('../worker/index.ts', import.meta.url), 'utf8')
    const sql = source.match(/`(INSERT INTO quant_snapshots[\s\S]*?)`/)[1]
    const insert = db.prepare(sql)
    const run = (id, payload) =>
      insert.run({ 1: id, 2: 'same-time', 3: 'same-time', 4: payload }).changes
    assert.equal(run('a', '{"value":1}'), 1)
    assert.equal(run('b', '{"value":1}'), 0)
    assert.equal(run('c', '{"value":2}'), 1)
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM quant_snapshots').get().count, 2)
  } finally {
    db.close()
  }
})
