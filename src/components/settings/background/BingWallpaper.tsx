import { useTranslation } from 'react-i18next'
import { RefreshCw, Download } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useWallpaperStore } from '@/stores/wallpaper'
import { BingMode } from '@/types/wallpaper'
import { WallpaperSection } from './WallpaperSection'

const BING_MODES: BingMode[] = [BingMode.Daily, BingMode.Random]

/**
 * BingWallpaper
 * Shows today's Bing image preview + metadata + Refresh/Download. Two modes:
 * "daily" (cached per day, cross-day refresh) and "random" (a fresh random pick
 * from the recent pool on each app open). Data comes from the store; on fetch
 * failure with no cache, an inline message is shown without breaking anything.
 */
export function BingWallpaper() {
  const { t } = useTranslation('wallpaper')
  const bing = useWallpaperStore((s) => s.config.bing)
  const loading = useWallpaperStore((s) => s.bingLoading)
  const error = useWallpaperStore((s) => s.bingError)
  const refreshBing = useWallpaperStore((s) => s.refreshBing)
  const setBingMode = useWallpaperStore((s) => s.setBingMode)

  const hasImage = Boolean(bing.url)
  const placeholder = t('bing.placeholderValue')

  const infoRows: { key: string; label: string; value: string }[] = [
    {
      key: 'title',
      label: t('bing.info.title'),
      value: bing.title || placeholder,
    },
    {
      key: 'copyright',
      label: t('bing.info.copyright'),
      value: bing.copyright || placeholder,
    },
    {
      key: 'date',
      label: t('bing.info.date'),
      value: bing.date || placeholder,
    },
    {
      key: 'resolution',
      label: t('bing.info.resolution'),
      value: hasImage ? 'UHD' : placeholder,
    },
  ]

  const handleDownload = () => {
    if (bing.url) window.open(bing.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-col gap-2xl">
      {/* Mode — daily rotation vs. random on open */}
      <WallpaperSection
        title={t('bing.modeTitle')}
        description={t('bing.modeDescription')}
      >
        <div className="flex w-full rounded-pill border border-hairline bg-canvas-soft p-xs sm:w-fit">
          {BING_MODES.map((m) => {
            const selected = m === bing.mode
            return (
              <button
                key={m}
                type="button"
                aria-pressed={selected}
                onClick={() => setBingMode(m)}
                className={cn(
                  'flex-1 whitespace-nowrap rounded-pill px-lg py-xs text-button-md outline-none transition-colors duration-[var(--duration-fast)] focus-visible:ring-2 focus-visible:ring-ring sm:flex-none',
                  selected
                    ? 'bg-primary text-on-primary'
                    : 'bg-transparent text-ink hover:bg-canvas-mid'
                )}
              >
                {t(`bing.modes.${m}`)}
              </button>
            )
          })}
        </div>
      </WallpaperSection>

      <WallpaperSection
        title={t('bing.todayTitle')}
        description={t('bing.todayDescription')}
      >
        <div
          role="img"
          aria-label={bing.title || t('bing.previewAlt')}
          className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-sm border border-hairline bg-canvas-soft bg-cover bg-center"
          style={
            hasImage ? { backgroundImage: `url("${bing.url}")` } : undefined
          }
        >
          {!hasImage ? (
            <span className="text-body-sm text-body-mid">
              {loading ? t('bing.loading') : t('bing.previewAlt')}
            </span>
          ) : null}
        </div>
        {error && !hasImage ? (
          <p className="text-body-sm text-destructive">
            {t('bing.fetchError')}
          </p>
        ) : null}
      </WallpaperSection>

      <WallpaperSection title={t('bing.infoTitle')}>
        <dl className="flex flex-col divide-y divide-hairline rounded-sm border border-hairline bg-canvas-card">
          {infoRows.map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between gap-md px-lg py-md"
            >
              <dt className="shrink-0 text-body-sm text-body-mid">
                {row.label}
              </dt>
              <dd className="truncate text-right text-body-sm text-ink">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </WallpaperSection>

      <div className="flex flex-wrap gap-sm">
        <Button
          variant="outline"
          size="md"
          onClick={() => void refreshBing(true)}
          disabled={loading}
        >
          <RefreshCw className={cn(loading && 'animate-spin')} />
          {t('bing.refresh')}
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={handleDownload}
          disabled={!hasImage}
        >
          <Download />
          {t('bing.download')}
        </Button>
      </div>
    </div>
  )
}
