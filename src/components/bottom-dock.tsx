'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LibraryIcon, MarginsIcon, SunIcon, UserIcon } from './ui/icons'

const tabs = [
  { href: '/', label: '今天', Icon: SunIcon },
  { href: '/margins', label: '页边', Icon: MarginsIcon },
  { href: '/library', label: '书架', Icon: LibraryIcon },
  { href: '/me', label: '我的', Icon: UserIcon },
]

export function BottomDock() {
  const pathname = usePathname()
  if (pathname.startsWith('/opinion/')) return null
  return <nav className="bottom-dock" aria-label="主导航">
    {tabs.map(({ href, label, Icon }) => {
      const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
      return <Link key={href} href={href} className={`dock-tab${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
        <span className="dock-icon"><Icon /></span><span>{label}</span>
      </Link>
    })}
  </nav>
}
