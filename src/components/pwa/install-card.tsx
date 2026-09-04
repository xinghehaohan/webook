'use client'

import { useEffect, useState } from 'react'

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

export function InstallCard() {
  const [prompt, setPrompt] = useState<InstallEvent>()
  const [ios, setIos] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIos(/iphone|ipad|ipod/i.test(navigator.userAgent) && !('standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone)))
    const listener = (event: Event) => { event.preventDefault(); setPrompt(event as InstallEvent) }
    window.addEventListener('beforeinstallprompt', listener)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('beforeinstallprompt', listener) }
  }, [])
  if (!prompt && !ios) return null
  return <section className="profile-card install-card"><span className="settings-icon">↗</span><div><h3>把页边放到主屏幕</h3><p>{ios ? '在 Safari 分享菜单中选择“添加到主屏幕”。' : '像普通 App 一样打开，阅读时更沉浸。'}</p></div>{prompt && <button type="button" onClick={() => void prompt.prompt()}>安装</button>}</section>
}
