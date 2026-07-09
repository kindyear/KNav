import type {
  AppearanceSetting,
  DateFormatSetting,
  EnterBehaviorSetting,
  GeneralSettings,
  LanguageSetting,
  TimeFormatSetting,
} from '@/types/settings'

/**
 * settingsService — settings-payload validation used by the ConfigManager.
 *
 * All import/export/reset/clear orchestration now lives in
 * `@/lib/config` (ConfigManager). This module keeps only the settings-specific
 * validation + parsing used to restore the settings module on import.
 */

// ── Validation ──────────────────────────────────────────────────────────────

const LANGUAGES: LanguageSetting[] = ['system', 'zh-CN', 'en-US']
const APPEARANCES: AppearanceSetting[] = ['system', 'light', 'dark']
const TIME_FORMATS: TimeFormatSetting[] = ['24', '12']
const DATE_FORMATS: DateFormatSetting[] = [
  'auto',
  'yyyy-mm-dd',
  'mm-dd-yyyy',
  'dd-mm-yyyy',
]
const ENTER_BEHAVIORS: EnterBehaviorSetting[] = ['current', 'new']

function isOneOf<T extends string>(list: T[], value: unknown): value is T {
  return typeof value === 'string' && (list as string[]).includes(value)
}

function isBool(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/** Type-guard for a valid GeneralSettings object. */
export function isValidGeneral(value: unknown): value is GeneralSettings {
  if (typeof value !== 'object' || value === null) return false
  const g = value as Record<string, unknown>
  return (
    isOneOf(LANGUAGES, g.language) &&
    isOneOf(APPEARANCES, g.appearance) &&
    isOneOf(TIME_FORMATS, g.timeFormat) &&
    isOneOf(DATE_FORMATS, g.dateFormat) &&
    isBool(g.showWeekday) &&
    isBool(g.showSeconds) &&
    isBool(g.autoFocusSearch) &&
    isOneOf(ENTER_BEHAVIORS, g.enterBehavior)
  )
}
