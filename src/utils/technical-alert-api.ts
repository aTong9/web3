import type { TechnicalAlertCondition, TechnicalAlertHorizon, TechnicalAlertRule } from '@/types'

import { requestWorkerJson as request } from '@/utils/worker-json-request'

export const technicalAlertApi = {
  list: async () =>
    (await request<{ alerts: TechnicalAlertRule[] }>('/api/technical-alerts')).alerts,
  create: async (input: {
    assetId: string
    assetName: string
    series: string
    compareAssetId: string | null
    compareAssetName: string | null
    condition: TechnicalAlertCondition
    threshold: number | null
    horizon: TechnicalAlertHorizon
    minimumConfidence: number
    requireResonance: boolean
  }) =>
    (
      await request<{ alert: TechnicalAlertRule }>('/api/technical-alerts', {
        method: 'POST',
        body: JSON.stringify(input),
      })
    ).alert,
  setEnabled: (rule: TechnicalAlertRule, enabled: boolean) =>
    request<{ ok: true }>(`/api/technical-alerts/${encodeURIComponent(rule.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    }),
  remove: (rule: TechnicalAlertRule) =>
    request<{ ok: true }>(`/api/technical-alerts/${encodeURIComponent(rule.id)}`, {
      method: 'DELETE',
    }),
}
