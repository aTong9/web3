import type {
  CrossAssetDataset,
  PaperSignalPosition,
  QuantDashboard,
  UsMegaCapDataset,
} from '../src/types/index'
import { buildQuantDashboard } from '../src/utils/quant-signals'

const maximumJsonBytes = 4_000_000
const maximumRequestBytes = 8_192
const clientIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

interface PaperPositionRow {
  id: string
  client_id: string
  symbol: string
  name: string
  action: PaperSignalPosition['action']
  opened_at: string
  closed_at: string | null
  entry_underlying_price: number
  exit_underlying_price: number | null
  forward_pe: number | null
  signal_score: number
  status: PaperSignalPosition['status']
}

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

const allowedOrigin = (request: Request, env: Env) => {
  const origin = request.headers.get('Origin')
  if (!origin) return null
  const requestOrigin = new URL(request.url).origin
  const allowed = env.ALLOWED_ORIGINS.split(',').map((item) => item.trim())
  return origin === requestOrigin || allowed.includes(origin) ? origin : null
}

const responseHeaders = (request: Request, env: Env) => {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  })
  const origin = allowedOrigin(request, env)
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')
    headers.set('Access-Control-Max-Age', '86400')
    headers.set('Vary', 'Origin')
  }
  return headers
}

const json = (request: Request, env: Env, value: unknown, status = 200) =>
  new Response(JSON.stringify(value), { status, headers: responseHeaders(request, env) })

const readBoundedJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok || !response.body) {
    throw new Error(`数据源响应异常：${response.status}`)
  }
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maximumJsonBytes) {
      await reader.cancel('JSON payload too large')
      throw new Error('数据源响应超过大小限制')
    }
    chunks.push(value)
  }
  const merged = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  return JSON.parse(new TextDecoder().decode(merged)) as T
}

const fetchSource = async <T>(env: Env, filename: string): Promise<T> => {
  const response = await fetch(`${env.GITHUB_DATA_BASE}/${filename}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'web3-quant-api/1.0' },
    cf: { cacheTtl: 300, cacheEverything: true },
  })
  return readBoundedJson<T>(response)
}

const refreshSnapshot = async (env: Env) => {
  const [crossAsset, megaCaps] = await Promise.all([
    fetchSource<CrossAssetDataset>(env, 'cross-asset.json'),
    fetchSource<UsMegaCapDataset>(env, 'us-megacaps.json'),
  ])
  const dashboard = buildQuantDashboard(crossAsset, megaCaps)
  const id = crypto.randomUUID()
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO quant_snapshots (id, generated_at, source_updated_at, payload)
       VALUES (?, ?, ?, ?)`,
    ).bind(id, dashboard.generatedAt, dashboard.generatedAt, JSON.stringify(dashboard)),
    env.DB.prepare(
      `DELETE FROM quant_snapshots
       WHERE id NOT IN (SELECT id FROM quant_snapshots ORDER BY created_at DESC LIMIT 240)`,
    ),
  ])
  console.log(
    JSON.stringify({ event: 'quant_snapshot_refreshed', id, generatedAt: dashboard.generatedAt }),
  )
  return dashboard
}

const latestDashboard = async (env: Env): Promise<QuantDashboard> => {
  const row = await env.DB.prepare(
    'SELECT payload FROM quant_snapshots ORDER BY created_at DESC LIMIT 1',
  ).first<{ payload: string }>()
  return row ? (JSON.parse(row.payload) as QuantDashboard) : refreshSnapshot(env)
}

const validateClientId = (value: unknown) => {
  if (typeof value !== 'string' || !clientIdPattern.test(value)) {
    throw new HttpError(400, 'clientId格式无效')
  }
  return value
}

const requestJson = async <T>(request: Request): Promise<T> => {
  const contentLength = Number(request.headers.get('Content-Length') ?? 0)
  if (contentLength > maximumRequestBytes) throw new HttpError(413, '请求内容过大')
  if (!request.body) throw new HttpError(400, '请求内容为空')
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maximumRequestBytes) {
      await reader.cancel('Request payload too large')
      throw new HttpError(413, '请求内容过大')
    }
    chunks.push(value)
  }
  const merged = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  try {
    return JSON.parse(new TextDecoder().decode(merged)) as T
  } catch {
    throw new HttpError(400, 'JSON格式无效')
  }
}

const toPaperPosition = (row: PaperPositionRow): PaperSignalPosition => ({
  id: row.id,
  symbol: row.symbol,
  name: row.name,
  action: row.action,
  openedAt: row.opened_at,
  closedAt: row.closed_at,
  entryUnderlyingPrice: row.entry_underlying_price,
  exitUnderlyingPrice: row.exit_underlying_price,
  forwardPe: row.forward_pe,
  signalScore: row.signal_score,
  status: row.status,
})

const listPaperPositions = async (env: Env, clientId: string) => {
  const rows = await env.DB.prepare(
    `SELECT id, client_id, symbol, name, action, opened_at, closed_at,
            entry_underlying_price, exit_underlying_price, forward_pe, signal_score, status
     FROM paper_positions WHERE client_id = ? ORDER BY opened_at DESC LIMIT 200`,
  )
    .bind(clientId)
    .all<PaperPositionRow>()
  return rows.results.map(toPaperPosition)
}

