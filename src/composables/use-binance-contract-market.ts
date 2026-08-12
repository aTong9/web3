import { onBeforeUnmount, readonly, ref } from 'vue'
import type {
  AssetPricePoint,
  ContractChartInterval,
  ContractInstrument,
  ContractInstrumentCatalog,
  ContractInstrumentCategory,
  ContractMarketSnapshot,
  ContractMicrostructureSnapshot,
  ContractTimeframeSeries,
} from '@/types'
import {
  resolveContractInstrumentMetadata,
  verifiedFallbackBases,
} from '@/utils/contract-instrument-catalog'

const restBase =
  (import.meta.env.VITE_BINANCE_FUTURES_REST_BASE as string | undefined)?.replace(/\/$/, '') ||
  'https://fapi.binance.com'
const streamBase =
  (import.meta.env.VITE_BINANCE_FUTURES_STREAM_BASE as string | undefined)?.replace(/\/$/, '') ||
  'wss://fstream.binance.com/ws'
const maximumPoints = 300
const contextPoints = 120
const contextRefreshMs = 60_000
const contextIntervals: ContractChartInterval[] = ['1m', '5m', '15m', '1h', '4h']
const featuredSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT']
const knownFxBases = new Set(['AUD', 'EUR', 'GBP', 'JPY'])
const knownIndexBases = new Set(['DJI', 'KOSPI', 'NDX', 'NIKKEI', 'SPX'])

type BinanceKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string,
]

interface BinanceKlineEvent {
  E: number
  k: {
    t: number
    o: string
    c: string
    h: string
    l: string
    v: string
    V?: string
  }
}

interface BinanceDepthEvent {
  E?: number
  bids?: Array<[string, string]>
  asks?: Array<[string, string]>
  b?: Array<[string, string]>
  a?: Array<[string, string]>
}

interface BinancePremium {
  markPrice?: string
  lastFundingRate?: string
  nextFundingTime?: number
}

interface BinanceOpenInterest {
  openInterest?: string
  time?: number
}

interface BinanceOpenInterestHistory {
  sumOpenInterest?: string
  timestamp?: number
}

interface TakerVolumePoint {
  time: number
  total: number
  buy: number
}

interface BinanceExchangeSymbol {
  symbol?: string
  pair?: string
  contractType?: string
  status?: string
  baseAsset?: string
  quoteAsset?: string
  marginAsset?: string
  onboardDate?: number
  underlyingType?: string
  underlyingSubType?: string[]
}

const emptyMicrostructure = (): ContractMicrostructureSnapshot => ({
  orderBookImbalancePct: null,
  spreadBps: null,
  takerBuyRatioPct: null,
  openInterestChangePct: null,
})

const emptySnapshot = (): ContractMarketSnapshot => ({
  symbol: 'BTCUSDT',
  quoteAsset: 'USDT',
  interval: '5m',
  points: [],
  timeframes: [],
  microstructure: emptyMicrostructure(),
  markPrice: null,
  fundingRatePct: null,
  nextFundingTime: null,
  openInterest: null,
  updatedAt: null,
  latencyMs: null,
  status: 'idle',
  errorCode: null,
})

const instrumentCategory = (
  baseAsset: string,
  underlyingType: string | undefined,
  underlyingSubTypes: readonly string[],
): ContractInstrumentCategory => {
  const metadata = [underlyingType ?? '', ...underlyingSubTypes].join(' ').toUpperCase()
  if (metadata.includes('STOCK') || metadata.includes('EQUITY')) return 'equity'
  if (metadata.includes('ETF')) return 'etf'
  if (metadata.includes('COMMODITY') || metadata.includes('METAL')) return 'commodity'
  if (metadata.includes('FOREX') || metadata.includes('FX')) return 'fx'
  if (metadata.includes('INDEX')) return 'index'
  const knownCategory = resolveContractInstrumentMetadata(baseAsset, 'other').category
  if (knownCategory !== 'other') return knownCategory
  if (knownFxBases.has(baseAsset)) return 'fx'
  if (knownIndexBases.has(baseAsset)) return 'index'
  if (!metadata || metadata.includes('COIN') || metadata.includes('CRYPTO')) return 'crypto'
  return 'other'
}

