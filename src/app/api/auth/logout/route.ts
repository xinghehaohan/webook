import { NextRequest } from 'next/server'
import { requestIsSameOrigin, SESSION_COOKIE, sessionCookieOptions, UPGRADE_COOKIE, WEREAD_KEY_COOKIE } from '@/lib/auth/session'
import { fail, ok } from '@/lib/api/response'

export async function POST(request: NextRequest) {
  if (!requestIsSameOrigin(request)) return fail('ORIGIN_FORBIDDEN', '请求来源不受信任。', 403)
  const response = ok({ authenticated: false }, 200)
  response.cookies.set(SESSION_COOKIE, '', sessionCookieOptions(0))
  response.cookies.set(UPGRADE_COOKIE, '', sessionCookieOptions(0))
  response.cookies.set(WEREAD_KEY_COOKIE, '', sessionCookieOptions(0))
  return response
}
