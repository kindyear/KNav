import { useEffect, useState } from 'react'
import { analyzeBackground, backgroundAnalysisKey } from '@/services/wallpaper'
import { useReadabilityStore } from '@/stores/readability'
import { useWallpaperStore } from '@/stores/wallpaper'
import type { WallpaperAnalysis } from '@/types/readability'

/**
 * useWallpaperAnalysis
 * Resolves the current background's brightness analysis, using the persisted
 * cache to avoid recomputation. When a background hasn't been analyzed yet it
 * runs the analyzer once (async for images), caches the result, and returns it.
 * Returns null until the first analysis for a given background is available.
 */
export function useWallpaperAnalysis(): WallpaperAnalysis | null {
  const config = useWallpaperStore((s) => s.config)
  const localUrl = useWallpaperStore((s) => s.localUrl)
  const cache = useReadabilityStore((s) => s.analysisCache)
  const cacheAnalysis = useReadabilityStore((s) => s.cacheAnalysis)

  const key = backgroundAnalysisKey(config, localUrl)
  const cached = key ? (cache[key] ?? null) : null
  const [analysis, setAnalysis] = useState<WallpaperAnalysis | null>(cached)

  useEffect(() => {
    let cancelled = false
    if (!key) {
      setAnalysis(null)
      return
    }
    if (cache[key]) {
      setAnalysis(cache[key])
      return
    }
    // Not cached yet — analyze once and store the result.
    analyzeBackground(config, localUrl)
      .then((result) => {
        if (cancelled) return
        cacheAnalysis(key, result)
        setAnalysis(result)
      })
      .catch(() => {
        // Analysis failed (e.g. tainted canvas) — leave defaults in place.
        if (!cancelled) setAnalysis(null)
      })
    return () => {
      cancelled = true
    }
    // Re-run only when the background identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return analysis
}
