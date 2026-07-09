import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  CUSTOM_SLOT_LIMIT,
  WALLPAPER_PERSIST_THROTTLE_MS,
  WALLPAPER_STORAGE_KEY,
  WALLPAPER_STORE_VERSION,
  createDefaultWallpaperConfig,
} from '@/config/wallpaper'
import {
  fetchBingDailyImage,
  fetchBingRandomImage,
  isStale,
  todayIso,
} from '@/services/bingWallpaper'
import { validateImageFile } from '@/services/localWallpaper'
import {
  deleteLocalWallpaperBlob,
  dataUrlToBlob,
  loadLocalWallpaperBlob,
  saveLocalWallpaperBlob,
} from '@/services/localWallpaperStore'
import { isDuplicateColor } from '@/utils/color'
import { createId } from '@/utils/gradient'
import { createThrottledLocalStorage } from '@/utils/throttled-storage'
import { BingMode, WallpaperType } from '@/types/wallpaper'
import type { GradientConfig, WallpaperConfig } from '@/types/wallpaper'

/** Transient (non-persisted) status flags for async wallpaper operations. */
interface WallpaperRuntime {
  bingLoading: boolean
  /** Error code for the last Bing fetch, or null when healthy. */
  bingError: string | null
  /**
   * Object URL for the active local wallpaper blob (from IndexedDB), or empty.
   * Runtime-only — never persisted; recreated on load via hydrateLocal().
   */
  localUrl: string
}

interface WallpaperActions {
  /** Switch the active wallpaper type; all sub-configs are preserved. */
  setType: (type: WallpaperType) => void

  // Solid
  setSolidCurrent: (color: string) => void
  addSolidCustom: (color: string) => boolean
  removeSolidCustom: (color: string) => void

  // Gradient
  setGradientCurrent: (gradient: GradientConfig) => void
  /** Persist edits to the current gradient (partial patch). */
  updateGradientCurrent: (patch: Partial<Omit<GradientConfig, 'id'>>) => void
  addGradientCustom: (gradient: GradientConfig) => boolean
  updateGradientCustom: (id: string, patch: Partial<GradientConfig>) => void
  removeGradientCustom: (id: string) => void

  // Bing
  setBingMode: (mode: BingMode) => void
  refreshBing: (force?: boolean) => Promise<void>
  ensureBingFresh: () => Promise<void>

  // Local
  uploadLocal: (file: File) => Promise<void>
  removeLocal: () => void
  /**
   * Recreate the local object URL from the IndexedDB blob on app start.
   * No-op when the active type isn't Local or nothing is stored.
   */
  hydrateLocal: () => Promise<void>
}

type WallpaperState = {
  config: WallpaperConfig
} & WallpaperRuntime &
  WallpaperActions

/** Enforce the 2–4 stop invariant when writing a gradient into state. */
function clampGradientColors(gradient: GradientConfig): GradientConfig {
  const colors = gradient.colors.slice(0, 4)
  while (colors.length < 2) colors.push('#000000')
  return { ...gradient, colors }
}

