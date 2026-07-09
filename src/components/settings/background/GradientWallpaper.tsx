import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { useWallpaperStore } from '@/stores/wallpaper'
import { CUSTOM_SLOT_LIMIT, createDefaultGradient } from '@/config/wallpaper'
import { buildGradientCss, createId } from '@/utils/gradient'
import { GradientCard } from './GradientCard'
import { GradientEditor } from './GradientEditor'
import { WallpaperSection } from './WallpaperSection'

/**
 * GradientWallpaper
 * Preset gradient grid + Custom Gradients grid + the GradientEditor. Selecting
 * any gradient applies it immediately via the store; creating adds a new custom
 * gradient (and selects it). Editing happens in the GradientEditor below.
 */
export function GradientWallpaper() {
  const { t } = useTranslation('wallpaper')
  const currentId = useWallpaperStore((s) => s.config.gradient.current.id)
  const presets = useWallpaperStore((s) => s.config.gradient.presets)
  const customs = useWallpaperStore((s) => s.config.gradient.customs)
  const setGradientCurrent = useWallpaperStore((s) => s.setGradientCurrent)
  const addGradientCustom = useWallpaperStore((s) => s.addGradientCustom)
  const removeGradientCustom = useWallpaperStore((s) => s.removeGradientCustom)

  const addSlots = CUSTOM_SLOT_LIMIT - customs.length

  const handleCreate = () => {
    const created = addGradientCustom(createDefaultGradient(createId('grad')))
    if (!created) {
      toast(t('gradient.createFailed'))
    }
  }

  return (
    <div className="flex flex-col gap-2xl">
      <WallpaperSection
        title={t('gradient.presetsTitle')}
        description={t('gradient.presetsDescription')}
      >
        <div className="grid grid-cols-3 gap-md">
          {presets.map((preset) => (
            <GradientCard
              key={preset.id}
              gradient={buildGradientCss(preset)}
              label={t(`presets.${preset.id}`, {
                defaultValue: preset.id,
              })}
              selected={preset.id === currentId}
              onSelect={() => setGradientCurrent(preset)}
            />
          ))}
        </div>
      </WallpaperSection>

      <WallpaperSection
        title={t('gradient.customTitle')}
        description={t('gradient.customDescription')}
      >
        <div className="grid grid-cols-3 gap-md">
          {customs.map((g) => (
            <GradientCard
              key={g.id}
              gradient={buildGradientCss(g)}
              label={g.id}
              selected={g.id === currentId}
              removable
              onSelect={() => setGradientCurrent(g)}
              onRemove={() => removeGradientCustom(g.id)}
              removeAriaLabel={t('gradient.removeGradientAriaLabel')}
            />
          ))}
          {addSlots > 0 ? (
            <button
              type="button"
              aria-label={t('gradient.createGradient')}
              onClick={handleCreate}
              className="flex aspect-video w-full flex-col items-center justify-center gap-xs rounded-sm border border-dashed border-hairline text-body-mid outline-none transition-colors duration-[var(--duration-fast)] hover:bg-canvas-soft hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Plus className="size-4" aria-hidden="true" />
              <span className="text-caption-mono-sm">
                {t('gradient.createGradient')}
              </span>
            </button>
          ) : null}
        </div>
      </WallpaperSection>

      <GradientEditor />
    </div>
  )
}