const fallbackInstrument = (
  baseAsset: string,
  category: ContractInstrumentCategory,
): ContractInstrument => {
  const metadata = resolveContractInstrumentMetadata(baseAsset, category)
  return {
    symbol: `${baseAsset}USDT`,
    pair: `${baseAsset}USDT`,
    baseAsset,
    quoteAsset: 'USDT',
    marginAsset: 'USDT',
    category: metadata.category,
    displayName: metadata.displayName,
    underlyingVenue: metadata.underlyingVenue,
    riskTags: metadata.riskTags,
    underlyingType: category === 'crypto' ? 'COIN' : 'TRADFI',
    underlyingSubTypes: [],
    onboardDate: null,
  }
}

const fallbackInstruments = [
  ...['BTC', 'ETH', 'BNB', 'SOL', 'XRP'].map((base) => fallbackInstrument(base, 'crypto')),
  ...verifiedFallbackBases.equity.map((base) => fallbackInstrument(base, 'equity')),
  ...verifiedFallbackBases.etf.map((base) => fallbackInstrument(base, 'etf')),
  ...verifiedFallbackBases.commodity.map((base) => fallbackInstrument(base, 'commodity')),
]

const emptyCatalog = (): ContractInstrumentCatalog => ({
  instruments: fallbackInstruments,
  status: 'idle',
  updatedAt: null,
  errorCode: null,
})

const sortInstruments = (instruments: ContractInstrument[]) => {
  const categoryOrder: ContractInstrumentCategory[] = [
    'equity',
    'etf',
    'commodity',
    'fx',
    'index',
    'crypto',
    'other',
  ]
  return [...instruments].sort((left, right) => {
    const leftFeatured = featuredSymbols.indexOf(left.symbol)
    const rightFeatured = featuredSymbols.indexOf(right.symbol)
    if (leftFeatured !== -1 || rightFeatured !== -1) {
      if (leftFeatured === -1) return 1
      if (rightFeatured === -1) return -1
      return leftFeatured - rightFeatured
    }
    return (
      categoryOrder.indexOf(left.category) - categoryOrder.indexOf(right.category) ||
      left.symbol.localeCompare(right.symbol)
    )
  })
}

const parseInstruments = (body: unknown) => {
  if (!body || typeof body !== 'object' || !('symbols' in body))
    throw new Error('Invalid exchange info response')
  const symbols = (body as { symbols?: unknown }).symbols
  if (!Array.isArray(symbols)) throw new Error('Invalid exchange info response')
  const instruments = symbols.flatMap((item) => {
    const source = item as BinanceExchangeSymbol
    if (
      source.status !== 'TRADING' ||
      source.contractType !== 'PERPETUAL' ||
      !source.symbol ||
      !source.baseAsset ||
      !source.quoteAsset
    )
      return []
    const underlyingSubTypes = Array.isArray(source.underlyingSubType)
      ? source.underlyingSubType.map(String)
      : []
    const category = instrumentCategory(source.baseAsset, source.underlyingType, underlyingSubTypes)
    const metadata = resolveContractInstrumentMetadata(source.baseAsset, category)
    return [
      {
        symbol: source.symbol,
        pair: source.pair ?? source.symbol,
        baseAsset: source.baseAsset,
        quoteAsset: source.quoteAsset,
        marginAsset: source.marginAsset ?? source.quoteAsset,
        category: metadata.category,
        displayName: metadata.displayName,
        underlyingVenue: metadata.underlyingVenue,
        riskTags: metadata.riskTags,
        underlyingType: source.underlyingType ?? null,
        underlyingSubTypes,
        onboardDate: source.onboardDate ? new Date(source.onboardDate).toISOString() : null,
      } satisfies ContractInstrument,
    ]
  })
  if (!instruments.length) throw new Error('Invalid exchange info response')
  return sortInstruments(instruments)
}

