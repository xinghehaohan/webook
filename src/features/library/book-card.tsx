/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { formatDate, formatProgress } from '@/lib/content/format'
import type { BookSummary } from '@/lib/content/types'
import { ArrowIcon } from '@/components/ui/icons'

export function BookCard({ book, index, fromDiscover = false }: { book: BookSummary; index: number; fromDiscover?: boolean }) {
  const colors = ['coral', 'green', 'violet', 'blue', 'yellow']
  return <Link href={`/library/${encodeURIComponent(book.bookId)}${fromDiscover ? '?from=discover' : ''}`} className="library-book">
    <div className={`book-cover ${colors[index % colors.length]}`}>{book.cover ? <img src={book.cover} alt="" /> : <span>{book.title.slice(0, 5)}</span>}</div>
    <div className="book-copy"><h3>{book.title}</h3><p>{book.author || '作者未显示'}</p><small>{formatProgress(book.progress)}{formatDate(book.readUpdateTime) ? ` · ${formatDate(book.readUpdateTime)}` : ''}</small></div>
    <ArrowIcon />
  </Link>
}
