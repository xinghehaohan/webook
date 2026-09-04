import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { fail, ok } from '@/lib/api/response'
import { createUpgradeMarker, requestIsSameOrigin, resolveWeReadKey, securityConfigured, SESSION_COOKIE, sessionCookieOptions, UPGRADE_COOKIE, verifySession, verifyUpgradeMarker, WEREAD_KEY_COOKIE } from '@/lib/auth/session'
import { callWeRead, GatewayError } from '@/lib/weread/gateway'
import { actionSchemas, type ActionName } from '@/lib/weread/schemas'
import { normalizeBookInfo, normalizeChapters, normalizeDiscovery, normalizeHighlights, normalizeOpinions, normalizeProgress, normalizeShelf } from '@/lib/weread/normalize'
import { readJsonBody } from '@/lib/api/body'

const ACTIONS = new Set(Object.keys(actionSchemas))

function normalize(action: ActionName, raw: unknown, value: Record<string, unknown>) {
  if (action === 'shelf') return normalizeShelf(raw)
  if (action === 'progress') return normalizeProgress(raw)
  if (action === 'highlights') return normalizeHighlights(raw, String(value.bookId))
  if (action === 'opinions') return normalizeOpinions(raw)
  if (action === 'chapters') return normalizeChapters(raw)
  if (action === 'book') return normalizeBookInfo(raw)
  return normalizeDiscovery(raw)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  if (!requestIsSameOrigin(request)) return fail('ORIGIN_FORBIDDEN', '请求来源不受信任。', 403)
  if (!securityConfigured()) return fail('SECURITY_NOT_CONFIGURED', '生产环境需要配置访问保护。', 503)
  const store = await cookies()
  if (process.env.NODE_ENV === 'production' && !verifySession(store.get(SESSION_COOKIE)?.value)) return fail('UNAUTHORIZED', '请先解锁你的页边。', 401)
  if (verifyUpgradeMarker(store.get(UPGRADE_COOKIE)?.value)) return fail('UPGRADE_REQUIRED', '微信读书 Skill 需要升级并重新部署后才能继续。', 409)
  const key = resolveWeReadKey(store.get(WEREAD_KEY_COOKIE)?.value)
  if (!key) return fail('KEY_MISSING', '请先在“我的”中连接微信读书 API Key。', 401)
  const { action: rawAction } = await params
  if (!ACTIONS.has(rawAction)) return fail('UNKNOWN_ACTION', '不支持这个微信读书操作。', 404)
  const action = rawAction as ActionName
  let body: unknown
  try { body = await readJsonBody(request) } catch (error) {
    return error instanceof Error && error.message === 'BODY_TOO_LARGE'
      ? fail('BODY_TOO_LARGE', '请求内容过大。', 413)
      : fail('INVALID_REQUEST', '请求格式不正确。', 400)
  }
  const parsed = actionSchemas[action].safeParse(body)
  if (!parsed.success) return fail('INVALID_REQUEST', '请求参数不正确。', 400)
  try {
    const value = parsed.data as Record<string, unknown>
    const raw = await callWeRead(action, value, request.signal, key)
    return ok(normalize(action, raw, value))
  } catch (error) {
    if (error instanceof GatewayError) {
      const response = fail(error.code, error.message, error.upgrade ? 409 : error.code === 'KEY_INVALID' ? 401 : 502, error.retryable)
      if (error.upgrade) response.cookies.set(UPGRADE_COOKIE, createUpgradeMarker(), sessionCookieOptions())
      return response
    }
    return fail('UNKNOWN_ERROR', '页芽暂时没能翻开这本书。', 500, true)
  }
}
