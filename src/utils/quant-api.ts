import type {
  BtcAutoTradingConfig,
  BtcAutoTradingDashboard,
  ContractPaperTrade,
  PaperSignalPosition,
  QuantDashboard,
  QuantOptionCandidate,
} from '@/types'

const defaultApiBase = 'https://web3-quant-api.binson0426.workers.dev'
const clientStorageKey = 'market-desk-quant-client-id-v1'
const requestTimeoutMs = 12_000
const fileRequestTimeoutMs = 60_000

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
  const sessionToken = window.localStorage.getItem('market-admin-session')
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      ...init?.headers,
    },
    signal: AbortSignal.timeout(requestTimeoutMs),
  })
  const payload = (await response.json()) as T & { error?: string }
  if (!response.ok) throw new Error(payload.error || `Cloudflare API ${response.status}`)
  return payload
}

const requestFile = async (path: string) => {
  const sessionToken = window.localStorage.getItem('market-admin-session')
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      Accept: 'text/csv',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    signal: AbortSignal.timeout(fileRequestTimeoutMs),
  })
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(payload?.error || `Cloudflare API ${response.status}`)
  }
  return response.blob()
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
  contractTrades: async () => {
    const payload = await request<{ trades: ContractPaperTrade[] }>('/api/contract-paper')
    return payload.trades
  },
  createContractTrade: async (trade: ContractPaperTrade) => {
    const payload = await request<{ trades: ContractPaperTrade[] }>('/api/contract-paper', {
      method: 'POST',
      body: JSON.stringify(trade),
    })
    return payload.trades
  },
  closeContractTrade: async (id: string, exitPrice: number, closedAt: string) => {
    const payload = await request<{ trades: ContractPaperTrade[] }>(
      `/api/contract-paper/${encodeURIComponent(id)}/close`,
      {
        method: 'PATCH',
        body: JSON.stringify({ exitPrice, closedAt }),
      },
    )
    return payload.trades
  },
  deleteContractTrade: async (id: string) => {
    const payload = await request<{ trades: ContractPaperTrade[] }>(
      `/api/contract-paper/${encodeURIComponent(id)}`,
      { method: 'DELETE' },
    )
    return payload.trades
  },
  btcAutoTrading: () => request<BtcAutoTradingDashboard>('/api/btc-auto-trading'),
  exportBtcAutoTrading: (locale: 'zh' | 'en') =>
    requestFile(`/api/btc-auto-trading/export?locale=${locale}`),
  saveBtcAutoTrading: (config: BtcAutoTradingConfig) =>
    request<BtcAutoTradingDashboard>('/api/btc-auto-trading', {
      method: 'PATCH',
      body: JSON.stringify(config),
    }),
  runBtcAutoTrading: () =>
    request<BtcAutoTradingDashboard>('/api/btc-auto-trading/run', { method: 'POST' }),
  closeBtcAutoTrading: () =>
    request<BtcAutoTradingDashboard>('/api/btc-auto-trading/close', { method: 'POST' }),
}
