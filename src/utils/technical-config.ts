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
    advancedMovingAverages: true,
    adx: true,
    stochastic: true,
    roc: true,
    cci: true,
    historicalVolatility: true,
    obv: true,
    vwap: true,
    marketStructure: true,
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
    maFastPeriod: 5,
    maMediumPeriod: 10,
    maTrendPeriod: 120,
    maAnnualPeriod: 250,
    emaPeriod: 20,
    adxPeriod: 14,
    stochasticPeriod: 14,
    rocPeriod: 12,
    cciPeriod: 20,
    historicalVolatilityPeriod: 20,
    vwapPeriod: 20,
    highLowWindow: 252,
    gapLookback: 60,
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

export const normalizeTechnicalIndicatorConfig = (
  config: TechnicalIndicatorConfig,
): TechnicalIndicatorConfig => ({
  ...defaultTechnicalIndicatorConfig,
  ...config,
  enabled: { ...defaultTechnicalIndicatorConfig.enabled, ...config.enabled },
  parameters: { ...defaultTechnicalIndicatorConfig.parameters, ...config.parameters },
  weights: { ...defaultTechnicalIndicatorConfig.weights, ...config.weights },
  display: { ...defaultTechnicalIndicatorConfig.display, ...config.display },
  sourcePriority: config.sourcePriority?.length
    ? config.sourcePriority
    : defaultTechnicalIndicatorConfig.sourcePriority,
})

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
  publicConfig: async () =>
    normalizeTechnicalIndicatorConfig(
      await request<TechnicalIndicatorConfig>('/api/technical-config'),
    ),
  adminConfig: async () => {
    const result = await request<{
      config: TechnicalIndicatorConfig
      versions: TechnicalIndicatorConfigVersion[]
    }>(
      '/api/admin/technical-config',
    )
    return { ...result, config: normalizeTechnicalIndicatorConfig(result.config) }
  },
  save: async (config: TechnicalIndicatorConfig) => {
    const result = await request<{
      config: TechnicalIndicatorConfig
      versions: TechnicalIndicatorConfigVersion[]
    }>(
      '/api/admin/technical-config',
      { method: 'PATCH', body: JSON.stringify(config) },
    )
    return { ...result, config: normalizeTechnicalIndicatorConfig(result.config) }
  },
}
