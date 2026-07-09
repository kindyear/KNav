import type { ComponentType } from 'react'

/** Icon component compatible with lucide-react. */
export type SettingsIcon = ComponentType<{ className?: string }>

/** Settings category identifiers. */
export type SettingsCategoryId =
  | 'general'
  | 'background'
  | 'search'
  | 'quick-access'
  | 'about'

/** A left-sidebar category entry. `labelKey` resolves via the settings ns. */
export interface SettingsCategory {
  id: SettingsCategoryId
  labelKey: string
  icon: SettingsIcon
}
