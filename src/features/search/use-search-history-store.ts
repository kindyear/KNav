import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createId } from '@/utils/gradient'

export interface SearchHistoryEntry {
  /** Stable unique id (used for list keys + single-item deletion). */
  id: string
  /** The searched text. */
  query: string
  /** Provider id used at search time. */
  providerId: string
  /** Epoch ms when the search was performed (updated on repeat searches). */
  timestamp: number
}

/** Maximum retained entries; older entries beyond this are dropped. */
const MAX_ENTRIES = 100

/** Store schema version — bump when the entry shape changes. */
const STORE_VERSION = 1

interface SearchHistoryState {
  entries: SearchHistoryEntry[]
  addEntry: (query: string, providerId: string) => void
  /** Remove a single entry by id (no confirmation). */
  removeEntry: (id: string) => void
  clear: () => void
}

/**
 * Persisted recent searches (localStorage: `knav-search-history`).
 * Each entry records the query text AND the provider used at that time.
 * De-duplicates by (query + provider): a repeat search is moved to the front
 * and its timestamp refreshed rather than duplicated. Most-recent-first,
 * capped at MAX_ENTRIES.
 */
export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (query, providerId) =>
        set((state) => {
          const q = query.trim()
          if (!q) return state
          const deduped = state.entries.filter(
            (e) => !(e.query === q && e.providerId === providerId)
          )
          const next: SearchHistoryEntry[] = [
            { id: createId('h'), query: q, providerId, timestamp: Date.now() },
            ...deduped,
          ].slice(0, MAX_ENTRIES)
          return { entries: next }
        }),
      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),
      clear: () => set({ entries: [] }),
    }),
    {
      name: 'knav-search-history',
      version: STORE_VERSION,
      // Backfill ids for legacy entries persisted before the id field existed.
      migrate: (persisted) => {
        const state = persisted as Partial<SearchHistoryState> | undefined
        const entries = (state?.entries ?? []).map((e) => ({
          ...e,
          id: e.id ?? createId('h'),
        }))
        return { entries } as SearchHistoryState
      },
    }
  )
)
