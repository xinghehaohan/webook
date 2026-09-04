import { NextResponse } from 'next/server'

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status, headers: { 'cache-control': 'private, no-store' } })
}

export function fail(code: string, message: string, status: number, retryable = false) {
  return NextResponse.json({ ok: false, code, message, retryable }, { status, headers: { 'cache-control': 'private, no-store' } })
}
