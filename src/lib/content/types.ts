export type SourceMode = 'demo' | 'live' | 'cached'

export type BookSummary = {
  bookId: string
  title: string
  author?: string
  cover?: string
  category?: string
  deepLink?: string
  readUpdateTime?: number
  finishReading?: boolean
  progress?: number
  searchIdx?: number
  lastSynced?: number
}

export type ReaderOpinion = {
  id: string
  author?: string
  avatar?: string
  content: string
  createdAt?: number
  likes?: number
}

export type MarginCard = {
  id: string
  bookmarkId?: string
  book: BookSummary
  chapterUid: number
  chapterTitle?: string
  range: string
  markText: string
  highlightCount: number
  opinionCount: number
  opinions: ReaderOpinion[]
  opinionStatus?: 'idle' | 'loaded' | 'error'
  fetchedAt: number
  source: SourceMode
}

export type ShelfSnapshot = {
  books: BookSummary[]
  albums: Array<{ albumId: string; name: string; author?: string; cover?: string }>
  hasArticleCollection: boolean
  total: number
  fetchedAt: number
  source: SourceMode
}

export type ConnectionState = {
  configured: boolean
  authenticated: boolean
  requiresAccessToken: boolean
  namespace: string
  blocked?: string
}

export type ApiFailure = {
  ok: false
  code: string
  message: string
  retryable: boolean
}

export type ApiSuccess<T> = { ok: true; data: T }
export type ApiResult<T> = ApiSuccess<T> | ApiFailure
