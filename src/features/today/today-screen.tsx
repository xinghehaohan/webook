'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { PageSprout } from '@/components/page-sprout'
import { loadConnection, loadMarginCards } from '@/lib/content/repository'
import type { ConnectionState, MarginCard } from '@/lib/content/types'
import { useReaderStore } from '@/state/reader-store'
import { DailyBite } from './daily-bite'
import { RefreshIcon } from '@/components/ui/icons'

export function TodayScreen() {
  const [cards, setCards] = useState<MarginCard[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [connection, setConnection] = useState<ConnectionState>()
  const setNamespace = useReaderStore((state) => state.setNamespace)

  const load = useCallback((controller: AbortController) => {
    void loadConnection(controller.signal).then(async (status) => {
      setConnection(status); setNamespace(status.namespace)
      if (!status.authenticated && status.requiresAccessToken) throw new Error('请先在“我的”中解锁页边。')
      if (status.blocked) throw new Error(status.blocked)
      const next = await loadMarginCards(status, controller.signal, 'today')
      setCards(next); setIndex(0)
      if (!next.length) setError('暂时没有找到带公开观点的热门标注。')
    }).catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : '页芽暂时没有找到书。') }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
  }, [setNamespace])

  const refresh = useCallback(() => {
    const controller = new AbortController()
    setLoading(true); setError(undefined)
    void loadConnection(controller.signal).then(async (status) => {
      setConnection(status); setNamespace(status.namespace)
      const next = await loadMarginCards(status, controller.signal, 'today', true)
      setCards(next); setIndex(0)
      if (!next.length) setError('暂时没有找到带公开观点的热门标注。')
    }).catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : '刷新失败。') }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
  }, [setNamespace])

  useEffect(() => { const controller = new AbortController(); load(controller); return () => controller.abort() }, [load])
  const current = cards.length ? cards[index % cards.length] : undefined
  const weekday = new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(new Date())

  return <div className="today-screen">
    <div className="page-scene sunny-page-scene" aria-hidden="true">
      <Image className="season-scene-image sunny-scene-image" src="/scenes/sunny-hillside.png" alt="" fill priority sizes="(max-width: 430px) 100vw, 430px" />
      <div className="scene-scrim" aria-hidden="true" />
    </div>
    <div className="sky-header">
      <header className="page-header"><div><span>{weekday} · 页边天气晴朗</span><h1>今天，从一句话开始</h1></div><button className="round-button" type="button" onClick={refresh} aria-label="刷新内容"><RefreshIcon /></button></header>
      <PageSprout />
    </div>
    <div className="sheet-content">
      {connection && !connection.configured && <div className="demo-notice"><b>正在预览示例数据</b><span>添加微信读书 API Key 后，页芽会从你的真实书架找内容。</span></div>}
      {error && <div className="gentle-error" role="status"><span>{error}</span><button type="button" onClick={refresh}>再试一次</button></div>}
      <DailyBite card={current} loading={loading} onNext={() => cards.length && setIndex((value) => (value + 1) % cards.length)} />
    </div>
  </div>
}
