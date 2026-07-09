import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  SETTINGS_PERSIST_THROTTLE_MS,
  SETTINGS_STORAGE_KEY,
  SETTINGS_VERSION,
  createDefaultGeneralSettings,
} from '@/config/settings'
import { createThrottledLocalStorage } from '@/utils/throttled-storage'
import type { GeneralSettings } from '@/types/settings'

interface SettingsState {
  general: GeneralSettings

  /** Patch one or more General fields (auto-persisted). */
  setGeneral: (patch: Partial<GeneralSettings>) => void
  /** Reset every setting back to its default. */
  reset: () => void
}

/**
 * Settings store — owns the General settings module (language / theme / clock /
 * locale …). Persisted to localStorage (`knav.settings`) via a throttled writer
 * so rapid toggles coalesce into a single write. Search / background / favorites
 * live in their own dedicated stores.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      general: createDefaultGeneralSettings(),

      setGeneral: (patch) =>
        set((state) => ({ general: { ...state.general, ...patch } })),

      reset: () => set({ general: createDefaultGeneralSettings() }),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      // Persist-middleware schema version (used for localStorage migrations only;
      // this is not part of the exported config).
      version: SETTINGS_VERSION,
      storage: createJSONStorage(() =>
        createThrottledLocalStorage(SETTINGS_PERSIST_THROTTLE_MS)
      ),
      // Only persist data, never the action functions.
      partialize: (state) => ({ general: state.general }),
      // Deep-merge persisted General over defaults so newly added fields keep
      // sensible defaults after an upgrade.
      merge: (persisted, current) => {
        const p = persisted as
          { general?: Partial<GeneralSettings> } | undefined
        return {
          ...current,
          general: { ...current.general, ...(p?.general ?? {}) },
        }
      },
    }
  )
)
