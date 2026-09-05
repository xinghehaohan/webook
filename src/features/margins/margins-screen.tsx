'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { RefreshIcon } from '@/components/ui/icons'
import { formatDate } from '@/lib/content/format'
import { callAction } from '@/lib/content/client'
import { loadBookEchoes, loadBookPopular, loadConnection, loadMarginCandidates, loadPersonalResonance } from '@/lib/content/repository'
import type { BookEcho, ConnectionState, MarginCandidate, MarginCard as MarginCardType } from '@/lib/content/types'
import { useReaderStore } from '@/state/reader-store'
import { MarginCard } from './margin-card'
import { MarginSkeleton } from './margin-skeleton'

type Chapter = { chapterUid: number; chapterIdx: number; title: string; level: number }
type LayerMessage = Partial<Record<'resonance' | 'popular' | 'chapters' | 'echoes', string>>

export function MarginsScreen() {
  const searchParams = useSearchParams()
  const [connection, setConnection] = useState<ConnectionState>()
  const [candidates, setCandidates] = useState<MarginCandidate[]>([])
  const [focus, setFocus] = useState<MarginCandidate>()
  const [resonance, setResonance] = useState<MarginCardType[]>([])
  const [popular, setPopular] = useState<MarginCardType[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [chapterCards, setChapterCards] = useState<MarginCardType[]>([])
  const [selectedChapter, setSelectedChapter] = useState<number>()
  const [echoes, setEchoes] = useState<BookEcho[]>([])
  const [depth, setDepth] = useState(2)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string>()
  const [layerMessages, setLayerMessages] = useState<LayerMessage>({})
  const resumeHandled = useRef(false)
  const lastExplored = useReaderStore((state) => state.lastExploredCard)
  const setNamespace = useReaderStore((state) => state.setNamespace)

  const loadSources = useCallback(async (controller: AbortController, force = false) => {
    setLoading(true)
    setMessage(undefined)
    try {
      const status = await loadConnection(controller.signal)
      setNamespace(status.namespace)
      if (!status.authenticated && status.requiresAccessToken) throw new Error('请先在“我的”中解锁页边。')
      const discovered = await loadMarginCandidates(status, controller.signal)
      const rememberedBook: MarginCandidate | undefined = lastExplored && !discovered.some((book) => book.bookId === lastExplored.book.bookId)
        ? { ...lastExplored.book, sourceLabel: '最近读过' }
        : undefined
      const next = rememberedBook ? [rememberedBook, ...discovered] : discovered
      if (force) resumeHandled.current = false
      setConnection(status)
      setCandidates(next)
      setFocus((current) => {
        if (current && !force && next.some((book) => book.bookId === current.bookId)) return current
        const remembered = lastExplored && next.find((book) => book.bookId === lastExplored.book.bookId)
        return remembered ?? next[0]
      })
      if (!next.length) setMessage('还没有找到可探索的书。先在微信读书打开几本，矿脉就会出现。')
    } catch (error) {
      if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : '暂时无法打开页边。')
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [lastExplored, setNamespace])

  useEffect(() => {
    const controller = new AbortController()
    void loadSources(controller)
    return () => controller.abort()
  }, [loadSources])

  useEffect(() => {
    if (!focus || !connection) return
    const controller = new AbortController()
    setResonance([]); setPopular([]); setChapters([]); setChapterCards([]); setEchoes([]); setSelectedChapter(undefined); setDepth(2); setLayerMessages({})
    void loadPersonalResonance(connection, focus, controller.signal)
      .then(setResonance)
      .catch((error: unknown) => { if (!controller.signal.aborted) setLayerMessages((value) => ({ ...value, resonance: error instanceof Error ? error.message : '你的划线暂时没有浮上来。' })) })
    void loadBookPopular(connection, focus, controller.signal)
      .then(setPopular)
      .catch((error: unknown) => { if (!controller.signal.aborted) setLayerMessages((value) => ({ ...value, popular: error instanceof Error ? error.message : '热门地层暂时没有响应。' })) })
    if (connection.configured) {
      void callAction<{ chapters: Chapter[] }>('chapters', { bookId: focus.bookId }, controller.signal)
        .then((value) => setChapters(value.chapters.filter((chapter) => chapter.title).slice(0, 80)))
        .catch((error: unknown) => { if (!controller.signal.aborted) setLayerMessages((value) => ({ ...value, chapters: error instanceof Error ? error.message : '章节矿脉暂时没有显形。' })) })
      void loadBookEchoes(focus.bookId, controller.signal)
        .then(setEchoes)
        .catch((error: unknown) => { if (!controller.signal.aborted) setLayerMessages((value) => ({ ...value, echoes: error instanceof Error ? error.message : '整本回声暂时没有传来。' })) })
    }
    return () => controller.abort()
  }, [connection, focus])

  const resumeCard = useMemo(() => lastExplored?.book.bookId === focus?.bookId ? lastExplored : undefined, [focus?.bookId, lastExplored])
  const resumeId = searchParams.get('resume')
  useEffect(() => {
    if (!resumeId || resumeHandled.current || !focus || !resumeCard || resumeCard.id !== resumeId) return
    const frame = requestAnimationFrame(() => {
      document.getElementById(`margin-${encodeURIComponent(resumeId)}`)?.scrollIntoView({ block: 'center' })
      resumeHandled.current = true
    })
    return () => cancelAnimationFrame(frame)
  }, [focus, resumeCard, resumeId])

  const refresh = () => {
    const controller = new AbortController()
    void loadSources(controller, true)
  }

  const chooseChapter = async (chapterUid: number) => {
    if (!connection || !focus) return
    setSelectedChapter(chapterUid); setChapterCards([]); setDepth(3)
    try {
      setChapterCards(await loadBookPopular(connection, focus, undefined, chapterUid))
    } catch (error) {
      setLayerMessages((value) => ({ ...value, chapters: error instanceof Error ? error.message : '这一章暂时没有公开标注。' }))
    }
  }

  const nextLayer = depth === 2 ? '章节矿脉' : '整本回声'

  return <div className="standard-screen margins-page">
    <header className="standard-header"><div><span className="eyebrow">MARGIN OILFIELD</span><h1>页边漫游</h1><p>沿着一本书往下钻，看看同一句话长出了多少种人生。</p></div><button className="round-button" type="button" onClick={refresh} aria-label="刷新页边"><RefreshIcon /></button></header>
    {loading && <MarginSkeleton />}
    {message && <div className="gentle-error"><span>{message}</span><button type="button" onClick={refresh}>重试</button></div>}
    {focus && <>
      <section className="focus-vein">
        <div className="focus-cover">{focus.cover ? <Image src={focus.cover} alt="" width={62} height={84} unoptimized /> : <span>{focus.title.slice(0, 4)}</span>}</div>
        <div><span className="vein-label">正在勘探 · {focus.sourceLabel}</span><h2>《{focus.title}》</h2><p>{focus.author || '作者未显示'}{focus.readUpdateTime ? ` · ${formatDate(focus.readUpdateTime)} 最近读过` : ''}</p></div>
      </section>
      <div className="book-vein-picker" aria-label="切换勘探书籍">
        {candidates.slice(0, 16).map((book) => <button className={book.bookId === focus.bookId ? 'active' : ''} type="button" key={book.bookId} onClick={() => setFocus(book)}><b>{book.title}</b><span>{book.sourceLabel}</span></button>)}
      </div>

      {resumeCard && <section className="oil-layer resume-layer"><div className="oil-layer-title"><span>01 · 接上次的页边</span><h2>继续从这句话往下走</h2></div><MarginCard card={resumeCard} /></section>}

      <section className="oil-layer"><div className="oil-layer-title"><span>{resumeCard ? '02' : '01'} · 我的共鸣层</span><h2>我划过的句子，别人也想过吗？</h2><p>私人划线只在你的设备上配对；有公开讨论时，才把它放回原文旁。</p></div>
        {layerMessages.resonance && <p className="layer-empty">{layerMessages.resonance}</p>}
        {!layerMessages.resonance && resonance.length === 0 && <p className="layer-empty">这本书还没有你的划线，先保留这一层空白。</p>}
        <div className="margin-list">{resonance.slice(0, 8).map((card) => <MarginCard key={`mine-${card.id}`} card={card} />)}</div>
      </section>

      {depth >= 2 && <section className="oil-layer"><div className="oil-layer-title"><span>{resumeCard ? '03' : '02'} · 热门地层</span><h2>最多人停下来的原文</h2><p>先看集体注意力落在哪里，再进入那一小片真实讨论。</p></div>
        {layerMessages.popular && <p className="layer-empty">{layerMessages.popular}</p>}
        {!layerMessages.popular && popular.length === 0 && <p className="layer-empty">这里暂时没有公开热门标注。</p>}
        <div className="margin-list">{popular.slice(0, 12).map((card) => <MarginCard key={`popular-${card.id}`} card={card} />)}</div>
      </section>}

      {depth >= 3 && <section className="oil-layer"><div className="oil-layer-title"><span>{resumeCard ? '04' : '03'} · 章节矿脉</span><h2>选一章，继续定向钻探</h2><p>章节不是目录，而是一排可以下潜的入口。</p></div>
        {layerMessages.chapters && <p className="layer-empty">{layerMessages.chapters}</p>}
        <div className="chapter-veins">{chapters.map((chapter) => <button type="button" className={selectedChapter === chapter.chapterUid ? 'active' : ''} key={chapter.chapterUid} onClick={() => void chooseChapter(chapter.chapterUid)}>{chapter.title}</button>)}</div>
        {selectedChapter && chapterCards.length === 0 && !layerMessages.chapters && <p className="layer-empty">这一章没有公开热门标注，换一条矿脉看看。</p>}
        <div className="margin-list">{chapterCards.map((card) => <MarginCard key={`chapter-${card.id}`} card={card} />)}</div>
      </section>}

      {depth >= 4 && <section className="oil-layer"><div className="oil-layer-title"><span>{resumeCard ? '05' : '04'} · 整本回声</span><h2>读完以后，他们如何记住这本书</h2><p>从一句原文抬头，听见整本书留在别人生活里的声音。</p></div>
        {layerMessages.echoes && <p className="layer-empty">{layerMessages.echoes}</p>}
        {!layerMessages.echoes && echoes.length === 0 && <p className="layer-empty">这本书暂时没有公开书评。</p>}
        <div className="book-echoes">{echoes.map((echo) => <article key={echo.id}><header><b>{echo.author || '微信读书用户'}</b><span>{echo.star ? `${'★'.repeat(echo.star)}${'☆'.repeat(5 - echo.star)}` : echo.isFinish ? '读完' : '在读'}</span></header><p>{echo.content}</p>{echo.createdAt && <small>{formatDate(echo.createdAt)}</small>}</article>)}</div>
      </section>}

      {depth < 4 && <button className="drill-deeper" type="button" onClick={() => setDepth((value) => Math.min(4, value + 1))}><span>继续往下钻</span><b>下一层：{nextLayer}</b><i>↓</i></button>}
      {depth === 4 && <div className="drill-status"><span>✦</span><p><b>这一口井已经钻到底了</b>换一本书，会出现完全不同的地层。</p></div>}
    </>}
    {!loading && !focus && !message && <div className="empty-card"><span>🌱</span><h2>页芽还没找到矿脉</h2><p>在微信读书读几本或留下一条划线，再回来看看。</p></div>}
  </div>
}
