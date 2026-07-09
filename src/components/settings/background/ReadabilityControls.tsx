import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useReadabilityStore } from '@/stores/readability'
import type { OverlayStrength } from '@/types/readability'
import { WallpaperSection } from './WallpaperSection'

const OVERLAY_OPTIONS: OverlayStrength[] = ['auto', 'low', 'medium', 'high']

/**
 * ReadabilityControls
 * The "Background Readability" settings surface inside the Background page.
 * Exposes overlay strength (auto / low / medium / high) and three toggles:
 * glass effect, text shadow, auto text color. All bound to the readability
 * store (persisted, applied live). No layout logic lives in page components.
 */
export function ReadabilityControls() {
  const { t } = useTranslation('wallpaper')
  const settings = useReadabilityStore((s) => s.settings)
  const setOverlayStrength = useReadabilityStore((s) => s.setOverlayStrength)
  const setGlassEffect = useReadabilityStore((s) => s.setGlassEffect)
  const setTextShadow = useReadabilityStore((s) => s.setTextShadow)
  const setAutoTextColor = useReadabilityStore((s) => s.setAutoTextColor)

  return (
    <WallpaperSection
      title={t('readability.title')}
      description={t('readability.description')}
    >
      <div className="flex flex-col gap-lg">
        {/* Overlay strength — segmented control */}
        <div className="flex flex-col gap-sm">
          <span className="text-body-sm text-body-mid">
            {t('readability.overlayLabel')}
          </span>
          <div className="flex w-full rounded-pill border border-hairline bg-canvas-soft p-xs">
            {OVERLAY_OPTIONS.map((opt) => {
              const selected = opt === settings.overlayStrength
              return (
                <button
                  key={opt}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setOverlayStrength(opt)}
                  className={cn(
                    'flex-1 rounded-pill px-md py-xs text-button-md outline-none transition-colors duration-[var(--duration-fast)] focus-visible:ring-2 focus-visible:ring-ring',
                    selected
                      ? 'bg-primary text-on-primary'
                      : 'bg-transparent text-ink hover:bg-canvas-mid'
                  )}
                >
                  {t(`readability.overlay.${opt}`)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Toggles */}
        <ToggleRow
          label={t('readability.glassEffect')}
          checked={settings.glassEffect}
          onChange={setGlassEffect}
        />
        <ToggleRow
          label={t('readability.textShadow')}
          checked={settings.textShadow}
          onChange={setTextShadow}
        />
        <ToggleRow
          label={t('readability.autoTextColor')}
          checked={settings.autoTextColor}
          onChange={setAutoTextColor}
        />
      </div>
    </WallpaperSection>
  )
}

/** A labeled switch row in the card-content language. */
function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-md rounded-sm border border-hairline bg-canvas-card px-lg py-md">
      <span className="text-body-md text-ink">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-10 shrink-0 rounded-pill outline-none transition-colors duration-[var(--duration-fast)] focus-visible:ring-2 focus-visible:ring-ring',
          checked ? 'bg-primary' : 'bg-canvas-mid'
        )}
      >
        <span
          className={cn(
            'absolute top-1/2 size-4 -translate-y-1/2 rounded-pill bg-canvas-card transition-[left] duration-[var(--duration-fast)]',
            checked ? 'left-[20px]' : 'left-[4px]'
          )}
        />
      </button>
    </div>
  )
}
