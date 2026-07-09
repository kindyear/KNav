import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createThrottledLocalStorage } from '@/utils/throttled-storage'
import { migrateIconValue } from '@/components/icon-system'
import {
  BUILTIN_PROVIDER_IDS,
  DEFAULT_PROVIDERS,
  createDefaultProviders,
} from './defaultProviders'
import {
  MAX_ENABLED_PROVIDERS,
  createUserProvider,
  getEnabledProviders,
  isSearchProvider,
} from './providerUtils'
import type { ProviderFormValues, SearchProvider } from './providerTypes'

/** localStorage key holding the entire provider array. */
export const PROVIDERS_STORAGE_KEY = 'searchProviders'

const STORE_VERSION = 1

/** Outcome of an enable attempt (so the UI can toast the limit). */
export type EnableResult = 'enabled' | 'limit-reached'

interface ProviderStoreState {
  providers: SearchProvider[]

  /** Add a user provider (builtin=false, disabled, ordered last). */
  addProvider: (values: ProviderFormValues) => void
  /** Update editable fields of a user provider (builtins are ignored). */
  updateProvider: (id: string, values: ProviderFormValues) => void
  /** Delete a user provider (builtins can never be deleted). */
  removeProvider: (id: string) => void
  /** Enable a provider unless the 10-item limit is reached. */
  enableProvider: (id: string) => EnableResult
  /** Disable a provider (remove it from the top bar). */
  disableProvider: (id: string) => void
  /** Reorder the enabled list to the given id order (from drag-and-drop). */
  reorderEnabled: (orderedIds: string[]) => void
  /** Replace the entire provider list (import). */
  replaceAll: (providers: SearchProvider[]) => void
}

/**
 * Reconcile persisted providers with the builtin defaults:
 * - keep persisted state (order/enabled/user providers)
 * - refresh builtin fixed fields (name/icon/searchUrl) from defaults
 * - inject builtins added to defaultProviders.ts since last run
 */
function reconcileWithDefaults(persisted: SearchProvider[]): SearchProvider[] {
  const byId = new Map(persisted.map((p) => [p.id, p]))
  const result: SearchProvider[] = []

  // Existing (valid) providers first; builtins get their fixed fields refreshed.
  for (const p of persisted) {
    if (!isSearchProvider(p)) continue
    if (p.builtin) {
      const def = DEFAULT_PROVIDERS.find((d) => d.id === p.id)
      if (!def) continue // builtin removed from defaults → drop it
      result.push({
        ...p,
        name: def.name,
        icon: def.icon,
        searchUrl: def.searchUrl,
        builtin: true,
      })
    } else {
      // Migrate legacy icon values (e.g. `SiGoogle`) to Iconify names.
      result.push({ ...p, icon: migrateIconValue(p.icon) })
    }
  }

  // Inject any new builtins not present in persisted state (appended to end).
  let maxOrder = result.reduce((m, p) => Math.max(m, p.order), -1)
  for (const def of DEFAULT_PROVIDERS) {
    if (!byId.has(def.id)) {
      result.push({ ...def, order: ++maxOrder })
    }
  }

  return result
}

/**
 * Provider store — single source of truth for all search providers.
 * Persisted (throttled) to localStorage under `searchProviders` as one array.
 */
export const useProviderStore = create<ProviderStoreState>()(
  persist(
    (set, get) => ({
      providers: createDefaultProviders(),

      addProvider: (values) =>
        set((state) => ({
          providers: [
            ...state.providers,
            createUserProvider(values, state.providers),
          ],
        })),

      updateProvider: (id, values) =>
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id && !p.builtin
              ? {
                  ...p,
                  name: values.name.trim(),
                  icon: values.icon,
                  searchUrl: values.searchUrl.trim(),
                  category: values.category?.trim() || undefined,
                  description: values.description?.trim() || undefined,
                }
              : p
          ),
        })),

      removeProvider: (id) =>
        set((state) => ({
          providers: state.providers.filter(
            (p) => !(p.id === id && !p.builtin)
          ),
        })),

      enableProvider: (id) => {
        const state = get()
        const enabledCount = state.providers.filter((p) => p.enabled).length
        if (enabledCount >= MAX_ENABLED_PROVIDERS) return 'limit-reached'
        set({
          providers: state.providers.map((p) =>
            p.id === id ? { ...p, enabled: true } : p
          ),
        })
        return 'enabled'
      },

      disableProvider: (id) =>
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id ? { ...p, enabled: false } : p
          ),
        })),

      reorderEnabled: (orderedIds) =>
        set((state) => {
          const orderIndex = new Map(orderedIds.map((id, i) => [id, i]))
          return {
            providers: state.providers.map((p) =>
              orderIndex.has(p.id) ? { ...p, order: orderIndex.get(p.id)! } : p
            ),
          }
        }),

      replaceAll: (providers) => set({ providers }),
    }),
    {
      name: PROVIDERS_STORAGE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() => createThrottledLocalStorage(300)),
      partialize: (state) => ({ providers: state.providers }),
      merge: (persisted, current) => {
        const p = persisted as { providers?: unknown } | undefined
        const list = Array.isArray(p?.providers)
          ? (p!.providers as SearchProvider[])
          : null
        return {
          ...current,
          providers: list
            ? reconcileWithDefaults(list)
            : createDefaultProviders(),
        }
      },
    }
  )
)

/** Whether an id refers to a builtin provider. */
export function isBuiltinId(id: string): boolean {
  return BUILTIN_PROVIDER_IDS.has(id)
}

/** Non-reactive lookup of the currently enabled providers (sorted). */
export function getEnabledProvidersSnapshot(): SearchProvider[] {
  return getEnabledProviders(useProviderStore.getState().providers)
}

/**
 * Resolve display metadata (name + icon key) for a provider id, even for
 * history entries whose provider was later deleted. Falls back to the raw id
 * and a generic icon so stale references still render sensibly.
 */
export function resolveProviderMeta(
  providers: SearchProvider[],
  id: string
): { name: string; icon: string } {
  const found = providers.find((p) => p.id === id)
  return found
    ? { name: found.name, icon: found.icon }
    : { name: id, icon: '__fallback__' }
}
