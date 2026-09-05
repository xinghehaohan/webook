import { cleanText } from '@/lib/content/format'
import type { BookEcho, BookSummary, MarginCard, ReaderOpinion, ShelfSnapshot } from '@/lib/content/types'

type AnyMap = Record<string, unknown>
const map = (value: unknown): AnyMap => value && typeof value === 'object' ? value as AnyMap : {}
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : []
const string = (value: unknown): string | undefined => typeof value === 'string' && value ? value : undefined
const number = (value: unknown): number | undefined => typeof value === 'number' && Number.isFinite(value) ? value : undefined

function normalizeBook(value: unknown): BookSummary {
  const item = map(value)
  const info = Object.keys(map(item.bookInfo)).length ? map(item.bookInfo) : item
  return {
    bookId: String(info.bookId ?? item.bookId ?? ''), title: cleanText(info.title, '未命名书籍'), author: cleanText(info.author) || undefined,
    cover: string(info.cover), category: cleanText(info.category) || undefined, deepLink: string(info.deepLink),
    readUpdateTime: number(item.readUpdateTime), finishReading: item.finishReading === 1 || item.finishReading === true,
    searchIdx: number(item.searchIdx) ?? number(info.searchIdx),
  }
}

export function normalizeShelf(raw: unknown): ShelfSnapshot {
  const data = map(raw)
  const books = list(data.books).map(normalizeBook).filter((book) => book.bookId)
  const albums = list(data.albums).map((value) => {
    const root = map(value); const info = map(root.albumInfo)
    return { albumId: String(info.albumId ?? ''), name: cleanText(info.name, '未命名有声书'), author: cleanText(info.authorName) || undefined, cover: string(info.cover) }
  }).filter((album) => album.albumId)
  const hasArticleCollection = Boolean(data.mp && Object.keys(map(data.mp)).length)
  return { books, albums, hasArticleCollection, total: books.length + albums.length + (hasArticleCollection ? 1 : 0), fetchedAt: Math.floor(Date.now() / 1000), source: 'live' }
}

export function normalizeProgress(raw: unknown) {
  const book = map(map(raw).book)
  const progress = Math.max(0, Math.min(100, number(book.progress) ?? 0))
  return { progress, readingTime: number(book.recordReadingTime), updatedAt: number(book.updateTime) }
}

export function normalizeHighlights(raw: unknown, bookId: string): { cards: MarginCard[] } {
  const data = map(raw)
  const chapters = new Map(list(data.chapters).map((value) => { const chapter = map(value); return [number(chapter.chapterUid) ?? 0, cleanText(chapter.title)] }))
  const cards = list(data.items).slice(0, 20).map((value, index) => {
    const item = map(value); const chapterUid = number(item.chapterUid) ?? 0; const range = cleanText(item.range)
    return {
      id: cleanText(item.bookmarkId) || `${bookId}-${chapterUid}-${range || index}`,
      bookmarkId: cleanText(item.bookmarkId) || undefined,
      book: { bookId, title: '微信读书' }, chapterUid, chapterTitle: chapters.get(chapterUid) || undefined,
      range, alternateRanges: [cleanText(item.simplifiedRange), cleanText(item.traditionalRange)].filter(Boolean), markText: cleanText(item.markText), highlightCount: number(item.totalCount) ?? 0,
      opinionCount: 0, opinions: [], fetchedAt: Math.floor(Date.now() / 1000), source: 'live' as const,
    }
  }).filter((card) => card.range && card.markText)
  return { cards }
}

function normalizeOpinion(value: unknown, index: number): ReaderOpinion {
  const wrapper = map(value); const review = Object.keys(map(wrapper.review)).length ? map(wrapper.review) : wrapper
  const author = map(review.author)
  return { id: String(review.reviewId ?? wrapper.reviewId ?? index), author: cleanText(author.name) || undefined, avatar: string(author.avatar), content: cleanText(review.content), createdAt: number(review.createTime), likes: number(review.likeCount) }
}

export function normalizeOpinions(raw: unknown) {
  const data = map(raw)
  return { groups: list(data.reviews).map((value) => {
    const group = map(value)
    return {
      range: cleanText(group.range), totalCount: number(group.totalCount) ?? 0,
      hasMore: group.hasMore === 1, maxIdx: number(group.maxIdx) ?? 0, synckey: number(group.synckey) ?? 0,
      opinions: list(group.pageReviews).map(normalizeOpinion).filter((opinion) => opinion.content),
    }
  }).filter((group) => group.range) }
}