const toPoint = (item: BinanceKline): AssetPricePoint => ({
  date: new Date(item[0]).toISOString(),
  open: Number(item[1]),
  high: Number(item[2]),
  low: Number(item[3]),
  close: Number(item[4]),
  volume: Number(item[5]),
})

const toTakerVolumePoint = (item: BinanceKline): TakerVolumePoint => ({
  time: item[0],
  total: Number(item[5]),
  buy: Number(item[9]),
})

const parseBody = async (response: Response) => {
  const body: unknown = await response.json()
  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'msg' in body
        ? String(body.msg)
        : `HTTP ${response.status}`
    throw new Error(message)
  }
  return body
}

const request = (path: string) =>
  fetch(`${restBase}${path}`, { signal: AbortSignal.timeout(12_000) }).then(parseBody)

const parseKlines = (body: unknown) => {
  if (!Array.isArray(body)) throw new Error('Invalid kline response')
  return body as BinanceKline[]
}

const toNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const calculateTakerBuyRatio = (items: readonly TakerVolumePoint[]) => {
  const recent = items
    .slice(-20)
    .filter((item) => Number.isFinite(item.total) && Number.isFinite(item.buy))
  const total = recent.reduce((sum, item) => sum + item.total, 0)
  const buy = recent.reduce((sum, item) => sum + item.buy, 0)
  return total > 0 ? (buy / total) * 100 : null
}

const calculateBookMetrics = (body: unknown) => {
  if (!body || typeof body !== 'object') return null
  const depth = body as BinanceDepthEvent
  const bids = depth.bids ?? depth.b ?? []
  const asks = depth.asks ?? depth.a ?? []
  const bidNotional = bids.reduce(
    (sum, [price, quantity]) => sum + Number(price) * Number(quantity),
    0,
  )
  const askNotional = asks.reduce(
    (sum, [price, quantity]) => sum + Number(price) * Number(quantity),
    0,
  )
  const totalNotional = bidNotional + askNotional
  const bestBid = toNumber(bids[0]?.[0])
  const bestAsk = toNumber(asks[0]?.[0])
  const mid = bestBid !== null && bestAsk !== null ? (bestBid + bestAsk) / 2 : null
  return {
    orderBookImbalancePct:
      totalNotional > 0 ? ((bidNotional - askNotional) / totalNotional) * 100 : null,
    spreadBps:
      mid !== null && mid > 0 && bestBid !== null && bestAsk !== null
        ? ((bestAsk - bestBid) / mid) * 10_000
        : null,
  }
}

const calculateOpenInterestChange = (body: unknown) => {
  if (!Array.isArray(body) || body.length < 2) return null
  const items = body as BinanceOpenInterestHistory[]
  const first = toNumber(items[0]?.sumOpenInterest)
  const latest = toNumber(items[items.length - 1]?.sumOpenInterest)
  return first !== null && latest !== null && first > 0 ? ((latest - first) / first) * 100 : null
}

const openInterestPeriod = (interval: ContractChartInterval) =>
  interval === '1m' || interval === '3m' ? '5m' : interval

const klinePath = (symbol: string, interval: ContractChartInterval, limit: number) =>
  `/fapi/v1/klines?symbol=${encodeURIComponent(symbol)}&interval=${interval}&limit=${limit}`

const loadTimeframes = async (symbol: string): Promise<ContractTimeframeSeries[]> => {
  const results = await Promise.allSettled(
    contextIntervals.map(async (interval) => ({
      interval,
      points: parseKlines(await request(klinePath(symbol, interval, contextPoints))).map(toPoint),
    })),
  )
  return results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []))
}

