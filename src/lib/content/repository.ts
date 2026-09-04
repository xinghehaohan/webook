'use client'

import { DEMO_MARGINS, DEMO_SHELF } from './demo'
import { callAction, getConnection } from './client'
import { mapLimit, mergeCandidateBooks } from './candidates'
import { CACHE_POLICY } from './cache-policy'
import { idbGet, idbSet } from '@/state/indexed-db'
import type { BookSummary, ConnectionState, MarginCard, ShelfSnapshot } from './types'

type HighlightsPayload = { cards: MarginCard[] }
type OpinionGroup = { range: string; totalCount: number; opinions: MarginCard['opinions']; hasMore?: boolean; maxIdx?: number; synckey?: number }
type OpinionsPayload = { groups: OpinionGroup[] }
type CacheEnvelope<T> = { value: T; savedAt: number; lastAccessed: number }
type HistoryIndex = { books: BookSummary[]; lastSynced: number }

async function cached<T>(namespace: string, key: string, ttlMs: number, allowStale = false): Promise<T | undefined> {
  const envelope = await idbGet<CacheEnvelope<T>>('content', `${namespace}:${key}`)
  if (!envelope || typeof envelope.savedAt !== 'number' || !('value' in envelope)) return undefined
  const age = Date.now() - envelope.savedAt
  if ((!allowStale && age > ttlMs) || age > CACHE_POLICY.staleAfterMs) return undefined
  envelope.lastAccessed = Date.now()
  void idbSet('content', `${namespace}:${key}`, envelope)
  return envelope.value
}

async function remember<T>(namespace: string, key: string, value: T) {
  const now = Date.now()
  await idbSet('content', `${namespace}:${key}`, { value, savedAt: now, lastAccessed: now } satisfies CacheEnvelope<T>)
}

export async function loadConnection(signal?: AbortSignal): Promise<ConnectionState> {
  try {
    const connection = await getConnection(signal)
    localStorage.setItem('pagesprout:last-namespace', connection.namespace)
    return connection
  } catch (error) {
    const namespace = localStorage.getItem('pagesprout:last-namespace')
    if (typeof navigator !== 'undefined' && !navigator.onLine && namespace) {
      return { configured: true, authenticated: true, requiresAccessToken: false, namespace }
    }
    throw error
  }
}

export async function loadShelf(connection: ConnectionState, signal?: AbortSignal, force = false): Promise<ShelfSnapshot> {
  if (!connection.configured) return DEMO_SHELF
  if (!force) {
    const fresh = await cached<ShelfSnapshot>(connection.namespace, 'shelf', CACHE_POLICY.shelfTtlMs)
    if (fresh) return { ...fresh, source: 'cached' }
  }
  try {
    const shelf = await callAction<ShelfSnapshot>('shelf', {}, signal)
    await remember(connection.namespace, 'shelf', shelf)
    await updateHistory(connection.namespace, shelf.books)
    return shelf
  } catch (error) {
    const previous = await cached<ShelfSnapshot>(connection.namespace, 'shelf', CACHE_POLICY.shelfTtlMs, true)
    if (previous) return { ...previous, source: 'cached' }
    throw error
  }
}

async function getHistory(namespace: string): Promise<HistoryIndex> {
  const stored = await idbGet<HistoryIndex | BookSummary[]>('meta', `${namespace}:history-list`)
  if (Array.isArray(stored)) return { books: stored, lastSynced: 0 }
  return stored ?? { books: [], lastSynced: 0 }
}

async function updateHistory(namespace: string, books: BookSummary[]) {
  const current = await getHistory(namespace)
  const lastSynced = Math.floor(Date.now() / 1000)
  const merged = mergeCandidateBooks(books, current.books).slice(0, CACHE_POLICY.maxBooks).map((book) => ({ ...book, lastSynced }))
  await idbSet('meta', `${namespace}:history-list`, { books: merged, lastSynced } satisfies HistoryIndex)
}

