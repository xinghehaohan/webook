import { z } from 'zod'

const bookId = z.string().min(1).max(128)
const chapterUid = z.coerce.number().int().nonnegative()
const reviewRange = z.string().regex(/^\d+-\d+$/).max(64)

export const actionSchemas = {
  shelf: z.object({}),
  progress: z.object({ bookId }),
  highlights: z.object({ bookId, chapterUid: chapterUid.optional() }),
  opinions: z.object({
    bookId,
    chapterUid,
    reviews: z.array(z.object({
      range: reviewRange,
      count: z.coerce.number().int().min(1).max(20).default(20),
      maxIdx: z.coerce.number().int().nonnegative().default(0),
      synckey: z.coerce.number().int().nonnegative().default(0),
    })).min(1).max(20),
  }),
  chapters: z.object({ bookId }),
  book: z.object({ bookId }),
  notebooks: z.object({ count: z.coerce.number().int().min(1).max(20).default(20), lastSort: z.coerce.number().int().nonnegative().optional() }),
  readStats: z.object({}),
  personalHighlights: z.object({ bookId }),
  bookReviews: z.object({ bookId, reviewListType: z.coerce.number().int().min(0).max(4).default(0), count: z.coerce.number().int().min(1).max(20).default(12), maxIdx: z.coerce.number().int().nonnegative().default(0), synckey: z.coerce.number().int().nonnegative().default(0) }),
  recommend: z.object({ count: z.coerce.number().int().min(1).max(24).default(12), maxIdx: z.coerce.number().int().nonnegative().default(0) }),
  search: z.object({ keyword: z.string().trim().min(1).max(120), maxIdx: z.coerce.number().int().nonnegative().default(0) }),
} as const

export type ActionName = keyof typeof actionSchemas

export const API_NAMES: Record<ActionName, string> = {
  shelf: '/shelf/sync', progress: '/book/getprogress', highlights: '/book/bestbookmarks', opinions: '/book/readreviews',
  chapters: '/book/chapterinfo', book: '/book/info', recommend: '/book/recommend', search: '/store/search',
  notebooks: '/user/notebooks', readStats: '/readdata/detail', personalHighlights: '/book/bookmarklist', bookReviews: '/review/list',
}

export function gatewayPayload(action: ActionName, value: Record<string, unknown>) {
  if (action === 'highlights') return { ...value, chapterUid: value.chapterUid ?? 0, synckey: 0 }
  if (action === 'search') return { ...value, scope: 10 }
  if (action === 'readStats') return { mode: 'monthly' }
  return value
}
