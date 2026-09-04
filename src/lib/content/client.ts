import type { ApiResult, ConnectionState } from './types'

export async function getConnection(signal?: AbortSignal): Promise<ConnectionState> {
  const response = await fetch('/api/auth/status', { cache: 'no-store', signal })
  const result = await response.json() as ApiResult<ConnectionState>
  if (!result.ok) throw new Error(result.message)
  return result.data
}

export async function callAction<T>(action: string, payload: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api/weread/${action}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
    signal,
  })
  const result = await response.json() as ApiResult<T>
  if (!result.ok) {
    const error = new Error(result.message) as Error & { code?: string; retryable?: boolean }
    error.code = result.code
    error.retryable = result.retryable
    if (result.code === 'UPGRADE_REQUIRED' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pagesprout:upgrade', { detail: result.message }))
    }
    throw error
  }
  return result.data
}
