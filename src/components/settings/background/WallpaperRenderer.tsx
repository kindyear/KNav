import { useEffect, useRef, useState } from 'react'
import { WALLPAPER_FADE_MS, WALLPAPER_IMAGE_FADE_MS } from '@/config/wallpaper'
import { resolveBackground } from '@/services/wallpaper'
import type { ResolvedBackground } from '@/services/wallpaper'
import { useWallpaperStore } from '@/stores/wallpaper'

/** Extract the URL from a CSS `url("…")` background-image, or null. */
function extractImageUrl(backgroundImage: string): string | null {
  const match = backgroundImage.match(/url\("(.+)"\)/)
  return match ? match[1] : null
}

/**
 * A single fixed background layer painting one resolved background.
 *
 * Image-based backgrounds (Bing / Local) are preloaded and only fade in once
 * the bytes have decoded, using a slower duration so a slow network reveals the
 * image gently rather than popping in. Color / gradient layers appear at once
 * with the standard cross-fade.
 */
function BackgroundLayer({
  background,
  active,
}: {
  background: ResolvedBackground
  active: boolean
}) {
  const imageUrl = extractImageUrl(background.backgroundImage)
  const [imageReady, setImageReady] = useState(!imageUrl)

  useEffect(() => {
    if (!imageUrl) {
      setImageReady(true)
      return
    }
    setImageReady(false)
    const img = new Image()
    let cancelled = false
    img.onload = () => {
      if (!cancelled) setImageReady(true)
    }
    // On error, still reveal so we don't hang on a blank canvas forever.
    img.onerror = () => {
      if (!cancelled) setImageReady(true)
    }
    img.src = imageUrl
    return () => {
      cancelled = true
    }
  }, [imageUrl])

  const visible = active && imageReady
  const fadeMs = imageUrl ? WALLPAPER_IMAGE_FADE_MS : WALLPAPER_FADE_MS

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 transition-opacity ease-out"
      style={{
        backgroundColor: background.backgroundColor,
        backgroundImage: background.backgroundImage,
        backgroundSize: background.backgroundSize,
        backgroundPosition: background.backgroundPosition,
        backgroundRepeat: background.backgroundRepeat,
        opacity: visible ? 1 : 0,
        transitionDuration: `${fadeMs}ms`,
      }}
    />
  )
}

/**
 * WallpaperRenderer
 * The single owner of the page background. Reads the resolved background from
 * the wallpaper store and cross-fades between the previous and next background
 * whenever it changes (no flashing). Also kicks off the Bing daily refresh once
 * on mount. Renders behind all app content (z-0; content sits above via z).
 */
export function WallpaperRenderer() {
  const config = useWallpaperStore((s) => s.config)
  const localUrl = useWallpaperStore((s) => s.localUrl)
  const ensureBingFresh = useWallpaperStore((s) => s.ensureBingFresh)
  const hydrateLocal = useWallpaperStore((s) => s.hydrateLocal)

  const background = resolveBackground(config, localUrl)
  const key = JSON.stringify(background)

  // Two-layer cross-fade: keep the old layer until the new one has faded in.
  const [layers, setLayers] = useState<
    { id: string; background: ResolvedBackground }[]
  >([{ id: key, background }])
  const prevKey = useRef(key)

  useEffect(() => {
    if (prevKey.current === key) return
    prevKey.current = key
    setLayers((current) => {
      const last = current[current.length - 1]
      if (last && last.id === key) return current
      return [...current.slice(-1), { id: key, background }]
    })
    // Drop the outgoing layer after the slowest possible fade completes.
    const timer = window.setTimeout(() => {
      setLayers((current) => current.slice(-1))
    }, WALLPAPER_IMAGE_FADE_MS + 50)
    return () => window.clearTimeout(timer)
  }, [key, background])

  // Kick off the daily Bing fetch once; it's a no-op if already fresh.
  useEffect(() => {
    void ensureBingFresh()
  }, [ensureBingFresh])

  // Restore the local wallpaper object URL from IndexedDB on mount (the URL is
  // runtime-only and not persisted).
  useEffect(() => {
    void hydrateLocal()
  }, [hydrateLocal])

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 bg-canvas">
      {layers.map((layer, i) => (
        <BackgroundLayer
          key={layer.id}
          background={layer.background}
          active={i === layers.length - 1}
        />
      ))}
    </div>
  )
}
