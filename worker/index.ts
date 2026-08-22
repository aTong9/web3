import type {
  CrossAssetDataset,
  AssetTechnicalDataset,
  HotStockDataset,
  MarketQuote,
  MarketQuoteResponse,
  OptionMarketDataset,
  ContractChartInterval,
  ContractPaperTrade,
  ContractPositionDirection,
  PaperSignalPosition,
  QuantDashboard,
  TechnicalAlertCondition,
  TechnicalAlertHorizon,
  TechnicalAlertRule,
  TechnicalIndicatorConfig,
  TechnicalIndicatorConfigVersion,
  UsMegaCapDataset,
} from '../src/types/index'
import { buildQuantDashboard } from '../src/utils/quant-signals'
import {
  closeContractPaperTrade,
  createContractPaperTrade,
} from '../src/utils/contract-paper-journal'
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
import {
  btcAutoTradingCsv,
  btcAutoTradingDashboard,
  closeBtcAutoTradingPosition,
  runBtcAutoTradingCycle,
  saveBtcAutoTradingConfig,
  saveTestnetSafetyDrill,
  testnetExecutionCalibration,
  testnetExecutionCalibrationEvidence,
} from './btc-auto-trading'
import {
  createTradingEvidenceAuditCheckpoint,
  loadTradingEvidenceCloudSnapshot,
  listTradingEvidenceCloudVersions,
  loadTradingEvidenceCloudVersion,
  restoreTradingEvidenceCloudVersion,
  saveTradingEvidenceCloudSnapshot,
  TradingEvidenceConflictError,
  TradingEvidenceIntegrityError,
  TradingEvidenceInputError,
  TradingEvidenceNotFoundError,
  verifyExternalTradingEvidenceAuditCheckpoint,
  verifyTradingEvidenceCloudAudit,
} from './trading-evidence-sync'

const maximumJsonBytes = 4_000_000
const maximumRequestBytes = 8_192
const quoteCacheSeconds = 45
const maximumQuoteSymbols = 25
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

interface ContractPaperTradeRow {
  id: string
  user_id: string
  symbol: string
  display_name: string
  quote_asset: string
  direction: ContractPositionDirection
  interval: ContractChartInterval
  opened_at: string
  closed_at: string | null
  entry_price: number
  exit_price: number | null
  stop_loss: number
  take_profit: number
  notional: number
  leverage: number
  fee_rate_pct: number
  funding_rate_pct: number
  funding_settlements: number
  risk_budget: number
  entered_risk_amount: number
  signal_score: number
  signal_confidence: number
  strategy_version: string
  signal_version: string
  path_id: string
  market_source: string
  cost_model_version: string
  planned_entry_price: number
  slippage_rate_pct: number
  status: ContractPaperTrade['status']
}

interface TechnicalAlertRow {
  id: string
  user_id: string
  asset_id: string
  asset_name: string
  series: string
  compare_asset_id: string | null
  compare_asset_name: string | null
  condition: TechnicalAlertCondition
  threshold: number | null
  horizon: TechnicalAlertHorizon
  minimum_confidence: number
  require_resonance: number
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
  'volumeSpike',
  'volatilityAbove',
  'gapAbove',
  'earningsWithinDays',
  'correlationStructureChange',
  'volatilityPercentileAbove',
  'technicalDivergence',
  'transmissionDivergence',
  'fundPremiumAbove',
  'fundLimitChanged',
])
const technicalAlertHorizons = new Set<TechnicalAlertHorizon>([
  'day',
  'week',
  'month',
  'quarter',
  'halfYear',
  'year',
])
const technicalRanges = new Set<TechnicalIndicatorConfig['display']['defaultRange']>([
  'day',
  'week',
  'month',
  'quarter',
  'halfYear',
  'year',
  'threeYear',
  'fiveYear',
])

interface TechnicalConfigRow {
  version: number
  formula_version: string
  config_json: string
  created_by: string | null
  created_at: string
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
  const localDevelopmentOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
  return origin === requestOrigin || allowed.includes(origin) || localDevelopmentOrigin
    ? origin
    : null
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
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
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

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: {
        symbol?: string
        longName?: string
        shortName?: string
        currency?: string
        instrumentType?: string
        regularMarketPrice?: number
        regularMarketTime?: number
        previousClose?: number
        chartPreviousClose?: number
        currentTradingPeriod?: {
          pre?: { start?: number; end?: number }
          regular?: { start?: number; end?: number }
          post?: { start?: number; end?: number }
        }
      }
      timestamp?: number[]
      indicators?: { quote?: Array<{ close?: Array<number | null> }> }
    }>
    error?: { description?: string } | null
  }
}

const fixedQuoteSymbols = new Set([
  '^GSPC',
  '^IXIC',
  '^N225',
  '000001.SS',
  '^HSI',
  '^STOXX50E',
  'DX-Y.NYB',
  '^VIX',
  'CL=F',
  'GC=F',
  'BTC-USD',
  'ETH-USD',
])

const toAShareQuoteSymbol = (code: string) => {
  if (/^[48]/.test(code)) return `${code}.BJ`
  return /^[569]/.test(code) ? `${code}.SS` : `${code}.SZ`
}

const permittedQuoteSymbols = async (env: Env) => {
  const [hotStocks, megaCaps] = await Promise.all([
    fetchSource<HotStockDataset>(env, 'hot-stocks.json'),
    fetchSource<UsMegaCapDataset>(env, 'us-megacaps.json'),
  ])
  const allowed = new Set(fixedQuoteSymbols)
  for (const stock of megaCaps.stocks) allowed.add(stock.symbol)
  for (const market of Object.values(hotStocks.markets)) {
    for (const stock of [...market.daily, ...market.weekly]) {
      allowed.add(
        market === hotStocks.markets.aShare ? toAShareQuoteSymbol(stock.code) : stock.code,
      )
    }
  }
  return allowed
}

