import { createId } from '@/utils/gradient'
import type {
  ProviderFormValues,
  SearchProvider,
} from './providerTypes'

/** Max providers that can be enabled (shown in the top bar) at once. */
export const MAX_ENABLED_PROVIDERS = 10

/** The required keyword placeholder in a provider's search URL. */
export const URL_PLACEHOLDER = '%s'

/** Generate a unique id for a user-created provider. */
export function createProviderId(): string {
  return createId('sp')
}

/** Whether a search URL is valid (non-empty and contains the placeholder). */
export function isValidSearchUrl(url: string): boolean {
  return url.trim().length > 0 && url.includes(URL_PLACEHOLDER)
}

/**
 * Build the destination URL for a keyword under the given provider.
 * Replaces `%s` with the URL-encoded keyword.
 */
export function buildSearchUrl(
  provider: SearchProvider,
  keyword: string
): string {
  return provider.searchUrl.replaceAll(
    URL_PLACEHOLDER,
    encodeURIComponent(keyword)
  )
}

/** Ascending sort by `order` (stable for equal orders). */
export function byOrder(a: SearchProvider, b: SearchProvider): number {
  return a.order - b.order
}

/** Enabled providers, sorted by order (the top-bar list). */
export function getEnabledProviders(
  providers: SearchProvider[]
): SearchProvider[] {
  return providers.filter((p) => p.enabled).sort(byOrder)
}

/** Disabled providers, sorted by order (the "Available" list). */
export function getAvailableProviders(
  providers: SearchProvider[]
): SearchProvider[] {
  return providers.filter((p) => !p.enabled).sort(byOrder)
}

/** The next `order` value (max + 1), so new items sort to the end. */
export function nextOrder(providers: SearchProvider[]): number {
  return providers.reduce((max, p) => Math.max(max, p.order), -1) + 1
}

/**
 * Create a user provider from form values.
 * builtin=false, enabled=false, ordered to the end.
 */
export function createUserProvider(
  values: ProviderFormValues,
  providers: SearchProvider[]
): SearchProvider {
  return {
    id: createProviderId(),
    name: values.name.trim(),
    icon: values.icon,
    searchUrl: values.searchUrl.trim(),
    builtin: false,
    enabled: false,
    order: nextOrder(providers),
    category: values.category?.trim() || undefined,
    description: values.description?.trim() || undefined,
  }
}

/** Runtime type guard for a persisted/imported provider object. */
export function isSearchProvider(value: unknown): value is SearchProvider {
  if (typeof value !== 'object' || value === null) return false
  const p = value as Record<string, unknown>
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    typeof p.icon === 'string' &&
    typeof p.searchUrl === 'string' &&
    typeof p.builtin === 'boolean' &&
    typeof p.enabled === 'boolean' &&
    typeof p.order === 'number'
  )
}
