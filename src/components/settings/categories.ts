import {
  Settings2,
  Image,
  Search,
  LayoutGrid,
  Info,
} from 'lucide-react'
import type { SettingsCategory } from './types'

/** Sidebar categories (order matters). Default selection is the first entry. */
export const SETTINGS_CATEGORIES: SettingsCategory[] = [
  { id: 'general', labelKey: 'categories.general', icon: Settings2 },
  { id: 'background', labelKey: 'categories.background', icon: Image },
  { id: 'search', labelKey: 'categories.search', icon: Search },
  { id: 'quick-access', labelKey: 'categories.quickAccess', icon: LayoutGrid },
  { id: 'about', labelKey: 'categories.about', icon: Info },
]
