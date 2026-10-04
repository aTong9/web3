import rsshub from './worker.mjs'
import { createRsshubCacheAdapter } from './rsshub-cache-adapter.mjs'

export default {
  fetch(request, env, context) {
    const cache = createRsshubCacheAdapter(globalThis.caches?.default)
    return rsshub.fetch(request, { ...env, CACHE: cache }, context)
  },
}
