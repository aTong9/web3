import type {
  AssetPricePoint,
  BtcAutoCloseReason,
  BtcAutoEntryGate,
  BtcAutoExecutionMode,
  BtcAutoMarketSource,
  BtcAutoSignalSnapshot,
  BtcAutoSignalHistoryItem,
  BtcAutoTrade,
  BtcAutoTradingConfig,
  BtcAutoTradingDashboard,
  ContractChartInterval,
  ContractMarketSnapshot,
  ContractTradeDecision,
} from '../src/types/index'
import { buildBtcAutoTradingCsv, type BtcAutoTradingExportLocale } from '../src/utils/btc-auto-trading-export'
import {
  btcAutoPerformanceWindowStartAt,
  btcAutoStrategyVersion,
  calculateBtcAutoDirectionalMove,
  calculateBtcAutoRollingHealth,
  calculateBtcAutoReconciledResult,
  calculateBtcAutoTradeResult,
  evaluateBtcAutoEntryGate,
  evolveBtcAutoSignal,
  nextBtcAutoScheduledRunAt,
  resolveBtcAutoCloseTrigger,
  selectBtcAutoOutcomePoint,
  summarizeBtcAutoPerformance,
  validateBtcAutoMarketFreshness,
} from '../src/utils/btc-auto-trading'
import { buildContractTradeDecision } from '../src/utils/contract-trade-decision'

const symbol = 'BTCUSDT' as const
const strategyInterval = '5m' as const
const marketIntervals: ContractChartInterval[] = ['1m', '5m', '15m', '1h', '4h']
const maximumExchangeJsonBytes = 4_000_000
const testnetBase = 'https://demo-fapi.binance.com'

interface BtcAutoConfigRow {
  enabled: number
  execution_mode: BtcAutoExecutionMode
  symbol: 'BTCUSDT'
  interval: '5m'
  notional_usdt: number
  leverage: number
  minimum_confidence: number
  minimum_directional_score: number
  required_confirmations: number
  cooldown_minutes: number
  daily_loss_limit_usdt: number
  max_consecutive_losses: number
  loss_pause_minutes: number
  performance_window_trades: number
  minimum_rolling_profit_factor: number
  maximum_rolling_drawdown_usdt: number
  performance_pause_minutes: number
  fee_rate_pct: number
  eligibility_confirmed: number
  updated_at: string
  last_run_at: string | null
  last_success_at: string | null
  last_failure_at: string | null
  last_error: string | null
  last_cycle_status: BtcAutoTradingDashboard['lastCycleStatus']
  consecutive_failures: number
}

interface BtcAutoSignalRow {
  strategy_version: string
  action: BtcAutoSignalSnapshot['action']
  score: number
  confidence: number
  price: number | null
  evolution: BtcAutoSignalSnapshot['evolution']
  confirmations: number
  reasons: string
  risks: string
  observed_at: string
  market_source: BtcAutoMarketSource
  cooldown_until: string | null
}

interface BtcAutoTradeRow {
  id: string
  strategy_version: string
  execution_mode: BtcAutoExecutionMode
  symbol: 'BTCUSDT'
  direction: BtcAutoTrade['direction']
  status: BtcAutoTrade['status']
  quantity: number
  notional_usdt: number
  leverage: number
  entry_price: number | null
  exit_price: number | null
  stop_loss: number
  take_profit: number
  opened_at: string
  closed_at: string | null
  gross_pnl: number | null
  fee_rate_pct: number
  fees: number | null
  funding_fee: number
  net_pnl: number | null
  return_pct: number | null
  pnl_source: BtcAutoTrade['pnlSource']
  reconciled_at: string | null
  reconciliation_error: string | null
  signal_score: number
  signal_confidence: number
  signal_reasons: string
  close_reason: BtcAutoCloseReason | null
  open_client_order_id: string
  close_client_order_id: string | null
  open_order_id: string | null
  close_order_id: string | null
  error: string | null
}

interface BtcAutoSignalHistoryRow extends BtcAutoSignalRow {
  id: string
  entry_gate_reason: BtcAutoEntryGate['reason']
  entry_eligible: number
  forward_1h_pct: number | null
  forward_1h_at: string | null
  forward_4h_pct: number | null
  forward_4h_at: string | null
  forward_24h_pct: number | null
  forward_24h_at: string | null
}

interface PendingSignalOutcomeRow {
  id: string
  action: BtcAutoSignalSnapshot['action']
  price: number
  observed_at: string
  forward_1h_pct: number | null
  forward_4h_pct: number | null
  forward_24h_pct: number | null
}

interface ExecutionFill {
  orderId: string
  clientOrderId: string
  status: string
  quantity: number
  averagePrice: number | null
}

interface ExecutionCommand {
  kind: 'open' | 'close'
  direction: BtcAutoTrade['direction']
  quantity: number
  leverage: number
  clientOrderId: string
}

interface ExecutionAdapter {
  size: (notionalUsdt: number, price: number) => Promise<number>
  execute: (command: ExecutionCommand, price: number) => Promise<ExecutionFill>
  query: (clientOrderId: string) => Promise<ExecutionFill>
  reconcile?: (trade: BtcAutoTradeRow) => Promise<ExecutionReconciliation>
}

interface ExecutionReconciliation {
  grossPnl: number
  fees: number
  fundingFee: number
  netPnl: number
  returnPct: number
}

interface MarketReading {
  market: ContractMarketSnapshot
  source: BtcAutoMarketSource
}

