'use client'

import { useState } from 'react'
import { useReaderStore } from '@/state/reader-store'

const lines = ['我找到一句，大家聊得很有意思！', '同一句话，换个人看就会发光。', '慢慢读，想法会自己长叶子。', '今天也只读一点点就好。']

export function PageSprout({ compact = false }: { compact?: boolean }) {
  const growth = useReaderStore((state) => state.growth)
  const reducedMotion = useReaderStore((state) => state.reducedMotion)
  const [line, setLine] = useState(0)
  const [waving, setWaving] = useState(false)
  const greet = () => {
    setLine((current) => (current + 1) % lines.length)
    setWaving(true)
    window.setTimeout(() => setWaving(false), 800)
  }
  return <div className={`sprout-stage${compact ? ' compact' : ''}`}>
    {!compact && <div className="cloud cloud-one" aria-hidden="true" />}
    {!compact && <div className="cloud cloud-two" aria-hidden="true" />}
    <button type="button" className={`page-sprout${waving && !reducedMotion ? ' waving' : ''}`} onClick={greet} aria-label="和页芽打招呼">
      <span className="sprout-leaf" /><span className="sprout-stem" />
      <span className="sprout-body"><i className="page-fold" /><i className="sprout-eye eye-left" /><i className="sprout-eye eye-right" /><i className="sprout-cheek cheek-left" /><i className="sprout-cheek cheek-right" /><i className="sprout-smile" /></span>
      <span className="sprout-arm arm-left" /><span className="sprout-arm arm-right" />
      {growth > 4 && <span className="knowledge-star">✦</span>}
    </button>
    {!compact && <div className="sprout-speech">{lines[line]}</div>}
    {!compact && <div className="meadow-hill" aria-hidden="true"><i>✿</i><i>✦</i><i>❀</i></div>}
  </div>
}
