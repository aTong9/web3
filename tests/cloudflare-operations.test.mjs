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

test('public reads are reused across page visits, expire, and invalidate on writes', async (t) => {
  let reads = 0
  let now = 1000
  t.mock.method(Date, 'now', () => now)
  t.mock.method(globalThis, 'fetch', async () => { reads++; return Response.json({ reads }) })
  const url = 'https://cache.test/api/technical-config'
  await cloudflareFetch(url)
  await cloudflareFetch(url)
  assert.equal(reads, 1)
  now += 61_000
  await cloudflareFetch(url)
  assert.equal(reads, 2)
  await cloudflareFetch('https://cache.test/api/admin/technical-config', { method: 'PATCH' })
  await cloudflareFetch(url)
  assert.equal(reads, 4)
})

test('quota responses suppress subsequent reads until Retry-After, without retrying writes', async (t) => {
  let reads = 0
  let now = 1000
  t.mock.method(Date, 'now', () => now)
  t.mock.method(globalThis, 'fetch', async () => {
    reads++
    return Response.json({ error: 'quota' }, { status: 429, headers: { 'Retry-After': '60' } })
  })
  const url = 'https://quota.test/api/market/quotes'
  assert.equal((await cloudflareFetch(url)).status, 429)
  assert.equal((await cloudflareFetch(url)).status, 429)
  assert.equal(reads, 1)
  await cloudflareFetch(url, { method: 'POST' })
  assert.equal(reads, 2)
  now += 61_000
  await cloudflareFetch(url)
  assert.equal(reads, 3)
})

test('public Worker configuration cache avoids repeat D1 reads and keeps CORS request-specific', async (t) => {
  const worker = (await createJiti(import.meta.url, {
    alias: { '@': new URL('../src', import.meta.url).pathname },
  }).import('../worker/index.ts')).default
  const entries = new Map()
  const originalCaches = globalThis.caches
  globalThis.caches = { default: {
    match: async (key) => entries.get(key.url)?.clone(),
    put: async (key, value) => { entries.set(key.url, value.clone()) },
  } }
  t.after(() => { globalThis.caches = originalCaches })
  let reads = 0
  const env = { ALLOWED_ORIGINS: 'https://one.test,https://two.test', DB: {
    prepare: () => ({ first: async () => { reads++; return {
      version: 1, config_json: '{}', formula_version: 'v1', created_at: '2026-09-22', created_by: 'admin',
    } } }),
  } }
  const get = (origin) => worker.fetch(new Request('https://api.test/api/technical-config', {
    headers: { Origin: origin },
  }), env)
  const first = await get('https://one.test')
  const second = await get('https://two.test')
  assert.equal(first.status, 200)
  assert.equal(second.headers.get('Access-Control-Allow-Origin'), 'https://two.test')
  assert.equal(reads, 1)
  entries.clear()
  await get('https://one.test')
  assert.equal(reads, 2)
})

test('D1 failures returned as 500 back off, while successful permission reads remain uncached', async (t) => {
  let calls = 0
  t.mock.method(globalThis, 'fetch', async (url) => {
    calls++
    return Response.json({}, { status: url.includes('/auth/me') ? 200 : 500 })
  })
  for (let i = 0; i < 3; i++) await cloudflareFetch('https://d1.test/api/quant/dashboard')
  assert.equal(calls, 1)
  await cloudflareFetch('https://d1.test/api/auth/me')
  await cloudflareFetch('https://d1.test/api/auth/me')
  assert.equal(calls, 3)
})
