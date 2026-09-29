import Parser from 'rss-parser'
import { AuthError, authenticate } from './admin'

interface SubscriptionRow {
  owner_user_id: string
  id: string
  name: string
  url: string
  feed_url: string
  platform: string
  tags_json: string
  status: string
  status_message: string
  checked_at: string | null
  last_success_at: string | null
  failure_count: number
  next_check_at: string | null
}

interface ItemRow {
  owner_user_id: string
  subscription_id: string
  id: string
  title: string
  description: string
  url: string
  published_at: string | null
  published_label: string | null
  stocks_json: string
}

interface FeedItem {
  id: string
  title: string
  description: string
  url: string
  publishedAt: string | null
}

const parser = new Parser({ timeout: 12_000 })
const maxFeedBytes = 2_000_000
const maxItems = 12
const feedTimeoutMs = 35_000
const safeUrl = (value: unknown) => {
  try {
    const url = new URL(String(value))
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}
const plainText = (value: unknown) =>
  String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(
      /&(?:amp|lt|gt|quot|#39);/g,
      (entity) =>
        ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" })[entity] ?? entity,
    )
    .replace(/\s+/g, ' ')
    .trim()
const publishedAt = (value: unknown) => {
  if (typeof value !== 'string') return null
  const date = new Date(value)
  return Number.isFinite(date.valueOf()) ? date.toISOString() : null
}

export const parseFeed = async (body: string): Promise<FeedItem[]> => {
  let entries: Array<Record<string, unknown>>
  if (body.trimStart().startsWith('{')) {
    const feed = JSON.parse(body) as { version?: unknown; items?: unknown }
    if (
      !String(feed.version ?? '').startsWith('https://jsonfeed.org/version/1') ||
      !Array.isArray(feed.items)
    )
      throw new Error('无效的 JSON Feed')
    entries = feed.items
  } else {
    const feed = await parser.parseString(body)
    entries = (feed.items ?? []) as Array<Record<string, unknown>>
  }
  return entries.slice(0, maxItems).flatMap((entry, index) => {
    const url = safeUrl(entry.url ?? entry.external_url ?? entry.link)
    if (!url) return []
    const title = plainText(entry.title) || '未命名内容'
    const description = plainText(
      entry.summary ??
        entry.contentSnippet ??
        entry.content_text ??
        entry.content_html ??
        entry.content ??
        entry.description,
    ).slice(0, 260)
    return [
      {
        id: String(entry.id ?? entry.guid ?? url ?? `${index}-${title}`).slice(0, 300),
        title,
        description,
        url,
        publishedAt: publishedAt(entry.date_published ?? entry.isoDate ?? entry.pubDate),
      },
    ]
  })
}

const readText = async (response: Response) => {
  if (!response.ok) throw new Error(`Feed HTTP ${response.status}`)
  if (Number(response.headers.get('content-length')) > maxFeedBytes) throw new Error('Feed 过大')
  if (!response.body) throw new Error('Feed 为空')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let body = ''
  let bytes = 0
  try {
    while (true) {
      const chunk = await reader.read()
      if (chunk.done) break
      bytes += chunk.value.byteLength
      if (bytes > maxFeedBytes) throw new Error('Feed 过大')
      body += decoder.decode(chunk.value, { stream: true })
    }
    return body + decoder.decode()
  } finally {
    await reader.cancel().catch(() => undefined)
  }
}

const fetchFeed = async (row: SubscriptionRow, env: Env & KolsEnv) => {
  const feedUrl = safeUrl(row.feed_url)
  if (!feedUrl) throw new Error('Feed URL 无效')
  const url = new URL(feedUrl)
  const request =
    url.hostname === 'rsshub.app' && env.RSSHUB_FETCHER
      ? new Request(`https://rsshub.internal${url.pathname}${url.search}`, {
          headers: { accept: 'application/rss+xml, application/atom+xml, application/xml' },
        })
      : new Request(feedUrl, {
          headers: {
            accept: 'application/rss+xml, application/atom+xml, application/xml, application/json',
          },
        })
  const signal = AbortSignal.timeout(feedTimeoutMs)
  const response =
    url.hostname === 'rsshub.app' && env.RSSHUB_FETCHER
      ? await env.RSSHUB_FETCHER.fetch(request, { signal })
      : await fetch(request, { signal })
  return parseFeed(await readText(response))
}

const syncSubscription = async (row: SubscriptionRow, env: Env & KolsEnv) => {
  const now = new Date().toISOString()
  try {
    const items = await fetchFeed(row, env)
    if (!items.length) throw new Error('Feed 没有有效内容')
    const insert = env.DB.prepare(
      `INSERT OR IGNORE INTO kol_items
       (owner_user_id,subscription_id,id,title,description,url,published_at,published_label,stocks_json,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
    )
    await env.DB.batch([
      ...items.map((item) =>
        insert.bind(
          row.owner_user_id,
          row.id,
          item.id,
          item.title,
          item.description,
          item.url,
          item.publishedAt,
          null,
          '[]',
          now,
        ),
      ),
      env.DB.prepare(
        `UPDATE kol_subscriptions SET status='ok',status_message=?,checked_at=?,last_success_at=?,
         failure_count=0,next_check_at=NULL
         WHERE owner_user_id=? AND id=?`,
      ).bind(`已同步 ${items.length} 条`, now, now, row.owner_user_id, row.id),
      env.DB.prepare(
        `DELETE FROM kol_items WHERE owner_user_id=? AND subscription_id=? AND id NOT IN
         (SELECT id FROM kol_items WHERE owner_user_id=? AND subscription_id=?
          ORDER BY COALESCE(published_at,created_at) DESC LIMIT 100)`,
      ).bind(row.owner_user_id, row.id, row.owner_user_id, row.id),
    ])
  } catch (error) {
    const prior = await env.DB.prepare(
      'SELECT 1 FROM kol_items WHERE owner_user_id=? AND subscription_id=? LIMIT 1',
    )
      .bind(row.owner_user_id, row.id)
      .first()
    const message = error instanceof Error ? error.message : '未知错误'
    const failures = (row.failure_count ?? 0) + 1
    const delayHours = Math.min(6, 2 ** Math.min(failures - 1, 3))
    const nextCheckAt = new Date(Date.now() + delayHours * 60 * 60 * 1000).toISOString()
    await env.DB.prepare(
      `UPDATE kol_subscriptions SET status=?,status_message=?,checked_at=?,failure_count=?,next_check_at=?
       WHERE owner_user_id=? AND id=?`,
    )
      .bind(
        prior ? 'stale' : 'failed',
        `本次更新失败：${message}`.slice(0, 300),
        now,
        failures,
        nextCheckAt,
        row.owner_user_id,
        row.id,
      )
      .run()
    console.warn(JSON.stringify({ event: 'kol_sync_failed', id: row.id, message }))
  }
}

export const syncKols = async (env: Env & KolsEnv) => {
  const now = new Date().toISOString()
  const rows = await env.DB.prepare(
    `SELECT owner_user_id,id,feed_url,failure_count FROM kol_subscriptions
     WHERE enabled=1 AND (next_check_at IS NULL OR next_check_at<=?) ORDER BY owner_user_id,id`,
  )
    .bind(now)
    .all<SubscriptionRow>()
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(3, rows.results.length) }, async () => {
      while (next < rows.results.length) {
        const row = rows.results[next++]
        try {
          await syncSubscription(row, env)
        } catch (error) {
          console.error(
            JSON.stringify({
              event: 'kol_database_write_failed',
              id: row.id,
              message: String(error),
            }),
          )
        }
      }
    }),
  )
}

const headers = (request: Request, env: Env & KolsEnv) => {
  const result = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  })
  const origin = request.headers.get('origin')
  if (origin && env.ALLOWED_ORIGINS.split(',').includes(origin)) {
    result.set('access-control-allow-origin', origin)
    result.set('access-control-allow-methods', 'GET, OPTIONS')
    result.set('access-control-allow-headers', 'Authorization, Content-Type')
    result.set('vary', 'Origin')
  }
  return result
}

const dataset = async (owner: string, env: Env & KolsEnv) => {
  const subscriptions = await env.DB.prepare(
    `SELECT owner_user_id,id,name,url,feed_url,platform,tags_json,status,status_message,checked_at,last_success_at
     FROM kol_subscriptions WHERE owner_user_id=? AND enabled=1 ORDER BY name`,
  )
    .bind(owner)
    .all<SubscriptionRow>()
  const items = await env.DB.prepare(
    `SELECT owner_user_id,subscription_id,id,title,description,url,published_at,published_label,stocks_json
     FROM kol_items WHERE owner_user_id=? ORDER BY published_at DESC`,
  )
    .bind(owner)
    .all<ItemRow>()
  const bySubscription = Map.groupBy(items.results, (item) => item.subscription_id)
  return {
    updatedAt:
      subscriptions.results
        .map((row) => row.checked_at)
        .filter(Boolean)
        .sort()
        .at(-1) ?? new Date(0).toISOString(),
    source: '用户授权的 RSS、Atom 与 JSON Feed；同步失败时保留上次内容',
    kols: subscriptions.results.map((row) => ({
      id: row.id,
      name: row.name,
      url: row.url,
      feedUrl: row.feed_url,
      platform: row.platform,
      tags: JSON.parse(row.tags_json),
      status: row.status,
      statusMessage: row.status_message,
      lastSuccessAt: row.last_success_at,
      items: (bySubscription.get(row.id) ?? []).slice(0, 100).map((item) => ({
        kind: 'content',
        id: item.id,
        title: item.title,
        description: item.description,
        url: item.url,
        publishedAt: item.published_at,
        publishedLabel: item.published_label,
        stocks: JSON.parse(item.stocks_json),
      })),
    })),
  }
}

export default {
  async fetch(request, env) {
    const responseHeaders = headers(request, env)
    if (request.method === 'OPTIONS')
      return new Response(null, { status: 204, headers: responseHeaders })
    try {
      if (new URL(request.url).pathname !== '/api/kols' || request.method !== 'GET')
        return new Response('{"error":"API路径不存在"}', { status: 404, headers: responseHeaders })
      const actor = await authenticate(request, env, 'analytics.view')
      return new Response(JSON.stringify(await dataset(actor.id, env)), {
        headers: responseHeaders,
      })
    } catch (error) {
      const status = error instanceof AuthError ? error.status : 500
      if (status === 500)
        console.error(JSON.stringify({ event: 'kol_read_failed', message: String(error) }))
      return new Response(
        JSON.stringify({ error: error instanceof AuthError ? error.message : '服务暂时不可用' }),
        { status, headers: responseHeaders },
      )
    }
  },
  async scheduled(controller, env) {
    if (controller.cron !== '15 * * * *') return
    await syncKols(env)
  },
} satisfies ExportedHandler<Env & KolsEnv>
