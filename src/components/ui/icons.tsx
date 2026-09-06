import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>
const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }

export function SunIcon(props: IconProps) { return <svg {...base} {...props}><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/></svg> }
export function MarginsIcon(props: IconProps) { return <svg {...base} {...props}><path d="M4 5.5h10a3 3 0 0 1 3 3V20H7a3 3 0 0 1-3-3z"/><path d="M7.5 9H14M7.5 12.5H12M19 4v7M17 6h4"/></svg> }
export function LibraryIcon(props: IconProps) { return <svg {...base} {...props}><path d="M4 4h5v16H4zM9 5h5v15H9zM15 4.5l4-1 3.5 15.5-4 1z"/></svg> }
export function JournalIcon(props: IconProps) { return <svg {...base} {...props}><path d="M5 3.5h12a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2z"/><path d="M8 3.5V20M11 8h5M11 12h4"/><path d="M17.5 2v4"/></svg> }
export function UserIcon(props: IconProps) { return <svg {...base} {...props}><circle cx="12" cy="8" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/></svg> }
export function SearchIcon(props: IconProps) { return <svg {...base} {...props}><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></svg> }
export function RefreshIcon(props: IconProps) { return <svg {...base} {...props}><path d="M20 7v5h-5M4 17v-5h5"/><path d="M18.5 12a7 7 0 0 0-12-4.5L4 10M5.5 12a7 7 0 0 0 12 4.5L20 14"/></svg> }
export function HeartIcon({ filled, ...props }: IconProps & { filled?: boolean }) { return <svg {...base} fill={filled ? 'currentColor' : 'none'} {...props}><path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6z"/></svg> }
export function ArrowIcon(props: IconProps) { return <svg {...base} {...props}><path d="M5 12h14M14 7l5 5-5 5"/></svg> }
