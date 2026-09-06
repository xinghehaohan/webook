'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { loadConnection } from '@/lib/content/repository'
import { formatDate } from '@/lib/content/format'
import { idbGet, idbSet } from '@/state/indexed-db'
import { useReaderStore } from '@/state/reader-store'

type MoodId = 'stormy' | 'blue' | 'quiet' | 'warm' | 'sparkling'
type ReflectionEntry = {
  id: string
  createdAt: number
  mood: MoodId
  causes: string[]
  note: string
  quote?: { bookTitle: string; markText: string }
}

const MOODS: Array<{ id: MoodId; label: string; face: string; color: string; speech: string }> = [
  { id: 'stormy', label: '有点难', face: '⌢', color: '#9b8bd9', speech: '辛苦了。我们只写一点点，也算在照顾自己。' },
  { id: 'blue', label: '低落', face: '︵', color: '#73bde8', speech: '我会安静地听，不需要把一切都想明白。' },
  { id: 'quiet', label: '平静', face: '—', color: '#ffd98a', speech: '平静也是一种抵达。想把哪一刻留住？' },
  { id: 'warm', label: '不错', face: '◡', color: '#ff9f74', speech: '我看见你心里亮了一点，告诉我发生了什么吧。' },
  { id: 'sparkling', label: '闪闪发光', face: 'ᴗ', color: '#ffca43', speech: '太好啦！把这束光写下来，以后还能回来抱抱它。' },
]

const QUICK_CAUSES = [
  ['🫶', '自己'], ['💞', '亲密关系'], ['🐣', '朋友'], ['🏡', '家人'],
  ['📚', '阅读学习'], ['💼', '工作'], ['🌿', '身体'], ['🍵', '休息'],
] as const

const MORE_CAUSES = [
  { title: '人与联结', items: [['❤️', '伴侣'], ['🐥', '朋友'], ['🏡', '家人'], ['🐾', '宠物'], ['🏘️', '社区'], ['🌱', '只关于我']] },
  { title: '正在发生', items: [['💼', '工作'], ['📚', '学习'], ['👟', '运动'], ['🍵', '放松'], ['🎨', '爱好'], ['✈️', '旅行'], ['📱', '刷手机'], ['🍜', '吃东西']] },
  { title: '身体与环境', items: [['🌿', '健康'], ['💤', '睡眠'], ['🏠', '室内'], ['🌳', '户外'], ['🔊', '吵闹'], ['🌙', '安静'], ['🌤️', '天气']] },
] as const

const PROMPTS: Record<MoodId, string> = {
  stormy: '不用解释全部。现在最重的那一小块，是什么？',
  blue: '如果这份低落会说话，它最想让你知道什么？',
  quiet: '今天有什么细小的瞬间，值得被慢慢记住？',
  warm: '哪件事让你感到被照顾、被理解，或更像自己？',
  sparkling: '这份快乐从哪里来？写给未来可能忘记它的你。',
}

const RESPONSES: Record<MoodId, string> = {
  stormy: '你没有绕开自己的感受，这已经很勇敢。今晚不必解决一切。',
  blue: '谢谢你把它交给这张心页。难过被看见时，就不再只能独自待着。',
  quiet: '你为平凡的一刻留了位置。许多长久的幸福，就是这样被保存下来的。',
  warm: '原来今天的光落在这里。愿你以后还能循着这句话，再次找到它。',
  sparkling: '我替你把这一刻夹进书里了。快乐不需要缩小，它值得占满一整页。',
}

