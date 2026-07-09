/**
 * Background Readability System — domain types.
 * Shared across the analyzer, readability service, store, and UI.
 */

/** Result of analyzing a background's luminance. */
export interface WallpaperAnalysis {
  /** Perceived average brightness, 0 (black) – 255 (white). */
  brightness: number
  /** Convenience flag: the background reads as dark. */
  isDark: boolean
  /** Convenience flag: the background reads as light. */
  isLight: boolean
}

/** Overlay intensity preference. `auto` derives it from brightness. */
export type OverlayStrength = 'auto' | 'low' | 'medium' | 'high'

/** Resolved foreground text polarity applied over the wallpaper. */
export type TextTheme = 'light' | 'dark'

/** User-facing readability preferences (persisted). */
export interface ReadabilitySettings {
  /** Overlay strength: auto (brightness-driven) or a fixed level. */
  overlayStrength: OverlayStrength
  /** Enable frosted-glass surfaces (backdrop blur) for cards/inputs. */
  glassEffect: boolean
  /** Enable subtle text-shadow on the clock / date / footer. */
  textShadow: boolean
  /** Auto-pick light/dark text from background brightness. */
  autoTextColor: boolean
}

/**
 * The set of CSS custom properties the readability manager writes to the
 * document root. Keys are the actual CSS variable names.
 */
export type ReadabilityVars = Record<string, string>
