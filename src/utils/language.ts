import {
  FALLBACK_LANGUAGE,
  SETTINGS_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '@/config/settings'
import type { LanguageSetting } from '@/types/settings'

/**
 * language utils — pure language-resolution helpers with no i18n dependency.
 * Shared by both the i18n bootstrap (initial language) and the runtime service,
 * so resolution logic lives in exactly one place (and avoids import cycles).
 */

/** Whether a raw tag is one of our supported languages. */
export function isSupportedLanguage(tag: string): tag is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(tag)
}

/**
 * Map an arbitrary browser tag (e.g. `zh`, `zh-Hans`, `en-GB`) to a supported
 * language, falling back to the default when unsupported.
 */
export function normalizeBrowserLanguage(
  raw: string | undefined
): SupportedLanguage {
  if (!raw) return FALLBACK_LANGUAGE
  if (isSupportedLanguage(raw)) return raw
  const base = raw.toLowerCase().split('-')[0]
  const match = SUPPORTED_LANGUAGES.find(
    (lng) => lng.toLowerCase().split('-')[0] === base
  )
  return match ?? FALLBACK_LANGUAGE
}

/** Read the current OS/browser language, normalized to a supported language. */
export function getSystemLanguage(): SupportedLanguage {
  const browser =
    typeof navigator !== 'undefined' ? navigator.language : undefined
  return normalizeBrowserLanguage(browser)
}

/**
 * Resolve a `LanguageSetting` to the concrete language to apply.
 * `system` follows the browser language; explicit choices are used as-is.
 */
export function resolveLanguage(setting: LanguageSetting): SupportedLanguage {
  if (setting === 'system') return getSystemLanguage()
  return isSupportedLanguage(setting) ? setting : FALLBACK_LANGUAGE
}

/**
 * Read the persisted language preference directly from localStorage (the
 * zustand-persisted settings payload). Used to bootstrap i18n synchronously
 * before React mounts, so the settings store is the single source of truth.
 */
export function readPersistedLanguageSetting(): LanguageSetting {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return 'system'
    const parsed = JSON.parse(raw) as {
      state?: { general?: { language?: LanguageSetting } }
    }
    return parsed.state?.general?.language ?? 'system'
  } catch {
    return 'system'
  }
}

/** The concrete language i18n should boot with, from persisted settings. */
export function resolveInitialLanguage(): SupportedLanguage {
  return resolveLanguage(readPersistedLanguageSetting())
}
