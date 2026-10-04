const encoder = new TextEncoder()
const cacheOrigin = 'https://rsshub.internal/__web3_cache/v1/'
const routeCachePrefix = 'rsshub:koa-redis-cache:'
// ponytail: Keep content volatile per isolate (500 entries / 8 MiB); add shared storage only if needed.
const contentState = { entries: new Map(), bytes: 0 }
let warned = false

const warnOnce = () => {
  if (warned) return
  warned = true
  console.warn('RSSHub Cache API unavailable; cache operations skipped')
}

const cacheRequest = async (key) => {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(key))
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  return new Request(cacheOrigin + hash)
}

export const createRsshubCacheAdapter = (
  cache,
  { state = contentState, now = Date.now, maxEntries = 500, maxBytes = 8 * 1024 * 1024 } = {},
) => ({
  async get(key) {
    if (!key.startsWith(routeCachePrefix)) {
      const entry = state.entries.get(key)
      if (!entry) return null
      if (now() >= entry.expiresAt) {
        state.entries.delete(key)
        state.bytes -= entry.bytes
        return null
      }
      return entry.value
    }
    try {
      const response = await cache.match(await cacheRequest(key))
      return response ? await response.text() : null
    } catch {
      warnOnce()
      return null
    }
  },
  async put(key, value, options) {
    const ttl = Math.max(60, Math.floor(Number(options?.expirationTtl) || 3600))
    if (!key.startsWith(routeCachePrefix)) {
      const currentTime = now()
      for (const [entryKey, entry] of state.entries) {
        if (currentTime >= entry.expiresAt) {
          state.entries.delete(entryKey)
          state.bytes -= entry.bytes
        }
      }
      const previous = state.entries.get(key)
      if (previous) {
        state.entries.delete(key)
        state.bytes -= previous.bytes
      }
      const bytes = encoder.encode(key).byteLength + encoder.encode(value).byteLength
      if (bytes > maxBytes) return
      state.entries.set(key, { value, bytes, expiresAt: currentTime + ttl * 1000 })
      state.bytes += bytes
      // Bound each isolate's temporary content cache by entry count and UTF-8 bytes.
      while (state.entries.size > maxEntries || state.bytes > maxBytes) {
        const oldestKey = state.entries.keys().next().value
        const oldest = state.entries.get(oldestKey)
        state.entries.delete(oldestKey)
        state.bytes -= oldest.bytes
      }
      return
    }
    try {
      const response = new Response(value, {
        headers: { 'Cache-Control': `public, max-age=${ttl}` },
      })
      await cache.put(await cacheRequest(key), response)
    } catch {
      warnOnce()
    }
  },
})