const createPaperPosition = async (request: Request, env: Env) => {
  const input = await requestJson<{ clientId?: unknown; symbol?: unknown }>(request)
  const clientId = validateClientId(input.clientId)
  const symbol = typeof input.symbol === 'string' ? input.symbol.trim().toUpperCase() : ''
  if (!/^[A-Z.]{1,10}$/.test(symbol)) throw new HttpError(400, '股票代码格式无效')
  const dashboard = await latestDashboard(env)
  const candidate = dashboard.options.find((item) => item.symbol === symbol)
  if (!candidate || candidate.price === null || candidate.action === 'unavailable') {
    throw new HttpError(409, '当前候选不可加入模拟记录')
  }
  const id = crypto.randomUUID()
  const openedAt = new Date().toISOString()
  try {
    await env.DB.prepare(
      `INSERT INTO paper_positions
       (id, client_id, symbol, name, action, opened_at, entry_underlying_price,
        forward_pe, signal_score, status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)`,
    )
      .bind(
        id,
        clientId,
        candidate.symbol,
        candidate.name,
        candidate.action,
        openedAt,
        candidate.price,
        candidate.forwardPe,
        candidate.score,
        openedAt,
      )
      .run()
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      throw new HttpError(409, '该股票已有未关闭的模拟记录')
    }
    throw error
  }
  const positions = await listPaperPositions(env, clientId)
  return positions.find((position) => position.id === id)
}

const closePaperPosition = async (env: Env, clientId: string, id: string) => {
  const existing = await env.DB.prepare(
    `SELECT symbol FROM paper_positions
     WHERE id = ? AND client_id = ? AND status = 'open'`,
  )
    .bind(id, clientId)
    .first<{ symbol: string }>()
  if (!existing) throw new HttpError(404, '未找到可关闭的模拟记录')
  const dashboard = await latestDashboard(env)
  const price = dashboard.options.find((item) => item.symbol === existing.symbol)?.price
  if (price === null || price === undefined) throw new HttpError(409, '当前标的价格不可用')
  const closedAt = new Date().toISOString()
  await env.DB.prepare(
    `UPDATE paper_positions
     SET status = 'closed', closed_at = ?, exit_underlying_price = ?, updated_at = ?
     WHERE id = ? AND client_id = ? AND status = 'open'`,
  )
    .bind(closedAt, price, closedAt, id, clientId)
    .run()
}

const deletePaperPosition = async (env: Env, clientId: string, id: string) => {
  const result = await env.DB.prepare(
    `DELETE FROM paper_positions WHERE id = ? AND client_id = ? AND status = 'closed'`,
  )
    .bind(id, clientId)
    .run()
  if (!result.meta.changes) throw new HttpError(404, '仅可删除已关闭的模拟记录')
}

const handleApi = async (request: Request, env: Env) => {
  const url = new URL(request.url)
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: responseHeaders(request, env) })
  if (url.pathname === '/api/health' && request.method === 'GET') {
    const snapshot = await env.DB.prepare(
      'SELECT generated_at FROM quant_snapshots ORDER BY created_at DESC LIMIT 1',
    ).first<{ generated_at: string }>()
    return json(request, env, { ok: true, service: 'web3-quant-api', latestSnapshotAt: snapshot?.generated_at ?? null })
  }
  if (url.pathname === '/api/quant/dashboard' && request.method === 'GET') {
    return json(request, env, await latestDashboard(env))
  }
  if (url.pathname === '/api/paper' && request.method === 'GET') {
    const clientId = validateClientId(url.searchParams.get('clientId'))
    return json(request, env, { positions: await listPaperPositions(env, clientId) })
  }
  if (url.pathname === '/api/paper' && request.method === 'POST') {
    return json(request, env, { position: await createPaperPosition(request, env) }, 201)
  }
  const closeMatch = url.pathname.match(/^\/api\/paper\/([0-9a-f-]+)\/close$/i)
  if (closeMatch && request.method === 'PATCH') {
    const input = await requestJson<{ clientId?: unknown }>(request)
    const clientId = validateClientId(input.clientId)
    await closePaperPosition(env, clientId, closeMatch[1])
    return json(request, env, { ok: true })
  }
  const deleteMatch = url.pathname.match(/^\/api\/paper\/([0-9a-f-]+)$/i)
  if (deleteMatch && request.method === 'DELETE') {
    const clientId = validateClientId(url.searchParams.get('clientId'))
    await deletePaperPosition(env, clientId, deleteMatch[1])
    return json(request, env, { ok: true })
  }
  throw new HttpError(404, 'API路径不存在')
}

export default {
  async fetch(request, env) {
    const requestId = crypto.randomUUID()
    try {
      if (!new URL(request.url).pathname.startsWith('/api/')) {
        throw new HttpError(404, '仅提供API访问')
      }
      return await handleApi(request, env)
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500
      const message = error instanceof Error ? error.message : '未知错误'
      console.error(JSON.stringify({ event: 'request_failed', requestId, status, message }))
      return json(
        request,
        env,
        { error: status >= 500 ? '服务暂时不可用' : message, requestId },
        status,
      )
    }
  },
  async scheduled(_controller, env) {
    try {
      await refreshSnapshot(env)
    } catch (error) {
      console.error(
        JSON.stringify({
          event: 'scheduled_refresh_failed',
          message: error instanceof Error ? error.message : '未知错误',
        }),
      )
      throw error
    }
  },
} satisfies ExportedHandler<Env>
