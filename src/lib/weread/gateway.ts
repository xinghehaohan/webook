import { API_NAMES, gatewayPayload, type ActionName } from './schemas'

const SKILL_VERSION = '1.0.4'
const OFFICIAL_GATEWAY = 'https://i.weread.qq.com/api/agent/gateway'

export class GatewayError extends Error {
  constructor(public code: string, message: string, public retryable: boolean, public upgrade = false) { super(message) }
}

export async function callWeRead(action: ActionName, value: Record<string, unknown>, signal?: AbortSignal): Promise<unknown> {
  const key = process.env.WEREAD_API_KEY
  if (!key) throw new GatewayError('KEY_MISSING', '尚未配置微信读书 API Key。', false)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  signal?.addEventListener('abort', () => controller.abort(), { once: true })
  const gateway = process.env.NODE_ENV === 'development' && process.env.WEREAD_DEV_GATEWAY_URL
    ? process.env.WEREAD_DEV_GATEWAY_URL
    : OFFICIAL_GATEWAY
  try {
    const response = await fetch(gateway, {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ api_name: API_NAMES[action], ...gatewayPayload(action, value), skill_version: SKILL_VERSION }),
      cache: 'no-store',
      signal: controller.signal,
    })
    const data = await response.json() as Record<string, unknown>
    const upgrade = data.upgrade_info as { message?: unknown } | undefined
    if (upgrade) throw new GatewayError('UPGRADE_REQUIRED', typeof upgrade.message === 'string' ? upgrade.message : '微信读书 Skill 需要升级后才能继续。', false, true)
    if (!response.ok || (typeof data.errcode === 'number' && data.errcode !== 0)) {
      const message = typeof data.errmsg === 'string' ? data.errmsg : '微信读书服务暂时不可用。'
      throw new GatewayError(response.status === 401 ? 'KEY_INVALID' : 'UPSTREAM_ERROR', message, response.status >= 500)
    }
    return data
  } catch (error) {
    if (error instanceof GatewayError) throw error
    if (controller.signal.aborted) throw new GatewayError('TIMEOUT', '连接微信读书超时，请稍后重试。', true)
    throw new GatewayError('NETWORK_ERROR', '暂时无法连接微信读书。', true)
  } finally { clearTimeout(timeout) }
}
