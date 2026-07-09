import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { ICON_TABS, type IconTabId } from './iconCollections'

interface IconTabsProps {
  active: IconTabId
  onChange: (id: IconTabId) => void
  /** Whether to show the Recent tab (only when there are recent icons). */
  showRecent: boolean
}

/**
 * IconTabs
 * Horizontal category tabs (Recent / All / Brands / System / Developer / Other)
 * for the Icon Picker. Switching tabs triggers lazy loading of that group's
 * collections in the parent.
 */
export function IconTabs({ active, onChange, showRecent }: IconTabsProps) {
  const { t } = useTranslation('common')
  return (
    <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {showRecent ? (
        <TabButton
          label={t('iconPicker.tabs.recent')}
          active={active === 'recent'}
          onClick={() => onChange('recent')}
        />
      ) : null}
      {ICON_TABS.map((tab) => (
        <TabButton
          key={tab.id}
          label={t(`iconPicker.tabs.${tab.labelKey}`)}
          active={active === tab.id}
          onClick={() => onChange(tab.id)}
        />
      ))}
    </div>
  )
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 whitespace-nowrap rounded-pill px-md py-xs text-body-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'bg-[var(--fg-active-bg)] text-[var(--fg-active-fg)]'
          : 'text-body-mid hover:bg-canvas-mid hover:text-ink'
      )}
    >
      {label}
    </button>
  )
}
