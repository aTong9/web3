import assert from 'node:assert/strict'
import test from 'node:test'
import { kolId, mergeKolResult } from '../scripts/lib/kol-result.mjs'
import { mergeSubscriptions, readOpmlSubscriptions } from '../scripts/lib/import-kols-opml.mjs'

test('OPML imports nested feeds once, ignores unsafe links, and preserves existing settings', async () => {
  const xml = `<opml><body><outline text="Group"><outline text="First" xmlUrl="https://example.com/rss" htmlUrl="https://example.com/"/><outline title="Duplicate" xmlUrl="https://example.com/rss"/><outline text="Unsafe" xmlUrl="javascript:alert(1)"/></outline></body></opml>`
  const rows = await readOpmlSubscriptions(xml)
  assert.equal(rows.length, 1)
  assert.deepEqual(rows[0].tags, ['Group'])
  const existing = [
    {
      name: 'Old',
      url: 'https://old.example/',
      feedUrl: 'https://example.com/rss',
      enabled: false,
      tags: ['美股'],
      id: 'keep',
    },
  ]
  const merged = mergeSubscriptions(existing, rows)
  assert.equal(merged.length, 1)
  assert.equal(merged[0].name, 'Duplicate')
  assert.equal(merged[0].enabled, false)
  assert.deepEqual(merged[0].tags, ['美股', 'Group'])
  assert.equal(merged[0].id, 'keep')
  assert.deepEqual(mergeSubscriptions(merged, rows), merged)
})

test('failed or empty content fetch keeps actual posts and original success time, never profile metadata', () => {
  const previous = {
    url: 'https://example.com/',
    platform: 'rss',
    lastSuccessAt: '2026-09-01T00:00:00Z',
    items: [
      { kind: 'content', url: 'https://example.com/post' },
      { kind: 'profile', url: 'https://example.com/' },
    ],
  }
  const failed = mergeKolResult(
    { status: 'failed', statusMessage: 'HTTP 403', items: [] },
    previous,
    '2026-09-20T00:00:00Z',
    '2026-09-29T00:00:00Z',
  )
  assert.equal(failed.status, 'stale')
  assert.equal(failed.lastSuccessAt, previous.lastSuccessAt)
  assert.deepEqual(
    failed.items.map((item) => item.url),
    ['https://example.com/post'],
  )
  const empty = mergeKolResult(
    {
      status: 'partial',
      statusMessage: 'profile',
      items: [{ kind: 'profile', url: previous.url }],
    },
    previous,
    '2026-09-20T00:00:00Z',
    '2026-09-29T00:00:00Z',
  )
  assert.equal(empty.status, 'stale')
  assert.equal(empty.lastSuccessAt, previous.lastSuccessAt)
})

test('RSS accounts with root homepages have distinct stable IDs from feed URLs', () => {
  const first = { url: 'https://example.com/', feedUrl: 'https://example.com/feed.xml' }
  const second = { url: 'https://example.com/', feedUrl: 'https://example.com/news.xml' }
  assert.notEqual(kolId(first, 'rss'), kolId(second, 'rss'))
  assert.equal(kolId(first, 'rss'), kolId({ ...first }, 'rss'))
  assert.equal(kolId({ ...first, id: 'saved-id' }, 'rss'), 'saved-id')
})
