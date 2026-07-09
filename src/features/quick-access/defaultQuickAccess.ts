import type { QuickAccessItem } from './quickAccessTypes'

/**
 * System default Quick Access sites.
 *
 * These are seeded ONLY on first run. Afterwards they behave exactly like any
 * user item — the user may reorder, hide, edit, or delete them freely (unlike
 * search providers, quick-access builtins are NOT permanent).
 *
 * To change the initial set, edit this file. `id` is a stable slug so that a
 * reinstall keeps the same identity; `icon` is an Iconify name (e.g.
 * `simple-icons:google`).
 */
export const DEFAULT_QUICK_ACCESS: readonly QuickAccessItem[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: 'simple-icons:openai',
    url: 'https://chatgpt.com',
    category: 'ai',
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: 'simple-icons:claude',
    url: 'https://claude.ai',
    category: 'ai',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: 'simple-icons:googlegemini',
    url: 'https://gemini.google.com',
    category: 'ai',
  },
  {
    id: 'deepseek',
    name: 'Deepseek',
    icon: 'simple-icons:deepseek',
    url: 'https://chat.deepseek.com',
    category: 'dev',
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'simple-icons:github',
    url: 'https://github.com',
    category: 'dev',
  },
  {
    id: 'bilibili',
    name: '哔哩哔哩',
    icon: 'simple-icons:bilibili',
    url: 'https://www.bilibili.com',
    category: 'video',
  },
].map((item, index) => ({
  ...item,
  builtin: true,
  enabled: true,
  order: index,
}))

/** Deep copy of the defaults (safe to mutate / persist). */
export function createDefaultQuickAccess(): QuickAccessItem[] {
  return DEFAULT_QUICK_ACCESS.map((item) => ({ ...item }))
}
