import type { BookSummary } from './types'

export function mergeCandidateBooks(shelf: BookSummary[], history: BookSummary[]): BookSummary[] {
  const merged = new Map<string, BookSummary>()
  for (const book of history) merged.set(book.bookId, book)
  for (const book of shelf) merged.set(book.bookId, { ...merged.get(book.bookId), ...book })
  return [...merged.values()]
    .filter((book) => book.progress !== 0)
    .sort((a, b) => (b.readUpdateTime ?? 0) - (a.readUpdateTime ?? 0))
}

export async function mapLimit<T, R>(items: T[], limit: number, mapper: (item: T) => Promise<R>): Promise<R[]> {
  const result = new Array<R>(items.length)
  let cursor = 0
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++
      result[index] = await mapper(items[index])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return result
}
