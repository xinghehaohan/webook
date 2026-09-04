import { BookDetail } from '@/features/library/book-detail'

export default async function BookDetailPage({ params, searchParams }: { params: Promise<{ bookId: string }>; searchParams: Promise<{ from?: string }> }) {
  const { bookId } = await params
  const { from } = await searchParams
  return <BookDetail bookId={decodeURIComponent(bookId)} fromDiscover={from === 'discover'} />
}
