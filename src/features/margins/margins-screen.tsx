'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadConnection, loadMarginCards } from '@/lib/content/repository'
import type { MarginCard as MarginCardType } from '@/lib/content/types'
import { useReaderStore } from '@/state/reader-store'
import { MarginCard } from './margin-card'
import { MarginFilters, type MarginFilter } from './margin-filters'
import { MarginSkeleton } from './margin-skeleton'
import { RefreshIcon } from '@/components/ui/icons'

export function MarginsScreen() {
  const [cards, setCards] = useState<MarginCardType[]>([])
  const [filter, setFilter] = useState<MarginFilter>('hot')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string>()
  const favorites = useReaderStore((state) => state.favorites)
  const setNamespace = useReaderStore((state) => state.setNamespace)

  const load = useCallback((controller: AbortController) => {
    void loadConnection(controller.signal).then(async (status) => {
      setNamespace(status.namespace)
      if (!status.authenticated && status.requiresAccessToken) throw new Error('请先在“我的”中解锁页边。')
      const next = await loadMarginCards(status, controller.signal)
      setCards(next); if (!next.length) setMessage('这些书暂时没有公开热门标注。')
    }).catch((error: unknown) => { if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : '暂时无法加载页边。') }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
  }, [setNamespace])
  const refresh = useCallback(() => { const controller = new AbortController(); setLoading(true); setMessage(undefined); void loadConnection(controller.signal).then(async (status) => { setNamespace(status.namespace); const next = await loadMarginCards(status, controller.signal, 'stream', true); setCards(next); if (!next.length) setMessage('这些书暂时没有公开热门标注。') }).catch((error: unknown) => { if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : '刷新失败。') }).finally(() => { if (!controller.signal.aborted) setLoading(false) }) }, [setNamespace])
  useEffect(() => { const controller = new AbortController(); load(controller); return () => controller.abort() }, [load])

  const visible = useMemo(() => {
    const base = filter === 'saved' ? Object.values(favorites) : [...cards]
    if (filter === 'hot') return base.sort((a, b) => b.highlightCount - a.highlightCount)
    if (filter === 'recent') return base.sort((a, b) => (b.book.readUpdateTime ?? 0) - (a.book.readUpdateTime ?? 0))
    if (filter === 'discussed') return base.sort((a, b) => b.opinionCount - a.opinionCount)
    return base
  }, [cards, favorites, filter])

  return <div className="standard-screen margins-page">
    <header className="standard-header"><div><span className="eyebrow">MARGINS</span><h1>页边漫游</h1><p>回到原文，看看别人从这里想到了什么。</p></div><button className="round-button" type="button" onClick={refresh} aria-label="刷新页边"><RefreshIcon /></button></header>
    <MarginFilters value={filter} onChange={setFilter} />
    {loading && <MarginSkeleton />}
    {message && <div className="gentle-error"><span>{message}</span><button type="button" onClick={refresh}>重试</button></div>}
    {!loading && visible.length === 0 ? <div className="empty-card"><span>🌱</span><h2>页芽还没吃到收藏</h2><p>在任意原文卡片上点“喂给页芽”，它们会留在这里。</p></div> : <div className="margin-list">{visible.map((card) => <MarginCard key={card.id} card={card} />)}</div>}
  </div>
}
