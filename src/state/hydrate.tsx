'use client'

import { useEffect, useState } from 'react'
import { idbGet } from './indexed-db'
import { useReaderStore } from './reader-store'

export function StoreHydrate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const namespace = useReaderStore((state) => state.namespace)
  const hydrateSnapshot = useReaderStore((state) => state.hydrateSnapshot)
  const setHydrated = useReaderStore((state) => state.setHydrated)

  useEffect(() => {
    let active = true
    void idbGet<Record<string, unknown>>('meta', `${namespace}:ui`).then((snapshot) => {
      if (!active) return
      hydrateSnapshot(snapshot ?? {})
      setHydrated(true)
      setReady(true)
    })
    return () => { active = false }
  }, [hydrateSnapshot, namespace, setHydrated])

  return <>{ready ? children : <div className="app-boot">页芽正在翻书…</div>}</>
}
