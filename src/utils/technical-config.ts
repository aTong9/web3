import type { TechnicalIndicatorConfig, TechnicalIndicatorConfigVersion } from '@/types'
import { defaultTechnicalIndicatorConfig } from '@/utils/technical-config-default'
import { requestWorkerJson as request } from '@/utils/worker-json-request'

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
