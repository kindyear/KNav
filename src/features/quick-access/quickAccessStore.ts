import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createThrottledLocalStorage } from '@/utils/throttled-storage'
import { migrateIconValue } from '@/components/icon-system'
import { createDefaultQuickAccess } from './defaultQuickAccess'
import {
  MAX_QUICK_ACCESS_ITEMS,
  createUserItem,
  getEnabledItems,
  isQuickAccessItem,
} from './quickAccessUtils'
import type { QuickAccessFormValues, QuickAccessItem } from './quickAccessTypes'

/** localStorage key holding the entire quick-access array. */
export const QUICK_ACCESS_STORAGE_KEY = 'quickAccess'

const STORE_VERSION = 1

/** Outcome of an add attempt (so the UI can toast the limit). */
export type AddResult = 'added' | 'limit-reached'

interface QuickAccessStoreState {
  items: QuickAccessItem[]

  /** Add a user item (enabled, ordered last) unless the 128 limit is hit. */
  addItem: (values: QuickAccessFormValues) => AddResult
  /** Update editable fields of any item (builtins included). */
  updateItem: (id: string, values: QuickAccessFormValues) => void
  /** Delete any item (builtins included — quick-access items aren't permanent). */
  removeItem: (id: string) => void
  /** Show an item on the home page. */
  enableItem: (id: string) => void
  /** Hide an item from the home page. */
  disableItem: (id: string) => void
  /** Reorder the enabled list to the given id order (from drag-and-drop). */
  reorderEnabled: (orderedIds: string[]) => void
  /** Replace the entire item list (import). */
  replaceAll: (items: QuickAccessItem[]) => void
}

/**
 * Quick Access store — single source of truth for all home-page tiles.
 * Persisted (throttled) to localStorage under `quickAccess` as one array.
 *
 * Unlike search providers, quick-access builtins are NOT permanent: the user
 * may delete/edit them freely, so persisted state is authoritative and defaults
 * are only seeded on first run (never re-injected or refreshed).
 */
export const useQuickAccessStore = create<QuickAccessStoreState>()(
  persist(
    (set, get) => ({
      items: createDefaultQuickAccess(),

      addItem: (values) => {
        const state = get()
        if (state.items.length >= MAX_QUICK_ACCESS_ITEMS) return 'limit-reached'
        set({ items: [...state.items, createUserItem(values, state.items)] })
        return 'added'
      },

      updateItem: (id, values) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  name: values.name.trim(),
                  icon: values.icon,
                  url: values.url.trim(),
                  category: values.category?.trim() || undefined,
                  description: values.description?.trim() || undefined,
                  accentColor: values.accentColor?.trim() || undefined,
                }
              : i
          ),
        })),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      enableItem: (id) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, enabled: true } : i
          ),
        })),

      disableItem: (id) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, enabled: false } : i
          ),
        })),

      reorderEnabled: (orderedIds) =>
        set((state) => {
          const orderIndex = new Map(orderedIds.map((id, i) => [id, i]))
          return {
            items: state.items.map((i) =>
              orderIndex.has(i.id) ? { ...i, order: orderIndex.get(i.id)! } : i
            ),
          }
        }),

      replaceAll: (items) => set({ items }),
    }),
    {
      name: QUICK_ACCESS_STORAGE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() => createThrottledLocalStorage(300)),
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => {
        const p = persisted as { items?: unknown } | undefined
        const list = Array.isArray(p?.items)
          ? (p!.items as unknown[])
              .filter(isQuickAccessItem)
              // Migrate legacy icon values (e.g. `SiGoogle`) to Iconify names.
              .map((i) => ({ ...i, icon: migrateIconValue(i.icon) }))
          : null
        return {
          ...current,
          // Persisted state is authoritative; only seed defaults on first run.
          items: list ?? createDefaultQuickAccess(),
        }
      },
    }
  )
)

/** Non-reactive lookup of the currently enabled items (sorted). */
export function getEnabledItemsSnapshot(): QuickAccessItem[] {
  return getEnabledItems(useQuickAccessStore.getState().items)
}
