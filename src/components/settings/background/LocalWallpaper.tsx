import { useTranslation } from 'react-i18next'
import { UploadCloud, ImageOff } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { useWallpaperStore } from '@/stores/wallpaper'
import { LOCAL_ACCEPTED_TYPES } from '@/config/wallpaper'
import { WallpaperSection } from './WallpaperSection'

/**
 * LocalWallpaper
 * Dashed-border drag / click upload zone. On upload the store saves the raw
 * image Blob to IndexedDB and exposes a runtime object URL — no Base64, so
 * localStorage stays tiny and only one decoded copy lives in memory. The
 * "Current Wallpaper" section shows a preview when an image is set, or an empty
 * state otherwise. Delete removes the image and resets wallpaper type to Solid.
 */
export function LocalWallpaper() {
  const { t } = useTranslation('wallpaper')
  const local = useWallpaperStore((s) => s.config.local)
  const localUrl = useWallpaperStore((s) => s.localUrl)
  const uploadLocal = useWallpaperStore((s) => s.uploadLocal)
  const removeLocal = useWallpaperStore((s) => s.removeLocal)

  const hasImage = Boolean(localUrl)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!(LOCAL_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
      toast(t('local.invalidType'))
      return
    }
    void uploadLocal(file).catch(() => toast(t('local.uploadFailed')))
  }

  return (
    <div className="flex flex-col gap-2xl">
      <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-sm rounded-sm border border-dashed border-hairline bg-canvas-card px-lg py-2xl text-center outline-none transition-colors duration-[var(--duration-fast)] hover:bg-canvas-soft focus-within:ring-2 focus-within:ring-ring">
        <UploadCloud className="size-8 text-body-mid" aria-hidden="true" />
        <span className="text-body-md text-ink">{t('local.uploadTitle')}</span>
        <span className="text-body-sm text-body-mid">
          {t('local.uploadHint')}
        </span>
        <span className="font-mono text-caption-mono-sm text-mute">
          {t('local.supported')}
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="absolute size-0 opacity-0"
        />
      </label>

      <WallpaperSection title={t('local.currentTitle')}>
        {hasImage ? (
          <div className="flex flex-col gap-md">
            <img
              src={localUrl}
              alt={local.fileName}
              className="aspect-video w-full rounded-sm border border-hairline object-cover"
            />
            <div className="flex items-center justify-between gap-md">
              <span className="truncate text-caption-mono-sm text-body-mid">
                {local.fileName}
              </span>
              <button
                type="button"
                onClick={removeLocal}
                className="rounded-pill px-lg py-xs font-sans text-button-md text-destructive outline-none transition-colors duration-[var(--duration-fast)] hover:bg-canvas-soft focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t('local.remove')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-sm rounded-sm border border-hairline bg-canvas-card px-lg py-2xl text-center">
            <ImageOff className="size-6 text-body-mid" aria-hidden="true" />
            <span className="text-body-md text-ink">
              {t('local.emptyTitle')}
            </span>
            <span className="text-body-sm text-body-mid">
              {t('local.emptyDescription')}
            </span>
          </div>
        )}
      </WallpaperSection>
    </div>
  )
}
