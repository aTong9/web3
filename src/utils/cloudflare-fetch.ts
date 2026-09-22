// Cache only public research data; never cache permissions or retry mutations.
const pending = new Map<string, Promise<Response>>()
const recent = new Map<string, { response: Response; until: number }>()
const publicPaths = new Set(['/api/technical-config', '/api/quant/dashboard', '/api/market/quotes'])

export const cloudflareFetch = async (url: string, options: RequestInit = {}) => {
  if ((options.method ?? 'GET').toUpperCase() !== 'GET') {
    pending.clear()
    recent.clear()
    try {
      return await fetch(url, options)
    } finally {
      pending.clear()
      recent.clear()
    }
  }
  options.signal?.throwIfAborted()
  const key = JSON.stringify([url, [...new Headers(options.headers)].sort(), options.credentials])
  for (const [cachedKey, entry] of recent) {
    if (entry.until <= Date.now()) recent.delete(cachedKey)
  }
  const cached = recent.get(key)
  if (cached && options.cache !== 'reload' && options.cache !== 'no-store') {
    return cached.response.clone()
  }
  let request = pending.get(key)
  if (!request) {
    request = fetch(url, options).then((response) => {
      // A mutation may have invalidated this request while it was in flight.
      if (pending.get(key) !== request) return response
      let ttl = 0
      const path = new URL(url, 'https://local.invalid').pathname
      if (response.ok && publicPaths.has(path) && options.cache !== 'no-store') ttl = 60_000
      if (response.status === 429 || response.status >= 500) {
        const retryAfter = response.headers.get('Retry-After')
        const delay = retryAfter === null ? 30_000 : /^\d+$/.test(retryAfter)
          ? Number(retryAfter) * 1000 : Date.parse(retryAfter) - Date.now()
        ttl = Number.isFinite(delay) ? Math.min(86_400_000, Math.max(1000, delay)) : 30_000
      }
      if (ttl > 0) {
        if (recent.size >= 100) recent.delete(recent.keys().next().value!)
        recent.set(key, { response: response.clone(), until: Date.now() + ttl })
      }
      return response
    })
    pending.set(key, request)
  }
  try {
    return (await request).clone()
  } finally {
    if (pending.get(key) === request) pending.delete(key)
  }
}