const parseJsonArray = <T>(value: string): T[] => {
  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

const toConfig = (row: BtcAutoConfigRow): BtcAutoTradingConfig => ({
  enabled: Boolean(row.enabled),
  executionMode: row.execution_mode,
  symbol: row.symbol,
  interval: row.interval,
  notionalUsdt: row.notional_usdt,
  leverage: row.leverage,
  minimumConfidence: row.minimum_confidence,
  minimumDirectionalScore: row.minimum_directional_score,
  requiredConfirmations: row.required_confirmations,
  cooldownMinutes: row.cooldown_minutes,
  dailyLossLimitUsdt: row.daily_loss_limit_usdt,
  maxConsecutiveLosses: row.max_consecutive_losses,
  lossPauseMinutes: row.loss_pause_minutes,
  performanceWindowTrades: row.performance_window_trades,
  minimumRollingProfitFactor: row.minimum_rolling_profit_factor,
  maximumRollingDrawdownUsdt: row.maximum_rolling_drawdown_usdt,
  performancePauseMinutes: row.performance_pause_minutes,
  feeRatePct: row.fee_rate_pct,
  eligibilityConfirmed: Boolean(row.eligibility_confirmed),
  updatedAt: row.updated_at,
})

const toSignal = (row: BtcAutoSignalRow | null): BtcAutoSignalSnapshot | null =>
  row
    ? {
        strategyVersion: row.strategy_version,
        action: row.action,
        score: row.score,
        confidence: row.confidence,
        price: row.price,
        evolution: row.evolution,
        confirmations: row.confirmations,
        reasons: parseJsonArray(row.reasons),
        risks: parseJsonArray(row.risks),
        observedAt: row.observed_at,
        marketSource: row.market_source,
      }
    : null

const toTrade = (row: BtcAutoTradeRow): BtcAutoTrade => ({
  id: row.id,
  strategyVersion: row.strategy_version,
  executionMode: row.execution_mode,
  symbol: row.symbol,
  direction: row.direction,
  status: row.status,
  quantity: row.quantity,
  notionalUsdt: row.notional_usdt,
  leverage: row.leverage,
  entryPrice: row.entry_price,
  exitPrice: row.exit_price,
  stopLoss: row.stop_loss,
  takeProfit: row.take_profit,
  openedAt: row.opened_at,
  closedAt: row.closed_at,
  grossPnl: row.gross_pnl,
  feeRatePct: row.fee_rate_pct,
  fees: row.fees,
  fundingFee: row.funding_fee,
  netPnl: row.net_pnl,
  returnPct: row.return_pct,
  pnlSource: row.pnl_source,
  reconciledAt: row.reconciled_at,
  reconciliationError: row.reconciliation_error,
  signalScore: row.signal_score,
  signalConfidence: row.signal_confidence,
  signalReasons: parseJsonArray(row.signal_reasons),
  closeReason: row.close_reason,
  openOrderId: row.open_order_id,
  closeOrderId: row.close_order_id,
  error: row.error,
})

const configColumns = `enabled, execution_mode, symbol, interval, notional_usdt, leverage,
  minimum_confidence, minimum_directional_score, required_confirmations, cooldown_minutes,
  daily_loss_limit_usdt, max_consecutive_losses, loss_pause_minutes,
  performance_window_trades, minimum_rolling_profit_factor, maximum_rolling_drawdown_usdt,
  performance_pause_minutes, fee_rate_pct, eligibility_confirmed, updated_at, last_run_at,
  last_success_at, last_failure_at, last_error, last_cycle_status, consecutive_failures`
const signalColumns = `strategy_version, action, score, confidence, price, evolution, confirmations, reasons, risks,
  observed_at, market_source, cooldown_until`
const tradeColumns = `id, strategy_version, execution_mode, symbol, direction, status, quantity, notional_usdt,
  leverage, entry_price, exit_price, stop_loss, take_profit, opened_at, closed_at, gross_pnl,
  fee_rate_pct, fees, funding_fee, net_pnl, return_pct, pnl_source, reconciled_at,
  reconciliation_error, signal_score, signal_confidence, signal_reasons, close_reason,
  open_client_order_id, close_client_order_id, open_order_id, close_order_id, error`

const loadConfigRow = async (env: Env) => {
  const row = await env.DB.prepare(
    `SELECT ${configColumns} FROM btc_auto_trading_config WHERE id = 'default'`,
  ).first<BtcAutoConfigRow>()
  if (!row) throw new Error('BTC自动交易配置尚未初始化')
  return row
}

const loadSignalRow = (env: Env) =>
  env.DB.prepare(
    `SELECT ${signalColumns} FROM btc_auto_signal_state WHERE id = 'default'`,
  ).first<BtcAutoSignalRow>()

const listTrades = async (env: Env, limit = 200) => {
  const rows = await env.DB.prepare(
    `SELECT ${tradeColumns} FROM btc_auto_trades ORDER BY opened_at DESC LIMIT ?1`,
  )
    .bind(limit)
    .all<BtcAutoTradeRow>()
  return rows.results.map(toTrade)
}

const listPerformanceTrades = async (env: Env, now: Date) => {
  const rows = await env.DB.prepare(
    `SELECT ${tradeColumns} FROM btc_auto_trades
     WHERE status = 'closed' AND closed_at >= ?1 ORDER BY opened_at DESC`,
  )
    .bind(btcAutoPerformanceWindowStartAt(now))
    .all<BtcAutoTradeRow>()
  return rows.results.map(toTrade)
}

const listAllTrades = async (env: Env) => {
  const pageSize = 1_000
  const trades: BtcAutoTrade[] = []
  let offset = 0
  while (true) {
    const rows = await env.DB.prepare(
      `SELECT ${tradeColumns} FROM btc_auto_trades ORDER BY opened_at DESC LIMIT ?1 OFFSET ?2`,
    )
      .bind(pageSize, offset)
      .all<BtcAutoTradeRow>()
    trades.push(...rows.results.map(toTrade))
    if (rows.results.length < pageSize) return trades
    offset += pageSize
  }
}

const listSignalHistory = async (env: Env, limit = 24) => {
  const rows = await env.DB.prepare(
    `SELECT id, ${signalColumns}, entry_gate_reason, entry_eligible,
      forward_1h_pct, forward_1h_at, forward_4h_pct, forward_4h_at,
      forward_24h_pct, forward_24h_at
     FROM btc_auto_signal_history ORDER BY observed_at DESC LIMIT ?1`,
  )
    .bind(limit)
    .all<BtcAutoSignalHistoryRow>()
  return rows.results.map(
    (row): BtcAutoSignalHistoryItem => ({
      ...toSignal(row)!,
      id: row.id,
      entryGateReason: row.entry_gate_reason,
      entryEligible: Boolean(row.entry_eligible),
      forward1hPct: row.forward_1h_pct,
      forward1hAt: row.forward_1h_at,
      forward4hPct: row.forward_4h_pct,
      forward4hAt: row.forward_4h_at,
      forward24hPct: row.forward_24h_pct,
      forward24hAt: row.forward_24h_at,
    }),
  )
}

const activeTradeRow = (env: Env) =>
  env.DB.prepare(
    `SELECT ${tradeColumns} FROM btc_auto_trades
     WHERE status IN ('opening', 'open', 'closing') ORDER BY opened_at DESC LIMIT 1`,
  ).first<BtcAutoTradeRow>()

class ExchangeRequestError extends Error {
  readonly definiteRejection: boolean
  readonly status: number
  readonly retryAfterMs: number | null

  constructor(message: string, status: number, retryAfterMs: number | null = null) {
    super(message)
    this.name = 'ExchangeRequestError'
    this.status = status
    this.retryAfterMs = retryAfterMs
    this.definiteRejection = status >= 400 && status < 500
  }
}

const retryAfterMilliseconds = (response: Response) => {
  const value = response.headers.get('Retry-After')
  if (!value) return null
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)
  const date = Date.parse(value)
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : null
}

const readExchangeJson = async <T>(response: Response): Promise<T> => {
  if (!response.body) {
    throw new ExchangeRequestError(
      `上游响应为空：${response.status}`,
      response.status,
      retryAfterMilliseconds(response),
    )
  }
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maximumExchangeJsonBytes) {
      await reader.cancel('Exchange response too large')
      throw new Error('上游响应超过大小限制')
    }
    chunks.push(value)
  }
  const merged = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  const body = new TextDecoder().decode(merged)
  let payload: T & { code?: number; msg?: string; message?: string }
  try {
    payload = JSON.parse(body) as T & { code?: number; msg?: string; message?: string }
  } catch {
    throw new ExchangeRequestError(
      `上游返回非JSON响应：${response.status}`,
      response.status,
      retryAfterMilliseconds(response),
    )
  }
  if (!response.ok) {
    throw new ExchangeRequestError(
      payload.msg || payload.message || `上游请求失败：${response.status}`,
      response.status,
      retryAfterMilliseconds(response),
    )
  }
  return payload
}

const publicJson = async <T>(url: URL, init: RequestInit = {}, label = '公开行情') => {
  let lastError: unknown
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await readExchangeJson<T>(
        await fetch(url, { ...init, signal: AbortSignal.timeout(8_000) }),
      )
    } catch (error) {
      lastError = error
      const retryable =
        (error instanceof ExchangeRequestError &&
          (error.status === 429 || error.status >= 500)) ||
        error instanceof TypeError ||
        (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError'))
      if (!retryable || attempt === 1) break
      const requestedDelay =
        error instanceof ExchangeRequestError ? (error.retryAfterMs ?? 300) : 300
      await new Promise((resolve) => setTimeout(resolve, Math.min(1_200, requestedDelay)))
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`${label}请求失败`)
}

