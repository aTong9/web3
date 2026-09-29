import { cloudflareFetch } from '@/utils/cloudflare-fetch'

const apiBase =
  (import.meta.env.VITE_QUANT_API_BASE as string | undefined)?.replace(/\/$/, '') ||
  (import.meta.env.DEV ? 'http://localhost:8787' : 'https://web3-quant-api.binson0426.workers.dev')

export const requestWorkerJson = async <T>(
  path: string,
  options: RequestInit = {},
  errorPrefix = 'Cloudflare API',
): Promise<T> => {
  const token = localStorage.getItem('market-admin-session')
  const response = await cloudflareFetch(`${apiBase}${path}`, {
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
  if (!response.ok) throw new Error(body.error || `${errorPrefix} ${response.status}`)
  return body
}
