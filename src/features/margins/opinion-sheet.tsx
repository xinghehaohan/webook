'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { SourceBadge } from '@/components/source-badge'
import { compactNumber, formatDate } from '@/lib/content/format'
import { callAction, getConnection } from '@/lib/content/client'
import { DEMO_MARGINS } from '@/lib/content/demo'
import type { MarginCard, ReaderOpinion } from '@/lib/content/types'
import { HeartIcon } from '@/components/ui/icons'
import { useReaderStore } from '@/state/reader-store'
import { idbGet, idbSet } from '@/state/indexed-db'

type Props = { bookId: string; chapterUid: number; range: string; bookmarkId?: string; from?: string; cardId?: string }

export function OpinionSheet({ bookId, chapterUid, range, bookmarkId, from, cardId }: Props) {
  const router = useRouter()
  const [card, setCard] = useState<MarginCard>()
  const [opinions, setOpinions] = useState<ReaderOpinion[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [message, setMessage] = useState<string>()
  const [cursor, setCursor] = useState<{ hasMore: boolean; maxIdx: number; synckey: number }>({ hasMore: false, maxIdx: 0, synckey: 0 })
  const favorites = useReaderStore((state) => state.favorites)
  const toggleFavorite = useReaderStore((state) => state.toggleFavorite)
  const loadMoreController = useRef<AbortController | null>(null)
  const fallbackPath = from?.startsWith('/') && !from.startsWith('//') ? from : '/margins'
  const fallbackHref = `${fallbackPath}${fallbackPath.includes('?') ? '&' : '?'}resume=${encodeURIComponent(cardId ?? '')}#margin-${encodeURIComponent(cardId ?? '')}`
  const goBack = () => {
    if (document.referrer.startsWith(window.location.origin)) router.back()
    else router.replace(fallbackHref)
  }
  useEffect(() => {
    const controller = new AbortController()
    void Promise.resolve().then(async () => {
      const stored = sessionStorage.getItem(`pagesprout:card:${bookId}:${chapterUid}:${range}`)
      const namespace = localStorage.getItem('pagesprout:last-namespace') ?? 'demo'
      const durable = stored ? undefined : await idbGet<MarginCard>('content', `${namespace}:card:${bookId}:${chapterUid}:${range}`)
      const initial = stored ? JSON.parse(stored) as MarginCard : durable ?? DEMO_MARGINS.find((item) => item.book.bookId === bookId && item.chapterUid === chapterUid && item.range === range)
      if (initial) { setCard(initial); setOpinions(initial.opinions) }
      const status = await getConnection(controller.signal)
      if (!status.configured) return
      let resolved = initial
      if (!resolved) {
        const highlights = await callAction<{ cards: MarginCard[] }>('highlights', { bookId, chapterUid }, controller.signal)
        resolved = highlights.cards.find((item) => item.bookmarkId === bookmarkId) ?? highlights.cards.find((item) => item.range === range)
        if (!resolved) throw new Error('这条标注暂时无法恢复。')
        setCard(resolved)
      }
      const result = await callAction<{ groups: Array<{ range: string; totalCount: number; opinions: ReaderOpinion[]; hasMore: boolean; maxIdx: number; synckey: number }> }>('opinions', {
        bookId, chapterUid, reviews: [{ range, count: 20, maxIdx: 0, synckey: 0 }],
      }, controller.signal)
      const group = result.groups.find((item) => item.range === range)
      if (group) { setOpinions(group.opinions); setCursor({ hasMore: group.hasMore, maxIdx: group.maxIdx, synckey: group.synckey }); setCard((value) => { const next = value ? { ...value, opinionCount: group.totalCount, opinions: group.opinions, opinionStatus: 'loaded' as const } : value; if (next) void idbSet('content', `${status.namespace}:card:${bookId}:${chapterUid}:${range}`, next); return next }) }
    }).catch((error: unknown) => { if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : '观点暂时没有加载成功。') }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => { controller.abort(); loadMoreController.current?.abort() }
  }, [bookId, bookmarkId, chapterUid, range])

  const loadMore = async () => {
    if (!cursor.hasMore || loadingMore) return
    loadMoreController.current?.abort(); const controller = new AbortController(); loadMoreController.current = controller
    setLoadingMore(true); setMessage(undefined)
    try {
      const result = await callAction<{ groups: Array<{ range: string; opinions: ReaderOpinion[]; hasMore: boolean; maxIdx: number; synckey: number }> }>('opinions', {
        bookId, chapterUid, reviews: [{ range, count: 20, maxIdx: cursor.maxIdx, synckey: cursor.synckey }],
      }, controller.signal)
      const group = result.groups.find((item) => item.range === range)
      if (group) {
        const additions = group.opinions.filter((item) => !opinions.some((existing) => existing.id === item.id))
        const advanced = group.maxIdx !== cursor.maxIdx || group.synckey !== cursor.synckey
        setOpinions((current) => [...current, ...additions.filter((item) => !current.some((existing) => existing.id === item.id))])
        setCursor({ hasMore: group.hasMore && advanced && additions.length > 0, maxIdx: group.maxIdx, synckey: group.synckey })
        if (!advanced || additions.length === 0) setMessage('已经读到这段讨论的尽头了。')
      }
    } catch (error) { if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : '没有加载到更多观点。') }
    finally { if (!controller.signal.aborted) setLoadingMore(false) }
  }

  if (!card && loading) return <div className="opinion-loading">页芽正在翻回这一页…</div>
  if (!card) return <div className="standard-screen"><button type="button" onClick={goBack} className="back-button">‹</button><div className="empty-card"><span>🍃</span><h2>这片页边暂时找不到了</h2><p>{message}</p></div></div>
  const favorite = Boolean(favorites[card.id])
  return <div className="opinion-page">
    <header className="opinion-nav"><button type="button" onClick={goBack} className="back-button" aria-label="返回页边">‹</button><div><span>观点深读</span><b>{opinions.length ? `${opinions.length} / ${card.opinionCount}` : '原文页边'}</b></div><button type="button" className={`icon-button${favorite ? ' saved' : ''}`} onClick={() => toggleFavorite(card)} aria-label="收藏"><HeartIcon filled={favorite} /></button></header>
    <section className="pinned-quote"><SourceBadge source={card.source} /><div className="book-source compact-source"><div className="book-cover-mini">{card.book.title.slice(0, 4)}</div><div><strong>《{card.book.title}》</strong><span>{card.chapterTitle || `章节 ${card.chapterUid}`}</span></div></div><blockquote>“<mark>{card.markText}</mark>”</blockquote><div className="margin-stats"><span><b>{compactNumber(card.highlightCount)} 人</b>标注</span><span><b>{compactNumber(card.opinionCount)} 个</b>想法</span></div></section>
    <section className="opinion-thread"><div className="thread-title"><div><span>READERS&apos; MARGINS</span><h2>大家在这里想到的</h2></div><i /></div>
      {loading && <p className="loading-copy">正在把观点放回原文旁边…</p>}
      {message && <div className="gentle-error">{message}</div>}
      {!loading && opinions.length === 0 && <div className="empty-opinion large-empty">这里还没有人留下想法。也许你可以先把这句话带走。</div>}
      {opinions.map((opinion, index) => <article className="thread-opinion" key={opinion.id}><div className={`reader-avatar avatar-${index % 4}`}>{(opinion.author || '读').slice(0, 1)}</div><div><header><b>{opinion.author || '微信读书用户'}</b>{opinion.createdAt && <span>{formatDate(opinion.createdAt)}</span>}</header><p>{opinion.content}</p>{typeof opinion.likes === 'number' && <small>♡ {compactNumber(opinion.likes)}</small>}</div></article>)}
      {opinions.length > 0 && cursor.hasMore && <button className="load-more" type="button" onClick={loadMore} disabled={loadingMore}>{loadingMore ? '页芽正在继续翻…' : '继续读更多观点'}</button>}
    </section>
  </div>
}
