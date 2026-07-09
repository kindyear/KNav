/**
 * Icon collections available to the Icon Picker.
 *
 * The whole project renders icons via Iconify by name only (e.g.
 * `simple-icons:google`). Icons are fetched on demand from the Iconify API and
 * cached — no icon library is bundled. Add a collection here to expose it in
 * the picker; nothing else needs to change.
 */

/** A picker tab grouping one or more Iconify collections. */
export type IconTabId = 'recent' | 'all' | 'brands' | 'system' | 'developer' | 'other'

export interface IconCollection {
  /** Iconify collection prefix, e.g. `simple-icons`. */
  prefix: string
  /** Human-friendly collection name (not translated — it's a proper noun). */
  name: string
}

/** All supported collections, keyed by prefix. */
export const COLLECTIONS: Record<string, IconCollection> = {
  'simple-icons': { prefix: 'simple-icons', name: 'Simple Icons' },
  lucide: { prefix: 'lucide', name: 'Lucide' },
  'material-symbols': { prefix: 'material-symbols', name: 'Material Symbols' },
  tabler: { prefix: 'tabler', name: 'Tabler' },
  carbon: { prefix: 'carbon', name: 'Carbon' },
  fluent: { prefix: 'fluent', name: 'Fluent UI' },
  heroicons: { prefix: 'heroicons', name: 'Heroicons' },
  ph: { prefix: 'ph', name: 'Phosphor' },
  ri: { prefix: 'ri', name: 'Remix Icons' },
  bi: { prefix: 'bi', name: 'Bootstrap Icons' },
}

/**
 * Picker tab definitions.
 * - `browsePrefixes`: collections whose full icon lists are loaded when the tab
 *   is opened WITHOUT a search query (kept small to avoid huge initial loads).
 * - `searchPrefixes`: collections searched when the user types.
 *
 * The "All" tab intentionally browses only Simple Icons + Lucide (per the
 * lazy-load requirement) but searches across every collection.
 */
export interface IconTab {
  id: IconTabId
  /** i18n key under `iconPicker.tabs`. */
  labelKey: string
  browsePrefixes: string[]
  searchPrefixes: string[]
}

const ALL_PREFIXES = Object.keys(COLLECTIONS)

export const ICON_TABS: IconTab[] = [
  {
    id: 'all',
    labelKey: 'all',
    browsePrefixes: ['simple-icons', 'lucide'],
    searchPrefixes: ALL_PREFIXES,
  },
  {
    id: 'brands',
    labelKey: 'brands',
    browsePrefixes: ['simple-icons'],
    searchPrefixes: ['simple-icons'],
  },
  {
    id: 'system',
    labelKey: 'system',
    browsePrefixes: ['lucide', 'material-symbols'],
    searchPrefixes: ['lucide', 'material-symbols'],
  },
  {
    id: 'developer',
    labelKey: 'developer',
    browsePrefixes: ['tabler', 'carbon', 'fluent'],
    searchPrefixes: ['tabler', 'carbon', 'fluent'],
  },
  {
    id: 'other',
    labelKey: 'other',
    browsePrefixes: ['heroicons', 'bi', 'ri', 'ph'],
    searchPrefixes: ['heroicons', 'bi', 'ri', 'ph'],
  },
]

/** Resolve a collection's display name from a prefix (falls back to prefix). */
export function getCollectionName(prefix: string): string {
  return COLLECTIONS[prefix]?.name ?? prefix
}
