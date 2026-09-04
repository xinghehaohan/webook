import type { NextRequest } from 'next/server'

const MAX_BODY_BYTES = 16_384

export async function readJsonBody(request: NextRequest): Promise<unknown> {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? ''
  if (!contentType.includes('application/json')) throw new Error('UNSUPPORTED_MEDIA_TYPE')
  const text = await request.text()
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) throw new Error('BODY_TOO_LARGE')
  try { return JSON.parse(text) } catch { throw new Error('INVALID_JSON') }
}