export function normalizeBookInfo(raw: unknown) { return normalizeBook(raw) }
export function normalizeChapters(raw: unknown) {
  return { chapters: list(map(raw).chapters).map((value) => { const item = map(value); return { chapterUid: number(item.chapterUid) ?? 0, chapterIdx: number(item.chapterIdx) ?? 0, title: cleanText(item.title), level: number(item.level) ?? 1 } }) }
}

export function normalizeNotebooks(raw: unknown) {
  const data = map(raw); const rows = list(data.books)
  const books = rows.map((value) => { const row = map(value); const normalized = normalizeBook(row.book); const sort = number(row.sort) ?? 0; return { ...normalized, readUpdateTime: normalized.readUpdateTime ?? sort, noteCount: (number(row.reviewCount) ?? 0) + (number(row.noteCount) ?? 0) + (number(row.bookmarkCount) ?? 0), sort } }).filter((book) => book.bookId)
  return { books, hasMore: data.hasMore === 1, lastSort: books.at(-1)?.sort ?? 0 }
}

export function normalizeReadStats(raw: unknown) {
  const books = list(map(raw).readLongest).flatMap((value) => { const row = map(value); const book = map(row.book); return Object.keys(book).length ? [{ ...normalizeBook(book), readTime: number(row.readTime) ?? 0 }] : [] }).filter((book) => book.bookId)
  return { books }
}

export function normalizePersonalHighlights(raw: unknown, bookId: string) {
  const data = map(raw); const chapters = new Map(list(data.chapters).map((value) => { const chapter = map(value); return [number(chapter.chapterUid) ?? 0, cleanText(chapter.title)] }))
  const book = { ...normalizeBook(data.book), bookId }
  const cards = list(data.updated).map((value, index) => { const item = map(value); const chapterUid = number(item.chapterUid) ?? 0; const range = cleanText(item.range); return { id: cleanText(item.bookmarkId) || `mine-${bookId}-${chapterUid}-${range || index}`, bookmarkId: cleanText(item.bookmarkId) || undefined, book, chapterUid, chapterTitle: chapters.get(chapterUid) || undefined, range, markText: cleanText(item.markText), highlightCount: 0, opinionCount: 0, opinions: [], opinionStatus: 'idle' as const, fetchedAt: Math.floor(Date.now() / 1000), source: 'live' as const } }).filter((card) => card.range && card.markText)
  return { cards }
}

export function normalizeBookReviews(raw: unknown) {
  const data = map(raw); const reviews: BookEcho[] = list(data.reviews).map((value, index) => { const entry = map(value); const wrapper = map(entry.review); const review = Object.keys(map(wrapper.review)).length ? map(wrapper.review) : wrapper; const author = map(review.author); const rawStar = number(review.star); return { id: String(review.reviewId ?? index), author: cleanText(author.name) || undefined, avatar: string(author.avatar), content: cleanText(review.content), createdAt: number(review.createTime), likes: number(review.likeCount), star: rawStar ? Math.round(rawStar / 20) : undefined, isFinish: review.isFinish === 1 || review.isFinish === true } }).filter((review) => review.content)
  return { reviews, totalCount: number(data.reviewsCnt) ?? reviews.length, hasMore: data.reviewsHasMore === 1, maxIdx: number(map(list(data.reviews).at(-1)).idx) ?? 0, synckey: number(data.synckey) ?? 0 }
}

export function normalizeDiscovery(raw: unknown) {
  const data = map(raw)
  const unpack = (value: unknown) => { const root = map(value); const book = normalizeBook(root.bookInfo ?? root.book ?? root); return { ...book, searchIdx: number(root.searchIdx) ?? book.searchIdx } }
  const grouped = list(data.results).flatMap((group) => list(map(group).books)).map(unpack)
  const recommended = list(data.books).map(unpack)
  const books = [...grouped, ...recommended].filter((book, index, items) => book.bookId && items.findIndex((other) => other.bookId === book.bookId) === index)
  return { books, hasMore: data.hasMore === 1, nextMaxIdx: books.at(-1)?.searchIdx ?? 0 }
}
