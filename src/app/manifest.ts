import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '页边 · PageSprout', short_name: '页边', description: '从你读过的书里，重新遇见原文与真实观点。',
    start_url: '/', display: 'standalone', background_color: '#f5f9ee', theme_color: '#bfeeff', orientation: 'portrait',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
