import { computed, onUnmounted, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import type { MarketQuote, MarketQuoteResponse } from '@/types'

const defaultApiBase = 'https://web3-quant-api.binson0426.workers.dev'
const refreshIntervalMs = 60_000
const requestTimeoutMs = 10_000
const apiBase = (import.meta.env.VITE_QUANT_API_BASE || defaultApiBase).replace(/\/$/, '')

export const toAShareQuoteSymbol = (code: string) => {
  if (/^[48]/.test(code)) return `${code}.BJ`
  return /^[569]/.test(code) ? `${code}.SS` : `${code}.SZ`
}

export const marketAssetQuoteSymbols: Record<string, string> = {
  sp500: '^GSPC',
  nasdaq: '^IXIC',
  nikkei: '^N225',
  shanghai: '000001.SS',
  hangseng: '^HSI',
  euro50: '^STOXX50E',
  usd: 'DX-Y.NYB',
  vix: '^VIX',
  wti: 'CL=F',
  gold: 'GC=F',
  btc: 'BTC-USD',
  eth: 'ETH-USD',
}

export const useMarketQuotes = (requestedSymbols: MaybeRefOrGetter<string[]>) => {
  const quotes = ref<Record<string, MarketQuote>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)
  const fetchedAt = ref<string | null>(null)
  let refreshTimer: number | undefined
  let requestSequence = 0

  const refresh = async () => {
    const symbols = [...new Set(toValue(requestedSymbols).filter(Boolean))].slice(0, 25)
    if (!symbols.length || document.visibilityState === 'hidden') return
    const sequence = ++requestSequence
    loading.value = true
    try {
      const response = await fetch(
        `${apiBase}/api/market/quotes?symbols=${encodeURIComponent(symbols.join(','))}`,
        { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(requestTimeoutMs) },
      )
      const payload = (await response.json()) as MarketQuoteResponse & { error?: string }
      if (!response.ok) throw new Error(payload.error || `行情接口 ${response.status}`)
      if (sequence !== requestSequence) return
      quotes.value = Object.fromEntries(payload.quotes.map((quote) => [quote.symbol, quote]))
      fetchedAt.value = payload.fetchedAt
      error.value = null
    } catch (cause) {
      if (sequence !== requestSequence) return
      error.value = cause instanceof Error ? cause.message : '行情暂时不可用'
    } finally {
      if (sequence === requestSequence) loading.value = false
    }
  }

  const schedule = () => {
    window.clearInterval(refreshTimer)
    refreshTimer = window.setInterval(refresh, refreshIntervalMs)
  }
  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') void refresh()
  }

  watch(
    () => toValue(requestedSymbols).join(','),
    () => void refresh(),
    { immediate: true },
  )
  schedule()
  document.addEventListener('visibilitychange', onVisibilityChange)
  onUnmounted(() => {
    requestSequence += 1
    window.clearInterval(refreshTimer)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })

  const quoteFor = (symbol: string) => quotes.value[symbol] ?? null
  const availableCount = computed(() => Object.keys(quotes.value).length)

  return { quotes, quoteFor, availableCount, loading, error, fetchedAt, refresh }
}
