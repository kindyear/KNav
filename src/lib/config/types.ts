/**
 * Unified config export/import format (schema v2).
 *
 * A single versioned envelope carries every module's data plus any user-uploaded
 * wallpaper blobs. New modules must be added under `data`, never as new top-level
 * fields — this keeps forward/backward compatibility simple.
 *
 *   {
 *     "app": "KNav",
 *     "version": 2,
 *     "exportTime": "2026-07-09T12:00:00.000Z",
 *     "data": {
 *       "settings": {}, "search": {}, "favorites": {},
 *       "background": {}, "history": {},
 *       "wallpapers": [ { id, name, mime, width, height, size, blob } ]
 *     }
 *   }
 */

/** Marker identifying a KNav config file. */
export const CONFIG_APP_NAME = 'KNav'

/** Current export schema version. */
export const CONFIG_VERSION = 2

/** Default export filename. */
export const CONFIG_EXPORT_FILENAME = 'knav-settings.json'

/** Warn before exporting files larger than this (bytes). */
export const CONFIG_LARGE_FILE_BYTES = 100 * 1024 * 1024

/** One exported wallpaper: metadata + Base64-encoded bytes. */
export interface WallpaperExport {
  id: string
  name: string
  mime: string
  width: number
  height: number
  size: number
  /** Raw Base64 payload (no `data:` prefix). */
  blob: string
}

/**
 * The `data` bag. Each module owns one key holding its persisted-shape payload.
 * `Record<string, unknown>` keeps the envelope open to future modules without
 * type churn; concrete modules validate their own slice on import.
 */
export interface ConfigData {
  [moduleKey: string]: unknown
  /** User-uploaded wallpapers (binary), encoded for transport. */
  wallpapers?: WallpaperExport[]
}

/** The complete export envelope (schema v2). */
export interface ConfigEnvelope {
  app: typeof CONFIG_APP_NAME
  version: number
  exportTime: string
  data: ConfigData
}

/**
 * A module registered with the ConfigManager. `key` is its slot under `data`.
 * `serialize` returns a JSON-safe snapshot; `restore` applies an imported slice
 * (and should tolerate partial/unknown input); `reset` restores defaults.
 * Modules never touch wallpaper blobs — those are handled centrally.
 */
export interface ConfigModule {
  key: string
  serialize: () => unknown
  restore: (value: unknown) => void
  reset: () => void
}

/** Per-import outcome so the UI can report successes and partial failures. */
export interface ImportReport {
  /** Count of successfully restored config modules. */
  modulesRestored: number
  /** Count of successfully restored wallpapers. */
  wallpapersRestored: number
  /** Count of wallpapers that failed to restore (import still succeeds). */
  wallpapersFailed: number
}
