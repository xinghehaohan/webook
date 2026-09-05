'use client'

import { useEffect, useLayoutEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { BottomDock } from './bottom-dock'
import { useReaderStore } from '@/state/reader-store'

const ROUTE_CHROME = {
  today: { light: '#168fd8', dark: '#0f6fa7' },
  margins: { light: '#bcecff', dark: '#16435b' },
  library: { light: '#f5f9ee', dark: '#172823' },
  profile: { light: '#68afd5', dark: '#16435b' },
  opinion: { light: '#f6f8f1', dark: '#172823' },
} as const

function chromeFor(pathname: string) {
  if (pathname.startsWith('/margins')) return ROUTE_CHROME.margins
  if (pathname.startsWith('/library')) return ROUTE_CHROME.library
  if (pathname.startsWith('/me')) return ROUTE_CHROME.profile
  if (pathname.startsWith('/opinion')) return ROUTE_CHROME.opinion
  return ROUTE_CHROME.today
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [offline, setOffline] = useState(false)
  const [blocked, setBlocked] = useState<string>()
  const fontScale = useReaderStore((state) => state.fontScale)
  const reducedMotion = useReaderStore((state) => state.reducedMotion)
  useLayoutEffect(() => {
    const appearance = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const palette = chromeFor(pathname)
      const color = appearance.matches ? palette.dark : palette.light
      document.documentElement.style.setProperty('--page-chrome', color)
      document.body.style.setProperty('--page-chrome', color)
      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
        if (meta.content !== color) meta.content = color
      })
    }
    apply()
    const metadataObserver = new MutationObserver(apply)
    metadataObserver.observe(document.head, { attributes: true, attributeFilter: ['content', 'media'], childList: true, subtree: true })
    appearance.addEventListener('change', apply)
    return () => { metadataObserver.disconnect(); appearance.removeEventListener('change', apply) }
  }, [pathname])
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine)
    update(); window.addEventListener('online', update); window.addEventListener('offline', update)
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update) }
  }, [])
  useEffect(() => {
    const onUpgrade = (event: Event) => setBlocked((event as CustomEvent<string>).detail)
    window.addEventListener('pagesprout:upgrade', onUpgrade)
    return () => window.removeEventListener('pagesprout:upgrade', onUpgrade)
  }, [])
  return <main className={`app-shell${reducedMotion ? ' reduce-motion' : ''}`} style={{ '--text-scale': fontScale } as React.CSSProperties}>
    {offline && <div className="offline-banner" role="status">离线阅读 · 正在显示最近保存的内容</div>}
    {blocked && <div className="upgrade-blocker" role="alert"><span>🛠️</span><h2>页芽需要照料一下</h2><p>{blocked}</p><small>升级完成后刷新页面即可继续。</small></div>}
    <div className="screen-content">{children}</div>
    <BottomDock />
  </main>
}
