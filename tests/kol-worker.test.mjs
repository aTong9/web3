import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)
const { parseFeed, default: worker } = jiti('../worker/kols.ts')

test('KOL Worker rejects unauthenticated private reads before touching D1', async () => {
  const response = await worker.fetch(new Request('https://kols.test/api/kols'), {
    ALLOWED_ORIGINS: '',
    DB: { prepare: () => { throw new Error('DB should not be read') } },
  })
  assert.equal(response.status, 401)
})

test('KOL Worker parses RSS and JSON Feed as safe dated content', async () => {
  const rss = `<?xml version="1.0"?><rss version="2.0"><channel><title>Feed</title><item><guid>one</guid><title>Post</title><link>https://example.com/post</link><pubDate>Tue, 29 Sep 2026 00:00:00 GMT</pubDate></item><item><title>Bad</title><link>javascript:alert(1)</link></item></channel></rss>`
  const xmlItems = await parseFeed(rss)
  assert.equal(xmlItems.length, 1)
  assert.equal(xmlItems[0].publishedAt, '2026-09-29T00:00:00.000Z')
  const jsonItems = await parseFeed(JSON.stringify({
    version: 'https://jsonfeed.org/version/1.1',
    items: [{ id: 'two', title: 'News', url: 'https://example.com/news', content_html: '<b>Summary</b>' }],
  }))
  assert.equal(jsonItems[0].description, 'Summary')
  assert.equal(jsonItems[0].publishedAt, null)
})