const fetchKlines = async (
  baseUrl: string,
  interval: ContractChartInterval,
): Promise<AssetPricePoint[]> => {
  const url = new URL('/fapi/v1/klines', baseUrl)
  url.search = new URLSearchParams({ symbol, interval, limit: '120' }).toString()
  const payload = await publicJson<unknown>(url, { headers: { Accept: 'application/json' } })
  if (!Array.isArray(payload)) throw new Error(`Binance ${interval} K线格式无效`)
  return payload.flatMap((row) => {
    if (!Array.isArray(row) || row.length < 7) return []
    const openTime = Number(row[0])
    const open = Number(row[1])
    const high = Number(row[2])
    const low = Number(row[3])
    const close = Number(row[4])
    const volume = Number(row[5])
    const closeTime = Number(row[6])
    if (
      ![openTime, open, high, low, close, volume, closeTime].every(Number.isFinite) ||
      closeTime >= Date.now()
    )
      return []
    return [{ date: new Date(openTime).toISOString(), open, high, low, close, volume }]
  })
}

const fetchBinanceMarket = async (baseUrl: string): Promise<ContractMarketSnapshot> => {
  const [series, premium] = await Promise.all([
    Promise.all(
      marketIntervals.map(async (interval) => ({
        interval,
        points: await fetchKlines(baseUrl, interval),
      })),
    ),
    (async () => {
      const url = new URL('/fapi/v1/premiumIndex', baseUrl)
      url.search = new URLSearchParams({ symbol }).toString()
      return publicJson<{
        markPrice?: string
        lastFundingRate?: string
        nextFundingTime?: number
      }>(url, { headers: { Accept: 'application/json' } })
    })(),
  ])
  const primary = series.find((item) => item.interval === strategyInterval)?.points ?? []
  const markPrice = Number(premium.markPrice)
  const fundingRate = Number(premium.lastFundingRate)
  return {
    symbol,
    quoteAsset: 'USDT',
    interval: strategyInterval,
    points: primary,
    timeframes: series,
    microstructure: {
      orderBookImbalancePct: null,
      spreadBps: null,
      takerBuyRatioPct: null,
      openInterestChangePct: null,
    },
    markPrice: Number.isFinite(markPrice) && markPrice > 0 ? markPrice : null,
    fundingRatePct: Number.isFinite(fundingRate) ? fundingRate * 100 : null,
    nextFundingTime: premium.nextFundingTime
      ? new Date(premium.nextFundingTime).toISOString()
      : null,
    openInterest: null,
    updatedAt: new Date().toISOString(),
    latencyMs: null,
    status: 'live',
    errorCode: null,
  }
}

const aggregatePoints = (points: readonly AssetPricePoint[], intervalMinutes: number) => {
  const intervalMs = intervalMinutes * 60_000
  const buckets = new Map<number, AssetPricePoint>()
  points.forEach((point) => {
    const timestamp = Date.parse(point.date)
    const bucket = Math.floor(timestamp / intervalMs) * intervalMs
    const current = buckets.get(bucket)
    if (!current) {
      buckets.set(bucket, {
        date: new Date(bucket).toISOString(),
        open: point.open ?? point.close,
        high: point.high ?? point.close,
        low: point.low ?? point.close,
        close: point.close,
        volume: point.volume ?? 0,
      })
      return
    }
    current.high = Math.max(current.high ?? current.close, point.high ?? point.close)
    current.low = Math.min(current.low ?? current.close, point.low ?? point.close)
    current.close = point.close
    current.volume = (current.volume ?? 0) + (point.volume ?? 0)
  })
  return [...buckets.values()].filter((point) => Date.parse(point.date) + intervalMs < Date.now())
}

type CoinbaseCandle = [number, number, number, number, number, number]

const fetchCoinbaseCandles = async (granularity: 60 | 300 | 900 | 3600) => {
  const url = new URL('https://api.exchange.coinbase.com/products/BTC-USD/candles')
  url.searchParams.set('granularity', String(granularity))
  const payload = await publicJson<CoinbaseCandle[]>(
    url,
    {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'web3-market-desk/1.0',
      },
    },
    'Coinbase行情',
  )
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error(`Coinbase BTC-USD ${granularity}秒行情不可用`)
  }
  const intervalMs = granularity * 1000
  return payload
    .flatMap(([time, low, high, open, close, volume]) => {
      if (![time, low, high, open, close, volume].every(Number.isFinite)) return []
      return [
        {
          date: new Date(time * 1000).toISOString(),
          open,
          high,
          low,
          close,
          volume,
        },
      ]
    })
    .filter((point) => Date.parse(point.date) + intervalMs < Date.now())
    .sort((left, right) => Date.parse(left.date) - Date.parse(right.date))
    .slice(-120)
}

const fetchCoinbaseMarket = async (): Promise<ContractMarketSnapshot> => {
  // Sequential fallback requests avoid creating a burst against Coinbase's shared public limit.
  const minutePoints = await fetchCoinbaseCandles(60)
  const fiveMinutePoints = await fetchCoinbaseCandles(300)
  const fifteenMinutePoints = await fetchCoinbaseCandles(900)
  const hourlyPoints = await fetchCoinbaseCandles(3600)
  const series = [
    { interval: '1m' as const, points: minutePoints.slice(-120) },
    { interval: '5m' as const, points: fiveMinutePoints },
    { interval: '15m' as const, points: fifteenMinutePoints },
    { interval: '1h' as const, points: hourlyPoints },
    { interval: '4h' as const, points: aggregatePoints(hourlyPoints, 240).slice(-120) },
  ]
  const primary = series.find((item) => item.interval === strategyInterval)?.points ?? []
  const latest = primary[primary.length - 1]?.close ?? null
  return {
    symbol,
    quoteAsset: 'USD',
    interval: strategyInterval,
    points: primary,
    timeframes: series,
    microstructure: {
      orderBookImbalancePct: null,
      spreadBps: null,
      takerBuyRatioPct: null,
      openInterestChangePct: null,
    },
    markPrice: latest,
    fundingRatePct: null,
    nextFundingTime: null,
    openInterest: null,
    updatedAt: new Date().toISOString(),
    latencyMs: null,
    status: 'live',
    errorCode: null,
  }
}

const verifiedMarket = (market: ContractMarketSnapshot, source: BtcAutoMarketSource) => {
  const freshnessError = validateBtcAutoMarketFreshness(market, new Date(), source)
  if (freshnessError) throw new Error(freshnessError)
  return market
}

const fetchMarket = async (env: Env, mode: BtcAutoExecutionMode): Promise<MarketReading> => {
  if (mode === 'testnet') {
    return {
      market: verifiedMarket(await fetchBinanceMarket(testnetBase), 'binance'),
      source: 'binance',
    }
  }
  try {
    return {
      market: verifiedMarket(await fetchBinanceMarket(env.BINANCE_FUTURES_PUBLIC_BASE), 'binance'),
      source: 'binance',
    }
  } catch (error) {
    console.warn(
      JSON.stringify({
        event: 'btc_auto_market_fallback',
        source: 'coinbase',
        message: error instanceof Error ? error.message : 'Binance行情不可用',
      }),
    )
    return { market: verifiedMarket(await fetchCoinbaseMarket(), 'coinbase'), source: 'coinbase' }
  }
}

