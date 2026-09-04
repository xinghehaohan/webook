'use client'

import { useCallback, useEffect, useState } from 'react'
import { SourceBadge } from '@/components/source-badge'
import { loadConnection, loadShelf } from '@/lib/content/repository'
import type { ConnectionState, ShelfSnapshot } from '@/lib/content/types'
import { useReaderStore } from '@/state/reader-store'
import { BookCard } from './book-card'
import { DiscoverPanel } from './discover-panel'

export function LibraryScreen({ initialView = 'shelf' }: { initialView?: 'shelf' | 'discover' }) {
  const [view, setView] = useState<'shelf' | 'discover'>(initialView)
  const [shelf, setShelf] = useState<ShelfSnapshot>()
  const [connection, setConnection] = useState<ConnectionState>()
  const [message, setMessage] = useState<string>()
  const setNamespace = useReaderStore((state) => state.setNamespace)
  const load = useCallback(() => {
    const controller = new AbortController()
    void loadConnection(controller.signal).then(async (status) => { setConnection(status); setNamespace(status.namespace); setShelf(await loadShelf(status, controller.signal)) }).catch((error: unknown) => { if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : '书架暂时没有同步成功。') })
    return () => controller.abort()
  }, [setNamespace])
  useEffect(load, [load])
  const books = [...(shelf?.books ?? [])].sort((a, b) => Number(a.finishReading) - Number(b.finishReading) || (b.readUpdateTime ?? 0) - (a.readUpdateTime ?? 0))
  return <div className="standard-screen library-page">
    <header className="standard-header"><div><span className="eyebrow">LIBRARY</span><h1>我的书架</h1><p>你读过的书，会继续在这里发芽。</p></div>{shelf && <SourceBadge source={shelf.source} />}</header>
    <div className="segmented"><button className={view === 'shelf' ? 'active' : ''} onClick={() => setView('shelf')}>读过 · {shelf?.total ?? '—'}</button><button className={view === 'discover' ? 'active' : ''} onClick={() => setView('discover')}>发现新书</button></div>
    {message && <div className="gentle-error"><span>{message}</span><button onClick={load}>重试</button></div>}
    {view === 'shelf' && !shelf && !message && <div className="margin-skeleton"><span /><span /><span /></div>}
    {view === 'shelf' && shelf ? <>
      <div className="shelf-summary"><div><b>{shelf.books.length}</b><span>电子书</span></div><div><b>{shelf.albums.length}</b><span>听书</span></div><div><b>{shelf.hasArticleCollection ? 1 : 0}</b><span>文章收藏</span></div></div>
      <div className="book-list">{books.map((book, index) => <BookCard key={book.bookId} book={book} index={index} />)}</div>
      {shelf.albums.length > 0 && <section className="audio-strip"><span>♫</span><div><b>{shelf.albums[0].name}</b><small>{shelf.albums[0].author || '微信听书'} · 有声内容不进入公开标注流</small></div></section>}
    </> : view === 'discover' ? <DiscoverPanel connection={connection} /> : null}
  </div>
}
