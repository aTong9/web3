import type { AnalyticsConfig, AppUser, UserRole } from '@/types'

const apiBase =
  (import.meta.env.VITE_QUANT_API_BASE as string | undefined)?.replace(/\/$/, '') ||
  (import.meta.env.DEV ? 'http://localhost:8787' : 'https://web3-quant-api.binson0426.workers.dev')

const request = async <T>(path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('market-admin-session')
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const body = (await response.json()) as T & { error?: string }
  if (!response.ok) throw new Error(body.error || `API ${response.status}`)
  return body
}

export const adminApi = {
  status: () => request<{ initialized: boolean }>('/api/auth/status'),
  exchange: (input: { code: string; name: string; email: string }) =>
    request<{ token: string; user: AppUser }>('/api/auth/exchange', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  me: () => request<{ user: AppUser }>('/api/auth/me'),
  logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
  users: () => request<{ users: AppUser[] }>('/api/admin/users'),
  createUser: (input: { name: string; email: string; role: UserRole }) =>
    request<{ user: AppUser; accessCode: string; expiresAt: string }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateUser: (id: string, input: { role?: UserRole; status?: AppUser['status'] }) =>
    request<{ ok: boolean }>(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  publicAnalytics: () => request<AnalyticsConfig>('/api/analytics/config'),
  analytics: () => request<AnalyticsConfig>('/api/admin/analytics'),
  saveAnalytics: (input: AnalyticsConfig) =>
    request<AnalyticsConfig>('/api/admin/analytics', {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
}
