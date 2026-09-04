'use client'
/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { callAction, getConnection } from '@/lib/content/client'
import { DEMO_BOOKS, DEMO_MARGINS } from '@/lib/content/demo'
import type { BookSummary, MarginCard as MarginCardType } from '@/lib/content/types'
import { MarginCard } from '@/features/margins/margin-card'

export function BookDetail({ bookId, fromDiscover = false }: { bookId: string; fromDiscover?: boolean }) {
  const [book, setBook] = useState<BookSummary>({ bookId, title: '正在翻书…' })
  const [cards, setCards] = useState<MarginCardType[]>([])
  const [chapters, setChapters] = useState<Array<{ chapterUid: number; title: string }>>([])
  const [message, setMessage] = useState<string>()
  useEffect(() => {
    const controller = new AbortController()
    void getConnection(controller.signal).then(async (status) => {
      if (!status.configured) {
        setBook(DEMO_BOOKS.find((item) => item.bookId === bookId) ?? { bookId, title: '这本书' })
        setCards(DEMO_MARGINS.filter((card) => card.book.bookId === bookId))
        return
      }
      const [infoResult, highlightsResult, chapterResult] = await Promise.allSettled([
        callAction<BookSummary>('book', { bookId }, controller.signal),
        callAction<{ cards: MarginCardType[] }>('highlights', { bookId }, controller.signal),
        callAction<{ chapters: Array<{ chapterUid: number; title: string }> }>('chapters', { bookId }, controller.signal),
      ])
      const info = infoResult.status === 'fulfilled' ? infoResult.value : { bookId, title: '这本书' }
      setBook(info)
      if (highlightsResult.status === 'fulfilled') setCards(highlightsResult.value.cards.map((card) => ({ ...card, book: { ...card.book, ...info } })))
      if (chapterResult.status === 'fulfilled') setChapters(chapterResult.value.chapters)
      if ([infoResult, highlightsResult, chapterResult].every((result) => result.status === 'rejected')) throw new Error('没有加载到这本书。')
    }).catch((error: unknown) => { if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : '没有加载到这本书。') })
    return () => controller.abort()
  }, [bookId])
  return <div className="standard-screen book-detail-page">
    <header className="detail-header"><Link href={fromDiscover ? '/library?view=discover' : '/library'} className="back-button">‹</Link><span>书内热门页边</span>{book.deepLink ? <a href={book.deepLink} className="open-weread" target="_blank" rel="noopener noreferrer">微信读书 ↗</a> : <span />}</header>
    <section className="book-hero"><div className="book-cover large">{book.cover ? <img src={book.cover} alt="" /> : book.title.slice(0, 5)}</div><div><span>{book.category || '微信读书'}</span><h1>{book.title}</h1><p>{book.author || '作者未显示'}</p></div></section>
    <div className="detail-title"><h2>大家标注最多的原文</h2><span>最多展示 20 条</span></div>
    {message && <div className="gentle-error">{message}</div>}
    {cards.length ? <div className="margin-list">{cards.map((card) => <MarginCard key={card.id} card={card} />)}</div> : <div className="empty-card"><span>📖</span><h2>还没有热门标注</h2><p>你仍然可以从目录重新走进这本书。</p>{chapters.slice(0, 6).map((chapter) => <div className="chapter-line" key={chapter.chapterUid}>{chapter.title}</div>)}</div>}
  </div>
}