export const useWallpaperStore = create<WallpaperState>()(
  persist(
    (set, get) => ({
      config: createDefaultWallpaperConfig(),
      bingLoading: false,
      bingError: null,
      localUrl: '',

      setType: (type) => set((s) => ({ config: { ...s.config, type } })),

      // ── Solid ──────────────────────────────────────────────────────────
      setSolidCurrent: (color) =>
        set((s) => ({
          config: {
            ...s.config,
            type: WallpaperType.Solid,
            solid: { ...s.config.solid, current: color },
          },
        })),

      addSolidCustom: (color) => {
        const { solid } = get().config
        if (
          solid.customs.length >= CUSTOM_SLOT_LIMIT ||
          isDuplicateColor([...solid.presets, ...solid.customs], color)
        ) {
          return false
        }
        set((s) => ({
          config: {
            ...s.config,
            solid: {
              ...s.config.solid,
              customs: [...s.config.solid.customs, color],
              current: color,
            },
            type: WallpaperType.Solid,
          },
        }))
        return true
      },

      removeSolidCustom: (color) =>
        set((s) => ({
          config: {
            ...s.config,
            solid: {
              ...s.config.solid,
              customs: s.config.solid.customs.filter((c) => c !== color),
            },
          },
        })),

      // ── Gradient ───────────────────────────────────────────────────────
      setGradientCurrent: (gradient) =>
        set((s) => ({
          config: {
            ...s.config,
            type: WallpaperType.Gradient,
            gradient: {
              ...s.config.gradient,
              current: clampGradientColors(gradient),
            },
          },
        })),

      updateGradientCurrent: (patch) =>
        set((s) => ({
          config: {
            ...s.config,
            gradient: {
              ...s.config.gradient,
              current: clampGradientColors({
                ...s.config.gradient.current,
                ...patch,
              }),
            },
          },
        })),

      addGradientCustom: (gradient) => {
        if (get().config.gradient.customs.length >= CUSTOM_SLOT_LIMIT) {
          return false
        }
        const entry = clampGradientColors({
          ...gradient,
          id: gradient.id || createId('grad'),
        })
        set((s) => ({
          config: {
            ...s.config,
            type: WallpaperType.Gradient,
            gradient: {
              ...s.config.gradient,
              customs: [...s.config.gradient.customs, entry],
              current: entry,
            },
          },
        }))
        return true
      },

      updateGradientCustom: (id, patch) =>
        set((s) => {
          const customs = s.config.gradient.customs.map((g) =>
            g.id === id ? clampGradientColors({ ...g, ...patch, id }) : g
          )
          const updated = customs.find((g) => g.id === id)
          const isCurrent = s.config.gradient.current.id === id
          return {
            config: {
              ...s.config,
              gradient: {
                ...s.config.gradient,
                customs,
                current:
                  isCurrent && updated ? updated : s.config.gradient.current,
              },
            },
          }
        }),

      removeGradientCustom: (id) =>
        set((s) => ({
          config: {
            ...s.config,
            gradient: {
              ...s.config.gradient,
              customs: s.config.gradient.customs.filter((g) => g.id !== id),
            },
          },
        })),

      // ── Bing ───────────────────────────────────────────────────────────
      setBingMode: (mode) => {
        set((s) => ({
          config: {
            ...s.config,
            type: WallpaperType.Bing,
            bing: { ...s.config.bing, mode },
          },
        }))
        // Switching mode is an explicit user action, so always fetch a fresh
        // image immediately (force) — otherwise daily's per-day cache would make
        // the switch appear to do nothing until a manual refresh.
        void get().refreshBing(true)
      },

      refreshBing: async (force = false) => {
        const { bing } = get().config
        const isRandom = bing.mode === BingMode.Random
        // Daily mode is cached per-day; random always fetches unless we already
        // have an image and aren't forcing.
        if (!force && bing.url) {
          if (!isRandom && !isStale(bing.lastFetchDate)) return
          if (isRandom) return
        }
        if (get().bingLoading) return
        set({ bingLoading: true, bingError: null })
        try {
          const image = isRandom
            ? await fetchBingRandomImage()
            : await fetchBingDailyImage()
          set((s) => ({
            bingLoading: false,
            bingError: null,
            config: {
              ...s.config,
              bing: {
                ...s.config.bing,
                enabled: true,
                url: image.url,
                title: image.title,
                copyright: image.copyright,
                date: image.date,
                lastFetchDate: todayIso(),
              },
            },
          }))
        } catch (error) {
          // Keep yesterday's cache; only surface an error when nothing cached.
          const code =
            error instanceof Error ? error.message : 'BING_UNKNOWN_ERROR'
          set({ bingLoading: false, bingError: code })
        }
      },

      ensureBingFresh: async () => {
        const { bing } = get().config
        // Random: fetch a new pick on every app open. Daily: only when stale.
        if (bing.mode === BingMode.Random) {
          await get().refreshBing(true)
          return
        }
        if (isStale(bing.lastFetchDate) || !bing.url) {
          await get().refreshBing(false)
        }
      },

      // ── Local ──────────────────────────────────────────────────────────
      uploadLocal: async (file) => {
        validateImageFile(file)
        // Store the raw bytes in IndexedDB (no Base64) and hand the UI a fresh
        // object URL. Revoke the previous URL so only one decoded copy lives in
        // memory at a time.
        await saveLocalWallpaperBlob(file)
        const url = URL.createObjectURL(file)
        const prev = get().localUrl
        if (prev) URL.revokeObjectURL(prev)
        set((s) => ({
          localUrl: url,
          config: {
            ...s.config,
            type: WallpaperType.Local,
            local: { fileName: file.name },
          },
        }))
      },

      removeLocal: () => {
        const prev = get().localUrl
        if (prev) URL.revokeObjectURL(prev)
        void deleteLocalWallpaperBlob()
        set((s) => ({
          localUrl: '',
          config: {
            ...s.config,
            type:
              s.config.type === WallpaperType.Local
                ? WallpaperType.Solid
                : s.config.type,
            local: { fileName: '' },
          },
        }))
      },

      hydrateLocal: async () => {
        // Only needed when a local wallpaper is the active/known source.
        if (!get().config.local.fileName || get().localUrl) return
        const blob = await loadLocalWallpaperBlob()
        if (!blob) return
        if (get().localUrl) return
        set({ localUrl: URL.createObjectURL(blob) })
      },
    }),
    {
      name: WALLPAPER_STORAGE_KEY,
      version: WALLPAPER_STORE_VERSION,
      storage: createJSONStorage(() =>
        createThrottledLocalStorage(WALLPAPER_PERSIST_THROTTLE_MS)
      ),
      // Only the config is durable; runtime flags stay in memory.
      partialize: (s) => ({ config: s.config }),
      merge: (persisted, current) => {
        const p = persisted as { config?: Partial<WallpaperConfig> } | undefined
        const base = current.config
        const saved = p?.config
        if (!saved) return current
        // Legacy migration: older builds persisted the local image as a Base64
        // `local.data` field inside localStorage. Move those bytes into
        // IndexedDB (fire-and-forget) and drop `data` so it never returns to
        // localStorage. `fileName` is retained so hydrateLocal() can restore it.
        const legacyLocal = saved.local as
          { fileName?: string; data?: string } | undefined
        if (legacyLocal?.data) {
          const dataUrl = legacyLocal.data
          void saveLocalWallpaperBlob(dataUrlToBlob(dataUrl)).catch(() => {})
        }
        // Deep-ish merge: keep built-in presets from code, restore user data.
        return {
          ...current,
          config: {
            type: saved.type ?? base.type,
            solid: { ...base.solid, ...saved.solid },
            gradient: { ...base.gradient, ...saved.gradient },
            bing: { ...base.bing, ...saved.bing },
            local: { fileName: legacyLocal?.fileName ?? '' },
          },
        }
      },
    }
  )
)
