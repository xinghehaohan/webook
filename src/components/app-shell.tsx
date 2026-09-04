'use client'

import { useEffect, useState } from 'react'
import { BottomDock } from './bottom-dock'
import { useReaderStore } from '@/state/reader-store'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [offline, setOffline] = useState(false)
  const [blocked, setBlocked] = useState<string>()
  const fontScale = useReaderStore((state) => state.fontScale)
  const reducedMotion = useReaderStore((state) => state.reducedMotion)
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
