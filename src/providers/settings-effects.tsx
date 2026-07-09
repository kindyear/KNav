import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settings'
import { applyLanguage } from '@/services/i18nService'

/**
 * SettingsEffects
 * Headless component that applies settings side-effects that aren't handled by
 * a dedicated provider. Currently syncs the i18n language with the persisted
 * language preference (appearance is owned by ThemeProvider).
 * Mount once near the app root.
 */
export function SettingsEffects() {
  const language = useSettingsStore((s) => s.general.language)

  useEffect(() => {
    applyLanguage(language)
  }, [language])

  return null
}
