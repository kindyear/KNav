import {
  CONFIG_APP_NAME,
  CONFIG_VERSION,
  type ConfigEnvelope,
  type WallpaperExport,
} from './types'

/**
 * Validation for imported config files.
 *
 * Only the v2 envelope is supported: `{ app: "KNav", version, exportTime, data }`.
 * `isKnavEnvelope` gates on the `app` marker plus a `data` bag.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** True when the input is a v2 KNav envelope (has the app marker + data bag). */
export function isKnavEnvelope(input: unknown): input is ConfigEnvelope {
  if (!isRecord(input)) return false
  return input.app === CONFIG_APP_NAME && isRecord(input.data)
}

/** Validate a single wallpaper export entry (defensive against bad files). */
export function isValidWallpaperExport(
  value: unknown
): value is WallpaperExport {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.mime === 'string' &&
    typeof value.blob === 'string' &&
    value.blob.length > 0
  )
}

/** The version we write; exposed for tests / diagnostics. */
export const CURRENT_EXPORT_VERSION = CONFIG_VERSION
