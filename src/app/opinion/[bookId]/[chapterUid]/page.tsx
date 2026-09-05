import { OpinionSheet } from '@/features/margins/opinion-sheet'

export default async function OpinionPage({ params, searchParams }: { params: Promise<{ bookId: string; chapterUid: string }>; searchParams: Promise<{ range?: string; bookmarkId?: string; from?: string; cardId?: string }> }) {
  const route = await params
  const query = await searchParams
  return <OpinionSheet bookId={decodeURIComponent(route.bookId)} chapterUid={Number(route.chapterUid)} range={query.range ?? ''} bookmarkId={query.bookmarkId} from={query.from} cardId={query.cardId} />
}
