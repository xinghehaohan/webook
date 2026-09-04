'use client'

import { create } from 'zustand'
import type { MarginCard } from '@/lib/content/types'
import { idbSet } from './indexed-db'

type ReaderState = {
  hydrated: boolean
  namespace: string
  favorites: Record<string, MarginCard>
  seen: string[]
  growth: number
  reducedMotion: boolean
  fontScale: number
  setHydrated: (value: boolean) => void
  setNamespace: (value: string) => void
  hydrateSnapshot: (snapshot: Partial<Pick<ReaderState, 'favorites' | 'seen' | 'growth' | 'reducedMotion' | 'fontScale'>>) => void
  toggleFavorite: (card: MarginCard) => void
  markSeen: (id: string) => void
  setReducedMotion: (value: boolean) => void
  setFontScale: (value: number) => void
  reset: () => void
}

const defaults = { favorites: {}, seen: [], growth: 3, reducedMotion: false, fontScale: 1 }

function persist(state: ReaderState) {
  const data = { favorites: state.favorites, seen: state.seen, growth: state.growth, reducedMotion: state.reducedMotion, fontScale: state.fontScale }
  void idbSet('meta', `${state.namespace}:ui`, data)
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  ...defaults,
  hydrated: false,
  namespace: 'demo',
  setHydrated: (hydrated) => set({ hydrated }),
  setNamespace: (namespace) => {
    if (namespace === get().namespace) return
    set({ ...defaults, namespace, hydrated: false })
  },
  hydrateSnapshot: (snapshot) => set({ ...defaults, ...snapshot }),
  toggleFavorite: (card) => {
    const favorites = { ...get().favorites }
    if (favorites[card.id]) delete favorites[card.id]
    else favorites[card.id] = card
    set({ favorites, growth: Object.keys(favorites).length + 3 })
    persist(get())
  },
  markSeen: (id) => {
    if (get().seen.includes(id)) return
    set({ seen: [...get().seen.slice(-199), id] })
    persist(get())
  },
  setReducedMotion: (reducedMotion) => { set({ reducedMotion }); persist(get()) },
  setFontScale: (fontScale) => { set({ fontScale }); persist(get()) },
  reset: () => set({ ...defaults, namespace: 'demo' }),
}))
