'use client'

import { useReaderStore } from '@/state/reader-store'

export function ReadingSettings() {
  const reducedMotion = useReaderStore((state) => state.reducedMotion)
  const setReducedMotion = useReaderStore((state) => state.setReducedMotion)
  const fontScale = useReaderStore((state) => state.fontScale)
  const setFontScale = useReaderStore((state) => state.setFontScale)
  return <section className="profile-card settings-card"><h2>阅读感觉</h2><div className="setting-row"><div><b>原文字号</b><span>让每一口思想更容易吸收</span></div><div className="size-toggle"><button onClick={() => setFontScale(Math.max(.9, fontScale - .1))}>A−</button><span>{Math.round(fontScale * 100)}%</span><button onClick={() => setFontScale(Math.min(1.3, fontScale + .1))}>A＋</button></div></div><label className="setting-row"><div><b>减少动态效果</b><span>关闭弹跳与庆祝动画</span></div><input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} /></label></section>
}
