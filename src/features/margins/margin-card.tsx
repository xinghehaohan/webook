'use client'

import Link from 'next/link'
import { compactNumber, formatDate, formatProgress } from '@/lib/content/format'
import type { MarginCard as MarginCardType } from '@/lib/content/types'
import { useReaderStore } from '@/state/reader-store'
import { ArrowIcon, HeartIcon } from '@/components/ui/icons'
import { SourceBadge } from '@/components/source-badge'
import { idbSet } from '@/state/indexed-db'

export function MarginCard({ card, hero = false }: { card: MarginCardType; hero?: boolean }) {
  const favorites = useReaderStore((state) => state.favorites)
  const toggleFavorite = useReaderStore((state) => state.toggleFavorite)
  const markSeen = useReaderStore((state) => state.markSeen)
  const namespace = useReaderStore((state) => state.namespace)
  const favorite = Boolean(favorites[card.id])
  const href = `/opinion/${encodeURIComponent(card.book.bookId)}/${card.chapterUid}?range=${encodeURIComponent(card.range)}&bookmarkId=${encodeURIComponent(card.bookmarkId ?? card.id)}`
  const remember = () => {
    markSeen(card.id)
    sessionStorage.setItem(`pagesprout:card:${card.book.bookId}:${card.chapterUid}:${card.range}`, JSON.stringify(card))
    void idbSet('content', `${namespace}:card:${card.book.bookId}:${card.chapterUid}:${card.range}`, card)
  }

  return <article className={`margin-card${hero ? ' hero-card' : ''}`}>
    <div className="card-meta-row"><SourceBadge source={card.source} /><span>{formatDate(card.book.readUpdateTime) ? `${formatDate(card.book.readUpdateTime)} 读过` : formatProgress(card.book.progress)}</span></div>
    <div className="book-source"><div className="book-cover-mini" aria-hidden="true"><span>{card.book.title.slice(0, 4)}</span></div><div><strong>《{card.book.title}》</strong><span>{card.book.author || '作者未显示'}{card.chapterTitle ? ` · ${card.chapterTitle}` : ''}</span></div></div>
    <blockquote>“<mark>{card.markText}</mark>”</blockquote>
    <div className="margin-stats"><span><b>{compactNumber(card.highlightCount)} 人</b>标注</span><span><b>{compactNumber(card.opinionCount)} 个</b>真实想法</span></div>
    {card.opinions[0] ? <div className="opinion-preview"><div className="opinion-person"><span>{(card.opinions[0].author || '读').slice(0, 1)}</span><b>{card.opinions[0].author || '微信读书用户'}</b></div><p>{card.opinions[0].content}</p>{typeof card.opinions[0].likes === 'number' && <small>♡ {compactNumber(card.opinions[0].likes)}</small>}</div> : card.opinionStatus === 'error' ? <div className="empty-opinion opinion-error">观点暂时没能来到原文旁边，点进去可以重新加载。</div> : <div className="empty-opinion">这里还没有人留下想法，但这句话已经被很多人看见。</div>}
    <div className="card-provenance"><span>获取于 {formatDate(card.fetchedAt) || '刚刚'}</span>{card.book.deepLink && <a href={card.book.deepLink} target="_blank" rel="noopener noreferrer">在微信读书打开 ↗</a>}</div>
    <div className="card-actions">
      <button className={`soft-action${favorite ? ' saved' : ''}`} type="button" onClick={() => toggleFavorite(card)} aria-pressed={favorite}><HeartIcon filled={favorite} />{favorite ? '已经喂给页芽' : '喂给页芽'}</button>
      <Link className="primary-action" href={href} onClick={remember}>读完大家的观点 <ArrowIcon /></Link>
    </div>
  </article>
}
