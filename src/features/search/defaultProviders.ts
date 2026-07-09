import type { SearchProvider } from './providerTypes'

/**
 * System builtin search providers.
 *
 * To add a new system provider later, ONLY edit this file — the rest of the
 * app reads everything from the store. Builtins:
 *  - cannot be deleted
 *  - allow reorder / enable / disable
 *  - have fixed id / name / icon / searchUrl (not user-editable)
 *
 * Every `searchUrl` MUST contain the `%s` placeholder (replaced with the
 * URL-encoded keyword at search time).
 */
export const DEFAULT_PROVIDERS: readonly SearchProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: 'simple-icons:google',
    searchUrl: 'https://www.google.com/search?q=%s',
    builtin: true,
    enabled: true,
    order: 0,
    category: 'general',
  },
  {
    id: 'bing',
    name: 'Bing',
    icon: 'simple-icons:microsoftbing',
    searchUrl: 'https://www.bing.com/search?q=%s',
    builtin: true,
    enabled: true,
    order: 1,
    category: 'general',
  },
  {
    id: 'baidu',
    name: 'Baidu',
    icon: 'simple-icons:baidu',
    searchUrl: 'https://www.baidu.com/s?wd=%s',
    builtin: true,
    enabled: true,
    order: 2,
    category: 'general',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: 'simple-icons:openai',
    searchUrl: 'https://chatgpt.com/?q=%s',
    builtin: true,
    enabled: true,
    order: 3,
    category: 'ai',
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: 'simple-icons:claude',
    searchUrl: 'https://claude.ai/new?q=%s',
    builtin: true,
    enabled: true,
    order: 4,
    category: 'ai',
  },
  {
    id: 'bilibili',
    name: 'Bilibili',
    icon: 'simple-icons:bilibili',
    searchUrl: 'https://search.bilibili.com/?keyword=%s',
    builtin: true,
    enabled: true,
    order: 5,
    category: 'video',
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'simple-icons:github',
    searchUrl: 'https://github.com/search?q=%s',
    builtin: true,
    enabled: true,
    order: 6,
    category: 'dev',
  },
] as const

/** Set of builtin ids for quick membership checks. */
export const BUILTIN_PROVIDER_IDS = new Set(DEFAULT_PROVIDERS.map((p) => p.id))

/** Deep copy of the defaults (safe to mutate / persist). */
export function createDefaultProviders(): SearchProvider[] {
  return DEFAULT_PROVIDERS.map((p) => ({ ...p }))
}
