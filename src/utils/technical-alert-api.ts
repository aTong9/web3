import type { TechnicalAlertCondition, TechnicalAlertRule } from '@/types'

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

export const technicalAlertApi = {
  list: async () => (await request<{ alerts: TechnicalAlertRule[] }>('/api/technical-alerts')).alerts,
  create: async (input: {
    assetId: string
    assetName: string
    series: string
    condition: TechnicalAlertCondition
    threshold: number | null
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
