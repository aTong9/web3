import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)
const { parseFeed, syncKols, default: worker } = jiti('../worker/kols.ts')

test('KOL Worker rejects unauthenticated private reads before touching D1', async () => {
  const response = await worker.fetch(new Request('https://kols.test/api/kols'), {
    ALLOWED_ORIGINS: '',
    DB: {
      prepare: () => {
        throw new Error('DB should not be read')
      },
    },
  })
  assert.equal(response.status, 401)
})

test('KOL Worker parses RSS and JSON Feed as safe dated content', async () => {
  const rss = `<?xml version="1.0"?><rss version="2.0"><channel><title>Feed</title><item><guid>one</guid><title>Post</title><link>https://example.com/post</link><pubDate>Tue, 29 Sep 2026 00:00:00 GMT</pubDate></item><item><title>Bad</title><link>javascript:alert(1)</link></item></channel></rss>`
  const xmlItems = await parseFeed(rss)
  assert.equal(xmlItems.length, 1)
  assert.equal(xmlItems[0].publishedAt, '2026-09-29T00:00:00.000Z')
  const jsonItems = await parseFeed(
    JSON.stringify({
      version: 'https://jsonfeed.org/version/1.1',
      items: [
        {
          id: 'two',
          title: 'News',
          url: 'https://example.com/news',
          content_html: '<b>Summary</b>',
        },
      ],
    }),
  )
  assert.equal(jsonItems[0].description, 'Summary')
  assert.equal(jsonItems[0].publishedAt, null)
})

test('KOL sync skips unchanged IDs and URLs, and retries after failure', async (t) => {
  const rows = [
    { owner_user_id: 'owner-a', id: 'a1', feed_url: 'https://feed.test/a1', failure_count: 0 },
    { owner_user_id: 'owner-a', id: 'a2', feed_url: 'https://feed.test/a2', failure_count: 0 },
    { owner_user_id: 'owner-b', id: 'b1', feed_url: 'https://feed.test/a1', failure_count: 0 },
  ]
  const saved = new Map(rows.map((row) => [row.id, new Map()]))
  const counts = { fetches: 0, inserts: 0, retention: 0, status: 0 }
  let fail = false
  let renamed = false
  t.mock.method(globalThis, 'fetch', async () => {
    counts.fetches++
    const feed = JSON.stringify({
      version: 'https://jsonfeed.org/version/1.1',
      items: Array.from({ length: 12 }, (_, i) => ({
        id: renamed && i === 0 ? 'renamed' : `item-${i}`,
        title: `Item ${i}`,
        url: `https://feed.test/item-${i}`,
      })),
    })
    return new Response(fail ? 'failed' : feed, { status: fail ? 503 : 200 })
  })
  const db = {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            sql,
            args,
            async all() {
              if (sql.includes('FROM kol_subscriptions'))
                return {
                  results: rows.filter(
                    (row) => !row.next_check_at || row.next_check_at <= new Date().toISOString(),
                  ),
                }
              const count = (args.length - 2) / 2
              const ids = args.slice(2, 2 + count)
              const urls = args.slice(2 + count)
              return {
                results: [...saved.get(args[1])]
                  .filter(([id, url]) => ids.includes(id) || urls.includes(url))
                  .map(([id, url]) => ({ id, url })),
              }
            },
            async first() {
              return saved.get(args[1]).size ? { 1: 1 } : null
            },
            async run() {
              const row = rows.find((item) => item.id === args.at(-1))
              row.status = args[0]
              row.failure_count = args[3]
              row.next_check_at = args[4]
            },
          }
        },
      }
    },
    async batch(statements) {
      for (const { sql, args } of statements) {
        if (sql.includes('INSERT OR IGNORE')) {
          counts.inserts++
          saved.get(args[1]).set(args[2], args[5])
        } else if (sql.includes('DELETE FROM kol_items')) counts.retention++
        else if (sql.includes('UPDATE kol_subscriptions')) {
          counts.status++
          const row = rows.find((item) => item.id === args.at(-1))
          row.status = 'ok'
          row.failure_count = 0
          row.next_check_at = null
        }
      }
    },
  }
  const env = { DB: db }

  await syncKols(env)
  assert.deepEqual(counts, { fetches: 3, inserts: 36, retention: 3, status: 3 })
  renamed = true
  await syncKols(env)
  assert.deepEqual(counts, { fetches: 6, inserts: 36, retention: 3, status: 6 })

  fail = true
  await syncKols(env)
  assert.equal(rows[0].status, 'stale')
  assert.equal(rows[0].failure_count, 1)
  assert.equal(saved.get('a1').size, 12)
  assert.ok(rows[0].next_check_at > new Date().toISOString())
  fail = false
  for (const row of rows) row.next_check_at = new Date(0).toISOString()
  await syncKols(env)
  assert.equal(rows[0].status, 'ok')
  assert.equal(rows[0].failure_count, 0)
  assert.equal(saved.get('a1').size, 12)
  assert.deepEqual(counts, { fetches: 12, inserts: 36, retention: 3, status: 9 })
})

test('KOL CORS preflight can be reused only by an allowed origin', async () => {
  const allowed = await worker.fetch(
    new Request('https://kols.test/api/kols', {
      method: 'OPTIONS',
      headers: { Origin: 'https://app.test' },
    }),
    { ALLOWED_ORIGINS: 'https://app.test', DB: {} },
  )
  assert.equal(allowed.headers.get('access-control-max-age'), '86400')
  assert.equal(allowed.headers.get('cache-control'), 'no-store')
  const denied = await worker.fetch(
    new Request('https://kols.test/api/kols', {
      method: 'OPTIONS',
      headers: { Origin: 'https://other.test' },
    }),
    { ALLOWED_ORIGINS: 'https://app.test', DB: {} },
  )
  assert.equal(denied.headers.get('access-control-max-age'), null)
  assert.equal(denied.headers.get('access-control-allow-origin'), null)
})
