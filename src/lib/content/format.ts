export function formatDate(timestamp?: number): string | undefined {
  if (!timestamp) return undefined
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date(timestamp * 1000))
    .replaceAll('/', '-')
}

export function compactNumber(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(value >= 100000 ? 0 : 1)}万`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return String(value)
}

export function formatProgress(value?: number): string {
  if (value === 100) return '已读完'
  if (typeof value === 'number' && value > 0) return `读到 ${value}%`
  return '在书架'
}

export function cleanText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim() : fallback
}
