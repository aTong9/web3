import { onBeforeUnmount, readonly, ref } from 'vue'
import type {
  AssetPricePoint,
  ContractChartInterval,
  ContractMarketSnapshot,
} from '@/types'

const restBase =
  (import.meta.env.VITE_BINANCE_FUTURES_REST_BASE as string | undefined)?.replace(/\/$/, '') ||
  'https://fapi.binance.com'
const streamBase =
  (import.meta.env.VITE_BINANCE_FUTURES_STREAM_BASE as string | undefined)?.replace(/\/$/, '') ||
  'wss://fstream.binance.com/ws'
const maximumPoints = 300

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
  }
}

const emptySnapshot = (): ContractMarketSnapshot => ({
  symbol: 'BTCUSDT',
  interval: '5m',
  points: [],
  markPrice: null,
  fundingRatePct: null,
  nextFundingTime: null,
  openInterest: null,
  updatedAt: null,
  latencyMs: null,
  status: 'idle',
  errorCode: null,
})

const toPoint = (item: BinanceKline): AssetPricePoint => ({
  date: new Date(item[0]).toISOString(),
  open: Number(item[1]),
  high: Number(item[2]),
  low: Number(item[3]),
  close: Number(item[4]),
  volume: Number(item[5]),
})

const parseBody = async (response: Response) => {
  const body: unknown = await response.json()
  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'msg' in body ? String(body.msg) : `HTTP ${response.status}`
    throw new Error(message)
  }
  return body
}

export const useBinanceContractMarket = () => {
  const snapshot = ref<ContractMarketSnapshot>(emptySnapshot())
  let socket: WebSocket | null = null
  let reconnectTimer: number | null = null
  let connectionGeneration = 0
  let reconnectAttempt = 0
  let intentionallyClosed = false

  const closeSocket = () => {
    if (reconnectTimer !== null) window.clearTimeout(reconnectTimer)
    reconnectTimer = null
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
    snapshot.value = {
      ...snapshot.value,
      points: points.slice(-maximumPoints),
      markPrice: point.close,
      updatedAt: new Date(event.E).toISOString(),
      latencyMs: Math.max(0, Date.now() - event.E),
      status: 'live',
      errorCode: null,
    }
  }

  const openStream = (generation: number) => {
    const { symbol, interval } = snapshot.value
    socket = new WebSocket(`${streamBase}/${symbol.toLowerCase()}@kline_${interval}`)
    socket.addEventListener('open', () => {
      if (generation !== connectionGeneration) return
      reconnectAttempt = 0
      snapshot.value = { ...snapshot.value, status: 'live', errorCode: null }
    })
    socket.addEventListener('message', (message) => {
      if (generation !== connectionGeneration) return
      try {
        updateKline(JSON.parse(String(message.data)) as BinanceKlineEvent)
      } catch (error) {
        console.warn('Binance kline message could not be parsed:', error)
      }
    })
    socket.addEventListener('close', () => {
      if (intentionallyClosed || generation !== connectionGeneration) return
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
    snapshot.value = {
      ...emptySnapshot(),
      symbol: symbol.toUpperCase(),
      interval,
      status: 'connecting',
    }

    try {
      const query = `symbol=${encodeURIComponent(snapshot.value.symbol)}`
      const [klinesResult, premiumResult, interestResult] = await Promise.allSettled([
        fetch(`${restBase}/fapi/v1/klines?${query}&interval=${interval}&limit=${maximumPoints}`, {
          signal: AbortSignal.timeout(12_000),
        }).then(parseBody),
        fetch(`${restBase}/fapi/v1/premiumIndex?${query}`, {
          signal: AbortSignal.timeout(12_000),
        }).then(parseBody),
        fetch(`${restBase}/fapi/v1/openInterest?${query}`, {
          signal: AbortSignal.timeout(12_000),
        }).then(parseBody),
      ])
      if (klinesResult.status === 'rejected') throw klinesResult.reason
      const klinesBody = klinesResult.value
      if (!Array.isArray(klinesBody)) throw new Error('Invalid kline response')
      const premium = (premiumResult.status === 'fulfilled' ? premiumResult.value : {}) as {
        markPrice?: string
        lastFundingRate?: string
        nextFundingTime?: number
      }
      const interest = (interestResult.status === 'fulfilled' ? interestResult.value : {}) as {
        openInterest?: string
        time?: number
      }
      if (generation !== connectionGeneration) return
      snapshot.value = {
        ...snapshot.value,
        points: (klinesBody as BinanceKline[]).map(toPoint),
        markPrice: Number(premium.markPrice) || null,
        fundingRatePct: Number.isFinite(Number(premium.lastFundingRate))
          ? Number(premium.lastFundingRate) * 100
          : null,
        nextFundingTime: premium.nextFundingTime
          ? new Date(premium.nextFundingTime).toISOString()
          : null,
        openInterest: Number(interest.openInterest) || null,
        updatedAt: new Date(interest.time ?? Date.now()).toISOString(),
        status: 'connecting',
        errorCode: null,
      }
      openStream(generation)
    } catch (error) {
      if (generation !== connectionGeneration) return
      const message = error instanceof Error ? error.message : String(error)
      const restricted = message.toLowerCase().includes('restricted location')
      snapshot.value = {
        ...snapshot.value,
        status: restricted ? 'restricted' : 'error',
        errorCode: restricted
          ? 'restrictedLocation'
          : message.includes('Invalid')
            ? 'invalidResponse'
            : 'network',
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
    connect,
    reconnect: () => connect(snapshot.value.symbol, snapshot.value.interval),
    disconnect,
  }
}
