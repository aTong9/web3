import type {
  CrossAssetDataset,
  PaperSignalPosition,
  QuantDashboard,
  TechnicalAlertCondition,
  TechnicalAlertRule,
  UsMegaCapDataset,
} from '../src/types/index'
import { buildQuantDashboard } from '../src/utils/quant-signals'
import {
  AuthError,
  analyticsConfig,
  authStatus,
  authenticate,
  createUser,
  exchangeCode,
  listUsers,
  logout,
  saveAnalytics,
  updateUser,
} from './admin'

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

interface TechnicalAlertRow {
  id: string
  user_id: string
  asset_id: string
  asset_name: string
  series: string
  condition: TechnicalAlertCondition
  threshold: number | null
  enabled: number
  created_at: string
  updated_at: string
}

const technicalAlertConditions = new Set<TechnicalAlertCondition>([
  'priceAbove',
  'priceBelow',
  'rsiAbove',
  'rsiBelow',
  'macdBullishCross',
  'macdBearishCross',
])

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
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
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
  if (row) {
    const dashboard = JSON.parse(row.payload) as QuantDashboard
    const currentSchema =
      dashboard.config.optionDteRange.min >= 365 &&
      dashboard.options.every((candidate) => candidate.earnings && candidate.direction)
    if (currentSchema) return dashboard
  }
  return refreshSnapshot(env)
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

