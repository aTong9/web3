import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { normalizeMentions, updateRedditMonitor } from '../scripts/update-reddit-monitor.mjs'

test('mention rankings filter funds, malformed rows and duplicates before taking twenty', () => {
  const rows = Array.from({ length: 25 }, (_, i) => ({
    ticker: `S${i}`,
    name: `Company ${i}`,
    mentions: 30 - i,
    upvotes: 5,
    mentions_24h_ago: null,
  }))
  const result = normalizeMentions(
    {
      results: [
        { ticker: 'SPY', name: 'SPDR ETF Trust', mentions: 100, upvotes: 100 },
        { ticker: 'BAD', name: 'Bad', mentions: 'invalid', upvotes: 0 },
        ...rows,
        rows[0],
      ],
    },
    'us',
  )
  assert.equal(result.length, 20)
  assert.equal(result[0].symbol, 'S0')
  assert.equal(result[0].previousMentions, null)
  assert.equal(new Set(result.map((row) => row.symbol)).size, 20)
  assert.throws(() => normalizeMentions({}, 'crypto'))
})

test('snapshot never presents missing data as a complete top twenty', () => {
  const dataset = JSON.parse(
    readFileSync(new URL('../src/data/reddit-monitor.json', import.meta.url)),
  )
  assert.deepEqual(Object.keys(dataset.markets).sort(), ['crypto', 'us'])
  for (const key of ['us', 'crypto']) {
    const market = dataset.markets[key]
    assert.ok(['ok', 'stale', 'unavailable'].includes(market.status))
    assert.ok(market.rows.length <= 20)
    assert.equal(new Set(market.rows.map((row) => row.symbol)).size, market.rows.length)
    for (const row of market.rows) {
      assert.ok(Number.isFinite(row.mentions) && row.mentions > 0)
      assert.ok(row.discussionUrl.startsWith('https://www.reddit.com/'))
    }
  }
})

test('HTTP 200 non-JSON responses preserve successful timestamps and report collection failure', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'reddit-monitor-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const path = join(directory, 'snapshot.json')
  const previous = {
    updatedAt: '2026-10-21T05:40:29.178Z',
    markets: Object.fromEntries(
      ['us', 'crypto'].map((key) => [
        key,
        {
          status: 'ok',
          updatedAt: '2026-10-21T05:40:29.178Z',
          rows: [{ symbol: key === 'us' ? 'AAPL' : 'BTC', mentions: 5 }],
        },
      ]),
    ),
  }
  await writeFile(path, JSON.stringify(previous))
  t.mock.method(globalThis, 'fetch', async () => new Response('<?php invalid upstream response'))
  const result = await updateRedditMonitor(path)
  assert.equal(result.failed, true)
  const saved = JSON.parse(await readFile(path, 'utf8'))
  for (const key of ['us', 'crypto']) {
    assert.deepEqual(saved.markets[key].rows, previous.markets[key].rows)
    assert.equal(saved.markets[key].updatedAt, previous.markets[key].updatedAt)
    assert.equal(saved.markets[key].status, 'stale')
    assert.match(saved.markets[key].message, /JSON/)
    assert.ok(!saved.markets[key].message.includes('<?php'))
  }
})

test('partial source failure keeps healthy market fresh and empty failures unavailable', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'reddit-monitor-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const path = join(directory, 'snapshot.json')
  t.mock.method(globalThis, 'fetch', async (url) =>
    url.includes('all-stocks')
      ? Response.json({ results: [{ ticker: 'AAPL', name: 'Apple', mentions: 5, upvotes: 3 }] })
      : new Response('unavailable', { status: 503 }),
  )
  const result = await updateRedditMonitor(path)
  assert.equal(result.failed, true)
  const saved = JSON.parse(await readFile(path, 'utf8'))
  assert.equal(saved.markets.us.status, 'ok')
  assert.equal(saved.markets.us.updatedAt, saved.updatedAt)
  assert.equal(saved.markets.crypto.status, 'unavailable')
  assert.equal(saved.markets.crypto.updatedAt, null)
  assert.deepEqual(saved.markets.crypto.rows, [])
})

test('healthy sources write fresh timestamps and report success', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'reddit-monitor-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const path = join(directory, 'snapshot.json')
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json({
      results: [{ ticker: 'TEST', name: 'Example', mentions: 3, upvotes: 1 }],
    }),
  )
  assert.deepEqual(await updateRedditMonitor(path), { failed: false })
  const saved = JSON.parse(await readFile(path, 'utf8'))
  for (const market of Object.values(saved.markets)) {
    assert.equal(market.status, 'ok')
    assert.equal(market.updatedAt, saved.updatedAt)
    assert.equal(market.message, '')
    assert.equal(market.rows.length, 1)
  }
})
