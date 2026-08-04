import type { PaperSignalPosition, QuantDashboard, QuantOptionCandidate } from '@/types'

const defaultApiBase = 'https://web3-quant-api.binson0426.workers.dev'
const clientStorageKey = 'market-desk-quant-client-id-v1'
const requestTimeoutMs = 12_000

const apiBase = (import.meta.env.VITE_QUANT_API_BASE || defaultApiBase).replace(/\/$/, '')

const clientIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const getQuantClientId = () => {
  const stored = window.localStorage.getItem(clientStorageKey)
  if (stored && clientIdPattern.test(stored)) return stored
  const created = window.crypto.randomUUID()
  window.localStorage.setItem(clientStorageKey, created)
  return created
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    signal: AbortSignal.timeout(requestTimeoutMs),
  })
  const payload = (await response.json()) as T & { error?: string }
  if (!response.ok) throw new Error(payload.error || `Cloudflare API ${response.status}`)
  return payload
}

export const quantApi = {
  baseUrl: apiBase,
  dashboard: () => request<QuantDashboard>('/api/quant/dashboard'),
  positions: async (clientId: string) => {
    const payload = await request<{ positions: PaperSignalPosition[] }>(
      `/api/paper?clientId=${encodeURIComponent(clientId)}`,
    )
    return payload.positions
  },
  createPosition: async (clientId: string, candidate: QuantOptionCandidate) => {
    const payload = await request<{ position: PaperSignalPosition }>('/api/paper', {
      method: 'POST',
      body: JSON.stringify({ clientId, symbol: candidate.symbol }),
    })
    return payload.position
  },
  closePosition: (clientId: string, position: PaperSignalPosition) =>
    request<{ ok: true }>(`/api/paper/${encodeURIComponent(position.id)}/close`, {
      method: 'PATCH',
      body: JSON.stringify({ clientId }),
    }),
  deletePosition: (clientId: string, position: PaperSignalPosition) =>
    request<{ ok: true }>(
      `/api/paper/${encodeURIComponent(position.id)}?clientId=${encodeURIComponent(clientId)}`,
      { method: 'DELETE' },
    ),
}
