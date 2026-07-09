import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import i18n, {
  FALLBACK_LANGUAGE,
  SUPPORTED_LANGUAGES,
  type Language,
} from '@/lib/i18n'

/** Normalize an arbitrary BCP-47 tag to a supported language, else fallback. */
export function normalizeLanguage(input: string | undefined): Language {
  if (!input) return FALLBACK_LANGUAGE
  const exact = SUPPORTED_LANGUAGES.find((l) => l === input)
  if (exact) return exact
  const base = input.toLowerCase().split('-')[0]
  const byBase = SUPPORTED_LANGUAGES.find(
    (l) => l.toLowerCase().split('-')[0] === base
  )
  return byBase ?? FALLBACK_LANGUAGE
}

/**
 * Imperative language switch — usable outside React.
 * e.g. setLanguage('zh-CN') / setLanguage('en-US').
 */
export function setLanguage(lang: Language): Promise<unknown> {
  return i18n.changeLanguage(lang)
}

/**
 * useLanguage
 * Reactive access to the current language + a typed setter. UI for the switcher
 * is intentionally not built yet; this is the stable interface for it.
 */
export function useLanguage() {
  const { i18n: instance } = useTranslation()
  const language = normalizeLanguage(instance.resolvedLanguage)

  const changeLanguage = useCallback((lang: Language) => {
    return i18n.changeLanguage(lang)
  }, [])

  return {
    language,
    supportedLanguages: SUPPORTED_LANGUAGES,
    setLanguage: changeLanguage,
  }
}