const outcomeSpecs = [
  { key: '1h' as const, milliseconds: 3_600_000, intervals: ['1m', '5m', '15m'] as const },
  { key: '4h' as const, milliseconds: 14_400_000, intervals: ['5m', '15m', '1h'] as const },
  { key: '24h' as const, milliseconds: 86_400_000, intervals: ['15m', '1h'] as const },
]

const updateSignalOutcomes = async (
  env: Env,
  reading: MarketReading,
  now: Date,
) => {
  const rows = await env.DB.prepare(
    `SELECT id, action, price, observed_at, forward_1h_pct, forward_4h_pct, forward_24h_pct
     FROM btc_auto_signal_history
     WHERE market_source = ?1 AND action IN ('long', 'short') AND price > 0
       AND observed_at <= ?2
       AND (forward_1h_pct IS NULL OR forward_4h_pct IS NULL OR forward_24h_pct IS NULL)
     ORDER BY observed_at ASC LIMIT 40`,
  )
    .bind(reading.source, new Date(now.getTime() - 3_600_000).toISOString())
    .all<PendingSignalOutcomeRow>()
  const statements = rows.results.flatMap((row) => {
    const values: Record<string, { move: number; observedAt: string }> = {}
    for (const spec of outcomeSpecs) {
      const field = spec.key === '1h' ? row.forward_1h_pct : spec.key === '4h' ? row.forward_4h_pct : row.forward_24h_pct
      if (field !== null) continue
      const targetAt = Date.parse(row.observed_at) + spec.milliseconds
      if (targetAt > now.getTime()) continue
      const point = selectBtcAutoOutcomePoint(
        reading.market,
        targetAt,
        spec.intervals,
        now.getTime(),
      )
      const move = point
        ? calculateBtcAutoDirectionalMove(row.action, row.price, point.price)
        : null
      if (point && move !== null) values[spec.key] = { move, observedAt: point.observedAt }
    }
    if (!Object.keys(values).length) return []
    return [
      env.DB.prepare(
        `UPDATE btc_auto_signal_history SET
         forward_1h_pct = COALESCE(?1, forward_1h_pct),
         forward_1h_at = COALESCE(?2, forward_1h_at),
         forward_4h_pct = COALESCE(?3, forward_4h_pct),
         forward_4h_at = COALESCE(?4, forward_4h_at),
         forward_24h_pct = COALESCE(?5, forward_24h_pct),
         forward_24h_at = COALESCE(?6, forward_24h_at)
         WHERE id = ?7`,
      ).bind(
        values['1h']?.move ?? null,
        values['1h']?.observedAt ?? null,
        values['4h']?.move ?? null,
        values['4h']?.observedAt ?? null,
        values['24h']?.move ?? null,
        values['24h']?.observedAt ?? null,
        row.id,
      ),
    ]
  })
  if (statements.length) await env.DB.batch(statements)
}

const signalOutcomeSummaries = async (env: Env, strategyVersion: string) => {
  const rows = await Promise.all(
    outcomeSpecs.map(async (spec) => {
      const column = `forward_${spec.key}_pct`
      const row = await env.DB.prepare(
        `SELECT COUNT(${column}) AS samples,
          AVG(${column}) AS average_directional_move_pct,
          AVG(CASE WHEN ${column} > 0 THEN 100.0 ELSE 0 END) AS hit_rate_pct
         FROM btc_auto_signal_history
         WHERE strategy_version = ?1 AND action IN ('long', 'short') AND ${column} IS NOT NULL`,
      )
        .bind(strategyVersion)
        .first<{
          samples: number
          average_directional_move_pct: number | null
          hit_rate_pct: number | null
        }>()
      return {
        horizon: spec.key,
        samples: row?.samples ?? 0,
        hitRatePct: row?.hit_rate_pct === null || row?.hit_rate_pct === undefined ? null : Number(row.hit_rate_pct.toFixed(2)),
        averageDirectionalMovePct:
          row?.average_directional_move_pct === null || row?.average_directional_move_pct === undefined
            ? null
            : Number(row.average_directional_move_pct.toFixed(4)),
      }
    }),
  )
  return rows
}

const paperAdapter: ExecutionAdapter = {
  size: async (notionalUsdt, price) => Number((notionalUsdt / price).toFixed(6)),
  execute: async (command, price) => ({
    orderId: `paper-${command.clientOrderId}`,
    clientOrderId: command.clientOrderId,
    status: 'FILLED',
    quantity: command.quantity,
    averagePrice: price,
  }),
  query: async () => {
    throw new Error('本地模拟订单无需查询交易所')
  },
}

const hex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('')

