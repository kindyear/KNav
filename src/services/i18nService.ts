import i18n from '@/lib/i18n'
import { resolveLanguage } from '@/utils/language'
import type { LanguageSetting } from '@/types/settings'

/**
 * i18nService — the single place that talks to the i18next instance.
 * Resolution logic lives in `@/utils/language`; this module only applies a
 * resolved language to i18next.
 */

export { resolveLanguage } from '@/utils/language'

/** Apply a language preference to i18next (no-op if already active). */
export function applyLanguage(setting: LanguageSetting): void {
  const next = resolveLanguage(setting)
  if (i18n.resolvedLanguage !== next) {
    void i18n.changeLanguage(next)
  }
}
