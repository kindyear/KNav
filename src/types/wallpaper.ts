/**
 * Wallpaper domain types.
 * Single source of truth for wallpaper configuration shapes shared across the
 * store, services, utils, and UI components.
 */

/** The four supported wallpaper sources. */
export const WallpaperType = {
  Solid: 'solid',
  Gradient: 'gradient',
  Bing: 'bing',
  Local: 'local',
} as const

export type WallpaperType = (typeof WallpaperType)[keyof typeof WallpaperType]

/** Gradient rendering mode. */
export type GradientMode = 'linear' | 'radial' | 'conic'

/**
 * Bing wallpaper mode.
 * - daily:  the official daily image, cached and refreshed once per day.
 * - random: a random pick from the recent image pool on each app open.
 */
export const BingMode = {
  Daily: 'daily',
  Random: 'random',
} as const

export type BingMode = (typeof BingMode)[keyof typeof BingMode]

/** A single gradient definition (2–4 color stops). */
export interface GradientConfig {
  id: string
  mode: GradientMode
  /** Angle in degrees (used by linear/conic; ignored by radial). */
  angle: number
  /** Ordered color stops (hex). Length is constrained to 2–4 at the UI/store. */
  colors: string[]
}

/** Solid-color sub-configuration. */
export interface SolidWallpaperConfig {
  /** Currently applied color (hex). */
  current: string
  /** Built-in preset colors (hex). */
  presets: string[]
  /** User-added colors (hex), capped by config. */
  customs: string[]
}

/** Gradient sub-configuration. */
export interface GradientWallpaperConfig {
  /** Currently applied gradient. */
  current: GradientConfig
  /** Built-in preset gradients. */
  presets: GradientConfig[]
  /** User-created gradients, capped by config. */
  customs: GradientConfig[]
}

/** Bing daily-image sub-configuration (cache of the last successful fetch). */
export interface BingWallpaperConfig {
  enabled: boolean
  /** Which Bing mode is active: daily rotation or random-on-open. */
  mode: BingMode
  /** Full image URL (absolute) currently displayed. Empty until first fetch. */
  url: string
  /** Image title. */
  title: string
  /** Copyright string. */
  copyright: string
  /** Bing's `startdate` (yyyymmdd) or a display date. */
  date: string
  /** ISO date (yyyy-mm-dd) of the last successful daily fetch; drives refresh. */
  lastFetchDate: string
}

/**
 * Local uploaded-image sub-configuration.
 * Only lightweight metadata is persisted here — the image bytes live in
 * IndexedDB (see services/localWallpaperStore) and are exposed to the UI at
 * runtime as a short-lived object URL, never stored as Base64.
 */
export interface LocalWallpaperConfig {
  fileName: string
}

/** The complete wallpaper configuration persisted to storage. */
export interface WallpaperConfig {
  type: WallpaperType
  solid: SolidWallpaperConfig
  gradient: GradientWallpaperConfig
  bing: BingWallpaperConfig
  local: LocalWallpaperConfig
}

/** Raw payload shape returned by the Bing HPImageArchive endpoint (subset). */
export interface BingImageDto {
  title: string
  copyright: string
  /** Relative URL fragment, e.g. "/th?id=...". */
  url: string
  /** yyyymmdd. */
  startdate: string
}
