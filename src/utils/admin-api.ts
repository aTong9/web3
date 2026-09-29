import type { AnalyticsConfig, AppUser, UserRole } from '@/types'
import { requestWorkerJson } from '@/utils/worker-json-request'

const request = <T>(path: string, options?: RequestInit) =>
  requestWorkerJson<T>(path, options, 'API')

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
