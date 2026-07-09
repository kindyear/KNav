import type { GradientConfig, WallpaperConfig } from '@/types/wallpaper'
import { BingMode, WallpaperType } from '@/types/wallpaper'

/** localStorage key for the persisted wallpaper configuration. */
export const WALLPAPER_STORAGE_KEY = 'knav.wallpaper'

/** Persisted-state schema version (bump when the shape changes). */
export const WALLPAPER_STORE_VERSION = 2

/** Throttle window (ms) for writing wallpaper state to localStorage. */
export const WALLPAPER_PERSIST_THROTTLE_MS = 300

/** Cross-fade duration (ms) applied when switching backgrounds. */
export const WALLPAPER_FADE_MS = 250

/**
 * Slower fade-in (ms) used when an image-based wallpaper (Bing / Local) first
 * paints. Gives a gentle reveal instead of a hard pop, which also masks slow
 * network loads.
 */
export const WALLPAPER_IMAGE_FADE_MS = 700

/** Max number of user-added colors / gradients. */
export const CUSTOM_SLOT_LIMIT = 6

/** Allowed color-stop counts for a gradient. */
export const GRADIENT_MIN_COLORS = 2
export const GRADIENT_MAX_COLORS = 4

/** Discrete direction presets (degrees) offered by the editor. */
export const GRADIENT_DIRECTION_STOPS = [0, 45, 90, 135, 180, 270] as const

/** Accepted upload MIME types for local wallpapers. */
export const LOCAL_ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const

/**
 * Bing daily-image endpoint builder.
 * `idx=0` starts at today; `n` is how many recent images to return (max 8).
 *
 * The Bing HPImageArchive endpoint does NOT send CORS headers, so the browser
 * cannot fetch it directly. We request a same-origin path (`/bing-api/...`)
 * that a proxy rewrites to `https://www.bing.com/...`:
 *  - dev: configured in vite.config.ts (`server.proxy`)
 *  - prod: configure your reverse proxy (nginx/CDN) to forward `/bing-api`.
 * The returned image `url` is absolutized against BING_ORIGIN; images
 * themselves load fine cross-origin (they're just <img>/background requests).
 */
export function buildBingEndpoint(count: number): string {
  const n = Math.min(Math.max(count, 1), BING_MAX_POOL)
  return `${BING_API_PROXY_PATH}/HPImageArchive.aspx?format=js&idx=0&n=${n}`
}

/** Same-origin path proxied to the Bing host (see buildBingEndpoint). */
export const BING_API_PROXY_PATH = '/bing-api'

/** How many recent images to pull for the random pool (Bing caps at 8). */
export const BING_MAX_POOL = 8

/** Base origin used to absolutize Bing's relative image URLs. */
export const BING_ORIGIN = 'https://www.bing.com'

/** Built-in solid color presets (hex). */
export const SOLID_PRESET_COLORS: string[] = [
  '#000000',
  '#111827',
  '#1E293B',
  '#374151',
  '#2563EB',
  '#7C3AED',
  '#DC2626',
  '#059669',
  '#D97706',
  '#F8FAFC',
]

/** Built-in gradient presets. */
export const GRADIENT_PRESETS: GradientConfig[] = [
  {
    id: 'blue-purple',
    mode: 'linear',
    angle: 135,
    colors: ['#4F46E5', '#7C3AED'],
  },
  {
    id: 'pink-purple',
    mode: 'linear',
    angle: 135,
    colors: ['#EC4899', '#8B5CF6'],
  },
  { id: 'sunset', mode: 'linear', angle: 135, colors: ['#F97316', '#DB2777'] },
  {
    id: 'deep-space',
    mode: 'linear',
    angle: 135,
    colors: ['#1E293B', '#0F172A'],
  },
  {
    id: 'aurora',
    mode: 'linear',
    angle: 135,
    colors: ['#22D3EE', '#A855F7', '#6366F1'],
  },
  { id: 'ocean', mode: 'linear', angle: 135, colors: ['#0EA5E9', '#1E3A8A'] },
  { id: 'forest', mode: 'linear', angle: 135, colors: ['#34D399', '#047857'] },
  { id: 'rose', mode: 'linear', angle: 135, colors: ['#FB7185', '#E11D48'] },
  { id: 'amber', mode: 'linear', angle: 135, colors: ['#FBBF24', '#F97316'] },
  { id: 'twilight', mode: 'radial', angle: 0, colors: ['#6D28D9', '#0F172A'] },
]

/** Default color used when adding a brand-new custom swatch. */
export const DEFAULT_CUSTOM_COLOR = '#3B82F6'

/** Factory for a fresh custom gradient (used by "Create Gradient"). */
export function createDefaultGradient(id: string): GradientConfig {
  return { id, mode: 'linear', angle: 135, colors: ['#3B82F6', '#06B6D4'] }
}

/** The initial wallpaper configuration on first run. */
export function createDefaultWallpaperConfig(): WallpaperConfig {
  return {
    type: WallpaperType.Bing,
    solid: {
      current: SOLID_PRESET_COLORS[1],
      presets: [...SOLID_PRESET_COLORS],
      customs: [],
    },
    gradient: {
      current: GRADIENT_PRESETS[0],
      presets: GRADIENT_PRESETS.map((g) => ({ ...g, colors: [...g.colors] })),
      customs: [],
    },
    bing: {
      enabled: true,
      mode: BingMode.Daily,
      url: '',
      title: '',
      copyright: '',
      date: '',
      lastFetchDate: '',
    },
    local: {
      fileName: '',
    },
  }
}
