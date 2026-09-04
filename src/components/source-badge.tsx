import type { SourceMode } from '@/lib/content/types'

export function SourceBadge({ source }: { source: SourceMode }) {
  const label = source === 'demo' ? '示例数据' : source === 'cached' ? '离线缓存' : '微信读书实时'
  return <span className={`source-badge ${source}`}>{label}</span>
}
