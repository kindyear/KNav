/**
 * Theme domain types.
 * - `Theme` is the user-facing preference (persisted).
 * - `ResolvedTheme` is the concrete applied appearance after resolving System.
 */
export type Theme = 'light' | 'dark' | 'system'

export type ResolvedTheme = 'light' | 'dark'
