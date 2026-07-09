import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  READABILITY_STORAGE_KEY,
  READABILITY_STORE_VERSION,
  createDefaultReadabilitySettings,
} from '@/config/readability'
import type {
  ReadabilitySettings,
  WallpaperAnalysis,
} from '@/types/readability'

interface ReadabilityState {
  settings: ReadabilitySettings
  /**
   * Cache of completed analyses keyed by a stable background signature (image
   * URL or color signature). Persisted so we never re-run Canvas analysis for a
   * background we've already measured.
   */
  analysisCache: Record<string, WallpaperAnalysis>

  setOverlayStrength: (
    strength: ReadabilitySettings['overlayStrength']
  ) => void
  setGlassEffect: (enabled: boolean) => void
  setTextShadow: (enabled: boolean) => void
  setAutoTextColor: (enabled: boolean) => void

  /** Store an analysis result under its background key. */
  cacheAnalysis: (key: string, analysis: WallpaperAnalysis) => void
}

/**
 * Persisted readability store: user preferences + a durable analysis cache.
 * The cache prevents repeated Canvas work when switching between backgrounds
 * that have already been measured.
 */
export const useReadabilityStore = create<ReadabilityState>()(
  persist(
    (set) => ({
      settings: createDefaultReadabilitySettings(),
      analysisCache: {},

      setOverlayStrength: (overlayStrength) =>
        set((s) => ({ settings: { ...s.settings, overlayStrength } })),
      setGlassEffect: (glassEffect) =>
        set((s) => ({ settings: { ...s.settings, glassEffect } })),
      setTextShadow: (textShadow) =>
        set((s) => ({ settings: { ...s.settings, textShadow } })),
      setAutoTextColor: (autoTextColor) =>
        set((s) => ({ settings: { ...s.settings, autoTextColor } })),

      cacheAnalysis: (key, analysis) =>
        set((s) =>
          s.analysisCache[key]
            ? s
            : { analysisCache: { ...s.analysisCache, [key]: analysis } }
        ),
    }),
    {
      name: READABILITY_STORAGE_KEY,
      version: READABILITY_STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const p = persisted as Partial<ReadabilityState> | undefined
        return {
          ...current,
          settings: { ...current.settings, ...p?.settings },
          analysisCache: { ...current.analysisCache, ...p?.analysisCache },
        }
      },
    }
  )
)
