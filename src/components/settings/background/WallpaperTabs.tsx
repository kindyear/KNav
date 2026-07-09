import { useTranslation } from 'react-i18next'
import { Palette, Blend, Globe, HardDrive } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WallpaperType } from '@/types/wallpaper'

const TABS: { id: WallpaperType; icon: LucideIcon }[] = [
  { id: WallpaperType.Bing, icon: Globe },
  { id: WallpaperType.Local, icon: HardDrive },
  { id: WallpaperType.Gradient, icon: Blend },
  { id: WallpaperType.Solid, icon: Palette },
]

/**
 * WallpaperTabs
 * A horizontal pill selector (same language as the Search provider bar) for the
 * wallpaper type. Exactly one is selected at a time. Not a Tabs/Radio/Select
 * component — a single pill container with tab-style buttons inside.
 */
export function WallpaperTabs({
  activeType,
  onSelect,
}: {
  activeType: WallpaperType
  onSelect: (type: WallpaperType) => void
}) {
  const { t } = useTranslation('wallpaper')
  return (
    <div
      role="radiogroup"
      aria-label={t('typeGroupAriaLabel')}
      className="w-fit max-w-full overflow-x-auto rounded-pill border border-hairline bg-canvas-card [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex h-[44px] items-center gap-xs p-xs">
        {TABS.map(({ id, icon: Icon }) => {
          const selected = id === activeType
          const label = t(`types.${id}`)
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(id)}
              className={cn(
                'flex h-full shrink-0 items-center gap-[6px] whitespace-nowrap rounded-pill px-md font-sans text-button-md outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] focus-visible:ring-2 focus-visible:ring-ring sm:px-lg',
                selected
                  ? 'bg-primary text-on-primary'
                  : 'bg-transparent text-ink hover:bg-canvas-soft'
              )}
            >
              <Icon className="size-[17px] shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