export function ReflectionScreen() {
  const namespace = useReaderStore((state) => state.namespace)
  const setNamespace = useReaderStore((state) => state.setNamespace)
  const lastExplored = useReaderStore((state) => state.lastExploredCard)
  const [mood, setMood] = useState<MoodId>()
  const [causes, setCauses] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [includeQuote, setIncludeQuote] = useState(true)
  const [showMore, setShowMore] = useState(false)
  const [savedAt, setSavedAt] = useState<number>()
  const [now] = useState(() => Date.now())
  const [entries, setEntries] = useState<ReflectionEntry[]>([])

  useEffect(() => {
    const controller = new AbortController()
    void loadConnection(controller.signal).then((status) => setNamespace(status.namespace)).catch(() => undefined)
    return () => controller.abort()
  }, [setNamespace])

  useEffect(() => {
    let active = true
    void idbGet<ReflectionEntry[]>('meta', `${namespace}:reflections`).then((value) => { if (active) setEntries(value ?? []) })
    return () => { active = false }
  }, [namespace])

  const selectedMood = MOODS.find((item) => item.id === mood)
  const weekCount = useMemo(() => entries.filter((entry) => now - entry.createdAt < 7 * 86400000).length, [entries, now])

  const toggleCause = (value: string) => setCauses((current) => current.includes(value) ? current.filter((item) => item !== value) : current.length < 3 ? [...current, value] : [...current.slice(1), value])

  const save = async () => {
    if (!mood) return
    const entry: ReflectionEntry = {
      id: crypto.randomUUID(), createdAt: Date.now(), mood, causes, note: note.trim(),
      quote: includeQuote && lastExplored ? { bookTitle: lastExplored.book.title, markText: lastExplored.markText } : undefined,
    }
    const next = [entry, ...entries].slice(0, 90)
    setEntries(next); setSavedAt(entry.createdAt)
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
    await idbSet('meta', `${namespace}:reflections`, next)
  }

  const reset = () => { setMood(undefined); setCauses([]); setNote(''); setSavedAt(undefined); setIncludeQuote(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  if (savedAt && selectedMood) return <div className="reflection-page reflection-complete">
    <div className="reflection-glow glow-one" /><div className="reflection-glow glow-two" />
    <header className="reflection-mini-header"><span>HEART PAGE</span><b>今天的心页</b></header>
    <section className="complete-scene">
      <div className="complete-stars">✦ <i>✧</i> ✦</div>
      <Image className="reflection-girl complete-girl" src="/mascot/reflection-girl.png" alt="拿着心记本微笑的阅读女孩" width={310} height={310} priority />
      <div className="complete-bubble">我替你收好了。<br />以后想回来时，它会一直在。</div>
    </section>
    <section className="saved-heart-page" style={{ '--mood-color': selectedMood.color } as React.CSSProperties}>
      <div className="saved-heart-meta"><span>{selectedMood.face}</span><div><b>{selectedMood.label}</b><small>{new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(savedAt)}</small></div></div>
      {causes.length > 0 && <div className="saved-tags">{causes.map((cause) => <span key={cause}>{cause}</span>)}</div>}
      {note.trim() && <blockquote>“{note.trim()}”</blockquote>}
      {includeQuote && lastExplored && <div className="saved-book-thread"><span>这份心情连接着</span><b>《{lastExplored.book.title}》</b><p>{lastExplored.markText}</p></div>}
      <p className="companion-response">{RESPONSES[selectedMood.id]}</p>
    </section>
    <button className="reflection-primary" type="button" onClick={reset}>再写一张心页</button>
  </div>

  return <div className="reflection-page">
    <div className="reflection-glow glow-one" /><div className="reflection-glow glow-two" />
    <header className="reflection-header"><div><span>REFLECTING</span><h1>和自己坐一会儿</h1><p>{weekCount ? `这周你已经回来 ${weekCount} 次了` : '不用写得正确，只要写得像你'}</p></div><div className="tiny-streak"><b>{entries.length}</b><span>心页</span></div></header>

    <section className="companion-scene">
      <Image className="reflection-girl" src="/mascot/reflection-girl.png" alt="拿着心记本陪伴记录的阅读女孩" width={270} height={270} priority />
      <div className="companion-bubble">{selectedMood?.speech ?? '我在这里。\n今天的你，是什么天气？'}</div>
      <span className="floating-leaf leaf-one">❋</span><span className="floating-leaf leaf-two">◆</span>
    </section>

    <section className="reflection-sheet">
      <div className="reflection-section-title"><span>01</span><div><h2>此刻，心里是什么天气？</h2><p>先选最接近的，不需要百分之百准确。</p></div></div>
      <div className="mood-row">{MOODS.map((item) => <button key={item.id} type="button" className={mood === item.id ? 'active' : ''} onClick={() => setMood(item.id)} aria-pressed={mood === item.id}><span className="mood-face" style={{ '--face-color': item.color } as React.CSSProperties}><i>•</i><i>•</i><b>{item.face}</b></span><small>{item.label}</small></button>)}</div>

      <div className="reflection-section-title second"><span>02</span><div><h2>是什么碰到了你？</h2><p>最多选三项，帮未来的你看见生活的纹理。</p></div></div>
      <div className="cause-grid">{QUICK_CAUSES.map(([emoji, label]) => <button key={label} type="button" className={causes.includes(label) ? 'active' : ''} onClick={() => toggleCause(label)}><span>{emoji}</span>{label}</button>)}<button className="more-cause" type="button" onClick={() => setShowMore(true)}><span>＋</span>更多…</button></div>

      <div className="reflection-section-title second"><span>03</span><div><h2>{mood ? PROMPTS[mood] : '想留下一句话吗？'}</h2><p>一行也好。你不需要把故事讲完整。</p></div></div>
      <div className="reflection-writing"><textarea value={note} onChange={(event) => setNote(event.target.value.slice(0, 600))} placeholder="写下刚刚浮上来的那句话…" rows={6} /><span>{note.length}/600</span></div>

      {lastExplored && <button type="button" className={`quote-thread${includeQuote ? ' active' : ''}`} onClick={() => setIncludeQuote((value) => !value)} aria-pressed={includeQuote}><span className="thread-check">{includeQuote ? '✓' : '+'}</span><div><small>把阅读也带进这张心页</small><b>《{lastExplored.book.title}》</b><p>“{lastExplored.markText}”</p></div></button>}

      <button className="reflection-primary" type="button" onClick={() => void save()} disabled={!mood}>{mood ? '把这一刻收好' : '先告诉我此刻的心情'}</button>
      <p className="reflection-privacy">只保存在这台设备。这里是你和自己的小房间。</p>
    </section>

    {entries.length > 0 && <section className="heart-history"><header><div><span>MY HEART PAGES</span><h2>最近留下的心页</h2></div><b>{entries.length}</b></header><div>{entries.slice(0, 5).map((entry) => { const item = MOODS.find((value) => value.id === entry.mood)!; return <article key={entry.id}><span className="history-mood" style={{ background: item.color }}>{item.face}</span><div><b>{entry.note || RESPONSES[entry.mood]}</b><small>{formatDate(Math.floor(entry.createdAt / 1000))} · {entry.causes.join('、') || '只关于我'}</small></div>{entry.quote && <i>书</i>}</article> })}</div></section>}

    {showMore && <div className="cause-overlay" role="dialog" aria-modal="true" aria-label="更多触发点"><button className="cause-backdrop" type="button" aria-label="关闭" onClick={() => setShowMore(false)} /><section className="cause-sheet"><header><button type="button" onClick={() => setShowMore(false)}>×</button><div><span>WHAT TOUCHED YOU?</span><h2>是什么碰到了你？</h2></div><b>{causes.length}/3</b></header><div className="cause-scroll">{MORE_CAUSES.map((group) => <section key={group.title}><h3>{group.title}</h3><div className="cause-grid expanded">{group.items.map(([emoji, label]) => <button key={label} type="button" className={causes.includes(label) ? 'active' : ''} onClick={() => toggleCause(label)}><span>{emoji}</span>{label}</button>)}</div></section>)}</div><button className="reflection-primary" type="button" onClick={() => setShowMore(false)}>带着这些回来</button></section></div>}
  </div>
}
