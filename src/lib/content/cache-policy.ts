export const CACHE_POLICY = {
  shelfTtlMs: 15 * 60 * 1000,
  highlightsTtlMs: 24 * 60 * 60 * 1000,
  opinionsTtlMs: 6 * 60 * 60 * 1000,
  staleAfterMs: 14 * 24 * 60 * 60 * 1000,
  maxBooks: 40,
  maxCards: 400,
} as const
