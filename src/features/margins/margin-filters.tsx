'use client'

export type MarginFilter = 'hot' | 'recent' | 'discussed' | 'saved'
const filters: Array<{ id: MarginFilter; label: string }> = [
  { id: 'hot', label: '最热' }, { id: 'recent', label: '最近读过' }, { id: 'discussed', label: '本页评论最多' }, { id: 'saved', label: '已收藏' },
]

export function MarginFilters({ value, onChange }: { value: MarginFilter; onChange: (value: MarginFilter) => void }) {
  return <div className="filter-row" role="group" aria-label="页边排序">{filters.map((filter) => <button key={filter.id} type="button" onClick={() => onChange(filter.id)} className={value === filter.id ? 'active' : ''}>{filter.label}</button>)}</div>
}
