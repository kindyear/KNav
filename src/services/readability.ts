import {
  AUTO_OVERLAY_BANDS,
  DEFAULT_OVERLAY_OPACITY,
  FIXED_OVERLAY_OPACITY,
  GLASS_BLUR_PX,
  GLASS_DARK_CONTEXT,
  GLASS_LIGHT_CONTEXT,
  OVERLAY_OPACITY_CAP,
  TEXT_SHADOW_DARK,
  TEXT_SHADOW_LIGHT,
} from '@/config/readability'
import type {
  OverlayStrength,
  ReadabilitySettings,
  ReadabilityVars,
  TextTheme,
  WallpaperAnalysis,
} from '@/types/readability'

/**
 * Readability service — pure derivations mapping a background analysis +
 * user settings into concrete overlay opacity, text theme, and CSS variables.
 * No DOM access here; the manager component applies the returned vars.
 */

/** Clamp any opacity to the hard cap. */
function cap(opacity: number): number {
  return Math.min(opacity, OVERLAY_OPACITY_CAP)
}

/** Overlay opacity derived from brightness (auto mode). */
export function autoOverlayOpacity(brightness: number): number {
  const band = AUTO_OVERLAY_BANDS.find((b) => brightness < b.max)
  return cap(band ? band.opacity : DEFAULT_OVERLAY_OPACITY)
}

/** Resolve overlay opacity from settings + (optional) analysis. */
export function resolveOverlayOpacity(
  strength: OverlayStrength,
  analysis: WallpaperAnalysis | null
): number {
  if (strength === 'auto') {
    if (!analysis) return DEFAULT_OVERLAY_OPACITY
    return autoOverlayOpacity(analysis.brightness)
  }
  return cap(FIXED_OVERLAY_OPACITY[strength])
}

/**
 * Resolve the foreground text theme.
 * - autoTextColor off → always light (white), overlay carries the contrast.
 * - dark background   → light text.
 * - light background  → dark text.
 * - medium            → light text (spec: keep white, overlay is strengthened).
 */
export function resolveTextTheme(
  analysis: WallpaperAnalysis | null,
  autoTextColor: boolean
): TextTheme {
  if (!autoTextColor || !analysis) return 'light'
  if (analysis.isLight) return 'dark'
  return 'light'
}

/**
 * Build the full set of CSS custom properties for the readability system.
 * These drive the overlay layer, glass surfaces, text color, and text shadow
 * via utility classes defined in globals.css.
 *
 * `suppressOverlay` skips the scrim entirely — used for solid backgrounds where
 * the user picked an exact color and any tint would be a visible color shift
 * (e.g. white turning gray). Legibility there is handled by auto text color.
 */
export function buildReadabilityVars(
  settings: ReadabilitySettings,
  analysis: WallpaperAnalysis | null,
  suppressOverlay = false
): ReadabilityVars {
  const overlay = suppressOverlay
    ? 0
    : resolveOverlayOpacity(settings.overlayStrength, analysis)
  const textTheme = resolveTextTheme(analysis, settings.autoTextColor)
  const isDarkText = textTheme === 'dark'

  const glass = isDarkText ? GLASS_LIGHT_CONTEXT : GLASS_DARK_CONTEXT
  const textShadow = settings.textShadow
    ? isDarkText
      ? TEXT_SHADOW_DARK
      : TEXT_SHADOW_LIGHT
    : 'none'

  // Foreground palette over the wallpaper (independent of the app light/dark
  // theme, which governs the settings panel + solid canvas fallback).
  const fg = isDarkText ? '15, 15, 15' : '255, 255, 255'
  // Inverse of the foreground — used as the text color on an active/selected
  // pill that fills with the foreground color, so it always contrasts the
  // wallpaper instead of a fixed black/white.
  const fgInverse = isDarkText ? '255, 255, 255' : '15, 15, 15'

  return {
    '--overlay-opacity': String(overlay),
    '--fg-rgb': fg,
    '--fg-ink': `rgba(${fg}, 1)`,
    '--fg-body': `rgba(${fg}, ${isDarkText ? 0.72 : 0.82})`,
    '--fg-mute': `rgba(${fg}, ${isDarkText ? 0.55 : 0.62})`,
    '--fg-active-bg': `rgba(${fg}, 0.92)`,
    '--fg-active-fg': `rgba(${fgInverse}, 1)`,
    '--fg-text-shadow': textShadow,
    '--glass-blur': settings.glassEffect ? `${GLASS_BLUR_PX}px` : '0px',
    '--glass-bg': glass.background,
    '--glass-bg-hover': glass.backgroundHover,
    '--glass-border': glass.border,
    '--glass-shadow': settings.glassEffect ? glass.shadow : 'none',
  }
}
