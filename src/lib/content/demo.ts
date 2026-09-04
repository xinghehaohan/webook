import type { BookSummary, MarginCard, ShelfSnapshot } from './types'

export const DEMO_BOOKS: BookSummary[] = [
  { bookId: 'demo-situated', title: '置身事内', author: '兰小欢', category: '经济学', progress: 100, finishReading: true, readUpdateTime: 1717545600 },
  { bookId: 'demo-courage', title: '被讨厌的勇气', author: '岸见一郎 / 古贺史健', category: '心理学', progress: 100, finishReading: true, readUpdateTime: 1715126400 },
  { bookId: 'demo-principles', title: '原则', author: '瑞·达利欧', category: '管理', progress: 68, readUpdateTime: 1712707200 },
  { bookId: 'demo-poor', title: '贫穷的本质', author: '阿比吉特·班纳吉 / 埃斯特·迪弗洛', category: '社会学', progress: 42, readUpdateTime: 1710028800 },
]

export const DEMO_MARGINS: MarginCard[] = [
  {
    id: 'demo-margin-1', bookmarkId: 'demo-bm-1', book: DEMO_BOOKS[0], chapterUid: 3, chapterTitle: '第三章 · 政府投融资与债务', range: '1920-1986',
    markText: '地方政府推动经济发展的模式，本质上是用未来的收益为今天的发展融资。', highlightCount: 1284, opinionCount: 47, fetchedAt: 1725408000, source: 'demo',
    opinions: [
      { id: 'demo-o-1', author: '林边的灯', content: '乐观时我们把它叫投资，悲观时才想起它也叫透支。', likes: 326 },
      { id: 'demo-o-2', author: '周一不上班', content: '关键不在借未来，而在谁有权决定未来收益如何分配。', likes: 189 },
    ],
  },
  {
    id: 'demo-margin-2', bookmarkId: 'demo-bm-2', book: DEMO_BOOKS[1], chapterUid: 7, chapterTitle: '一切烦恼都来自人际关系', range: '835-902',
    markText: '自由就是不再试图满足别人的期待，也不期待别人来满足自己。', highlightCount: 3821, opinionCount: 86, fetchedAt: 1725408000, source: 'demo',
    opinions: [
      { id: 'demo-o-3', author: '山雀与海', content: '不索取认可很自由，但不代表我们可以不承担关系。', likes: 512 },
      { id: 'demo-o-4', author: '透明岛屿', content: '真正难的不是不在意，而是分清哪些期待值得回应。', likes: 277 },
    ],
  },
  {
    id: 'demo-margin-3', bookmarkId: 'demo-bm-3', book: DEMO_BOOKS[2], chapterUid: 2, chapterTitle: '用五步流程实现人生愿望', range: '1208-1272',
    markText: '如果你不担心自己的形象，你就能更坦然地面对错误。', highlightCount: 988, opinionCount: 64, fetchedAt: 1725408000, source: 'demo',
    opinions: [
      { id: 'demo-o-5', author: '玻璃盐', content: '承认自己错了，比维护聪明的形象轻松得多。', likes: 201 },
      { id: 'demo-o-6', author: '顾城北', content: '在真实世界里，坦然承认错误的成本并不平等。', likes: 166 },
    ],
  },
  {
    id: 'demo-margin-4', bookmarkId: 'demo-bm-4', book: DEMO_BOOKS[3], chapterUid: 5, chapterTitle: '穷人真正需要什么', range: '640-715',
    markText: '贫穷不仅意味着缺少金钱，也意味着注意力被迫消耗在眼前的每一个选择上。', highlightCount: 2156, opinionCount: 32, fetchedAt: 1725408000, source: 'demo',
    opinions: [{ id: 'demo-o-7', author: '小岛来信', content: '选择太多是富人的自由，选择太急是穷人的日常。', likes: 421 }],
  },
]

export const DEMO_SHELF: ShelfSnapshot = {
  books: DEMO_BOOKS,
  albums: [{ albumId: 'demo-audio', name: '人类简史 · 听书', author: '尤瓦尔·赫拉利' }],
  hasArticleCollection: true,
  total: 6,
  fetchedAt: 1725408000,
  source: 'demo',
}
