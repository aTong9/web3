import assert from 'node:assert/strict'
import { webcrypto } from 'node:crypto'
import { copyFile, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { createRsshubCacheAdapter } from '../worker/rsshub-cache-adapter.mjs'

globalThis.crypto ??= webcrypto

const fakeCache = () => {
  let now = 0
  const entries = new Map()
  const calls = { match: 0, put: 0 }
  return {
    calls,
    advance(seconds) {
      now += seconds
    },
    async match(request) {
      calls.match++
      const entry = entries.get(request.url)
      return entry && now < entry.expiresAt ? entry.response.clone() : undefined
    },
    async put(request, response) {
      calls.put++
      const ttl = Number(response.headers.get('cache-control').match(/max-age=(\d+)/)?.[1])
      entries.set(request.url, { response: response.clone(), expiresAt: now + ttl })
    },
    keys() {
      return [...entries.keys()]
    },
  }
}

const memoryState = () => ({ entries: new Map(), bytes: 0 })

test('uses Cache API only for route keys and hashes their identities', async () => {
  const cache = fakeCache()
  const adapter = createRsshubCacheAdapter(cache, { state: memoryState() })
  await adapter.put('新闻:一', '中文 📰', { expirationTtl: 120 })
  await adapter.put('新闻:二', '第二篇', { expirationTtl: 120 })
  assert.equal(await adapter.get('新闻:一'), '中文 📰')
  assert.equal(await adapter.get('新闻:二'), '第二篇')
  assert.equal(await adapter.get('新闻:三'), null)
  assert.deepEqual(cache.calls, { match: 0, put: 0 })
  await adapter.put('rsshub:koa-redis-cache:一', 'route-one', { expirationTtl: 120 })
  await adapter.put('rsshub:koa-redis-cache:二', 'route-two', { expirationTtl: 120 })
  assert.equal(await adapter.get('rsshub:koa-redis-cache:一'), 'route-one')
  assert.equal(await adapter.get('rsshub:koa-redis-cache:二'), 'route-two')
  assert.equal(await adapter.get('rsshub:koa-redis-cache:三'), null)
  assert.deepEqual(cache.calls, { match: 3, put: 2 })
  assert.equal(new Set(cache.keys()).size, 2)
  assert(cache.keys().every((key) => key.startsWith('https://rsshub.internal/__web3_cache/v1/')))
  assert(cache.keys().every((key) => !key.includes('新闻')))
})

test('honors KV expirationTtl and minimum 60 seconds', async () => {
  const cache = fakeCache()
  let now = 0
  const adapter = createRsshubCacheAdapter(cache, { state: memoryState(), now: () => now })
  await adapter.put('short', 'value', { expirationTtl: 1 })
  now += 59_000
  assert.equal(await adapter.get('short'), 'value')
  now += 1_000
  assert.equal(await adapter.get('short'), null)
  await adapter.put('custom', 'value', { expirationTtl: 120 })
  now += 119_000
  assert.equal(await adapter.get('custom'), 'value')
  now += 1_000
  assert.equal(await adapter.get('custom'), null)
  assert.deepEqual(cache.calls, { match: 0, put: 0 })
  await adapter.put('rsshub:koa-redis-cache:route', 'value', { expirationTtl: 120 })
  cache.advance(119)
  assert.equal(await adapter.get('rsshub:koa-redis-cache:route'), 'value')
  cache.advance(1)
  assert.equal(await adapter.get('rsshub:koa-redis-cache:route'), null)
})

test('bounds isolate memory by FIFO entry count and UTF-8 bytes', async () => {
  const cache = fakeCache()
  const state = memoryState()
  const adapter = createRsshubCacheAdapter(cache, { state, maxEntries: 2, maxBytes: 15 })
  await adapter.put('a', '中文', { expirationTtl: 120 })
  await adapter.put('b', 'two', { expirationTtl: 120 })
  await adapter.put('c', 'three', { expirationTtl: 120 })
  assert.equal(await adapter.get('a'), null)
  assert.equal(await adapter.get('b'), 'two')
  assert.equal(await adapter.get('c'), 'three')
  await adapter.put('large', '内容内容内容', { expirationTtl: 120 })
  assert.equal(await adapter.get('large'), null)
  assert(state.bytes <= 15)
  assert(state.entries.size <= 2)
  assert.deepEqual(cache.calls, { match: 0, put: 0 })
})

test('cache failures degrade to misses and skipped writes', async () => {
  const previousWarn = console.warn
  console.warn = () => {}
  const adapter = createRsshubCacheAdapter({
    async match() {
      throw new Error('cache unavailable')
    },
    async put() {
      throw new Error('cache unavailable')
    },
  })
  try {
    assert.equal(await adapter.get('rsshub:koa-redis-cache:key'), null)
    await assert.doesNotReject(
      adapter.put('rsshub:koa-redis-cache:key', 'value', { expirationTtl: 60 }),
    )
    const unreadable = createRsshubCacheAdapter({
      async match() {
        return { async text() { throw new Error('body read failed') } }
      },
    })
    assert.equal(await unreadable.get('rsshub:koa-redis-cache:key'), null)
  } finally {
    console.warn = previousWarn
  }
})

test('wrapper delegates the feed request with Cache API binding and original environment', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'web3-rsshub-cache-test-'))
  const previousCaches = globalThis.caches
  try {
    const sourceDirectory = fileURLToPath(new URL('../worker/', import.meta.url))
    await copyFile(
      join(sourceDirectory, 'rsshub-cache-adapter.mjs'),
      join(directory, 'rsshub-cache-adapter.mjs'),
    )
    await copyFile(
      join(sourceDirectory, 'rsshub-worker-entry.mjs'),
      join(directory, 'rsshub-worker-entry.mjs'),
    )
    await writeFile(
      join(directory, 'worker.mjs'),
      `export default { async fetch(request, env, context) {
        await env.CACHE.put('feed', '中文', { expirationTtl: 120 });
        return new Response(JSON.stringify({
          path: new URL(request.url).pathname,
          value: await env.CACHE.get('feed'),
          browser: env.BROWSER,
          context: context.marker,
        }));
      } }`,
    )
    globalThis.caches = { default: fakeCache() }
    const wrapper = (await import(pathToFileURL(join(directory, 'rsshub-worker-entry.mjs')).href)).default
    const response = await wrapper.fetch(
      new Request('https://rsshub.internal/bloomberg/%2F'),
      { BROWSER: 'browser-binding' },
      { marker: 'original-context' },
    )
    assert.deepEqual(await response.json(), {
      path: '/bloomberg/%2F',
      value: '中文',
      browser: 'browser-binding',
      context: 'original-context',
    })
  } finally {
    globalThis.caches = previousCaches
    await rm(directory, { recursive: true, force: true })
  }
})
