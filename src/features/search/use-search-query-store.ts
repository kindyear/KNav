import { create } from 'zustand'

interface SearchQueryState {
  /** Current text in the search box. */
  query: string
  setQuery: (query: string) => void
}

/**
 * Ephemeral (non-persisted) shared search text.
 * Lifted out of SearchBox so the history list can fill the input on click
 * without changing the selected provider.
 */
export const useSearchQueryStore = create<SearchQueryState>((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
}))
