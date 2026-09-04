import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { readJsonBody } from '@/lib/api/body'
import { fail, ok } from '@/lib/api/response'
import { accessProtectionEnabled, encryptWeReadKey, requestIsSameOrigin, securityConfigured, SESSION_COOKIE, sessionCookieOptions, UPGRADE_COOKIE, verifySession, WEREAD_KEY_COOKIE } from '@/lib/auth/session'
import { callWeRead, GatewayError } from '@/lib/weread/gateway'

const schema = z.object({ key: z.string().trim().min(8).max(512) })

export async function POST(request: NextRequest) {
  if (!requestIsSameOrigin(request)) return fail('ORIGIN_FORBIDDEN', '请求来源不受信任。', 403)
  if (!securityConfigured()) return fail('SECURITY_NOT_CONFIGURED', '生产环境需要先配置访问保护。', 503)
  const store = await cookies()
  if (accessProtectionEnabled() && !verifySession(store.get(SESSION_COOKIE)?.value)) return fail('UNAUTHORIZED', '请先输入页边访问口令。', 401)
  let body: unknown
  try { body = await readJsonBody(request) } catch (error) {
    return error instanceof Error && error.message === 'BODY_TOO_LARGE'
      ? fail('BODY_TOO_LARGE', '请求内容过大。', 413)
      : fail('INVALID_REQUEST', '请求格式不正确。', 400)
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return fail('INVALID_KEY', '请输入完整的微信读书 API Key。', 400)
  const key = parsed.data.key.replaceAll('\\_', '_')
  try {
    await callWeRead('shelf', {}, request.signal, key)
    const response = ok({ connected: true })
    response.cookies.set(WEREAD_KEY_COOKIE, encryptWeReadKey(key), sessionCookieOptions(30 * 24 * 60 * 60))
    response.cookies.set(UPGRADE_COOKIE, '', sessionCookieOptions(0))
    return response
  } catch (error) {
    if (error instanceof GatewayError) return fail(error.code, error.code === 'KEY_INVALID' ? '这个 API Key 无法通过微信读书验证。' : error.message, error.code === 'KEY_INVALID' ? 401 : 502, error.retryable)
    return fail('UNKNOWN_ERROR', '暂时无法验证这个 API Key。', 500, true)
  }
}
