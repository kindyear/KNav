import i18n from 'i18next'
import type { InitOptions } from 'i18next'
import { initReactI18next } from 'react-i18next'

import { resolveInitialLanguage } from '@/utils/language'

import enCommon from '@/locales/en-US/common.json'
import enNavigation from '@/locales/en-US/navigation.json'
import enHero from '@/locales/en-US/hero.json'
import enSearch from '@/locales/en-US/search.json'
import enQuickAccess from '@/locales/en-US/quick-access.json'
import enSettings from '@/locales/en-US/settings.json'
import enAbout from '@/locales/en-US/about.json'
import enFooter from '@/locales/en-US/footer.json'
import enWallpaper from '@/locales/en-US/wallpaper.json'

import zhCommon from '@/locales/zh-CN/common.json'
import zhNavigation from '@/locales/zh-CN/navigation.json'
import zhHero from '@/locales/zh-CN/hero.json'
import zhSearch from '@/locales/zh-CN/search.json'
import zhQuickAccess from '@/locales/zh-CN/quick-access.json'
import zhSettings from '@/locales/zh-CN/settings.json'
import zhAbout from '@/locales/zh-CN/about.json'
import zhFooter from '@/locales/zh-CN/footer.json'
import zhWallpaper from '@/locales/zh-CN/wallpaper.json'

/** Supported language codes. Add a new entry here + a locales folder to extend. */
export const SUPPORTED_LANGUAGES = ['en-US', 'zh-CN'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]

export const FALLBACK_LANGUAGE: Language = 'en-US'

/** i18n namespaces, split by module. */
export const NAMESPACES = [
  'common',
  'navigation',
  'hero',
  'search',
  'quickAccess',
  'settings',
  'about',
  'footer',
  'wallpaper',
] as const

export const DEFAULT_NS = 'common'

const resources = {
  'en-US': {
    common: enCommon,
    navigation: enNavigation,
    hero: enHero,
    search: enSearch,
    quickAccess: enQuickAccess,
    settings: enSettings,
    about: enAbout,
    footer: enFooter,
    wallpaper: enWallpaper,
  },
  'zh-CN': {
    common: zhCommon,
    navigation: zhNavigation,
    hero: zhHero,
    search: zhSearch,
    quickAccess: zhQuickAccess,
    settings: zhSettings,
    about: zhAbout,
    footer: zhFooter,
    wallpaper: zhWallpaper,
  },
} as const

i18n.use(initReactI18next).init({
  resources,
  lng: resolveInitialLanguage(),
  fallbackLng: FALLBACK_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES,
  // `supportedLngs` already normalizes bare tags to their supported variant
  // (e.g. "zh" → "zh-CN", "en" → "en-US"). Do NOT enable
  // `nonExplicitSupportedLngs`: combined with region-coded resources
  // (en-US / zh-CN) it strips the region and makes the translator look up a
  // non-existent "en"/"zh" bundle, so every key falls through to its raw name.
  ns: NAMESPACES,
  defaultNS: DEFAULT_NS,
  // Resources are bundled inline, so initialize synchronously. Without this,
  // i18next finishes init on a later tick and (with Suspense disabled) the
  // first render shows raw keys that never get re-rendered.
  // `initImmediate` is a valid runtime option missing from these typings.
  initImmediate: false,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
} as InitOptions)

export default i18n

/** Keep <html lang> in sync with the active language. */
function syncHtmlLang(lang: string | undefined) {
  if (typeof document !== 'undefined' && lang) {
    document.documentElement.lang = lang
  }
}
syncHtmlLang(i18n.resolvedLanguage)
i18n.on('languageChanged', syncHtmlLang)
