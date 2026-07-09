import { useTranslation } from 'react-i18next'
import { useWallpaperStore } from '@/stores/wallpaper'
import { WallpaperType } from '@/types/wallpaper'
import { WallpaperTabs } from './WallpaperTabs'
import { SolidWallpaper } from './SolidWallpaper'
import { GradientWallpaper } from './GradientWallpaper'
import { BingWallpaper } from './BingWallpaper'
import { LocalWallpaper } from './LocalWallpaper'
import { ReadabilityControls } from './ReadabilityControls'

const CONTENT: Record<WallpaperType, () => React.JSX.Element> = {
  [WallpaperType.Solid]: SolidWallpaper,
  [WallpaperType.Gradient]: GradientWallpaper,
  [WallpaperType.Bing]: BingWallpaper,
  [WallpaperType.Local]: LocalWallpaper,
}

/**
 * WallpaperPage
 * The Background settings surface: a horizontal wallpaper-type pill selector on
 * top, switching between Solid / Gradient / Bing / Local content below. All
 * state is owned by the wallpaper store; switching type only changes
 * `config.type` and preserves every sub-config.
 */
export function WallpaperPage() {
  const { t } = useTranslation('wallpaper')
  const activeType = useWallpaperStore((s) => s.config.type)
  const setType = useWallpaperStore((s) => s.setType)
  const Content = CONTENT[activeType]

  return (
    <div className="flex flex-col gap-2xl">
      <div className="flex flex-col gap-md">
        <span className="text-body-sm text-body-mid">{t('typeLabel')}</span>
        <WallpaperTabs activeType={activeType} onSelect={setType} />
      </div>
      <Content />
      <div className="h-px w-full bg-hairline" />
      <ReadabilityControls />
    </div>
  )
}
