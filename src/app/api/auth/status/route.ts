import { cookies } from 'next/headers'
import { accessProtectionEnabled, connectionNamespace, parseWeReadKey, resolveWeReadKey, securityConfigured, SESSION_COOKIE, UPGRADE_COOKIE, verifySession, verifyUpgradeMarker, WEREAD_KEY_COOKIE } from '@/lib/auth/session'
import { ok } from '@/lib/api/response'

export async function GET() {
  const store = await cookies()
  const deviceKey = parseWeReadKey(store.get(WEREAD_KEY_COOKIE)?.value)
  const key = resolveWeReadKey(store.get(WEREAD_KEY_COOKIE)?.value)
  const configured = Boolean(key)
  const protectedProduction = accessProtectionEnabled()
  const authenticated = !protectedProduction || (securityConfigured() && verifySession(store.get(SESSION_COOKIE)?.value))
  return ok({
    configured,
    authenticated,
    requiresAccessToken: protectedProduction && !authenticated,
    namespace: key ? connectionNamespace(key) : 'demo',
    configuredBy: deviceKey ? 'device' : configured ? 'environment' : undefined,
    blocked: verifyUpgradeMarker(store.get(UPGRADE_COOKIE)?.value) ? '微信读书 Skill 需要升级并重新部署后才能继续。' : undefined,
    securityReady: securityConfigured(),
  })
}
