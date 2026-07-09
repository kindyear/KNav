import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getEnabledProvidersSnapshot } from './providerStore'

interface SearchProviderState {
  /** Currently selected provider id (empty when none resolved yet). */
  providerId: string
  setProviderId: (id: string) => void
}

/** First enabled provider id, or '' when none are enabled. */
function firstEnabledId(): string {
  return getEnabledProvidersSnapshot()[0]?.id ?? ''
}

/**
 * Persisted search-provider selection (localStorage: `knav-search-provider`).
 * Validates against the live provider store: if the stored selection is no
 * longer enabled (disabled/deleted), it falls back to the first enabled one.
 */
export const useSearchProviderStore = create<SearchProviderState>()(
  persist(
    (set) => ({
      providerId: '',
      setProviderId: (id) => set({ providerId: id }),
    }),
    {
      name: 'knav-search-provider',
      merge: (persisted, current) => {
        const next = { ...current, ...(persisted as SearchProviderState) }
        const enabledIds = new Set(
          getEnabledProvidersSnapshot().map((p) => p.id)
        )
        if (!next.providerId || !enabledIds.has(next.providerId)) {
          next.providerId = firstEnabledId()
        }
        return next
      },
    }
  )
)

/**
 * Resolve the effective selected id against the current enabled list.
 * Use in components so the selection always points to a valid, enabled provider
 * even right after a provider is disabled/deleted.
 */
export function useResolvedProviderId(): string {
  const selected = useSearchProviderStore((s) => s.providerId)
  const enabled = getEnabledProvidersSnapshot()
  if (selected && enabled.some((p) => p.id === selected)) return selected
  return enabled[0]?.id ?? ''
}
