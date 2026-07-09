import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useSettingsStore } from '@/stores/settings'
import {
  applyAppearance,
  getSystemAppearance,
  resolveAppearance,
  subscribeSystemAppearance,
  type ResolvedAppearance,
} from '@/services/themeService'
import type { AppearanceSetting } from '@/types/settings'
import { ThemeContext } from './theme-context'

/**
 * ThemeProvider
 * - Reads the appearance preference from the unified settings store.
 * - Resolves `system` against the OS scheme and applies the `.light`/`.dark`
 *   class + `color-scheme` to the document root (no reload).
 * - Subscribes to OS color-scheme changes so `system` reacts in real time.
 * - Exposes the theme context consumed by `useTheme()` (e.g. the Toaster).
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const appearance = useSettingsStore((s) => s.general.appearance)
  const setGeneral = useSettingsStore((s) => s.setGeneral)

  const [systemAppearance, setSystemAppearance] =
    useState<ResolvedAppearance>(getSystemAppearance)

  // Track the OS color scheme for `system` mode.
  useEffect(() => subscribeSystemAppearance(setSystemAppearance), [])

  const resolvedTheme = resolveAppearance(appearance, systemAppearance)

  // Apply the resolved appearance to the document root.
  useEffect(() => {
    applyAppearance(resolvedTheme)
  }, [resolvedTheme])

  const setTheme = useCallback(
    (next: AppearanceSetting) => setGeneral({ appearance: next }),
    [setGeneral]
  )

  const toggleTheme = useCallback(() => {
    setGeneral({ appearance: resolvedTheme === 'dark' ? 'light' : 'dark' })
  }, [resolvedTheme, setGeneral])

  const value = useMemo(
    () => ({ theme: appearance, resolvedTheme, setTheme, toggleTheme }),
    [appearance, resolvedTheme, setTheme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
