import type {
  TechnicalIndicatorConfig,
  TechnicalIndicatorConfigVersion,
} from '@/types'

export const defaultTechnicalIndicatorConfig: TechnicalIndicatorConfig = {
  version: 1,
  formulaVersion: 'technical-core-v1',
  updatedAt: null,
  updatedBy: null,
  enabled: {
    maShort: true,
    maLong: true,
    macd: true,
    rsi: true,
    bollinger: true,
    atr: true,
    volume: true,
    crossAsset: true,
  },
  parameters: {
    maShortPeriod: 20,
    maLongPeriod: 60,
    macdFastPeriod: 12,
    macdSlowPeriod: 26,
    macdSignalPeriod: 9,
    rsiPeriod: 14,
    rsiOverbought: 70,
    rsiOversold: 30,
    bollingerPeriod: 20,
    bollingerMultiplier: 2,
    atrPeriod: 14,
    supportResistanceWindow: 60,
  },
  weights: {
    trend: 0.4,
    momentum: 0.22,
    volatility: 0.13,
    volume: 0.1,
    crossAsset: 0.15,
  },
  display: {
    carouselIntervalMs: 7_000,
    carouselAutoPlay: true,
    defaultRange: 'year',
  },
  sourcePriority: ['Massive', 'FRED', '新浪财经', '腾讯财经', 'DefiLlama'],
}

const apiBase =
  (import.meta.env.VITE_QUANT_API_BASE as string | undefined)?.replace(/\/$/, '') ||
  (import.meta.env.DEV ? 'http://localhost:8787' : 'https://web3-quant-api.binson0426.workers.dev')

const request = async <T>(path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('market-admin-session')
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    signal: AbortSignal.timeout(12_000),
  })
  const body = (await response.json()) as T & { error?: string }
  if (!response.ok) throw new Error(body.error || `Cloudflare API ${response.status}`)
  return body
}

export const technicalConfigApi = {
  publicConfig: () => request<TechnicalIndicatorConfig>('/api/technical-config'),
  adminConfig: () =>
    request<{ config: TechnicalIndicatorConfig; versions: TechnicalIndicatorConfigVersion[] }>(
      '/api/admin/technical-config',
    ),
  save: (config: TechnicalIndicatorConfig) =>
    request<{ config: TechnicalIndicatorConfig; versions: TechnicalIndicatorConfigVersion[] }>(
      '/api/admin/technical-config',
      { method: 'PATCH', body: JSON.stringify(config) },
    ),
}
