import { create } from 'zustand'

interface SearchFocusState {
  /** Registered focus handler from the mounted SearchBox (null when unmounted). */
  focusHandler: (() => void) | null
  /** SearchBox registers its focus fn on mount; pass null to unregister. */
  register: (handler: (() => void) | null) => void
  /** Focus the search box if one is mounted. */
  focus: () => void
}

/**
 * Ephemeral bridge so non-adjacent components (e.g. the history dialog) can
 * focus the search input without prop drilling or refs across the tree.
 * SearchBox registers its focus handler; callers invoke `focus()`.
 */
export const useSearchFocusStore = create<SearchFocusState>((set, get) => ({
  focusHandler: null,
  register: (handler) => set({ focusHandler: handler }),
  focus: () => get().focusHandler?.(),
}))
