import { LibraryScreen } from '@/features/library/library-screen'
export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams
  return <LibraryScreen initialView={view === 'discover' ? 'discover' : 'shelf'} />
}
