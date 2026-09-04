'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { PageSprout } from '@/components/page-sprout'
import { InstallCard } from '@/components/pwa/install-card'
import { loadConnection } from '@/lib/content/repository'
import type { ConnectionState } from '@/lib/content/types'
import { clearAllLocalData } from '@/state/indexed-db'
import { useReaderStore } from '@/state/reader-store'
import { ConnectionCard } from './connection-card'
import { ReadingSettings } from './reading-settings'

export function ProfileScreen() {
  const [connection, setConnection] = useState<ConnectionState>()
  const favorites = useReaderStore((state) => state.favorites)
  const seen = useReaderStore((state) => state.seen)
  const growth = useReaderStore((state) => state.growth)
  const reset = useReaderStore((state) => state.reset)
  const refresh = useCallback(() => { void loadConnection().then(setConnection) }, [])
  useEffect(refresh, [refresh])
  const clear = async () => {
    if (!window.confirm('清除本机上的收藏、缓存、历史和页芽成长吗？')) return
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined)
    await clearAllLocalData(); reset(); window.location.reload()
  }
  return <div className="standard-screen profile-page">
    <div className="profile-scene">
      <Image className="season-scene-image snowy-scene-image" src="/scenes/snowy-house.png" alt="" fill priority sizes="(max-width: 430px) 100vw, 430px" />
      <div className="scene-scrim" aria-hidden="true" />
      <header className="profile-hero"><div><span className="eyebrow">MY GARDEN</span><h1>我和页芽</h1><p>不是读了多少，而是留下了什么。</p></div><PageSprout compact /></header>
    </div>
    <section className="growth-card"><div className="growth-ring" style={{ '--growth': `${Math.min(100, growth * 7)}%` } as React.CSSProperties}><span>{growth}</span></div><div><span>页芽等级 · 正在长叶子</span><h2>你的思想花园有了 {Object.keys(favorites).length} 颗光点</h2><p>每收藏一个真正打动你的观点，页芽就会再长一点。</p></div></section>
    <div className="stat-grid"><div><b>{seen.length}</b><span>读过的页边</span></div><div><b>{Object.keys(favorites).length}</b><span>收藏的观点</span></div><div><b>{growth}</b><span>页芽成长</span></div></div>
    <ConnectionCard connection={connection} onChanged={refresh} />
    <ReadingSettings />
    <InstallCard />
    <section className="profile-card privacy-card"><div><h3>本地数据与隐私</h3><p>收藏和成长保存在这台设备。API Key 仅发送给本应用服务端与微信读书，不写入前端存储。</p></div><button type="button" onClick={clear}>清除全部本地数据</button></section>
    <div className="app-signature">页边 · PageSprout <span>v0.1</span></div>
  </div>
}
