import { useEffect } from 'react'
import { buildReadabilityVars } from '@/services/readability'
import { useReadabilityStore } from '@/stores/readability'
import { useWallpaperStore } from '@/stores/wallpaper'
import { WallpaperType } from '@/types/wallpaper'
import { useWallpaperAnalysis } from './use-wallpaper-analysis'

/**
 * BackgroundReadabilityManager
 * Headless controller that derives readability CSS variables from the current
 * wallpaper analysis + user settings and writes them to the document root.
 * Every foreground utility (fg-ink, glass-surface, overlay, …) reads these
 * variables, so a single write here updates the whole page (with a 250ms
 * transition). Renders nothing.
 */
export function BackgroundReadabilityManager() {
  const settings = useReadabilityStore((s) => s.settings)
  const wallpaperType = useWallpaperStore((s) => s.config.type)
  const analysis = useWallpaperAnalysis()

  useEffect(() => {
    // Solid backgrounds are an exact user-chosen color — skip the overlay so it
    // isn't tinted (e.g. white → gray). Text color still adapts for contrast.
    const suppressOverlay = wallpaperType === WallpaperType.Solid
    const vars = buildReadabilityVars(settings, analysis, suppressOverlay)
    const root = document.documentElement
    for (const [name, value] of Object.entries(vars)) {
      root.style.setProperty(name, value)
    }
  }, [settings, analysis, wallpaperType])

  return null
}
