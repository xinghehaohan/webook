'use client'

import { MarginCard } from '@/features/margins/margin-card'
import type { MarginCard as MarginCardType } from '@/lib/content/types'

export function DailyBite({ card, onNext, loading }: { card?: MarginCardType; onNext: () => void; loading?: boolean }) {
  return <section className="daily-section">
    <div className="section-title-row"><div><span className="section-kicker">TODAY&apos;S BITE</span><h2>一口思想</h2></div><button className="text-button" type="button" onClick={onNext} disabled={loading}>{loading ? '翻书中…' : '换一口 ↻'}</button></div>
    {card ? <MarginCard card={card} hero /> : <div className="margin-skeleton"><span /><span /><span /></div>}
  </section>
}
