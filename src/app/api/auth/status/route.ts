import { cookies } from 'next/headers'
import { connectionNamespace, securityConfigured, SESSION_COOKIE, UPGRADE_COOKIE, verifySession, verifyUpgradeMarker } from '@/lib/auth/session'
import { ok } from '@/lib/api/response'

export async function GET() {
  const store = await cookies()
  const configured = Boolean(process.env.WEREAD_API_KEY)
  const protectedProduction = process.env.NODE_ENV === 'production'
  const authenticated = !protectedProduction || (securityConfigured() && verifySession(store.get(SESSION_COOKIE)?.value))
  return ok({
    configured,
    authenticated,
    requiresAccessToken: protectedProduction && !authenticated,
    namespace: configured ? connectionNamespace() : 'demo',
    blocked: verifyUpgradeMarker(store.get(UPGRADE_COOKIE)?.value) ? '微信读书 Skill 需要升级并重新部署后才能继续。' : undefined,
    securityReady: securityConfigured(),
  })
}