const quoteSession = (
  meta: NonNullable<NonNullable<YahooChartResponse['chart']>['result']>[number]['meta'],
  nowSeconds: number,
): MarketQuote['session'] => {
  if (meta?.instrumentType === 'CRYPTOCURRENCY') return 'continuous'
  const periods = meta?.currentTradingPeriod
  if (
    periods?.pre?.start &&
    periods.pre.end &&
    nowSeconds >= periods.pre.start &&
    nowSeconds < periods.pre.end
  )
    return 'pre'
  if (
    periods?.regular?.start &&
    periods.regular.end &&
    nowSeconds >= periods.regular.start &&
    nowSeconds < periods.regular.end
  )
    return 'regular'
  if (
    periods?.post?.start &&
    periods.post.end &&
    nowSeconds >= periods.post.start &&
    nowSeconds < periods.post.end
  )
    return 'post'
  return 'closed'
}

const fetchYahooQuote = async (symbol: string): Promise<MarketQuote> => {
  const cache = caches.default
  const cacheKey = new Request(`https://market-quote-cache.invalid/${encodeURIComponent(symbol)}`)
  const cached = await cache.match(cacheKey)
  if (cached) return (await cached.json()) as MarketQuote

  const sourceUrl = `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}`
  const endpoint = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d&includePrePost=true`
  const response = await fetch(endpoint, {
    headers: { Accept: 'application/json', 'User-Agent': 'web3-market-desk/1.0' },
  })
  const payload = await readBoundedJson<YahooChartResponse>(response)
  const result = payload.chart?.result?.[0]
  const meta = result?.meta
  if (!meta || payload.chart?.error) throw new Error(`行情不可用：${symbol}`)

  const timestamps = result.timestamp ?? []
  const closes = result.indicators?.quote?.[0]?.close ?? []
  let latestIndex = Math.min(timestamps.length, closes.length) - 1
  while (latestIndex >= 0 && closes[latestIndex] === null) latestIndex -= 1
  const price = latestIndex >= 0 ? closes[latestIndex] : (meta.regularMarketPrice ?? null)
  const marketTimestamp = latestIndex >= 0 ? timestamps[latestIndex] : meta.regularMarketTime
  const previousClose = meta.previousClose ?? meta.chartPreviousClose ?? null
  const fetchedAt = new Date().toISOString()
  const nowSeconds = Math.floor(Date.now() / 1000)
  const session = quoteSession(meta, nowSeconds)
  const ageSeconds = marketTimestamp
    ? Math.max(0, nowSeconds - marketTimestamp)
    : Number.POSITIVE_INFINITY
  const status: MarketQuote['status'] =
    session === 'closed'
      ? 'closed'
      : ageSeconds <= 300
        ? 'nearRealTime'
        : ageSeconds <= 1_800
          ? 'delayed'
          : 'stale'
  const quote: MarketQuote = {
    symbol,
    name: meta.longName ?? meta.shortName ?? symbol,
    price,
    previousClose,
    changePct:
      price !== null && previousClose !== null && previousClose !== 0
        ? ((price - previousClose) / previousClose) * 100
        : null,
    currency: meta.currency ?? null,
    marketTime: marketTimestamp ? new Date(marketTimestamp * 1000).toISOString() : null,
    fetchedAt,
    session,
    status,
    source: 'Yahoo Finance chart',
    sourceUrl,
  }
  await cache.put(
    cacheKey,
    new Response(JSON.stringify(quote), {
      headers: { 'Cache-Control': `public, max-age=${quoteCacheSeconds}` },
    }),
  )
  return quote
}

const marketQuotes = async (request: Request, env: Env): Promise<MarketQuoteResponse> => {
  const rawSymbols = new URL(request.url).searchParams.get('symbols') ?? ''
  const symbols = [
    ...new Set(
      rawSymbols
        .split(',')
        .map((value) => value.trim().toUpperCase())
        .filter(Boolean),
    ),
  ]
  if (!symbols.length) throw new HttpError(400, '至少提供一个行情代码')
  if (symbols.length > maximumQuoteSymbols)
    throw new HttpError(400, `单次最多查询${maximumQuoteSymbols}个标的`)
  const allowed = await permittedQuoteSymbols(env)
  const denied = symbols.filter((symbol) => !allowed.has(symbol))
  const permitted = symbols.filter((symbol) => allowed.has(symbol))

  const settled = await Promise.allSettled(permitted.map(fetchYahooQuote))
  const quotes: MarketQuote[] = []
  const unavailableSymbols = [...denied]
  settled.forEach((result, index) => {
    if (result.status === 'fulfilled') quotes.push(result.value)
    else unavailableSymbols.push(permitted[index])
  })
  return {
    fetchedAt: new Date().toISOString(),
    refreshAfterSeconds: 60,
    quotes,
    unavailableSymbols,
    disclaimer: '免费准实时行情可能延迟、休市或中断，仅供研究展示，不用于交易执行。',
  }
}

const refreshSnapshot = async (env: Env) => {
  const [crossAsset, megaCaps, optionMarket, stockTechnicals] = await Promise.all([
    fetchSource<CrossAssetDataset>(env, 'cross-asset.json'),
    fetchSource<UsMegaCapDataset>(env, 'us-megacaps.json'),
    fetchSource<OptionMarketDataset>(env, 'option-market.json'),
    fetchSource<AssetTechnicalDataset>(env, 'us-stock-technical-signals.json'),
  ])
  const dashboard = buildQuantDashboard(crossAsset, megaCaps, optionMarket, stockTechnicals)
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
      dashboard.options.every(
        (candidate) =>
          candidate.earnings &&
          candidate.direction &&
          'optionMarket' in candidate &&
          'earningsEvent' in candidate,
      ) &&
      dashboard.assets.every((asset) => 'validation' in asset)
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

const requestJson = async <T>(request: Request, maximumBytes = maximumRequestBytes): Promise<T> => {
  const contentLength = Number(request.headers.get('Content-Length') ?? 0)
  if (contentLength > maximumBytes) throw new HttpError(413, '请求内容过大')
  if (!request.body) throw new HttpError(400, '请求内容为空')
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maximumBytes) {
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

const contractIntervals: ContractChartInterval[] = ['1m', '3m', '5m', '15m', '30m', '1h', '4h']
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const isContractInterval = (value: unknown): value is ContractChartInterval =>
  typeof value === 'string' && contractIntervals.includes(value as ContractChartInterval)

const contractText = (value: unknown, field: string, maximum: number) => {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (!normalized || normalized.length > maximum) throw new HttpError(400, `${field}格式无效`)
  return normalized
}

const contractNumber = (
  value: unknown,
  field: string,
  minimum: number,
  maximum: number,
  integer = false,
) => {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < minimum ||
    value > maximum ||
    (integer && !Number.isInteger(value))
  )
    throw new HttpError(400, `${field}格式无效`)
  return value
}

const contractTimestamp = (value: unknown, field: string) => {
  const normalized = contractText(value, field, 40)
  const timestamp = new Date(normalized).getTime()
  if (!Number.isFinite(timestamp) || timestamp > Date.now() + 300_000) {
    throw new HttpError(400, `${field}格式无效`)
  }
  return new Date(timestamp).toISOString()
}

const toContractPaperTrade = (row: ContractPaperTradeRow): ContractPaperTrade => ({
  id: row.id,
  symbol: row.symbol,
  displayName: row.display_name,
  quoteAsset: row.quote_asset,
  direction: row.direction,
  interval: row.interval,
  openedAt: row.opened_at,
  closedAt: row.closed_at,
  entryPrice: row.entry_price,
  exitPrice: row.exit_price,
  stopLoss: row.stop_loss,
  takeProfit: row.take_profit,
  notional: row.notional,
  leverage: row.leverage,
  feeRatePct: row.fee_rate_pct,
  fundingRatePct: row.funding_rate_pct,
  fundingSettlements: row.funding_settlements,
  riskBudget: row.risk_budget,
  enteredRiskAmount: row.entered_risk_amount,
  signalScore: row.signal_score,
  signalConfidence: row.signal_confidence,
  strategyVersion: row.strategy_version,
  signalVersion: row.signal_version,
  pathId: row.path_id,
  marketSource: row.market_source,
  costModelVersion: row.cost_model_version,
  plannedEntryPrice: row.planned_entry_price,
  slippageRatePct: row.slippage_rate_pct,
  status: row.status,
})

const contractPaperColumns = `id, user_id, symbol, display_name, quote_asset, direction, interval,
  opened_at, closed_at, entry_price, exit_price, stop_loss, take_profit, notional, leverage,
  fee_rate_pct, funding_rate_pct, funding_settlements, risk_budget, entered_risk_amount,
  signal_score, signal_confidence, strategy_version, signal_version, path_id, market_source,
  cost_model_version, planned_entry_price, slippage_rate_pct, status`

const listContractPaperTrades = async (env: Env, userId: string) => {
  const rows = await env.DB.prepare(
    `SELECT ${contractPaperColumns}
     FROM contract_paper_trades
     WHERE user_id = ?1
     ORDER BY opened_at DESC
     LIMIT 200`,
  )
    .bind(userId)
    .all<ContractPaperTradeRow>()
  return rows.results.map(toContractPaperTrade)
}

const parseContractPaperTrade = async (request: Request) => {
  const input = await requestJson<Record<string, unknown>>(request)
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HttpError(400, '合约模拟记录格式无效')
  }
  const id = contractText(input.id, '记录ID', 36)
  if (!uuidPattern.test(id)) throw new HttpError(400, '记录ID格式无效')
  const symbol = contractText(input.symbol, '合约代码', 30).toUpperCase()
  if (!/^[A-Z0-9]{2,30}$/.test(symbol)) throw new HttpError(400, '合约代码格式无效')
  const quoteAsset = contractText(input.quoteAsset, '结算资产', 12).toUpperCase()
  if (!/^[A-Z0-9]{2,12}$/.test(quoteAsset)) throw new HttpError(400, '结算资产格式无效')
  if (input.direction !== 'long' && input.direction !== 'short') {
    throw new HttpError(400, '模拟方向无效')
  }
  if (!isContractInterval(input.interval)) throw new HttpError(400, 'K线周期无效')
  const openedAt = contractTimestamp(input.openedAt, '记录时间')
  const created = createContractPaperTrade({
    id,
    symbol,
    displayName: contractText(input.displayName, '标的名称', 120),
    quoteAsset,
    direction: input.direction,
    interval: input.interval,
    openedAt,
    entryPrice: contractNumber(input.entryPrice, '入场价', 0.00000001, 1_000_000_000),
    stopLoss: contractNumber(input.stopLoss, '止损价', 0.00000001, 1_000_000_000),
    takeProfit: contractNumber(input.takeProfit, '止盈价', 0.00000001, 1_000_000_000),
    notional: contractNumber(input.notional, '名义仓位', 0.01, 1_000_000_000),
    leverage: contractNumber(input.leverage, '杠杆倍数', 1, 125),
    feeRatePct: contractNumber(input.feeRatePct, '手续费率', 0, 5),
    fundingRatePct: contractNumber(input.fundingRatePct, '资金费率', -100, 100),
    fundingSettlements: contractNumber(input.fundingSettlements, '资金费次数', 0, 10_000, true),
    riskBudget: contractNumber(input.riskBudget, '风险预算', 0.00000001, 1_000_000_000),
    enteredRiskAmount: contractNumber(
      input.enteredRiskAmount,
      '止损风险',
      0.00000001,
      1_000_000_000,
    ),
    signalScore: contractNumber(input.signalScore, '信号评分', -100, 100),
    signalConfidence: contractNumber(input.signalConfidence, '信号一致度', 0, 100),
    strategyVersion: contractText(input.strategyVersion, '策略版本', 120),
    signalVersion: contractText(input.signalVersion, '信号版本', 120),
    pathId: contractText(input.pathId, '路径ID', 120),
    marketSource: contractText(input.marketSource, '行情源', 120),
    costModelVersion: contractText(input.costModelVersion, '成本模型版本', 120),
    plannedEntryPrice: contractNumber(
      input.plannedEntryPrice,
      '计划入场价',
      0.00000001,
      1_000_000_000,
    ),
    slippageRatePct: contractNumber(input.slippageRatePct, '滑点率', 0, 5),
  })
  if (!created) throw new HttpError(400, '交易计划方向或价格层级无效')
  if (input.status === 'open') return created
  if (input.status !== 'closed') throw new HttpError(400, '模拟记录状态无效')
  const closedAt = contractTimestamp(input.closedAt, '关闭时间')
  if (new Date(closedAt).getTime() < new Date(openedAt).getTime()) {
    throw new HttpError(400, '关闭时间不能早于记录时间')
  }
  const closed = closeContractPaperTrade(
    created,
    contractNumber(input.exitPrice, '退出价', 0.00000001, 1_000_000_000),
    closedAt,
  )
  if (!closed) throw new HttpError(400, '关闭记录格式无效')
  return closed
}

const createCloudContractPaperTrade = async (request: Request, env: Env, userId: string) => {
  const trade = await parseContractPaperTrade(request)
  const updatedAt = new Date().toISOString()
  await env.DB.prepare(
    `INSERT OR IGNORE INTO contract_paper_trades
     (id, user_id, symbol, display_name, quote_asset, direction, interval, opened_at, closed_at,
      entry_price, exit_price, stop_loss, take_profit, notional, leverage, fee_rate_pct,
      funding_rate_pct, funding_settlements, risk_budget, entered_risk_amount, signal_score,
      signal_confidence, strategy_version, signal_version, path_id, market_source,
      cost_model_version, planned_entry_price, slippage_rate_pct, status, updated_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15,
             ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26, ?27, ?28,
             ?29, ?30, ?31)`,
  )
    .bind(
      trade.id,
      userId,
      trade.symbol,
      trade.displayName,
      trade.quoteAsset,
      trade.direction,
      trade.interval,
      trade.openedAt,
      trade.closedAt,
      trade.entryPrice,
      trade.exitPrice,
      trade.stopLoss,
      trade.takeProfit,
      trade.notional,
      trade.leverage,
      trade.feeRatePct,
      trade.fundingRatePct,
      trade.fundingSettlements,
      trade.riskBudget,
      trade.enteredRiskAmount,
      trade.signalScore,
      trade.signalConfidence,
      trade.strategyVersion,
      trade.signalVersion,
      trade.pathId,
      trade.marketSource,
      trade.costModelVersion,
      trade.plannedEntryPrice,
      trade.slippageRatePct,
      trade.status,
      updatedAt,
    )
    .run()
  const stored = await env.DB.prepare(
    `SELECT ${contractPaperColumns} FROM contract_paper_trades WHERE id = ?1 AND user_id = ?2`,
  )
    .bind(trade.id, userId)
    .first<ContractPaperTradeRow>()
  if (!stored) throw new HttpError(409, '该合约已有未关闭的云端模拟记录')
  return listContractPaperTrades(env, userId)
}

const closeCloudContractPaperTrade = async (
  request: Request,
  env: Env,
  userId: string,
  id: string,
) => {
  if (!uuidPattern.test(id)) throw new HttpError(400, '记录ID格式无效')
  const existing = await env.DB.prepare(
    `SELECT ${contractPaperColumns}
     FROM contract_paper_trades WHERE id = ?1 AND user_id = ?2 AND status = 'open'`,
  )
    .bind(id, userId)
    .first<ContractPaperTradeRow>()
  if (!existing) throw new HttpError(404, '未找到可关闭的合约模拟记录')
  const input = await requestJson<Record<string, unknown>>(request)
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HttpError(400, '关闭记录格式无效')
  }
  const closedAt = contractTimestamp(input.closedAt, '关闭时间')
  const trade = toContractPaperTrade(existing)
  if (new Date(closedAt).getTime() < new Date(trade.openedAt).getTime()) {
    throw new HttpError(400, '关闭时间不能早于记录时间')
  }
  const closed = closeContractPaperTrade(
    trade,
    contractNumber(input.exitPrice, '退出价', 0.00000001, 1_000_000_000),
    closedAt,
  )
  if (!closed) throw new HttpError(400, '关闭记录格式无效')
  const result = await env.DB.prepare(
    `UPDATE contract_paper_trades
     SET status = 'closed', closed_at = ?1, exit_price = ?2, updated_at = ?3
     WHERE id = ?4 AND user_id = ?5 AND status = 'open'`,
  )
    .bind(closed.closedAt, closed.exitPrice, new Date().toISOString(), id, userId)
    .run()
  if (!result.meta.changes) throw new HttpError(409, '合约模拟记录状态已变化')
  return listContractPaperTrades(env, userId)
}

const deleteCloudContractPaperTrade = async (env: Env, userId: string, id: string) => {
  if (!uuidPattern.test(id)) throw new HttpError(400, '记录ID格式无效')
  const result = await env.DB.prepare(
    `DELETE FROM contract_paper_trades WHERE id = ?1 AND user_id = ?2 AND status = 'closed'`,
  )
    .bind(id, userId)
    .run()
  if (!result.meta.changes) throw new HttpError(404, '仅可删除已关闭的合约模拟记录')
  return listContractPaperTrades(env, userId)
}

const toTechnicalAlert = (row: TechnicalAlertRow): TechnicalAlertRule => ({
  id: row.id,
  assetId: row.asset_id,
  assetName: row.asset_name,
  series: row.series,
  compareAssetId: row.compare_asset_id,
  compareAssetName: row.compare_asset_name,
  condition: row.condition,
  threshold: row.threshold,
  horizon: row.horizon,
  minimumConfidence: row.minimum_confidence,
  requireResonance: Boolean(row.require_resonance),
  enabled: Boolean(row.enabled),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const listTechnicalAlerts = async (env: Env, userId: string) => {
  const rows = await env.DB.prepare(
    `SELECT id, user_id, asset_id, asset_name, series, compare_asset_id, compare_asset_name,
            condition, threshold,
            horizon, minimum_confidence, require_resonance, enabled, created_at, updated_at
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
    compareAssetId?: unknown
    compareAssetName?: unknown
    condition?: unknown
    threshold?: unknown
    horizon?: unknown
    minimumConfidence?: unknown
    requireResonance?: unknown
  }>(request)
  const assetId = validateAlertText(input.assetId, '资产ID', 80)
  const assetName = validateAlertText(input.assetName, '资产名称', 120)
  const series = validateAlertText(input.series, '资产代码', 40)
  if (!technicalAlertConditions.has(input.condition as TechnicalAlertCondition)) {
    throw new HttpError(400, '预警条件无效')
  }
  const condition = input.condition as TechnicalAlertCondition
  const requiresComparison = condition === 'correlationStructureChange'
  const compareAssetId = requiresComparison
    ? validateAlertText(input.compareAssetId, '对比资产ID', 80)
    : null
  const compareAssetName = requiresComparison
    ? validateAlertText(input.compareAssetName, '对比资产名称', 120)
    : null
  if (compareAssetId === assetId) throw new HttpError(400, '对比资产不能与当前资产相同')
  if (!technicalAlertHorizons.has(input.horizon as TechnicalAlertHorizon)) {
    throw new HttpError(400, '关注周期无效')
  }
  const horizon = input.horizon as TechnicalAlertHorizon
  const minimumConfidence = Number(input.minimumConfidence)
  if (!Number.isInteger(minimumConfidence) || minimumConfidence < 0 || minimumConfidence > 100) {
    throw new HttpError(400, '最低置信度无效')
  }
  if (typeof input.requireResonance !== 'boolean') throw new HttpError(400, '共振偏好无效')
  const requiresThreshold = !condition.startsWith('macd') && condition !== 'fundLimitChanged'
  const threshold = input.threshold === null ? null : Number(input.threshold)
  if (requiresThreshold && (!Number.isFinite(threshold) || threshold === null)) {
    throw new HttpError(400, '预警阈值无效')
  }
  if (
    condition === 'correlationStructureChange' &&
    (threshold === null || threshold <= 0 || threshold > 2)
  ) {
    throw new HttpError(400, '相关性变化阈值必须大于0且不超过2')
  }
  if (
    ['volatilityPercentileAbove', 'technicalDivergence'].includes(condition) &&
    (threshold === null || threshold < 0 || threshold > 100)
  ) {
    throw new HttpError(400, '百分比或指标差阈值必须在0至100之间')
  }
  if (
    condition === 'transmissionDivergence' &&
    (threshold === null || threshold < 0 || threshold > 10)
  ) {
    throw new HttpError(400, '传导背离阈值必须在0至10之间')
  }
  if (
    condition === 'fundPremiumAbove' &&
    (threshold === null || threshold < 0 || threshold > 1000)
  ) {
    throw new HttpError(400, '基金溢价率阈值必须在0至1000之间')
  }
  if (!requiresThreshold && threshold !== null) throw new HttpError(400, '该预警不需要阈值')
  const now = new Date().toISOString()
  const id = crypto.randomUUID()
  try {
    await env.DB.prepare(
      `INSERT INTO technical_alert_rules
       (id, user_id, asset_id, asset_name, series, compare_asset_id, compare_asset_name,
        condition, threshold, horizon,
        minimum_confidence, require_resonance, enabled, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    )
      .bind(
        id,
        userId,
        assetId,
        assetName,
        series,
        compareAssetId,
        compareAssetName,
        condition,
        threshold,
        horizon,
        minimumConfidence,
        input.requireResonance ? 1 : 0,
        now,
        now,
      )
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

const updateTechnicalAlert = async (request: Request, env: Env, userId: string, id: string) => {
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

const toTechnicalConfig = (row: TechnicalConfigRow): TechnicalIndicatorConfig => {
  const payload = JSON.parse(row.config_json) as Omit<
    TechnicalIndicatorConfig,
    'version' | 'formulaVersion' | 'updatedAt' | 'updatedBy'
  >
  return {
    version: row.version,
    formulaVersion: row.formula_version,
    updatedAt: row.created_at,
    updatedBy: row.created_by,
    ...payload,
  }
}

const latestTechnicalConfig = async (env: Env) => {
  const row = await env.DB.prepare(
    `SELECT version, formula_version, config_json, created_by, created_at
     FROM technical_indicator_config_versions ORDER BY version DESC LIMIT 1`,
  ).first<TechnicalConfigRow>()
  if (!row) throw new HttpError(503, '技术指标配置尚未初始化')
  return toTechnicalConfig(row)
}

const listTechnicalConfigVersions = async (env: Env) => {
  const rows = await env.DB.prepare(
    `SELECT version, formula_version, created_by, created_at
     FROM technical_indicator_config_versions ORDER BY version DESC LIMIT 50`,
  ).all<Omit<TechnicalConfigRow, 'config_json'>>()
  return rows.results.map(
    (row): TechnicalIndicatorConfigVersion => ({
      version: row.version,
      formulaVersion: row.formula_version,
      updatedAt: row.created_at,
      updatedBy: row.created_by,
    }),
  )
}

const validateConfigNumber = (
  value: unknown,
  label: string,
  minimum: number,
  maximum: number,
  integer = true,
) => {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < minimum ||
    value > maximum ||
    (integer && !Number.isInteger(value))
  ) {
    throw new HttpError(400, `${label}必须在${minimum}至${maximum}之间`)
  }
  return value
}

const validateTechnicalConfig = (input: TechnicalIndicatorConfig) => {
  if (!input || typeof input !== 'object') throw new HttpError(400, '技术指标配置无效')
  if (!/^[a-z0-9][a-z0-9._-]{2,39}$/i.test(input.formulaVersion ?? '')) {
    throw new HttpError(400, '公式版本格式无效')
  }
  const enabledKeys: Array<keyof TechnicalIndicatorConfig['enabled']> = [
    'maShort',
    'maLong',
    'macd',
    'rsi',
    'bollinger',
    'atr',
    'volume',
    'crossAsset',
    'advancedMovingAverages',
    'adx',
    'stochastic',
    'roc',
    'cci',
    'historicalVolatility',
    'obv',
    'vwap',
    'marketStructure',
  ]
  if (enabledKeys.some((key) => typeof input.enabled?.[key] !== 'boolean')) {
    throw new HttpError(400, '指标启用状态无效')
  }
  const parameters = input.parameters
  validateConfigNumber(parameters?.maShortPeriod, '短期均线周期', 2, 200)
  validateConfigNumber(parameters?.maLongPeriod, '长期均线周期', 5, 400)
  validateConfigNumber(parameters?.macdFastPeriod, 'MACD快线周期', 2, 100)
  validateConfigNumber(parameters?.macdSlowPeriod, 'MACD慢线周期', 3, 200)
  validateConfigNumber(parameters?.macdSignalPeriod, 'MACD信号周期', 2, 100)
  validateConfigNumber(parameters?.rsiPeriod, 'RSI周期', 2, 100)
  validateConfigNumber(parameters?.rsiOverbought, 'RSI超买阈值', 51, 99, false)
  validateConfigNumber(parameters?.rsiOversold, 'RSI超卖阈值', 1, 49, false)
  validateConfigNumber(parameters?.bollingerPeriod, '布林带周期', 2, 200)
  validateConfigNumber(parameters?.bollingerMultiplier, '布林带倍数', 0.5, 5, false)
  validateConfigNumber(parameters?.atrPeriod, 'ATR周期', 2, 100)
  validateConfigNumber(parameters?.supportResistanceWindow, '支撑压力窗口', 10, 500)
  validateConfigNumber(parameters?.maFastPeriod, '快速均线周期', 2, 60)
  validateConfigNumber(parameters?.maMediumPeriod, '中速均线周期', 3, 120)
  validateConfigNumber(parameters?.maTrendPeriod, '趋势均线周期', 20, 300)
  validateConfigNumber(parameters?.maAnnualPeriod, '长期均线周期', 60, 500)
  validateConfigNumber(parameters?.emaPeriod, 'EMA周期', 2, 200)
  validateConfigNumber(parameters?.adxPeriod, 'ADX周期', 2, 100)
  validateConfigNumber(parameters?.stochasticPeriod, 'Stochastic周期', 2, 100)
  validateConfigNumber(parameters?.rocPeriod, 'ROC周期', 2, 200)
  validateConfigNumber(parameters?.cciPeriod, 'CCI周期', 2, 200)
  validateConfigNumber(parameters?.historicalVolatilityPeriod, '历史波动率周期', 5, 252)
  validateConfigNumber(parameters?.vwapPeriod, 'VWAP周期', 2, 252)
  validateConfigNumber(parameters?.highLowWindow, '高低点窗口', 20, 1260)
  validateConfigNumber(parameters?.gapLookback, '缺口回看窗口', 5, 500)
  if (parameters.maShortPeriod >= parameters.maLongPeriod) {
    throw new HttpError(400, '短期均线周期必须小于长期均线周期')
  }
  if (
    !(
      parameters.maFastPeriod < parameters.maMediumPeriod &&
      parameters.maMediumPeriod < parameters.maTrendPeriod &&
      parameters.maTrendPeriod < parameters.maAnnualPeriod
    )
  ) {
    throw new HttpError(400, '高级均线周期必须按快速、中速、趋势、长期依次增大')
  }
  if (parameters.macdFastPeriod >= parameters.macdSlowPeriod) {
    throw new HttpError(400, 'MACD快线周期必须小于慢线周期')
  }
  if (parameters.rsiOversold >= parameters.rsiOverbought) {
    throw new HttpError(400, 'RSI超卖阈值必须小于超买阈值')
  }
  const weightKeys: Array<keyof TechnicalIndicatorConfig['weights']> = [
    'trend',
    'momentum',
    'volatility',
    'volume',
    'crossAsset',
  ]
  const weightTotal = weightKeys.reduce(
    (sum, key) => sum + validateConfigNumber(input.weights?.[key], `${key}权重`, 0, 1, false),
    0,
  )
  if (Math.abs(weightTotal - 1) > 0.001) throw new HttpError(400, '综合评分权重之和必须为1')
  validateConfigNumber(input.display?.carouselIntervalMs, '轮播间隔', 3_000, 30_000)
  if (typeof input.display?.carouselAutoPlay !== 'boolean') throw new HttpError(400, '轮播设置无效')
  if (!technicalRanges.has(input.display?.defaultRange)) throw new HttpError(400, '默认周期无效')
  if (
    !Array.isArray(input.sourcePriority) ||
    !input.sourcePriority.length ||
    input.sourcePriority.length > 10 ||
    input.sourcePriority.some(
      (source) => typeof source !== 'string' || !source.trim() || source.length > 80,
    )
  ) {
    throw new HttpError(400, '数据源优先级无效')
  }
  return {
    enabled: input.enabled,
    parameters,
    weights: input.weights,
    display: input.display,
    sourcePriority: input.sourcePriority.map((source) => source.trim()),
  }
}

const saveTechnicalConfig = async (request: Request, env: Env, actorId: string) => {
  const input = await requestJson<TechnicalIndicatorConfig>(request)
  const payload = validateTechnicalConfig(input)
  const now = new Date().toISOString()
  const result = await env.DB.prepare(
    `INSERT INTO technical_indicator_config_versions
     (formula_version, config_json, created_by, created_at) VALUES (?, ?, ?, ?)`,
  )
    .bind(input.formulaVersion, JSON.stringify(payload), actorId, now)
    .run()
  const version = Number(result.meta.last_row_id)
  await env.DB.prepare(
    `INSERT INTO admin_audit_log
     (id, actor_user_id, action, target_type, target_id, metadata, created_at)
     VALUES (?, ?, 'technical-config.update', 'technical-config', ?, ?, ?)`,
  )
    .bind(
      crypto.randomUUID(),
      actorId,
      String(version),
      JSON.stringify({ formulaVersion: input.formulaVersion }),
      now,
    )
    .run()
  return {
    config: await latestTechnicalConfig(env),
    versions: await listTechnicalConfigVersions(env),
  }
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
  if (url.pathname === '/api/technical-config' && request.method === 'GET') {
    return json(request, env, await latestTechnicalConfig(env))
  }
  if (url.pathname === '/api/market/quotes' && request.method === 'GET') {
    return json(request, env, await marketQuotes(request, env))
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
  if (url.pathname === '/api/admin/technical-config' && request.method === 'GET') {
    await authenticate(request, env, 'technicalConfig.manage')
    return json(request, env, {
      config: await latestTechnicalConfig(env),
      versions: await listTechnicalConfigVersions(env),
    })
  }
  if (url.pathname === '/api/admin/technical-config' && request.method === 'PATCH') {
    const actor = await authenticate(request, env, 'technicalConfig.manage')
    return json(request, env, await saveTechnicalConfig(request, env, actor.id))
  }
  if (url.pathname === '/api/quant/dashboard' && request.method === 'GET') {
    return json(request, env, await latestDashboard(env))
  }
  if (url.pathname === '/api/btc-auto-trading' && request.method === 'GET') {
    await authenticate(request, env, 'autoTrade.manage')
    return json(request, env, await btcAutoTradingDashboard(env))
  }
  if (url.pathname === '/api/btc-auto-trading/export' && request.method === 'GET') {
    await authenticate(request, env, 'autoTrade.manage')
    const locale = url.searchParams.get('locale') === 'en' ? 'en' : 'zh'
    const headers = responseHeaders(request, env)
    headers.set('Content-Type', 'text/csv; charset=utf-8')
    headers.set(
      'Content-Disposition',
      `attachment; filename="btc-auto-trading-${new Date().toISOString().slice(0, 10)}.csv"`,
    )
    return new Response(await btcAutoTradingCsv(env, locale), { headers })
  }
  if (url.pathname === '/api/btc-auto-trading' && request.method === 'PATCH') {
    const actor = await authenticate(request, env, 'autoTrade.manage')
    const input = await requestJson<Record<string, unknown>>(request)
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new HttpError(400, 'BTC自动交易配置格式无效')
    }
    try {
      return json(request, env, await saveBtcAutoTradingConfig(env, actor.id, input))
    } catch (error) {
      throw new HttpError(400, error instanceof Error ? error.message : 'BTC自动交易配置无效')
    }
  }
  if (url.pathname === '/api/btc-auto-trading/run' && request.method === 'POST') {
    await authenticate(request, env, 'autoTrade.manage')
    await runBtcAutoTradingCycle(env)
    return json(request, env, await btcAutoTradingDashboard(env))
  }
  if (url.pathname === '/api/btc-auto-trading/close' && request.method === 'POST') {
    await authenticate(request, env, 'autoTrade.manage')
    await closeBtcAutoTradingPosition(env)
    return json(request, env, await btcAutoTradingDashboard(env))
  }
  if (url.pathname === '/api/btc-auto-trading/testnet-calibration' && request.method === 'GET') {
    await authenticate(request, env, 'autoTrade.manage')
    return json(request, env, await testnetExecutionCalibration(env))
  }
  if (
    url.pathname === '/api/btc-auto-trading/testnet-calibration/evidence' &&
    request.method === 'GET'
  ) {
    await authenticate(request, env, 'autoTrade.manage')
    return json(request, env, await testnetExecutionCalibrationEvidence(env))
  }
  if (url.pathname === '/api/btc-auto-trading/testnet-drills' && request.method === 'POST') {
    const actor = await authenticate(request, env, 'autoTrade.manage')
    const input = await requestJson<Record<string, unknown>>(request)
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new HttpError(400, 'Testnet演练记录格式无效')
    }
    try {
      return json(request, env, await saveTestnetSafetyDrill(env, actor.id, input), 201)
    } catch (error) {
      throw new HttpError(400, error instanceof Error ? error.message : 'Testnet演练记录无效')
    }
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
  if (url.pathname === '/api/contract-paper' && request.method === 'GET') {
    const actor = await authenticate(request, env, 'paper.manage')
    return json(request, env, { trades: await listContractPaperTrades(env, actor.id) })
  }
  if (url.pathname === '/api/trading-evidence' && request.method === 'GET') {
    const actor = await authenticate(request, env, 'paper.manage')
    return json(request, env, await loadTradingEvidenceCloudSnapshot(env, actor.id))
  }
  if (url.pathname === '/api/trading-evidence' && request.method === 'PUT') {
    const actor = await authenticate(request, env, 'paper.manage')
    const input = await requestJson<{ expectedRevision: unknown; bundle: unknown }>(
      request,
      2_100_000,
    )
    try {
      return json(request, env, await saveTradingEvidenceCloudSnapshot(env, actor.id, input))
    } catch (error) {
      if (error instanceof TradingEvidenceConflictError) throw new HttpError(409, error.message)
      if (error instanceof TradingEvidenceInputError) throw new HttpError(400, error.message)
      throw error
    }
  }
  if (url.pathname === '/api/trading-evidence/history' && request.method === 'GET') {
    const actor = await authenticate(request, env, 'paper.manage')
    return json(request, env, { versions: await listTradingEvidenceCloudVersions(env, actor.id) })
  }
  if (url.pathname === '/api/trading-evidence/audit' && request.method === 'GET') {
    const actor = await authenticate(request, env, 'paper.manage')
    return json(request, env, await verifyTradingEvidenceCloudAudit(env, actor.id))
  }
  if (
    url.pathname === '/api/trading-evidence/audit/checkpoint' &&
    request.method === 'GET'
  ) {
    const actor = await authenticate(request, env, 'paper.manage')
    return json(request, env, await createTradingEvidenceAuditCheckpoint(env, actor.id))
  }
  if (
    url.pathname === '/api/trading-evidence/audit/checkpoint/verify' &&
    request.method === 'POST'
  ) {
    const actor = await authenticate(request, env, 'paper.manage')
    const input = await requestJson<{ serialized?: unknown }>(request, 16_384)
    if (typeof input.serialized !== 'string') {
      throw new HttpError(400, '外部审计检查点内容无效')
    }
    try {
      return json(
        request,
        env,
        await verifyExternalTradingEvidenceAuditCheckpoint(env, actor.id, input.serialized),
      )
    } catch (error) {
      if (error instanceof TradingEvidenceInputError) throw new HttpError(400, error.message)
      throw error
    }
  }
  const evidenceHistoryMatch = url.pathname.match(
    /^\/api\/trading-evidence\/history\/(\d+)(?:\/(restore))?$/,
  )
  if (evidenceHistoryMatch && request.method === 'GET' && !evidenceHistoryMatch[2]) {
    const actor = await authenticate(request, env, 'paper.manage')
    const revision = Number(evidenceHistoryMatch[1])
    const snapshot = await loadTradingEvidenceCloudVersion(env, actor.id, revision)
    if (!snapshot) throw new HttpError(404, '云端交易证据历史版本不存在')
    return json(request, env, snapshot)
  }
  if (evidenceHistoryMatch?.[2] === 'restore' && request.method === 'POST') {
    const actor = await authenticate(request, env, 'paper.manage')
    const revision = Number(evidenceHistoryMatch[1])
    const input = await requestJson<{ expectedRevision: unknown }>(request)
    try {
      return json(
        request,
        env,
        await restoreTradingEvidenceCloudVersion(env, actor.id, revision, input.expectedRevision),
      )
    } catch (error) {
      if (error instanceof TradingEvidenceConflictError) throw new HttpError(409, error.message)
      if (error instanceof TradingEvidenceNotFoundError) throw new HttpError(404, error.message)
      if (error instanceof TradingEvidenceInputError) throw new HttpError(400, error.message)
      if (error instanceof TradingEvidenceIntegrityError) throw error
      throw error
    }
  }
  if (url.pathname === '/api/contract-paper' && request.method === 'POST') {
    const actor = await authenticate(request, env, 'paper.manage')
    return json(
      request,
      env,
      { trades: await createCloudContractPaperTrade(request, env, actor.id) },
      201,
    )
  }
  const contractPaperCloseMatch = url.pathname.match(
    /^\/api\/contract-paper\/([0-9a-f-]+)\/close$/i,
  )
  if (contractPaperCloseMatch && request.method === 'PATCH') {
    const actor = await authenticate(request, env, 'paper.manage')
    return json(request, env, {
      trades: await closeCloudContractPaperTrade(
        request,
        env,
        actor.id,
        contractPaperCloseMatch[1],
      ),
    })
  }
  const contractPaperDeleteMatch = url.pathname.match(/^\/api\/contract-paper\/([0-9a-f-]+)$/i)
  if (contractPaperDeleteMatch && request.method === 'DELETE') {
    const actor = await authenticate(request, env, 'paper.manage')
    return json(request, env, {
      trades: await deleteCloudContractPaperTrade(env, actor.id, contractPaperDeleteMatch[1]),
    })
  }
  if (url.pathname === '/api/technical-alerts' && request.method === 'GET') {
    const actor = await authenticate(request, env, 'technicalAlerts.manage')
    return json(request, env, { alerts: await listTechnicalAlerts(env, actor.id) })
  }
  if (url.pathname === '/api/technical-alerts' && request.method === 'POST') {
    const actor = await authenticate(request, env, 'technicalAlerts.manage')
    return json(request, env, { alert: await createTechnicalAlert(request, env, actor.id) }, 201)
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
  async scheduled(controller, env) {
    try {
      if (controller.cron === '*/5 * * * *') await runBtcAutoTradingCycle(env)
      else await refreshSnapshot(env)
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
