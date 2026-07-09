import type {
  OverlayStrength,
  ReadabilitySettings,
} from '@/types/readability'

/** localStorage key for persisted readability settings. */
export const READABILITY_STORAGE_KEY = 'knav.readability'

/** Persisted-state schema version. */
export const READABILITY_STORE_VERSION = 1

/** Transition duration (ms) for overlay / blur / text-color changes. */
export const READABILITY_TRANSITION_MS = 250

/** Downscaled canvas edge used for brightness analysis (100×100). */
export const ANALYSIS_SAMPLE_SIZE = 100

/** Brightness thresholds (0–255) classifying dark / medium / light. */
export const BRIGHTNESS_DARK_MAX = 90
export const BRIGHTNESS_LIGHT_MIN = 170

/**
 * Auto overlay opacity by brightness band (0–1). Values follow the spec and
 * never exceed the hard cap below.
 *  - <60      → 0.10
 *  - 60–130   → 0.18
 *  - 130–190  → 0.25
 *  - >190     → 0.30
 */
export const AUTO_OVERLAY_BANDS: { max: number; opacity: number }[] = [
  { max: 60, opacity: 0.1 },
  { max: 130, opacity: 0.18 },
  { max: 190, opacity: 0.25 },
  { max: Infinity, opacity: 0.3 },
]

/** Fixed overlay opacities for the non-auto strength levels. */
export const FIXED_OVERLAY_OPACITY: Record<
  Exclude<OverlayStrength, 'auto'>,
  number
> = {
  low: 0.1,
  medium: 0.2,
  high: 0.3,
}

/** Hard cap — overlay opacity must never exceed this. */
export const OVERLAY_OPACITY_CAP = 0.35

/** Default overlay opacity before any analysis has completed. */
export const DEFAULT_OVERLAY_OPACITY = 0.18

/** Glass surface tokens for light-text (dark background) contexts. */
export const GLASS_DARK_CONTEXT = {
  background: 'rgba(255, 255, 255, 0.10)',
  backgroundHover: 'rgba(255, 255, 255, 0.16)',
  border: 'rgba(255, 255, 255, 0.12)',
  shadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
} as const

/** Glass surface tokens for dark-text (light background) contexts. */
export const GLASS_LIGHT_CONTEXT = {
  background: 'rgba(0, 0, 0, 0.08)',
  backgroundHover: 'rgba(0, 0, 0, 0.14)',
  border: 'rgba(0, 0, 0, 0.10)',
  shadow: '0 2px 8px rgba(0, 0, 0, 0.10)',
} as const

/** Subtle text shadow applied to hero/footer text when enabled. */
export const TEXT_SHADOW_LIGHT = '0 2px 8px rgba(0, 0, 0, 0.25)'
export const TEXT_SHADOW_DARK = '0 1px 6px rgba(255, 255, 255, 0.25)'

/**
 * Blur radius (px) for frosted-glass surfaces.
 * Kept modest (12px) to limit GPU cost — the raised surface background opacity
 * above carries most of the contrast, so a smaller blur still reads as glass.
 */
export const GLASS_BLUR_PX = 12

/** Default readability settings on first run. */
export function createDefaultReadabilitySettings(): ReadabilitySettings {
  return {
    overlayStrength: 'auto',
    glassEffect: true,
    textShadow: true,
    autoTextColor: true,
  }
}
