import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { SETTINGS_CATEGORIES } from './categories'
import type { SettingsCategoryId } from './types'

/**
 * SettingsSidebar
 * Category navigation styled as pills.
 * - Mobile: a horizontal, scrollable bar pinned under the header.
 * - Desktop (>=sm): a 220px vertical rail on the left.
 * Selected uses white fill / black text; others are transparent with hover.
 */
export function SettingsSidebar({
  activeId,
  onSelect,
}: {
  activeId: SettingsCategoryId
  onSelect: (id: SettingsCategoryId) => void
}) {
  const { t } = useTranslation('settings')
  return (
    <nav
      aria-label={t('categoriesAriaLabel')}
      className="flex w-full shrink-0 flex-row gap-xs overflow-x-auto border-b border-hairline p-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:w-[220px] sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r sm:p-lg"
    >
      {SETTINGS_CATEGORIES.map((category) => {
        const Icon = category.icon
        const selected = category.id === activeId
        return (
          <button
            key={category.id}
            type="button"
            aria-current={selected ? 'page' : undefined}
            onClick={() => onSelect(category.id)}
            className={cn(
              'flex h-10 shrink-0 items-center gap-sm whitespace-nowrap rounded-pill px-lg font-sans text-button-md outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] focus-visible:ring-2 focus-visible:ring-ring',
              selected
                ? 'bg-primary text-on-primary'
                : 'bg-transparent text-ink hover:bg-canvas-soft'
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {t(category.labelKey)}
          </button>
        )
      })}
    </nav>
  )
}
