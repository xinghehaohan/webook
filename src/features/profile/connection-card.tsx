'use client'

import { useState } from 'react'
import type { ConnectionState } from '@/lib/content/types'

type ApiResult = { ok: boolean; message?: string }

export function ConnectionCard({ connection, onChanged }: { connection?: ConnectionState; onChanged: () => void }) {
  const [accessToken, setAccessToken] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [editingKey, setEditingKey] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string>()

  const login = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage(undefined); setBusy(true)
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: accessToken }) })
      const result = await response.json() as ApiResult
      if (!result.ok) return setMessage(result.message || '没有解锁成功。')
      setAccessToken(''); onChanged()
    } finally { setBusy(false) }
  }

  const connect = async (event: React.FormEvent) => {
    event.preventDefault(); if (!apiKey.trim()) return
    setMessage(undefined); setBusy(true)
    try {
      const response = await fetch('/api/auth/weread-key', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key: apiKey }) })
      const result = await response.json() as ApiResult
      if (!result.ok) return setMessage(result.message || '没有连接成功。')
      setApiKey(''); setEditingKey(false); setMessage('连接成功，页芽开始读取你的书架。'); onChanged()
    } catch { setMessage('网络没有连上，请稍后再试。') }
    finally { setBusy(false) }
  }

  const connected = Boolean(connection?.configured)
  return <section className="connection-card">
    <div className={`connection-orb${connected ? ' connected' : ''}`}>{connected ? '✓' : '⌁'}</div>
    <div className="connection-copy"><span>微信读书连接</span><h3>{connected ? (connection?.authenticated ? '书架已准备好' : '需要解锁') : '等待你的 API Key'}</h3><p>{connected ? (connection?.configuredBy === 'device' ? 'API Key 保存在这台设备的 HttpOnly Cookie 中。' : '正在使用服务器环境中的 API Key。') : '直接在下方粘贴 Key，验证成功后就会读取你的真实书架。'}</p></div>
    {connection?.requiresAccessToken ? <form onSubmit={login} className="unlock-form"><input type="password" value={accessToken} onChange={(event) => setAccessToken(event.target.value)} placeholder="输入页边访问口令" aria-label="页边访问口令" autoComplete="current-password" /><button type="submit" disabled={busy}>{busy ? '解锁中' : '解锁'}</button>{message && <small>{message}</small>}</form> : (!connected || editingKey) ? <form onSubmit={connect} className="unlock-form"><input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="粘贴 wrk-… API Key" aria-label="微信读书 API Key" autoComplete="off" spellCheck={false} /><button type="submit" disabled={busy || !apiKey.trim()}>{busy ? '连接中' : '连接'}</button>{message && <small className={message.startsWith('连接成功') ? 'success' : ''}>{message}</small>}</form> : <div className="connection-actions"><span>{message || '连接正常'}</span><button type="button" onClick={() => { setEditingKey(true); setMessage(undefined) }}>更换 Key</button></div>}
  </section>
}
