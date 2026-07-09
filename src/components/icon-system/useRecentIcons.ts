import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** How many recently-used icons to remember. */
const MAX_RECENT = 20

interface RecentIconsState {
  /** Most-recent-first list of Iconify names. */
  recent: string[]
  /** Record a picked icon (dedup + move-to-front, capped at MAX_RECENT). */
  add: (icon: string) => void
}

/**
 * Recently-used icons for the Icon Picker (localStorage: `knav-recent-icons`).
 * Shown first when the picker opens so common choices are one click away.
 */
export const useRecentIconsStore = create<RecentIconsState>()(
  persist(
    (set) => ({
      recent: [],
      add: (icon) =>
        set((state) => ({
          recent: [icon, ...state.recent.filter((i) => i !== icon)].slice(
            0,
            MAX_RECENT
          ),
        })),
    }),
    { name: 'knav-recent-icons' }
  )
)
