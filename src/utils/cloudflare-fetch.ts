// Only coalesce concurrent reads; never cache permissions or retry mutations.
const pending = new Map<string, Promise<Response>>()

export const cloudflareFetch = async (url: string, options: RequestInit = {}) => {
  if ((options.method ?? 'GET').toUpperCase() !== 'GET') {
    pending.clear()
    try {
      return await fetch(url, options)
    } finally {
      pending.clear()
    }
  }
  options.signal?.throwIfAborted()
  const key = JSON.stringify([url, [...new Headers(options.headers)].sort(), options.credentials])
  let request = pending.get(key)
  if (!request) {
    request = fetch(url, options)
    pending.set(key, request)
  }
  try {
    return (await request).clone()
  } finally {
    if (pending.get(key) === request) pending.delete(key)
  }
}
