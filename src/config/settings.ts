import type { GeneralSettings } from '@/types/settings'

/** localStorage key for the persisted settings payload. */
export const SETTINGS_STORAGE_KEY = 'knav.settings'

/** Settings schema version (bump when the shape changes). */
export const SETTINGS_VERSION = 1

/** Throttle window (ms) for writing settings to localStorage. */
export const SETTINGS_PERSIST_THROTTLE_MS = 300

/** Supported UI languages (must mirror the i18n resource bundles). */
export const SUPPORTED_LANGUAGES = ['zh-CN', 'en-US'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

/** Fallback language when the browser language isn't supported. */
export const FALLBACK_LANGUAGE: SupportedLanguage = 'zh-CN'

/** Default General settings on first run. */
export function createDefaultGeneralSettings(): GeneralSettings {
  return {
    language: 'system',
    appearance: 'system',
    timeFormat: '24',
    dateFormat: 'auto',
    showWeekday: true,
    showSeconds: true,
    autoFocusSearch: true,
    enterBehavior: 'new',
  }
}
