import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#bfeeff', borderRadius: 38 }}><div style={{ width: 116, height: 102, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '52% 52% 42% 42%', border: '8px solid #29343b', background: '#fffdf4', color: '#29343b', fontSize: 48, fontWeight: 800 }}>页</div></div>, size)
}