const testnetAdapter = (env: Env): ExecutionAdapter => {
  const apiKey = env.BINANCE_TESTNET_API_KEY
  const apiSecret = env.BINANCE_TESTNET_API_SECRET
  if (!apiKey || !apiSecret) throw new Error('Binance Testnet Secret 尚未配置')
  let serverOffsetPromise: Promise<number> | null = null
  const serverOffset = () => {
    if (!serverOffsetPromise) {
      serverOffsetPromise = publicJson<{ serverTime: number }>(
        new URL('/fapi/v1/time', testnetBase),
        {
          headers: { Accept: 'application/json' },
        },
        'Binance服务器时间',
      )
        .then((result) => result.serverTime - Date.now())
    }
    return serverOffsetPromise
  }
  const signedRequest = async <T>(
    method: 'GET' | 'POST',
    path: string,
    values: Record<string, string>,
  ) => {
    const params = new URLSearchParams({
      ...values,
      recvWindow: '5000',
      timestamp: String(Date.now() + (await serverOffset())),
    })
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(apiSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const signature = hex(
      await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(params.toString())),
    )
    params.set('signature', signature)
    const url = new URL(path, testnetBase)
    if (method === 'GET') {
      url.search = params.toString()
      return readExchangeJson<T>(
        await fetch(url, {
          method,
          headers: { Accept: 'application/json', 'X-MBX-APIKEY': apiKey },
          signal: AbortSignal.timeout(8_000),
        }),
      )
    }
    return readExchangeJson<T>(
      await fetch(url, {
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-MBX-APIKEY': apiKey,
        },
        body: params.toString(),
        signal: AbortSignal.timeout(8_000),
      }),
    )
  }
  const toFill = (payload: {
    orderId?: number
    clientOrderId?: string
    status?: string
    executedQty?: string
    avgPrice?: string
    cumQuote?: string
  }): ExecutionFill => {
    const quantity = Number(payload.executedQty)
    const directAverage = Number(payload.avgPrice)
    const quote = Number(payload.cumQuote)
    const averagePrice =
      Number.isFinite(directAverage) && directAverage > 0
        ? directAverage
        : Number.isFinite(quote) && Number.isFinite(quantity) && quantity > 0
          ? quote / quantity
          : null
    return {
      orderId: String(payload.orderId ?? ''),
      clientOrderId: payload.clientOrderId ?? '',
      status: payload.status ?? 'UNKNOWN',
      quantity: Number.isFinite(quantity) ? quantity : 0,
      averagePrice,
    }
  }
  const reconcile = async (row: BtcAutoTradeRow): Promise<ExecutionReconciliation> => {
    if (!row.open_order_id || !row.close_order_id || !row.closed_at) {
      throw new Error('Testnet订单尚未具备完整对账标识')
    }
    interface AccountTrade {
      id?: number
      orderId?: number
      realizedPnl?: string
      commission?: string
      commissionAsset?: string
    }
    const orderTrades = async (orderId: string) => {
      const items = await signedRequest<AccountTrade[]>('GET', '/fapi/v1/userTrades', {
        symbol,
        orderId,
      })
      if (!Array.isArray(items) || !items.length) throw new Error(`订单 ${orderId} 暂无成交明细`)
      return items
    }
    const fills = [...(await orderTrades(row.open_order_id)), ...(await orderTrades(row.close_order_id))]
    const uniqueFills = [...new Map(fills.map((item) => [String(item.id), item])).values()]
    if (
      uniqueFills.some(
        (item) => item.commissionAsset !== 'USDT' && Number(item.commission ?? 0) !== 0,
      )
    ) {
      throw new Error('Testnet成交佣金不是USDT，暂不自动换算')
    }
    const grossPnl = uniqueFills.reduce((sum, item) => sum + Number(item.realizedPnl ?? 0), 0)
    const fees = uniqueFills.reduce(
      (sum, item) => sum + Math.abs(Number(item.commission ?? 0)),
      0,
    )
    interface IncomeItem {
      tranId?: number
      income?: string
      asset?: string
    }
    const incomes = new Map<string, IncomeItem>()
    const closedAt = Date.parse(row.closed_at)
    let windowStart = Date.parse(row.opened_at)
    const maximumWindow = 6 * 86_400_000
    while (windowStart <= closedAt) {
      const windowEnd = Math.min(closedAt, windowStart + maximumWindow)
      const items = await signedRequest<IncomeItem[]>('GET', '/fapi/v1/income', {
        symbol,
        incomeType: 'FUNDING_FEE',
        startTime: String(windowStart),
        endTime: String(windowEnd),
        limit: '1000',
      })
      if (!Array.isArray(items)) throw new Error('Testnet资金费记录格式无效')
      items.forEach((item, index) => incomes.set(String(item.tranId ?? `${windowStart}-${index}`), item))
      windowStart = windowEnd + 1
    }
    const fundingItems = [...incomes.values()]
    if (fundingItems.some((item) => item.asset !== 'USDT' && Number(item.income ?? 0) !== 0)) {
      throw new Error('Testnet资金费不是USDT，暂不自动换算')
    }
    const fundingFee = fundingItems.reduce((sum, item) => sum + Number(item.income ?? 0), 0)
    const values = [...uniqueFills.flatMap((item) => [item.realizedPnl, item.commission]), fundingFee]
    if (values.some((value) => !Number.isFinite(Number(value)))) {
      throw new Error('Testnet对账明细包含无效数值')
    }
    const result = calculateBtcAutoReconciledResult(toTrade(row), grossPnl, fees, fundingFee)
    if (!result) throw new Error('无法计算Testnet已对账盈亏')
    return result
  }
  return {
    size: async (notionalUsdt, price) => {
      const payload = await publicJson<{
        symbols?: Array<{
          symbol?: string
          quantityPrecision?: number
          filters?: Array<{ filterType?: string; stepSize?: string; minQty?: string }>
        }>
      }>(
        new URL('/fapi/v1/exchangeInfo', testnetBase),
        {
          headers: { Accept: 'application/json' },
        },
        'Binance合约规则',
      )
      const market = payload.symbols?.find((item) => item.symbol === symbol)
      const lot = market?.filters?.find((item) => item.filterType === 'MARKET_LOT_SIZE')
      const step = Number(lot?.stepSize)
      const minimum = Number(lot?.minQty)
      const raw = notionalUsdt / price
      const quantity =
        Number.isFinite(step) && step > 0
          ? Math.floor(raw / step) * step
          : Number(raw.toFixed(market?.quantityPrecision ?? 3))
      if (
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        (Number.isFinite(minimum) && quantity < minimum)
      )
        throw new Error('配置的名义仓位低于 BTCUSDT Testnet 最小下单数量')
      return Number(quantity.toFixed(8))
    },
    execute: async (command) => {
      if (command.kind === 'open') {
        await signedRequest('POST', '/fapi/v1/leverage', {
          symbol,
          leverage: String(command.leverage),
        })
      }
      const side =
        command.kind === 'open'
          ? command.direction === 'long'
            ? 'BUY'
            : 'SELL'
          : command.direction === 'long'
            ? 'SELL'
            : 'BUY'
      return toFill(
        await signedRequest('POST', '/fapi/v1/order', {
          symbol,
          side,
          type: 'MARKET',
          quantity: String(command.quantity),
          newClientOrderId: command.clientOrderId,
          newOrderRespType: 'RESULT',
          ...(command.kind === 'close' ? { reduceOnly: 'true' } : {}),
        }),
      )
    },
    query: async (clientOrderId) =>
      toFill(
        await signedRequest('GET', '/fapi/v1/order', {
          symbol,
          origClientOrderId: clientOrderId,
        }),
      ),
    reconcile,
  }
}

const adapterFor = (env: Env, mode: BtcAutoExecutionMode) =>
  mode === 'testnet' ? testnetAdapter(env) : paperAdapter

const updateSignal = async (
  env: Env,
  signal: BtcAutoSignalSnapshot,
  cooldownUntil: string | null,
) => {
  await env.DB.prepare(
    `INSERT INTO btc_auto_signal_state
     (id, strategy_version, action, score, confidence, price, evolution, confirmations, reasons, risks,
      observed_at, market_source, cooldown_until)
     VALUES ('default', ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
     ON CONFLICT(id) DO UPDATE SET strategy_version = excluded.strategy_version,
       action = excluded.action, score = excluded.score,
       confidence = excluded.confidence, price = excluded.price, evolution = excluded.evolution,
       confirmations = excluded.confirmations, reasons = excluded.reasons, risks = excluded.risks,
       observed_at = excluded.observed_at, market_source = excluded.market_source,
       cooldown_until = excluded.cooldown_until`,
  )
    .bind(
      signal.strategyVersion,
      signal.action,
      signal.score,
      signal.confidence,
      signal.price,
      signal.evolution,
      signal.confirmations,
      JSON.stringify(signal.reasons),
      JSON.stringify(signal.risks),
      signal.observedAt,
      signal.marketSource,
      cooldownUntil,
    )
    .run()
}

