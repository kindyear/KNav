/**
 * Quick Access domain model.
 *
 * The Quick Access grid is fully config-driven: nothing on the home page is
 * hardcoded. All tiles are read from the store, filtered by `enabled` and
 * ordered by `order`.
 *
 * NOTE: user data (name / url / category / description) is NEVER translated —
 * only surrounding management UI uses i18n.
 */
export interface QuickAccessItem {
  /** Stable unique id. Builtins use a slug; user items use a generated id. */
  id: string
  /** Display name shown under the logo (user data — not translated). */
  name: string
  /** Icon registry key (e.g. `SiGoogle`). Rendered via the icon registry. */
  icon: string
  /** Destination URL. MUST start with http:// or https://. Opened in a new tab. */
  url: string
  /** true = seeded from system defaults on first run; false = user-created. */
  builtin: boolean
  /** Whether the tile appears on the home page. */
  enabled: boolean
  /** Sort order (ascending) within enabled + hidden lists. */
  order: number
  /** Optional grouping category (user data — not translated). */
  category?: string
  /** Optional description (user data — not translated). */
  description?: string
  /** Optional brand/accent color override (hex). Falls back to icon color. */
  accentColor?: string
}

/** The shape persisted to localStorage (the whole array under one key). */
export type QuickAccessList = QuickAccessItem[]

/** Fields a user may provide when creating/editing a Quick Access item. */
export interface QuickAccessFormValues {
  name: string
  url: string
  icon: string
  category?: string
  description?: string
  accentColor?: string
}
