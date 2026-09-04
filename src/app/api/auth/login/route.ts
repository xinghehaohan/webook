import { NextRequest } from 'next/server'
import { z } from 'zod'
import { canAttemptLogin, recordLoginFailure } from '@/lib/auth/rate-limit'
import { createSession, requestIsSameOrigin, safeEqual, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth/session'
import { fail, ok } from '@/lib/api/response'
import { readJsonBody } from '@/lib/api/body'

const schema = z.object({ token: z.string().min(1).max(512) })

export async function POST(request: NextRequest) {
  if (!requestIsSameOrigin(request)) return fail('ORIGIN_FORBIDDEN', '请求来源不受信任。', 403)
  if (!canAttemptLogin()) return fail('RATE_LIMITED', '尝试次数过多，请稍后再试。', 429, true)
  let body: unknown
  try { body = await readJsonBody(request) } catch (error) {
    return error instanceof Error && error.message === 'BODY_TOO_LARGE'
      ? fail('BODY_TOO_LARGE', '请求内容过大。', 413)
      : fail('INVALID_REQUEST', '请求格式不正确。', 400)
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return fail('INVALID_REQUEST', '请输入访问口令。', 400)
  const expected = process.env.APP_ACCESS_TOKEN
  if (!expected || !safeEqual(parsed.data.token, expected)) {
    recordLoginFailure()
    return fail('ACCESS_DENIED', '访问口令不正确。', 401)
  }
  const response = ok({ authenticated: true })
  response.cookies.set(SESSION_COOKIE, createSession(), sessionCookieOptions())
  return response
}