const combinedStreamUrl = (symbol: string, interval: ContractChartInterval) => {
  const root = streamBase.replace(/\/(?:ws|stream)$/, '')
  const streamSymbol = symbol.toLowerCase()
  const streams = [`${streamSymbol}@kline_${interval}`, `${streamSymbol}@depth20@500ms`]
  return `${root}/stream?streams=${streams.join('/')}`
}

const eventPayload = (value: unknown) => {
  if (value && typeof value === 'object' && 'data' in value)
    return (value as { data: unknown }).data
  return value
}

const isKlineEvent = (value: unknown): value is BinanceKlineEvent =>
  Boolean(value && typeof value === 'object' && 'k' in value)

const isDepthEvent = (value: unknown): value is BinanceDepthEvent =>
  Boolean(
    value &&
    typeof value === 'object' &&
    ('bids' in value || 'asks' in value || 'b' in value || 'a' in value),
  )

const marketErrorCode = (message: string) =>
  message.toLowerCase().includes('restricted location')
    ? ('restrictedLocation' as const)
    : message.includes('Invalid')
      ? ('invalidResponse' as const)
      : ('network' as const)

export const useBinanceContractMarket = () => {
  const snapshot = ref<ContractMarketSnapshot>(emptySnapshot())
  const catalog = ref<ContractInstrumentCatalog>(emptyCatalog())
  let socket: WebSocket | null = null
  let reconnectTimer: number | null = null
  let contextTimer: number | null = null
  let connectionGeneration = 0
  let reconnectAttempt = 0
  let intentionallyClosed = false
  let takerVolumes: TakerVolumePoint[] = []
  let catalogRequest: Promise<void> | null = null

  const loadCatalog = (force = false) => {
    if (!force && catalog.value.status === 'ready') return Promise.resolve()
    if (!force && catalogRequest) return catalogRequest
    catalog.value = { ...catalog.value, status: 'loading', errorCode: null }
    catalogRequest = request('/fapi/v1/exchangeInfo')
      .then((body) => {
        catalog.value = {
          instruments: parseInstruments(body),
          status: 'ready',
          updatedAt: new Date().toISOString(),
          errorCode: null,
        }
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error)
        catalog.value = {
          instruments: fallbackInstruments,
          status: 'fallback',
          updatedAt: null,
          errorCode: marketErrorCode(message),
        }
      })
      .finally(() => {
        catalogRequest = null
      })
    return catalogRequest
  }

  const closeSocket = () => {
    if (reconnectTimer !== null) window.clearTimeout(reconnectTimer)
    if (contextTimer !== null) window.clearTimeout(contextTimer)
    reconnectTimer = null
    contextTimer = null
    socket?.close()
    socket = null
  }

  const updateKline = (event: BinanceKlineEvent) => {
    const point: AssetPricePoint = {
      date: new Date(event.k.t).toISOString(),
      open: Number(event.k.o),
      high: Number(event.k.h),
      low: Number(event.k.l),
      close: Number(event.k.c),
      volume: Number(event.k.v),
    }
    const points = [...snapshot.value.points]
    const latest = points[points.length - 1]
    if (latest?.date === point.date) points[points.length - 1] = point
    else points.push(point)

    if (event.k.V !== undefined) {
      const takerPoint: TakerVolumePoint = {
        time: event.k.t,
        total: Number(event.k.v),
        buy: Number(event.k.V),
      }
      const latestTaker = takerVolumes[takerVolumes.length - 1]
      if (latestTaker?.time === takerPoint.time) takerVolumes[takerVolumes.length - 1] = takerPoint
      else takerVolumes.push(takerPoint)
      takerVolumes = takerVolumes.slice(-maximumPoints)
    }

    const nextPoints = points.slice(-maximumPoints)
    snapshot.value = {
      ...snapshot.value,
      points: nextPoints,
      timeframes: snapshot.value.timeframes.map((series) =>
        series.interval === snapshot.value.interval
          ? { ...series, points: nextPoints.slice(-contextPoints) }
          : series,
      ),
      microstructure: {
        ...snapshot.value.microstructure,
        takerBuyRatioPct: calculateTakerBuyRatio(takerVolumes),
      },
      markPrice: point.close,
      updatedAt: new Date(event.E).toISOString(),
      latencyMs: Math.max(0, Date.now() - event.E),
      status: 'live',
      errorCode: null,
    }
  }

  const updateDepth = (event: BinanceDepthEvent) => {
    const metrics = calculateBookMetrics(event)
    if (!metrics) return
    const eventTime = event.E ?? Date.now()
    snapshot.value = {
      ...snapshot.value,
      microstructure: { ...snapshot.value.microstructure, ...metrics },
      updatedAt: new Date(eventTime).toISOString(),
      latencyMs: Math.max(0, Date.now() - eventTime),
      status: 'live',
      errorCode: null,
    }
  }

  const scheduleContextRefresh = (generation: number) => {
    if (contextTimer !== null) window.clearTimeout(contextTimer)
    contextTimer = window.setTimeout(async () => {
      const { symbol, interval } = snapshot.value
      const query = `symbol=${encodeURIComponent(symbol)}`
      const period = openInterestPeriod(interval)
      const [timeframesResult, premiumResult, interestResult, historyResult] =
        await Promise.allSettled([
          loadTimeframes(symbol),
          request(`/fapi/v1/premiumIndex?${query}`),
          request(`/fapi/v1/openInterest?${query}`),
          request(`/futures/data/openInterestHist?${query}&period=${period}&limit=12`),
        ])
      if (generation !== connectionGeneration) return
      const premium = (
        premiumResult.status === 'fulfilled' ? premiumResult.value : {}
      ) as BinancePremium
      const interest = (
        interestResult.status === 'fulfilled' ? interestResult.value : {}
      ) as BinanceOpenInterest
      snapshot.value = {
        ...snapshot.value,
        timeframes:
          timeframesResult.status === 'fulfilled' && timeframesResult.value.length
            ? timeframesResult.value
            : snapshot.value.timeframes,
        microstructure: {
          ...snapshot.value.microstructure,
          openInterestChangePct:
            historyResult.status === 'fulfilled'
              ? calculateOpenInterestChange(historyResult.value)
              : snapshot.value.microstructure.openInterestChangePct,
        },
        markPrice: toNumber(premium.markPrice) ?? snapshot.value.markPrice,
        fundingRatePct:
          toNumber(premium.lastFundingRate) === null
            ? snapshot.value.fundingRatePct
            : Number(premium.lastFundingRate) * 100,
        nextFundingTime: premium.nextFundingTime
          ? new Date(premium.nextFundingTime).toISOString()
          : snapshot.value.nextFundingTime,
        openInterest: toNumber(interest.openInterest) ?? snapshot.value.openInterest,
      }
      scheduleContextRefresh(generation)
    }, contextRefreshMs)
  }

  const openStream = (generation: number) => {
    const { symbol, interval } = snapshot.value
    socket = new WebSocket(combinedStreamUrl(symbol, interval))
    socket.addEventListener('open', () => {
      if (generation !== connectionGeneration) return
      reconnectAttempt = 0
      snapshot.value = { ...snapshot.value, status: 'live', errorCode: null }
      scheduleContextRefresh(generation)
    })
    socket.addEventListener('message', (message) => {
      if (generation !== connectionGeneration) return
      try {
        const payload = eventPayload(JSON.parse(String(message.data)) as unknown)
        if (isKlineEvent(payload)) updateKline(payload)
        else if (isDepthEvent(payload)) updateDepth(payload)
      } catch (error) {
        console.warn('Binance market message could not be parsed:', error)
      }
    })
    socket.addEventListener('close', () => {
      if (intentionallyClosed || generation !== connectionGeneration) return
      if (contextTimer !== null) window.clearTimeout(contextTimer)
      contextTimer = null
      reconnectAttempt += 1
      snapshot.value = { ...snapshot.value, status: 'reconnecting' }
      reconnectTimer = window.setTimeout(
        () => openStream(generation),
        Math.min(1_000 * 2 ** reconnectAttempt, 30_000),
      )
    })
    socket.addEventListener('error', () => socket?.close())
  }

  const connect = async (symbol: string, interval: ContractChartInterval) => {
    connectionGeneration += 1
    const generation = connectionGeneration
    intentionallyClosed = true
    closeSocket()
    intentionallyClosed = false
    takerVolumes = []
    snapshot.value = {
      ...emptySnapshot(),
      symbol: symbol.toUpperCase(),
      quoteAsset:
        catalog.value.instruments.find((instrument) => instrument.symbol === symbol.toUpperCase())
          ?.quoteAsset ?? (symbol.toUpperCase().endsWith('USDC') ? 'USDC' : 'USDT'),
      interval,
      status: 'connecting',
    }

    try {
      const query = `symbol=${encodeURIComponent(snapshot.value.symbol)}`
      const period = openInterestPeriod(interval)
      const [
        klinesResult,
        timeframesResult,
        premiumResult,
        interestResult,
        depthResult,
        historyResult,
      ] = await Promise.allSettled([
        request(klinePath(snapshot.value.symbol, interval, maximumPoints)),
        loadTimeframes(snapshot.value.symbol),
        request(`/fapi/v1/premiumIndex?${query}`),
        request(`/fapi/v1/openInterest?${query}`),
        request(`/fapi/v1/depth?${query}&limit=20`),
        request(`/futures/data/openInterestHist?${query}&period=${period}&limit=12`),
      ])
      if (klinesResult.status === 'rejected') throw klinesResult.reason
      const klines = parseKlines(klinesResult.value)
      const premium = (
        premiumResult.status === 'fulfilled' ? premiumResult.value : {}
      ) as BinancePremium
      const interest = (
        interestResult.status === 'fulfilled' ? interestResult.value : {}
      ) as BinanceOpenInterest
      const bookMetrics =
        depthResult.status === 'fulfilled' ? calculateBookMetrics(depthResult.value) : null
      takerVolumes = klines.map(toTakerVolumePoint)
      if (generation !== connectionGeneration) return
      snapshot.value = {
        ...snapshot.value,
        points: klines.map(toPoint),
        timeframes: timeframesResult.status === 'fulfilled' ? timeframesResult.value : [],
        microstructure: {
          ...emptyMicrostructure(),
          ...bookMetrics,
          takerBuyRatioPct: calculateTakerBuyRatio(takerVolumes),
          openInterestChangePct:
            historyResult.status === 'fulfilled'
              ? calculateOpenInterestChange(historyResult.value)
              : null,
        },
        markPrice: toNumber(premium.markPrice),
        fundingRatePct:
          toNumber(premium.lastFundingRate) === null ? null : Number(premium.lastFundingRate) * 100,
        nextFundingTime: premium.nextFundingTime
          ? new Date(premium.nextFundingTime).toISOString()
          : null,
        openInterest: toNumber(interest.openInterest),
        updatedAt: new Date(interest.time ?? Date.now()).toISOString(),
        status: 'connecting',
        errorCode: null,
      }
      openStream(generation)
    } catch (error) {
      if (generation !== connectionGeneration) return
      const message = error instanceof Error ? error.message : String(error)
      const errorCode = marketErrorCode(message)
      snapshot.value = {
        ...snapshot.value,
        status: errorCode === 'restrictedLocation' ? 'restricted' : 'error',
        errorCode,
      }
    }
  }

  const disconnect = () => {
    intentionallyClosed = true
    connectionGeneration += 1
    closeSocket()
    snapshot.value = { ...snapshot.value, status: 'idle' }
  }

  onBeforeUnmount(disconnect)

  return {
    snapshot: readonly(snapshot),
    catalog: readonly(catalog),
    loadCatalog,
    connect,
    reconnect: () => connect(snapshot.value.symbol, snapshot.value.interval),
    disconnect,
  }
}
