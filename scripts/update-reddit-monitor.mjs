import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { writeJsonAtomic } from './lib/write-json-atomic.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = resolve(root, 'src/data/reddit-monitor.json')
const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(20_000) })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}
const nonnegative = (value) =>
  value !== null && value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0
const discussionUrl = (query) =>
  `https://www.reddit.com/search/?q=${encodeURIComponent(query)}&sort=top&t=day`

export const normalizeMentions = (payload, market) => {
  if (!Array.isArray(payload?.results)) throw new Error('Invalid mention dataset')
  const seen = new Set()
  const rows = payload.results
    .filter((row) => {
      if (
        typeof row.ticker !== 'string' ||
        !/^[A-Z0-9.^-]{1,20}$/.test(row.ticker) ||
        typeof row.name !== 'string' ||
        !nonnegative(row.mentions) ||
        Number(row.mentions) === 0 ||
        !nonnegative(row.upvotes) ||
        seen.has(row.ticker)
      )
        return false
      if (market === 'us' && /\b(ETF|ETN|Fund|Trust)\b/i.test(row.name)) return false
      seen.add(row.ticker)
      return true
    })
    .sort(
      (a, b) => Number(b.mentions) - Number(a.mentions) || Number(b.upvotes) - Number(a.upvotes),
    )
  if (!rows.length) throw new Error('Empty mention dataset')
  return rows.slice(0, 20).map((row, index) => ({
    rank: index + 1,
    symbol: row.ticker,
    name: row.name.replaceAll('&amp;', '&'),
    mentions: Number(row.mentions),
    upvotes: Number(row.upvotes),
    previousMentions: nonnegative(row.mentions_24h_ago) ? Number(row.mentions_24h_ago) : null,
    discussionUrl: discussionUrl(`$${row.ticker.replace(/-USD$/, '')} ${row.name}`),
  }))
}

export async function updateRedditMonitor() {
  const previous = await readFile(output, 'utf8')
    .then(JSON.parse)
    .catch(() => ({ markets: {} }))
  const now = new Date().toISOString()
  const markets = {}
  for (const key of ['us', 'crypto']) {
    const sourceUrl = `https://apewisdom.io/api/v1.0/filter/all-${key === 'us' ? 'stocks' : 'crypto'}`
    try {
      const result = { rows: normalizeMentions(await fetchJson(sourceUrl), key) }
      markets[key] = { ...result, status: 'ok', updatedAt: now, sourceUrl, message: '' }
    } catch {
      const old = previous.markets[key]
      markets[key] = {
        rows: old?.rows ?? [],
        updatedAt: old?.updatedAt ?? null,
        sourceUrl,
        status: old?.rows?.length ? 'stale' : 'unavailable',
        message: '本次采集失败，保留上次快照。',
      }
      console.warn(`${key}: source unavailable`)
    }
  }
  await writeJsonAtomic(output, { updatedAt: now, markets })
  console.log(
    Object.entries(markets)
      .map(([key, value]) => `${key}: ${value.status}, ${value.rows.length}`)
      .join('\n'),
  )
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await updateRedditMonitor()
