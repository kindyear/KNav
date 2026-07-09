import { useTranslation } from 'react-i18next'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWallpaperStore } from '@/stores/wallpaper'
import {
  GRADIENT_DIRECTION_STOPS,
  GRADIENT_MAX_COLORS,
  DEFAULT_CUSTOM_COLOR,
} from '@/config/wallpaper'
import {
  buildGradientCss,
  canAddGradientColor,
  canRemoveGradientColor,
} from '@/utils/gradient'
import type { GradientMode } from '@/types/wallpaper'
import { ColorPickerPopover } from './ColorPickerPopover'
import { WallpaperSection } from './WallpaperSection'

const GRADIENT_KINDS: GradientMode[] = ['linear', 'radial', 'conic']

/**
 * GradientEditor
 * Live editor for the store's current gradient: 2–4 color stops (add/remove +
 * per-stop color pickers), a Gradient Type segmented control, and a Direction
 * control (discrete presets + free slider). Every change writes to the store,
 * updating both the preview and the live page background immediately.
 */
export function GradientEditor() {
  const { t } = useTranslation('wallpaper')
  const current = useWallpaperStore((s) => s.config.gradient.current)
  const updateGradientCurrent = useWallpaperStore(
    (s) => s.updateGradientCurrent
  )

  const setColorAt = (index: number, value: string) => {
    const colors = current.colors.map((c, i) => (i === index ? value : c))
    updateGradientCurrent({ colors })
  }

  const addColor = () => {
    if (!canAddGradientColor(current)) return
    updateGradientCurrent({ colors: [...current.colors, DEFAULT_CUSTOM_COLOR] })
  }

  const removeColorAt = (index: number) => {
    if (!canRemoveGradientColor(current)) return
    updateGradientCurrent({
      colors: current.colors.filter((_, i) => i !== index),
    })
  }

  const angleEnabled = current.mode !== 'radial'

  return (
    <WallpaperSection
      title={t('gradient.editor.title')}
      description={t('gradient.editor.description')}
    >
      <div className="flex flex-col gap-lg rounded-sm border border-hairline bg-canvas-card p-lg">
        {/* Live preview */}
        <div
          aria-hidden="true"
          className="aspect-video w-full rounded-sm border border-hairline"
          style={{ backgroundImage: buildGradientCss(current) }}
        />

        {/* Color stops */}
        <div className="flex flex-col gap-sm">
          <span className="text-body-sm text-body-mid">
            {t('gradient.editor.colors')}
          </span>
          <div className="flex flex-wrap gap-sm">
            {current.colors.map((color, i) => (
              <div key={i} className="group relative">
                <ColorPickerPopover
                  value={color}
                  onSelect={(hex) => setColorAt(i, hex)}
                >
                  <button
                    type="button"
                    style={{ backgroundColor: color }}
                    aria-label={t('gradient.editor.stopAriaLabel', {
                      index: i + 1,
                    })}
                    className="size-10 rounded-sm border border-hairline outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </ColorPickerPopover>
                {canRemoveGradientColor(current) ? (
                  <button
                    type="button"
                    aria-label={t('gradient.editor.removeStopAriaLabel')}
                    onClick={() => removeColorAt(i)}
                    className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-pill border border-hairline bg-canvas-card text-body-mid opacity-0 outline-none transition-opacity duration-[var(--duration-fast)] hover:text-ink focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
                  >
                    <X className="size-2.5" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            ))}
            {current.colors.length < GRADIENT_MAX_COLORS ? (
              <button
                type="button"
                aria-label={t('gradient.editor.addStop')}
                onClick={addColor}
                className="flex size-10 items-center justify-center rounded-sm border border-dashed border-hairline text-body-mid outline-none transition-colors duration-[var(--duration-fast)] hover:bg-canvas-soft hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Gradient Type — segmented control */}
        <div className="flex flex-col gap-sm">
          <span className="text-body-sm text-body-mid">
            {t('gradient.editor.typeLabel')}
          </span>
          <div className="flex w-full rounded-pill border border-hairline bg-canvas-soft p-xs">
            {GRADIENT_KINDS.map((k) => {
              const selected = k === current.mode
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => updateGradientCurrent({ mode: k })}
                  className={cn(
                    'flex-1 rounded-pill px-md py-xs text-button-md outline-none transition-colors duration-[var(--duration-fast)] focus-visible:ring-2 focus-visible:ring-ring',
                    selected
                      ? 'bg-primary text-on-primary'
                      : 'bg-transparent text-ink hover:bg-canvas-mid'
                  )}
                >
                  {t(`gradient.editor.types.${k}`)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Direction — discrete presets + free slider */}
        <div
          className={cn(
            'flex flex-col gap-sm',
            !angleEnabled && 'pointer-events-none opacity-50'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-body-mid">
              {t('gradient.editor.directionLabel')}
            </span>
            <span className="font-mono text-caption-mono-sm text-body">
              {current.angle}°
            </span>
          </div>
          <div className="flex flex-wrap gap-xs">
            {GRADIENT_DIRECTION_STOPS.map((deg) => {
              const selected = current.angle === deg
              return (
                <button
                  key={deg}
                  type="button"
                  disabled={!angleEnabled}
                  aria-pressed={selected}
                  onClick={() => updateGradientCurrent({ angle: deg })}
                  className={cn(
                    'rounded-pill border px-md py-xxs font-mono text-caption-mono-sm outline-none transition-colors duration-[var(--duration-fast)] focus-visible:ring-2 focus-visible:ring-ring',
                    selected
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-hairline bg-transparent text-ink hover:bg-canvas-soft'
                  )}
                >
                  {deg}°
                </button>
              )
            })}
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={current.angle}
            disabled={!angleEnabled}
            onChange={(e) =>
              updateGradientCurrent({ angle: Number(e.target.value) })
            }
            aria-label={t('gradient.editor.directionLabel')}
            className="h-1 w-full cursor-pointer appearance-none rounded-pill bg-canvas-mid accent-[var(--primary)]"
          />
        </div>
      </div>
    </WallpaperSection>
  )
}
