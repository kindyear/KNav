import { buildGradientCss } from '@/utils/gradient'
import { BING_API_PROXY_PATH, BING_ORIGIN } from '@/config/wallpaper'
import { WallpaperType } from '@/types/wallpaper'
import type { WallpaperConfig } from '@/types/wallpaper'
import type { WallpaperAnalysis } from '@/types/readability'
import {
  analyzeColor,
  analyzeColors,
  analyzeImage,
} from '@/services/wallpaperAnalyzer'

/** A resolved background style derived from a wallpaper config. */
export interface ResolvedBackground {
  backgroundColor: string
  backgroundImage: string
  backgroundSize: string
  backgroundPosition: string
  backgroundRepeat: string
}

const EMPTY_BACKGROUND: ResolvedBackground = {
  backgroundColor: 'transparent',
  backgroundImage: 'none',
  backgroundSize: 'auto',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
}

/**
 * Resolve a WallpaperConfig into the concrete background style to apply.
 * This is the single place that maps each wallpaper type to CSS — the renderer
 * consumes the result and no component touches `document` styles directly.
 *
 * - Solid:    background-color
 * - Gradient: background-image (via buildGradientCss)
 * - Bing:     background-image url + cover/center (falls back to none if empty)
 * - Local:    same as Bing using the runtime object URL (from IndexedDB)
 */
export function resolveBackground(
  config: WallpaperConfig,
  localUrl = ''
): ResolvedBackground {
  switch (config.type) {
    case WallpaperType.Solid:
      return {
        ...EMPTY_BACKGROUND,
        backgroundColor: config.solid.current,
      }
    case WallpaperType.Gradient:
      return {
        ...EMPTY_BACKGROUND,
        backgroundImage: buildGradientCss(config.gradient.current),
      }
    case WallpaperType.Bing:
      if (!config.bing.url) return EMPTY_BACKGROUND
      return {
        ...EMPTY_BACKGROUND,
        backgroundImage: `url("${config.bing.url}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    case WallpaperType.Local:
      if (!localUrl) return EMPTY_BACKGROUND
      return {
        ...EMPTY_BACKGROUND,
        backgroundImage: `url("${localUrl}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    default:
      return EMPTY_BACKGROUND
  }
}

/**
 * A stable signature identifying the current background for analysis caching.
 * Images key on their URL; colors/gradients key on their color composition.
 * Returns null when there's nothing to analyze (e.g. empty background).
 */
export function backgroundAnalysisKey(
  config: WallpaperConfig,
  localUrl = ''
): string | null {
  switch (config.type) {
    case WallpaperType.Solid:
      return `solid:${config.solid.current}`
    case WallpaperType.Gradient:
      return `gradient:${config.gradient.current.colors.join(',')}`
    case WallpaperType.Bing:
      return config.bing.url ? `bing:${config.bing.url}` : null
    case WallpaperType.Local:
      return localUrl ? `local:${config.local.fileName}` : null
    default:
      return null
  }
}

/**
 * Rewrite a Bing image URL to the same-origin proxy path so it can be drawn to
 * a canvas without tainting it (cross-origin images block getImageData).
 * Non-Bing URLs (e.g. local data URLs) are returned unchanged.
 */
function toAnalyzableBingUrl(url: string): string {
  if (url.startsWith(BING_ORIGIN)) {
    return url.replace(BING_ORIGIN, BING_API_PROXY_PATH)
  }
  return url
}

/**
 * Analyze the current background's brightness. Solid/gradient are computed
 * synchronously from their colors; image-based backgrounds sample a canvas.
 * Rejects/returns via the underlying analyzers; callers cache the result.
 */
export async function analyzeBackground(
  config: WallpaperConfig,
  localUrl = ''
): Promise<WallpaperAnalysis> {
  switch (config.type) {
    case WallpaperType.Solid:
      return analyzeColor(config.solid.current)
    case WallpaperType.Gradient:
      return analyzeColors(config.gradient.current.colors)
    case WallpaperType.Bing:
      return analyzeImage(toAnalyzableBingUrl(config.bing.url))
    case WallpaperType.Local:
      return analyzeImage(localUrl)
    default:
      return analyzeColor('#000000')
  }
}
