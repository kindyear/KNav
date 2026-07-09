import type { AppearanceSetting } from '@/types/settings'

/**
 * themeService — resolves the appearance preference to a concrete light/dark
 * value and applies it to the document root. Also exposes a subscription to the
 * OS color-scheme so `system` can react in real time without a reload.
 */

export type ResolvedAppearance = 'light' | 'dark'

const MEDIA_QUERY = '(prefers-color-scheme: dark)'

/** Read the current OS color scheme. */
export function getSystemAppearance(): ResolvedAppearance {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light'
}

/** Resolve an appearance preference against the current OS scheme. */
export function resolveAppearance(
  setting: AppearanceSetting,
  system: ResolvedAppearance = getSystemAppearance()
): ResolvedAppearance {
  return setting === 'system' ? system : setting
}

/**
 * Apply a concrete appearance to <html> (and mirror it on <body>):
 * toggles the `light` / `dark` classes and the CSS `color-scheme`.
 */
export function applyAppearance(resolved: ResolvedAppearance): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.classList.toggle('light', resolved === 'light')
  root.style.colorScheme = resolved

  const body = document.body
  if (body) {
    body.classList.toggle('dark', resolved === 'dark')
    body.classList.toggle('light', resolved === 'light')
  }
}

/**
 * Subscribe to OS color-scheme changes. The callback receives the new resolved
 * appearance. Returns an unsubscribe function.
 */
export function subscribeSystemAppearance(
  onChange: (appearance: ResolvedAppearance) => void
): () => void {
  if (typeof window === 'undefined') return () => {}
  const mql = window.matchMedia(MEDIA_QUERY)
  const handler = (e: MediaQueryListEvent) => {
    onChange(e.matches ? 'dark' : 'light')
  }
  mql.addEventListener('change', handler)
  return () => mql.removeEventListener('change', handler)
}
