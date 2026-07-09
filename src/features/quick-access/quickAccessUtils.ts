import { createId } from '@/utils/gradient'
import type { QuickAccessFormValues, QuickAccessItem } from './quickAccessTypes'

/** Max total quick-access items (builtin + user) allowed. */
export const MAX_QUICK_ACCESS_ITEMS = 128

/** Generate a unique id for a user-created quick-access item. */
export function createQuickAccessId(): string {
  return createId('qa')
}

/** Whether a URL is valid (must start with http:// or https://). */
export function isValidQuickAccessUrl(url: string): boolean {
  return /^https?:\/\/\S+/i.test(url.trim())
}

/** Ascending sort by `order`. */
export function byOrder(a: QuickAccessItem, b: QuickAccessItem): number {
  return a.order - b.order
}

/** Enabled items, sorted by order (the home-page grid + "Activated" list). */
export function getEnabledItems(items: QuickAccessItem[]): QuickAccessItem[] {
  return items.filter((i) => i.enabled).sort(byOrder)
}

/** Disabled items, sorted by order (the "Hidden" list). */
export function getHiddenItems(items: QuickAccessItem[]): QuickAccessItem[] {
  return items.filter((i) => !i.enabled).sort(byOrder)
}

/** The next `order` value (max + 1), so new items sort to the end. */
export function nextOrder(items: QuickAccessItem[]): number {
  return items.reduce((max, i) => Math.max(max, i.order), -1) + 1
}

/** Whether another item can be added (under the total limit). */
export function canAddItem(items: QuickAccessItem[]): boolean {
  return items.length < MAX_QUICK_ACCESS_ITEMS
}

/**
 * Create a user item from form values.
 * builtin=false, enabled=true (visible immediately), ordered to the end.
 */
export function createUserItem(
  values: QuickAccessFormValues,
  items: QuickAccessItem[]
): QuickAccessItem {
  return {
    id: createQuickAccessId(),
    name: values.name.trim(),
    icon: values.icon,
    url: values.url.trim(),
    builtin: false,
    enabled: true,
    order: nextOrder(items),
    category: values.category?.trim() || undefined,
    description: values.description?.trim() || undefined,
    accentColor: values.accentColor?.trim() || undefined,
  }
}

/** Runtime type guard for a persisted/imported item object. */
export function isQuickAccessItem(value: unknown): value is QuickAccessItem {
  if (typeof value !== 'object' || value === null) return false
  const i = value as Record<string, unknown>
  return (
    typeof i.id === 'string' &&
    typeof i.name === 'string' &&
    typeof i.icon === 'string' &&
    typeof i.url === 'string' &&
    typeof i.builtin === 'boolean' &&
    typeof i.enabled === 'boolean' &&
    typeof i.order === 'number'
  )
}
