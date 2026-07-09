/**
 * Search provider domain model.
 *
 * The entire search system is config-driven: nothing hardcodes Google/Bing/etc.
 * All search UI reads providers from the store, filtered by `enabled` and
 * ordered by `order`.
 */
export interface SearchProvider {
  /** Stable unique id. Builtins use a slug; user providers use a uuid. */
  id: string
  /** Display name (builtin names are fixed; user names are editable). */
  name: string
  /** Icon registry key (e.g. `SiGoogle`). Rendered via the icon registry. */
  icon: string
  /**
   * Search URL template. MUST contain the `%s` placeholder, which is replaced
   * with `encodeURIComponent(keyword)` at search time.
   * e.g. `https://www.google.com/search?q=%s`
   */
  searchUrl: string
  /** Optional search-suggestion endpoint (reserved; not used yet). */
  suggestionUrl?: string
  /** Optional parser identifier for suggestions (reserved; not used yet). */
  suggestionParser?: string
  /** true = system builtin (cannot be deleted); false = user-created. */
  builtin: boolean
  /** Whether the provider appears in the top search bar. */
  enabled: boolean
  /** Sort order (ascending) within enabled + available lists. */
  order: number
  /** Optional grouping category. */
  category?: string
  /** Optional description. */
  description?: string
}

/** The shape persisted to localStorage (the whole array under one key). */
export type SearchProviderList = SearchProvider[]

/** Fields a user may provide when creating/editing a custom provider. */
export interface ProviderFormValues {
  name: string
  icon: string
  searchUrl: string
  category?: string
  description?: string
}
