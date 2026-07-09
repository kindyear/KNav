import { createContext } from 'react'
import type { ResolvedTheme, Theme } from '@/types/theme'

export interface ThemeContextValue {
  /** Current user preference. */
  theme: Theme
  /** Concrete applied appearance after resolving `system`. */
  resolvedTheme: ResolvedTheme
  /** Update the user preference. */
  setTheme: (theme: Theme) => void
  /** Convenience toggle between light and dark (resolves system first). */
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
