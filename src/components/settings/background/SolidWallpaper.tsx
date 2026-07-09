import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { useWallpaperStore } from '@/stores/wallpaper'
import { DEFAULT_CUSTOM_COLOR, CUSTOM_SLOT_LIMIT } from '@/config/wallpaper'
import { ColorCard } from './ColorCard'
import { ColorPickerPopover } from './ColorPickerPopover'
import { WallpaperSection } from './WallpaperSection'

/**
 * SolidWallpaper
 * Preset color grid (click applies immediately) + a Custom Colors grid with a
 * native color-picker "Add Color" affordance. All state comes from the
 * wallpaper store; selecting a color updates the live background at once.
 */
export function SolidWallpaper() {
  const { t } = useTranslation('wallpaper')
  const current = useWallpaperStore((s) => s.config.solid.current)
  const presets = useWallpaperStore((s) => s.config.solid.presets)
  const customs = useWallpaperStore((s) => s.config.solid.customs)
  const setSolidCurrent = useWallpaperStore((s) => s.setSolidCurrent)
  const addSolidCustom = useWallpaperStore((s) => s.addSolidCustom)
  const removeSolidCustom = useWallpaperStore((s) => s.removeSolidCustom)

  const addSlots = CUSTOM_SLOT_LIMIT - customs.length

  const handleAddColor = (value: string) => {
    const added = addSolidCustom(value)
    if (!added) {
      toast(t('solid.addColorFailed'))
    }
  }

  return (
    <div className="flex flex-col gap-2xl">
      <WallpaperSection
        title={t('solid.presetsTitle')}
        description={t('solid.presetsDescription')}
      >
        <div className="grid grid-cols-[repeat(auto-fill,48px)] gap-md">
          {presets.map((color) => (
            <ColorCard
              key={color}
              color={color}
              label={color}
              selected={color === current}
              onSelect={() => setSolidCurrent(color)}
            />
          ))}
        </div>
      </WallpaperSection>

      <WallpaperSection
        title={t('solid.customTitle')}
        description={t('solid.customDescription')}
      >
        <div className="grid grid-cols-[repeat(auto-fill,48px)] gap-md">
          {customs.map((color) => (
            <ColorCard
              key={color}
              color={color}
              label={color}
              selected={color === current}
              removable
              onSelect={() => setSolidCurrent(color)}
              onRemove={() => removeSolidCustom(color)}
              removeAriaLabel={t('solid.removeColorAriaLabel')}
            />
          ))}
          {addSlots > 0 ? (
            <ColorPickerPopover
              value={DEFAULT_CUSTOM_COLOR}
              onSelect={handleAddColor}
            >
              <button
                type="button"
                aria-label={t('solid.addColor')}
                className="flex size-12 items-center justify-center rounded-sm border border-dashed border-hairline text-body-mid outline-none transition-colors duration-[var(--duration-fast)] hover:bg-canvas-soft hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </ColorPickerPopover>
          ) : null}
        </div>
      </WallpaperSection>
    </div>
  )
}