const toTechnicalAlert = (row: TechnicalAlertRow): TechnicalAlertRule => ({
  id: row.id,
  assetId: row.asset_id,
  assetName: row.asset_name,
  series: row.series,
  condition: row.condition,
  threshold: row.threshold,
  enabled: Boolean(row.enabled),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const listTechnicalAlerts = async (env: Env, userId: string) => {
  const rows = await env.DB.prepare(
    `SELECT id, user_id, asset_id, asset_name, series, condition, threshold,
            enabled, created_at, updated_at
     FROM technical_alert_rules
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 200`,
  )
    .bind(userId)
    .all<TechnicalAlertRow>()
  return rows.results.map(toTechnicalAlert)
}

const validateAlertText = (value: unknown, field: string, maximum: number) => {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (!normalized || normalized.length > maximum) throw new HttpError(400, `${field}格式无效`)
  return normalized
}

const createTechnicalAlert = async (request: Request, env: Env, userId: string) => {
  const input = await requestJson<{
    assetId?: unknown
    assetName?: unknown
    series?: unknown
    condition?: unknown
    threshold?: unknown
  }>(request)
  const assetId = validateAlertText(input.assetId, '资产ID', 80)
  const assetName = validateAlertText(input.assetName, '资产名称', 120)
  const series = validateAlertText(input.series, '资产代码', 40)
  if (!technicalAlertConditions.has(input.condition as TechnicalAlertCondition)) {
    throw new HttpError(400, '预警条件无效')
  }
  const condition = input.condition as TechnicalAlertCondition
  const requiresThreshold = !condition.startsWith('macd')
  const threshold = input.threshold === null ? null : Number(input.threshold)
  if (requiresThreshold && (!Number.isFinite(threshold) || threshold === null)) {
    throw new HttpError(400, '预警阈值无效')
  }
  if (!requiresThreshold && threshold !== null) throw new HttpError(400, 'MACD预警不需要阈值')
  const now = new Date().toISOString()
  const id = crypto.randomUUID()
  try {
    await env.DB.prepare(
      `INSERT INTO technical_alert_rules
       (id, user_id, asset_id, asset_name, series, condition, threshold, enabled, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    )
      .bind(id, userId, assetId, assetName, series, condition, threshold, now, now)
      .run()
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      throw new HttpError(409, '该资产已有相同类型的预警')
    }
    throw error
  }
  const rules = await listTechnicalAlerts(env, userId)
  return rules.find((rule) => rule.id === id)
}

const updateTechnicalAlert = async (
  request: Request,
  env: Env,
  userId: string,
  id: string,
) => {
  const input = await requestJson<{ enabled?: unknown }>(request)
  if (typeof input.enabled !== 'boolean') throw new HttpError(400, '启用状态无效')
  const result = await env.DB.prepare(
    `UPDATE technical_alert_rules SET enabled = ?, updated_at = ? WHERE id = ? AND user_id = ?`,
  )
    .bind(input.enabled ? 1 : 0, new Date().toISOString(), id, userId)
    .run()
  if (!result.meta.changes) throw new HttpError(404, '未找到预警规则')
}

const deleteTechnicalAlert = async (env: Env, userId: string, id: string) => {
  const result = await env.DB.prepare(
    'DELETE FROM technical_alert_rules WHERE id = ? AND user_id = ?',
  )
    .bind(id, userId)
    .run()
  if (!result.meta.changes) throw new HttpError(404, '未找到预警规则')
}

const handleApi = async (request: Request, env: Env) => {
  const url = new URL(request.url)
  if (request.method === 'OPTIONS')
    return new Response(null, { status: 204, headers: responseHeaders(request, env) })
  if (url.pathname === '/api/health' && request.method === 'GET') {
    const snapshot = await env.DB.prepare(
      'SELECT generated_at FROM quant_snapshots ORDER BY created_at DESC LIMIT 1',
    ).first<{ generated_at: string }>()
    return json(request, env, {
      ok: true,
      service: 'web3-quant-api',
      latestSnapshotAt: snapshot?.generated_at ?? null,
    })
  }
  if (url.pathname === '/api/auth/status' && request.method === 'GET') {
    return json(request, env, await authStatus(env))
  }
  if (url.pathname === '/api/auth/exchange' && request.method === 'POST') {
    return json(request, env, await exchangeCode(env, await requestJson(request)))
  }
  if (url.pathname === '/api/auth/me' && request.method === 'GET') {
    return json(request, env, { user: await authenticate(request, env) })
  }
  if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
    await logout(request, env)
    return json(request, env, { ok: true })
  }
  if (url.pathname === '/api/analytics/config' && request.method === 'GET') {
    return json(request, env, await analyticsConfig(env))
  }
  if (url.pathname === '/api/admin/users' && request.method === 'GET') {
    await authenticate(request, env, 'users.manage')
    return json(request, env, { users: await listUsers(env) })
  }
  if (url.pathname === '/api/admin/users' && request.method === 'POST') {
    const actor = await authenticate(request, env, 'users.manage')
    return json(request, env, await createUser(env, actor.id, await requestJson(request)), 201)
  }
  const userMatch = url.pathname.match(/^\/api\/admin\/users\/([0-9a-f-]+)$/i)
  if (userMatch && request.method === 'PATCH') {
    const actor = await authenticate(request, env, 'users.manage')
    await updateUser(env, actor.id, userMatch[1], await requestJson(request))
    return json(request, env, { ok: true })
  }
  if (url.pathname === '/api/admin/analytics' && request.method === 'GET') {
    await authenticate(request, env, 'analytics.view')
    return json(request, env, await analyticsConfig(env, true))
  }
  if (url.pathname === '/api/admin/analytics' && request.method === 'PATCH') {
    const actor = await authenticate(request, env, 'analytics.manage')
    return json(request, env, await saveAnalytics(env, actor.id, await requestJson(request)))
  }
  if (url.pathname === '/api/quant/dashboard' && request.method === 'GET') {
    return json(request, env, await latestDashboard(env))
  }
  if (url.pathname === '/api/paper' && request.method === 'GET') {
    const actor = await authenticate(request, env, 'paper.manage')
    return json(request, env, { positions: await listPaperPositions(env, actor.id) })
  }
  if (url.pathname === '/api/paper' && request.method === 'POST') {
    const actor = await authenticate(request, env, 'paper.manage')
    const input = await requestJson<{ symbol?: unknown }>(request)
    const securedRequest = new Request(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ ...input, clientId: actor.id }),
    })
    return json(request, env, { position: await createPaperPosition(securedRequest, env) }, 201)
  }
  const closeMatch = url.pathname.match(/^\/api\/paper\/([0-9a-f-]+)\/close$/i)
  if (closeMatch && request.method === 'PATCH') {
    const actor = await authenticate(request, env, 'paper.manage')
    await closePaperPosition(env, actor.id, closeMatch[1])
    return json(request, env, { ok: true })
  }
  const deleteMatch = url.pathname.match(/^\/api\/paper\/([0-9a-f-]+)$/i)
  if (deleteMatch && request.method === 'DELETE') {
    const actor = await authenticate(request, env, 'paper.manage')
    await deletePaperPosition(env, actor.id, deleteMatch[1])
    return json(request, env, { ok: true })
  }
  if (url.pathname === '/api/technical-alerts' && request.method === 'GET') {
    const actor = await authenticate(request, env, 'technicalAlerts.manage')
    return json(request, env, { alerts: await listTechnicalAlerts(env, actor.id) })
  }
  if (url.pathname === '/api/technical-alerts' && request.method === 'POST') {
    const actor = await authenticate(request, env, 'technicalAlerts.manage')
    return json(
      request,
      env,
      { alert: await createTechnicalAlert(request, env, actor.id) },
      201,
    )
  }
  const technicalAlertMatch = url.pathname.match(/^\/api\/technical-alerts\/([0-9a-f-]+)$/i)
  if (technicalAlertMatch && request.method === 'PATCH') {
    const actor = await authenticate(request, env, 'technicalAlerts.manage')
    await updateTechnicalAlert(request, env, actor.id, technicalAlertMatch[1])
    return json(request, env, { ok: true })
  }
  if (technicalAlertMatch && request.method === 'DELETE') {
    const actor = await authenticate(request, env, 'technicalAlerts.manage')
    await deleteTechnicalAlert(env, actor.id, technicalAlertMatch[1])
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
      const status = error instanceof HttpError || error instanceof AuthError ? error.status : 500
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
