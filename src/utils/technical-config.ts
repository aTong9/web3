import type { TechnicalIndicatorConfig, TechnicalIndicatorConfigVersion } from '@/types'
import { defaultTechnicalIndicatorConfig } from '@/utils/technical-config-default'

export { defaultTechnicalIndicatorConfig } from '@/utils/technical-config-default'

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
    }>('/api/admin/technical-config')
    return { ...result, config: normalizeTechnicalIndicatorConfig(result.config) }
  },
  save: async (config: TechnicalIndicatorConfig) => {
    const result = await request<{
      config: TechnicalIndicatorConfig
      versions: TechnicalIndicatorConfigVersion[]
    }>('/api/admin/technical-config', { method: 'PATCH', body: JSON.stringify(config) })
    return { ...result, config: normalizeTechnicalIndicatorConfig(result.config) }
  },
}
