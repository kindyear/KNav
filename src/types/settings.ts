/**
 * Settings domain types.
 * The persisted settings root is versioned; `general` is the only module it
 * owns. Search / background / favorites each have their own dedicated stores
 * and are exported as separate modules by the ConfigManager.
 */

/** Display language preference. `system` follows the browser language. */
export type LanguageSetting = 'system' | 'zh-CN' | 'en-US'

/** Appearance preference. `system` follows the OS color scheme. */
export type AppearanceSetting = 'system' | 'light' | 'dark'

/** Clock time format. */
export type TimeFormatSetting = '24' | '12'

/** Date display format. `auto` derives from the active language. */
export type DateFormatSetting =
  'auto' | 'yyyy-mm-dd' | 'mm-dd-yyyy' | 'dd-mm-yyyy'

/** How the Enter key opens search results. */
export type EnterBehaviorSetting = 'current' | 'new'

/** The General settings module. */
export interface GeneralSettings {
  language: LanguageSetting
  appearance: AppearanceSetting
  timeFormat: TimeFormatSetting
  dateFormat: DateFormatSetting
  showWeekday: boolean
  showSeconds: boolean
  autoFocusSearch: boolean
  enterBehavior: EnterBehaviorSetting
}
