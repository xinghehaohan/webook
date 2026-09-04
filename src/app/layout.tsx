import type { Metadata, Viewport } from 'next'
import { AppShell } from '@/components/app-shell'
import { StoreHydrate } from '@/state/hydrate'
import { RegisterServiceWorker } from '@/components/pwa/register-service-worker'
import './globals.css'

export const metadata: Metadata = {
  title: { default: '页边 · 有人在', template: '%s · 页边' },
  description: '从你读过的书里，重新遇见原文与真实观点。',
  applicationName: '页边',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: '页边' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#bfeeff' },
    { media: '(prefers-color-scheme: dark)', color: '#15262d' },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <StoreHydrate>
          <AppShell>{children}</AppShell>
          <RegisterServiceWorker />
        </StoreHydrate>
      </body>
    </html>
  )
}
