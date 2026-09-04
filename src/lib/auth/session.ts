import { createHmac, timingSafeEqual } from 'node:crypto'
import type { NextRequest } from 'next/server'

export const SESSION_COOKIE = 'pagesprout_session'
export const UPGRADE_COOKIE = 'pagesprout_upgrade'
export const SESSION_AGE = 7 * 24 * 60 * 60

function secret(): string | undefined {
  return process.env.SESSION_SECRET || (process.env.NODE_ENV === 'development' ? 'pagesprout-local-development' : undefined)
}

function signature(value: string): string {
  const valueSecret = secret()
  if (!valueSecret) return ''
  return createHmac('sha256', valueSecret).update(value).digest('base64url')
}

export function safeEqual(left: string, right: string): boolean {
  const key = secret() || 'pagesprout-constant-time-compare'
  const digest = (value: string) => createHmac('sha256', key).update(value).digest()
  return timingSafeEqual(digest(left), digest(right))
}

export function createSession(): string {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_AGE })).toString('base64url')
  return `${payload}.${signature(payload)}`
}

export function verifySession(value?: string): boolean {
  if (!value) return false
  const [payload, givenSignature] = value.split('.')
  if (!payload || !givenSignature || !safeEqual(signature(payload), givenSignature)) return false
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { exp?: number }
    return typeof parsed.exp === 'number' && parsed.exp > Date.now() / 1000
  } catch { return false }
}

export function createUpgradeMarker(): string {
  const value = '1.0.4'
  return `${value}.${signature(value)}`
}

export function verifyUpgradeMarker(value?: string): boolean {
  if (!value) return false
  const [version, givenSignature] = value.split('.')
  return version === '1.0.4' && Boolean(givenSignature) && safeEqual(signature(version), givenSignature)
}

export function connectionNamespace(): string {
  const key = process.env.WEREAD_API_KEY
  const valueSecret = secret()
  if (!key || !valueSecret) return 'demo'
  return createHmac('sha256', valueSecret).update(key).digest('hex').slice(0, 16)
}

export function securityConfigured(): boolean {
  if (process.env.NODE_ENV === 'development') return true
  return Boolean(process.env.APP_ACCESS_TOKEN && process.env.SESSION_SECRET)
}

export function requestIsSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const requestHost = request.headers.get('host') || request.nextUrl.host
  const localHost = /^(127\.0\.0\.1|localhost)(:\d+)?$/.test(requestHost)
  if (!origin) return process.env.NODE_ENV === 'development' && localHost
  const fetchSite = request.headers.get('sec-fetch-site')
  if (fetchSite && fetchSite !== 'same-origin') return false
  try { return new URL(origin).origin === `${request.nextUrl.protocol}//${requestHost}` } catch { return false }
}

export function sessionCookieOptions(maxAge = SESSION_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge,
  }
}
