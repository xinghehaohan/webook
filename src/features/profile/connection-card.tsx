'use client'

import { useState } from 'react'
import type { ConnectionState } from '@/lib/content/types'

export function ConnectionCard({ connection, onChanged }: { connection?: ConnectionState; onChanged: () => void }) {
  const [token, setToken] = useState('')
  const [message, setMessage] = useState<string>()
  const login = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage(undefined)
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }) })
    const result = await response.json() as { ok: boolean; message?: string }
    if (!result.ok) return setMessage(result.message || '没有解锁成功。')
    setToken(''); onChanged()
  }
  return <section className="connection-card">
    <div className={`connection-orb${connection?.configured ? ' connected' : ''}`}>{connection?.configured ? '✓' : '⌁'}</div>
    <div className="connection-copy"><span>微信读书连接</span><h3>{connection?.configured ? (connection.authenticated ? '书架已准备好' : '需要解锁') : '等待你的 API Key'}</h3><p>{connection?.configured ? '密钥安全地保留在服务器环境中，不会发送到浏览器。' : '在项目的 .env.local 中添加 WEREAD_API_KEY，然后重新启动应用。'}</p></div>
    {connection?.requiresAccessToken && <form onSubmit={login} className="unlock-form"><input type="password" value={token} onChange={(event) => setToken(event.target.value)} placeholder="输入页边访问口令" aria-label="页边访问口令" /><button type="submit">解锁</button>{message && <small>{message}</small>}</form>}
  </section>
}