const appendSignalHistory = async (
  env: Env,
  signal: BtcAutoSignalSnapshot,
  cooldownUntil: string | null,
  gate: BtcAutoEntryGate,
) => {
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO btc_auto_signal_history
       (id, strategy_version, action, score, confidence, price, evolution, confirmations, reasons, risks,
        observed_at, market_source, cooldown_until, entry_gate_reason, entry_eligible)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)`,
    ).bind(
      crypto.randomUUID(),
      signal.strategyVersion,
      signal.action,
      signal.score,
      signal.confidence,
      signal.price,
      signal.evolution,
      signal.confirmations,
      JSON.stringify(signal.reasons),
      JSON.stringify(signal.risks),
      signal.observedAt,
      signal.marketSource,
      cooldownUntil,
      gate.reason,
      gate.eligible ? 1 : 0,
    ),
    env.DB.prepare(`DELETE FROM btc_auto_signal_history WHERE observed_at < ?1`).bind(
      new Date(Date.now() - 90 * 86_400_000).toISOString(),
    ),
  ])
}

const markTradeOpen = async (env: Env, tradeId: string, fill: ExecutionFill) => {
  if (fill.status !== 'FILLED' || fill.averagePrice === null || fill.quantity <= 0) {
    throw new Error(`Binance开仓订单未完全成交：${fill.status}`)
  }
  await env.DB.prepare(
    `UPDATE btc_auto_trades SET status = 'open', quantity = ?1, entry_price = ?2,
      open_order_id = ?3, error = NULL, updated_at = ?4 WHERE id = ?5 AND status = 'opening'`,
  )
    .bind(fill.quantity, fill.averagePrice, fill.orderId, new Date().toISOString(), tradeId)
    .run()
}

const markTradeClosed = async (
  env: Env,
  row: BtcAutoTradeRow,
  fill: ExecutionFill,
  reason: BtcAutoCloseReason,
) => {
  if (fill.status !== 'FILLED' || fill.averagePrice === null) {
    throw new Error(`Binance平仓订单未完全成交：${fill.status}`)
  }
  const trade = toTrade(row)
  const result = calculateBtcAutoTradeResult(trade, fill.averagePrice, row.fee_rate_pct)
  if (!result) throw new Error('无法计算BTC自动交易盈亏')
  const closedAt = new Date().toISOString()
  await env.DB.prepare(
    `UPDATE btc_auto_trades SET status = 'closed', exit_price = ?1, closed_at = ?2,
      gross_pnl = ?3, fees = ?4, funding_fee = 0, net_pnl = ?5, return_pct = ?6,
      pnl_source = 'estimated', reconciled_at = NULL, reconciliation_error = NULL,
      close_reason = ?7, close_order_id = ?8, error = NULL, updated_at = ?9 WHERE id = ?10`,
  )
    .bind(
      fill.averagePrice,
      closedAt,
      result.grossPnl,
      result.fees,
      result.netPnl,
      result.returnPct,
      reason,
      fill.orderId,
      closedAt,
      row.id,
    )
    .run()
}

const reconcileLatestTestnetPnl = async (env: Env) => {
  if (!env.BINANCE_TESTNET_API_KEY || !env.BINANCE_TESTNET_API_SECRET) return
  const row = await env.DB.prepare(
    `SELECT ${tradeColumns} FROM btc_auto_trades
     WHERE execution_mode = 'testnet' AND status = 'closed' AND pnl_source = 'estimated'
     ORDER BY CASE WHEN reconciliation_error IS NULL THEN 0 ELSE 1 END, updated_at ASC LIMIT 1`,
  ).first<BtcAutoTradeRow>()
  if (!row) return
  const adapter = testnetAdapter(env)
  try {
    const result = await adapter.reconcile!(row)
    const reconciledAt = new Date().toISOString()
    await env.DB.prepare(
      `UPDATE btc_auto_trades SET gross_pnl = ?1, fees = ?2, funding_fee = ?3,
       net_pnl = ?4, return_pct = ?5, pnl_source = 'reconciled', reconciled_at = ?6,
       reconciliation_error = NULL, updated_at = ?6 WHERE id = ?7 AND pnl_source = 'estimated'`,
    )
      .bind(
        result.grossPnl,
        result.fees,
        result.fundingFee,
        result.netPnl,
        result.returnPct,
        reconciledAt,
        row.id,
      )
      .run()
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 300) : 'Testnet对账失败'
    await env.DB.prepare(
      `UPDATE btc_auto_trades SET reconciliation_error = ?1, updated_at = ?2
       WHERE id = ?3 AND pnl_source = 'estimated'`,
    )
      .bind(message, new Date().toISOString(), row.id)
      .run()
    console.warn(JSON.stringify({ event: 'btc_auto_pnl_reconciliation_pending', message }))
  }
}

const reconcilePendingTrade = async (env: Env, row: BtcAutoTradeRow, adapter: ExecutionAdapter) => {
  if (row.execution_mode !== 'testnet') return row
  try {
    if (row.status === 'opening') {
      const fill = await adapter.query(row.open_client_order_id)
      if (fill.status === 'FILLED') await markTradeOpen(env, row.id, fill)
    }
    if (row.status === 'closing' && row.close_client_order_id) {
      const fill = await adapter.query(row.close_client_order_id)
      if (fill.status === 'FILLED') {
        await markTradeClosed(env, row, fill, row.close_reason ?? 'manual')
      }
    }
  } catch (error) {
    if (!(error instanceof ExchangeRequestError) || !error.definiteRejection) throw error
    const message = error.message.slice(0, 300)
    if (row.status === 'opening') {
      await env.DB.prepare(
        `UPDATE btc_auto_trades SET status = 'error', error = ?1, updated_at = ?2
         WHERE id = ?3 AND status = 'opening'`,
      )
        .bind(message, new Date().toISOString(), row.id)
        .run()
    } else {
      await env.DB.prepare(
        `UPDATE btc_auto_trades SET status = 'open', close_reason = NULL,
         close_client_order_id = NULL, error = ?1, updated_at = ?2
         WHERE id = ?3 AND status = 'closing'`,
      )
        .bind(message, new Date().toISOString(), row.id)
        .run()
    }
  }
  return activeTradeRow(env)
}

const openTrade = async (
  env: Env,
  config: BtcAutoTradingConfig,
  signal: BtcAutoSignalSnapshot,
  decision: ContractTradeDecision,
  adapter: ExecutionAdapter,
) => {
  if (
    signal.price === null ||
    (signal.action !== 'long' && signal.action !== 'short') ||
    Math.abs(signal.score) < config.minimumDirectionalScore ||
    signal.confidence < config.minimumConfidence ||
    signal.confirmations < config.requiredConfirmations
  )
    return
  if (
    decision.stopLoss === null ||
    decision.takeProfit === null ||
    decision.action !== signal.action
  )
    return
  const id = crypto.randomUUID()
  const compactId = id.replaceAll('-', '')
  const clientOrderId = `md_o_${compactId.slice(0, 26)}`
  const quantity = await adapter.size(config.notionalUsdt, signal.price)
  const now = new Date().toISOString()
  await env.DB.prepare(
    `INSERT INTO btc_auto_trades
     (id, strategy_version, execution_mode, symbol, direction, status, quantity, notional_usdt, leverage,
      stop_loss, take_profit, opened_at, fee_rate_pct, signal_score, signal_confidence,
      signal_reasons, open_client_order_id, created_at, updated_at)
     VALUES (?1, ?2, ?3, 'BTCUSDT', ?4, 'opening', ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12,
             ?13, ?14, ?15, ?16, ?17)`,
  )
    .bind(
      id,
      signal.strategyVersion,
      config.executionMode,
      signal.action,
      quantity,
      config.notionalUsdt,
      config.leverage,
      decision.stopLoss,
      decision.takeProfit,
      now,
      config.feeRatePct,
      signal.score,
      signal.confidence,
      JSON.stringify(signal.reasons),
      clientOrderId,
      now,
      now,
    )
    .run()
  try {
    const fill = await adapter.execute(
      {
        kind: 'open',
        direction: signal.action,
        quantity,
        leverage: config.leverage,
        clientOrderId,
      },
      signal.price,
    )
    await markTradeOpen(env, id, fill)
  } catch (error) {
    const definiteRejection = error instanceof ExchangeRequestError && error.definiteRejection
    await env.DB.prepare(
      `UPDATE btc_auto_trades SET status = ?1, error = ?2, updated_at = ?3 WHERE id = ?4`,
    )
      .bind(
        definiteRejection ? 'error' : 'opening',
        error instanceof Error ? error.message.slice(0, 300) : '开仓失败',
        now,
        id,
      )
      .run()
    throw error
  }
}

const closeTrade = async (
  env: Env,
  row: BtcAutoTradeRow,
  adapter: ExecutionAdapter,
  price: number,
  reason: BtcAutoCloseReason,
) => {
  const compactId = crypto.randomUUID().replaceAll('-', '')
  const clientOrderId = `md_c_${compactId.slice(0, 26)}`
  const now = new Date().toISOString()
  const transition = await env.DB.prepare(
    `UPDATE btc_auto_trades SET status = 'closing', close_reason = ?1,
      close_client_order_id = ?2, updated_at = ?3 WHERE id = ?4 AND status = 'open'`,
  )
    .bind(reason, clientOrderId, now, row.id)
    .run()
  if (!transition.meta.changes) return
  try {
    const fill = await adapter.execute(
      {
        kind: 'close',
        direction: row.direction,
        quantity: row.quantity,
        leverage: row.leverage,
        clientOrderId,
      },
      price,
    )
    await markTradeClosed(env, { ...row, status: 'closing', close_reason: reason }, fill, reason)
  } catch (error) {
    const definiteRejection = error instanceof ExchangeRequestError && error.definiteRejection
    await env.DB.prepare(
      `UPDATE btc_auto_trades SET status = ?1,
       close_reason = CASE WHEN ?1 = 'open' THEN NULL ELSE close_reason END,
       close_client_order_id = CASE WHEN ?1 = 'open' THEN NULL ELSE close_client_order_id END,
       error = ?2, updated_at = ?3 WHERE id = ?4`,
    )
      .bind(
        definiteRejection ? 'open' : 'closing',
        error instanceof Error ? error.message.slice(0, 300) : '平仓失败',
        now,
        row.id,
      )
      .run()
    throw error
  }
}

const acquireCycleLock = async (env: Env, now: Date) => {
  const lockUntil = new Date(now.getTime() + 4 * 60_000).toISOString()
  const result = await env.DB.prepare(
    `UPDATE btc_auto_trading_config SET cycle_lock_until = ?1
     WHERE id = 'default' AND (cycle_lock_until IS NULL OR cycle_lock_until < ?2)`,
  )
    .bind(lockUntil, now.toISOString())
    .run()
  return Boolean(result.meta.changes)
}

const releaseCycleLock = (
  env: Env,
  status: Exclude<BtcAutoTradingDashboard['lastCycleStatus'], 'unknown'>,
  lastError: string | null = null,
) => {
  const completedAt = new Date().toISOString()
  return env.DB.prepare(
    `UPDATE btc_auto_trading_config SET cycle_lock_until = NULL, last_run_at = ?1,
      last_error = ?2, last_cycle_status = ?3,
      last_success_at = CASE WHEN ?3 = 'success' THEN ?1 ELSE last_success_at END,
      last_failure_at = CASE WHEN ?3 = 'failed' THEN ?1 ELSE last_failure_at END,
      consecutive_failures = CASE
        WHEN ?3 = 'success' THEN 0
        WHEN ?3 = 'failed' THEN consecutive_failures + 1
        ELSE consecutive_failures
      END
      WHERE id = 'default'`,
  )
    .bind(completedAt, lastError, status)
    .run()
}

const releaseManualLock = (env: Env) =>
  env.DB.prepare(
    `UPDATE btc_auto_trading_config SET cycle_lock_until = NULL WHERE id = 'default'`,
  )
    .run()

export const runBtcAutoTradingCycle = async (env: Env) => {
  const now = new Date()
  if (!(await acquireCycleLock(env, now))) return
  try {
    const config = toConfig(await loadConfigRow(env))
    const strategyVersion = btcAutoStrategyVersion(config)
    await reconcileLatestTestnetPnl(env)
    let active = await activeTradeRow(env)
    if (!config.enabled && !active) {
      await releaseCycleLock(env, 'skipped')
      return
    }
    const reading = await fetchMarket(env, config.executionMode)
    try {
      await updateSignalOutcomes(env, reading, now)
    } catch (error) {
      console.warn(
        JSON.stringify({
          event: 'btc_auto_signal_outcome_update_failed',
          message: error instanceof Error ? error.message : '影子验证回填失败',
        }),
      )
    }
    const decision = buildContractTradeDecision(reading.market)
    const previousRow = await loadSignalRow(env)
    const previous = toSignal(previousRow)
    const evolvedSignal = evolveBtcAutoSignal(
      previous,
      decision,
      now.toISOString(),
      reading.source,
      strategyVersion,
    )
    let cooldownUntil = previousRow?.cooldown_until ?? null
    const cooldownActive = cooldownUntil !== null && Date.parse(cooldownUntil) > now.getTime()
    const signal = cooldownActive ? { ...evolvedSignal, confirmations: 0 } : evolvedSignal
    const activeAdapter = active ? adapterFor(env, active.execution_mode) : null
    if (active?.status === 'opening' || active?.status === 'closing') {
      active = await reconcilePendingTrade(env, active, activeAdapter!)
    }
    if (active?.status === 'open') {
      const minutePoints =
        reading.market.timeframes.find((item) => item.interval === '1m')?.points ?? []
      const trigger = resolveBtcAutoCloseTrigger(
        toTrade(active),
        signal,
        minutePoints,
        config.minimumConfidence,
      )
      if (trigger) {
        await closeTrade(env, active, activeAdapter!, trigger.referencePrice, trigger.reason)
        cooldownUntil = new Date(now.getTime() + config.cooldownMinutes * 60_000).toISOString()
        signal.confirmations = 0
        active = await activeTradeRow(env)
      }
    }
    const trades = await listTrades(env, 1000)
    const daily = summarizeBtcAutoPerformance(trades, now).find((item) => item.period === 'day')
    const gate = evaluateBtcAutoEntryGate({
      config,
      signal,
      trades,
      hasActivePosition: Boolean(active),
      cooldownUntil,
      dailyNetPnl: daily?.netPnl ?? 0,
      now,
      strategyVersion,
    })
    await updateSignal(env, signal, cooldownUntil)
    await appendSignalHistory(env, signal, cooldownUntil, gate)
    if (gate.eligible) {
      await openTrade(env, config, signal, decision, adapterFor(env, config.executionMode))
    }
    await releaseCycleLock(env, 'success')
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 300) : '未知错误'
    await releaseCycleLock(env, 'failed', message)
    console.error(JSON.stringify({ event: 'btc_auto_trading_failed', message }))
    throw error
  }
}

export const closeBtcAutoTradingPosition = async (env: Env) => {
  const now = new Date()
  if (!(await acquireCycleLock(env, now))) throw new Error('自动交易周期正在运行，请稍后重试')
  try {
    let active = await activeTradeRow(env)
    if (!active) return
    const adapter = adapterFor(env, active.execution_mode)
    if (active.status === 'opening' || active.status === 'closing') {
      active = await reconcilePendingTrade(env, active, adapter)
    }
    if (!active || active.status !== 'open') return
    const reading = await fetchMarket(env, active.execution_mode)
    const price = reading.market.markPrice
    if (price === null) throw new Error('当前BTC价格不可用，无法安全提交平仓')
    await closeTrade(env, active, adapter, price, 'manual')
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 300) : '人工平仓失败'
    console.error(JSON.stringify({ event: 'btc_auto_manual_close_failed', message }))
    throw error
  } finally {
    await releaseManualLock(env)
  }
}

export const btcAutoTradingDashboard = async (env: Env): Promise<BtcAutoTradingDashboard> => {
  const now = new Date()
  const [configRow, signalRow, trades, performanceTrades, signalHistory] = await Promise.all([
    loadConfigRow(env),
    loadSignalRow(env),
    listTrades(env),
    listPerformanceTrades(env, now),
    listSignalHistory(env),
  ])
  const config = toConfig(configRow)
  const strategyVersion = btcAutoStrategyVersion(config)
  const signalOutcomes = await signalOutcomeSummaries(env, strategyVersion)
  const signal = toSignal(signalRow)
  const openTrade =
    trades.find((trade) => ['opening', 'open', 'closing'].includes(trade.status)) ?? null
  const performance = summarizeBtcAutoPerformance(performanceTrades, now)
  const dailyNetPnl = performance.find((item) => item.period === 'day')?.netPnl ?? 0
  return {
    config,
    strategyVersion,
    credentialsReady: Boolean(env.BINANCE_TESTNET_API_KEY && env.BINANCE_TESTNET_API_SECRET),
    lastRunAt: configRow.last_run_at,
    lastSuccessfulRunAt: configRow.last_success_at,
    lastFailureAt: configRow.last_failure_at,
    lastError: configRow.last_error,
    lastCycleStatus: configRow.last_cycle_status,
    consecutiveFailures: configRow.consecutive_failures,
    nextRunAt: nextBtcAutoScheduledRunAt(),
    signal,
    signalHistory,
    signalOutcomes,
    entryGate: evaluateBtcAutoEntryGate({
      config,
      signal,
      trades,
      hasActivePosition: Boolean(openTrade),
      cooldownUntil: signalRow?.cooldown_until ?? null,
      dailyNetPnl,
      strategyVersion,
    }),
    rollingHealth: calculateBtcAutoRollingHealth(config, trades, now, strategyVersion),
    openTrade,
    trades,
    performance,
  }
}

export const btcAutoTradingCsv = async (
  env: Env,
  locale: BtcAutoTradingExportLocale,
) => {
  const [dashboard, trades] = await Promise.all([btcAutoTradingDashboard(env), listAllTrades(env)])
  return buildBtcAutoTradingCsv(
    {
      ...dashboard,
      trades,
      performance: summarizeBtcAutoPerformance(trades),
    },
    locale,
  )
}

const boundedNumber = (
  value: unknown,
  label: string,
  minimum: number,
  maximum: number,
  integer = false,
) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) {
    throw new Error(`${label}必须在 ${minimum} 到 ${maximum} 之间`)
  }
  return integer ? Math.round(value) : value
}

export const saveBtcAutoTradingConfig = async (
  env: Env,
  actorId: string,
  input: Record<string, unknown>,
) => {
  if (typeof input.enabled !== 'boolean') throw new Error('自动交易开关格式无效')
  if (input.executionMode !== 'paper' && input.executionMode !== 'testnet') {
    throw new Error('执行模式无效')
  }
  if (typeof input.eligibilityConfirmed !== 'boolean') throw new Error('资格确认格式无效')
  if (input.enabled && input.executionMode === 'testnet' && !input.eligibilityConfirmed) {
    throw new Error('启用Testnet前请确认所在地和账户符合Binance条款')
  }
  if (
    input.enabled &&
    input.executionMode === 'testnet' &&
    (!env.BINANCE_TESTNET_API_KEY || !env.BINANCE_TESTNET_API_SECRET)
  )
    throw new Error('启用Testnet前请先配置两项Cloudflare Secret')
  const now = new Date().toISOString()
  const config = {
    enabled: input.enabled,
    executionMode: input.executionMode,
    notionalUsdt: boundedNumber(input.notionalUsdt, '名义仓位', 10, 10_000),
    leverage: boundedNumber(input.leverage, '杠杆', 1, 5, true),
    minimumConfidence: boundedNumber(input.minimumConfidence, '最低置信度', 55, 88, true),
    minimumDirectionalScore: boundedNumber(input.minimumDirectionalScore, '最低方向分', 30, 90),
    requiredConfirmations: boundedNumber(input.requiredConfirmations, '连续确认次数', 2, 6, true),
    cooldownMinutes: boundedNumber(input.cooldownMinutes, '冷却时间', 5, 1440, true),
    dailyLossLimitUsdt: boundedNumber(input.dailyLossLimitUsdt, '日亏损熔断', 1, 1000),
    maxConsecutiveLosses: boundedNumber(input.maxConsecutiveLosses, '连续亏损次数', 2, 10, true),
    lossPauseMinutes: boundedNumber(input.lossPauseMinutes, '连续亏损暂停时间', 30, 2880, true),
    performanceWindowTrades: boundedNumber(
      input.performanceWindowTrades,
      '滚动绩效样本数',
      10,
      100,
      true,
    ),
    minimumRollingProfitFactor: boundedNumber(
      input.minimumRollingProfitFactor,
      '最低滚动Profit Factor',
      0.5,
      2,
    ),
    maximumRollingDrawdownUsdt: boundedNumber(
      input.maximumRollingDrawdownUsdt,
      '最大滚动回撤',
      1,
      1000,
    ),
    performancePauseMinutes: boundedNumber(
      input.performancePauseMinutes,
      '滚动绩效暂停时间',
      60,
      10_080,
      true,
    ),
    feeRatePct: boundedNumber(input.feeRatePct, '单边手续费率', 0, 1),
    eligibilityConfirmed: input.eligibilityConfirmed,
  }
  await env.DB.batch([
    env.DB.prepare(
      `UPDATE btc_auto_trading_config SET enabled = ?1, execution_mode = ?2,
       notional_usdt = ?3, leverage = ?4, minimum_confidence = ?5,
       minimum_directional_score = ?6, required_confirmations = ?7, cooldown_minutes = ?8,
       daily_loss_limit_usdt = ?9, max_consecutive_losses = ?10, loss_pause_minutes = ?11,
       performance_window_trades = ?12, minimum_rolling_profit_factor = ?13,
       maximum_rolling_drawdown_usdt = ?14, performance_pause_minutes = ?15,
       fee_rate_pct = ?16, eligibility_confirmed = ?17, updated_by = ?18, updated_at = ?19
       WHERE id = 'default'`,
    ).bind(
      config.enabled ? 1 : 0,
      config.executionMode,
      config.notionalUsdt,
      config.leverage,
      config.minimumConfidence,
      config.minimumDirectionalScore,
      config.requiredConfirmations,
      config.cooldownMinutes,
      config.dailyLossLimitUsdt,
      config.maxConsecutiveLosses,
      config.lossPauseMinutes,
      config.performanceWindowTrades,
      config.minimumRollingProfitFactor,
      config.maximumRollingDrawdownUsdt,
      config.performancePauseMinutes,
      config.feeRatePct,
      config.eligibilityConfirmed ? 1 : 0,
      actorId,
      now,
    ),
    env.DB.prepare(
      `INSERT INTO admin_audit_log
       (id, actor_user_id, action, target_type, target_id, metadata, created_at)
       VALUES (?1, ?2, 'btc-auto.config.update', 'btc-auto-trading', 'default', ?3, ?4)`,
    ).bind(crypto.randomUUID(), actorId, JSON.stringify(config), now),
  ])
  return btcAutoTradingDashboard(env)
}