async function requestOpinionGroups(cards: MarginCard[], signal?: AbortSignal): Promise<MarginCard[]> {
  const grouped = new Map<string, MarginCard[]>()
  for (const card of cards) {
    const key = `${card.book.bookId}:${card.chapterUid}`
    grouped.set(key, [...(grouped.get(key) ?? []), card])
  }
  const batches = await mapLimit([...grouped.values()], 2, async (batch) => {
    try {
      const result = await callAction<OpinionsPayload>('opinions', {
        bookId: batch[0].book.bookId,
        chapterUid: batch[0].chapterUid,
        reviews: batch.map((card) => ({ range: card.range, count: 1, maxIdx: 0, synckey: 0 })),
      }, signal)
      return batch.map((card) => {
        const group = result.groups.find((item) => item.range === card.range)
        return group
          ? { ...card, opinions: group.opinions, opinionCount: group.totalCount, opinionStatus: 'loaded' as const }
          : { ...card, opinionStatus: 'error' as const }
      })
    } catch {
      return batch.map((card) => ({ ...card, opinionStatus: 'error' as const }))
    }
  })
  return batches.flat()
}

async function findDailyCard(cards: MarginCard[], signal?: AbortSignal): Promise<MarginCard[]> {
  let firstResolved: MarginCard | undefined
  for (const card of cards.slice(0, 6)) {
    const [resolved] = await requestOpinionGroups([card], signal)
    if (resolved.opinionStatus === 'loaded') firstResolved ??= resolved
    if (resolved.opinionStatus === 'loaded' && resolved.opinionCount > 0 && resolved.opinions.length > 0) return [resolved]
  }
  return firstResolved ? [firstResolved] : []
}

export async function loadMarginCards(connection: ConnectionState, signal?: AbortSignal, mode: 'today' | 'stream' = 'stream', force = false): Promise<MarginCard[]> {
  if (!connection.configured) return mode === 'today' ? DEMO_MARGINS.slice(0, 1) : DEMO_MARGINS
  const cacheKey = mode === 'today' ? 'today-margin' : 'margins'
  if (!force) {
    const fresh = await cached<MarginCard[]>(connection.namespace, cacheKey, CACHE_POLICY.opinionsTtlMs)
    if (fresh?.length) return fresh.map((card) => ({ ...card, source: 'cached' }))
  }
  try {
    const shelf = await loadShelf(connection, signal, force)
    const history = await getHistory(connection.namespace)
    const candidates = mergeCandidateBooks(shelf.books, history.books).slice(0, 8)
    const progressed = await mapLimit(candidates, 2, async (book) => {
      try {
        const value = await callAction<{ progress: number }>('progress', { bookId: book.bookId }, signal)
        return { ...book, progress: value.progress }
      } catch { return undefined }
    })
    const eligible = progressed.filter((book): book is NonNullable<typeof book> => Boolean(book && book.progress !== 0))
    const batches = await mapLimit(eligible, 2, async (book) => {
      try {
        const value = await callAction<HighlightsPayload>('highlights', { bookId: book.bookId }, signal)
        return value.cards.map((card) => ({ ...card, book: { ...card.book, ...book }, source: 'live' as const }))
      } catch { return [] }
    })
    const rawCards = batches.flat().slice(0, mode === 'today' ? 6 : 12)
    const cards = mode === 'today' ? await findDailyCard(rawCards, signal) : await requestOpinionGroups(rawCards, signal)
    if (cards.length) await remember(connection.namespace, cacheKey, cards.slice(0, CACHE_POLICY.maxCards))
    return cards
  } catch (error) {
    const previous = await cached<MarginCard[]>(connection.namespace, cacheKey, CACHE_POLICY.opinionsTtlMs, true)
    if (previous?.length) return previous.map((card) => ({ ...card, source: 'cached' }))
    throw error
  }
}

export async function loadOpinions(card: MarginCard, signal?: AbortSignal) {
  if (card.source === 'demo') return card.opinions
  const result = await callAction<OpinionsPayload>('opinions', {
    bookId: card.book.bookId,
    chapterUid: card.chapterUid,
    reviews: [{ range: card.range, count: 20, maxIdx: 0, synckey: 0 }],
  }, signal)
  return result.groups.find((item) => item.range === card.range)?.opinions ?? []
}
