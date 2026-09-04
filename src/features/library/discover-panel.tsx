'use client'

import { useEffect, useRef, useState } from 'react'
import { callAction } from '@/lib/content/client'
import { DEMO_BOOKS } from '@/lib/content/demo'
import type { BookSummary, ConnectionState } from '@/lib/content/types'
import { SearchIcon } from '@/components/ui/icons'
import { BookCard } from './book-card'

type DiscoveryResult = { books: BookSummary[]; hasMore: boolean; nextMaxIdx: number }

export function DiscoverPanel({ connection }: { connection?: ConnectionState }) {
  const [keyword, setKeyword] = useState('')
  const [books, setBooks] = useState<BookSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('根据你的阅读痕迹，发现下一本书。')
  const [cursor, setCursor] = useState({ hasMore: false, maxIdx: 0 })
  const [mode, setMode] = useState<'recommend' | 'search'>('recommend')
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController(); controllerRef.current = controller
    if (!connection) return () => controller.abort()
    if (!connection.configured) {
      void Promise.resolve().then(() => { if (!controller.signal.aborted) { setBooks(DEMO_BOOKS.slice(0, 3)); setMessage('示例推荐：连接后会依据你的真实阅读痕迹更新。') } })
      return () => controller.abort()
    }
    void Promise.resolve().then(() => { if (!controller.signal.aborted) setLoading(true) })
    void callAction<DiscoveryResult>('recommend', { count: 12, maxIdx: 0 }, controller.signal)
      .then((result) => { setBooks(result.books); setCursor({ hasMore: result.hasMore, maxIdx: result.nextMaxIdx }); setMessage('页芽根据你的阅读痕迹挑了这些书。') })
      .catch((error: unknown) => { if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : '推荐暂时不可用。') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [connection])

  const search = async (event: React.FormEvent) => {
    event.preventDefault(); if (!keyword.trim()) return
    controllerRef.current?.abort(); const controller = new AbortController(); controllerRef.current = controller
    if (!connection?.configured) { setBooks(DEMO_BOOKS.filter((book) => `${book.title}${book.author}`.includes(keyword.trim()))); setMessage('示例搜索结果'); setMode('search'); return }
    setLoading(true); setMode('search')
    try {
      const result = await callAction<DiscoveryResult>('search', { keyword: keyword.trim(), maxIdx: 0 }, controller.signal)
      setBooks(result.books); setCursor({ hasMore: result.hasMore, maxIdx: result.nextMaxIdx }); setMessage(result.books.length ? `为你找到与“${keyword.trim()}”相关的书` : '换个更简短的关键词试试。')
    } catch (error) { if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : '搜索暂时不可用。') }
    finally { if (!controller.signal.aborted) setLoading(false) }
  }

  const loadMore = async () => {
    if (!connection?.configured || loading || !cursor.hasMore) return
    const controller = new AbortController(); controllerRef.current = controller; setLoading(true)
    try {
      const action = mode === 'search' ? 'search' : 'recommend'
      const payload = mode === 'search' ? { keyword: keyword.trim(), maxIdx: cursor.maxIdx } : { count: 12, maxIdx: cursor.maxIdx }
      const result = await callAction<DiscoveryResult>(action, payload, controller.signal)
      const additions = result.books.filter((book) => !books.some((existing) => existing.bookId === book.bookId))
      setBooks((current) => [...current, ...additions])
      const advanced = result.nextMaxIdx !== cursor.maxIdx && additions.length > 0
      setCursor({ hasMore: result.hasMore && advanced, maxIdx: result.nextMaxIdx })
      if (!advanced) setMessage('已经翻到这一批推荐的尽头了。')
    } catch (error) { if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : '没有加载到更多书。') }
    finally { if (!controller.signal.aborted) setLoading(false) }
  }

  return <div className="discover-panel">
    <form className="search-box" onSubmit={search}><SearchIcon /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜书名、作者…" aria-label="搜索电子书" /><button type="submit">{loading ? '寻找中' : '搜索'}</button></form>
    <div className="discover-message">{message}</div>
    <div className="compact-book-list">{books.map((book, index) => <BookCard key={book.bookId} book={book} index={index} fromDiscover />)}</div>
    {cursor.hasMore && <button className="load-more" type="button" onClick={loadMore} disabled={loading}>{loading ? '页芽正在找…' : '再发现一些书'}</button>}
    <a className="external-source" href="https://z-lib.sk/" target="_blank" rel="noopener noreferrer"><div><span>外部书源</span><h3>Z-Library ↗</h3><p>去外部站点继续寻找延伸书目。页边不会代理或托管其内容。</p></div><span className="external-star">✦</span></a>
  </div>
}
