import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { normalizeMentions } from '../scripts/update-reddit-monitor.mjs'

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
