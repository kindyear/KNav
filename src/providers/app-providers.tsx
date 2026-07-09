import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/toast'
import '@/lib/i18n'
import { ThemeProvider } from './theme-provider'
import { SettingsEffects } from './settings-effects'

/**
 * Application-wide provider composition.
 * Order: Theme (owns document appearance) → app content.
 * i18n is initialized as a side-effect import (see '@/lib/i18n') and kept in
 * sync with the settings store via <SettingsEffects>.
 * Router is mounted separately in main.tsx so providers stay router-agnostic.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SettingsEffects />
      {children}
      <Toaster />
    </ThemeProvider>
  )
}
