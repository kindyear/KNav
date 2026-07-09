import {
  ANALYSIS_SAMPLE_SIZE,
  BRIGHTNESS_DARK_MAX,
  BRIGHTNESS_LIGHT_MIN,
} from '@/config/readability'
import type { WallpaperAnalysis } from '@/types/readability'

/**
 * WallpaperAnalyzer
 * Computes the perceived brightness (0–255) of a background so the readability
 * system can adapt overlay + text color. Images are sampled on a small
 * (100×100) canvas; solid/gradient colors are computed directly from their
 * hex stops. Kept framework-agnostic and side-effect free.
 */

/** Rec. 601 luma from 8-bit RGB. */
function luma(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

/** Build a WallpaperAnalysis from a brightness value. */
export function classifyBrightness(brightness: number): WallpaperAnalysis {
  return {
    brightness,
    isDark: brightness < BRIGHTNESS_DARK_MAX,
    isLight: brightness > BRIGHTNESS_LIGHT_MIN,
  }
}

/** Parse a #rgb / #rrggbb hex string into [r, g, b]; null if unparseable. */
export function parseHex(hex: string): [number, number, number] | null {
  let h = hex.trim().replace('#', '')
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  }
  if (h.length !== 6) return null
  const n = Number.parseInt(h, 16)
  if (Number.isNaN(n)) return null
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Brightness (0–255) of a single hex color. */
export function analyzeColor(hex: string): WallpaperAnalysis {
  const rgb = parseHex(hex)
  const brightness = rgb ? luma(rgb[0], rgb[1], rgb[2]) : 128
  return classifyBrightness(brightness)
}

/** Average brightness across several hex stops (e.g. a gradient). */
export function analyzeColors(hexes: string[]): WallpaperAnalysis {
  const values = hexes
    .map(parseHex)
    .filter((v): v is [number, number, number] => v !== null)
  if (values.length === 0) return classifyBrightness(128)
  const avg =
    values.reduce((sum, [r, g, b]) => sum + luma(r, g, b), 0) / values.length
  return classifyBrightness(avg)
}

/**
 * Analyze an image URL by drawing a downscaled copy to a canvas and averaging
 * pixel luma. Resolves to a WallpaperAnalysis; rejects on load/security errors
 * (e.g. tainted canvas) so callers can fall back gracefully.
 */
export function analyzeImage(url: string): Promise<WallpaperAnalysis> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const size = ANALYSIS_SAMPLE_SIZE
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
          reject(new Error('NO_CANVAS_CONTEXT'))
          return
        }
        ctx.drawImage(img, 0, 0, size, size)
        const { data } = ctx.getImageData(0, 0, size, size)
        let total = 0
        let count = 0
        // Sample every 4th pixel (stride 16 bytes) — plenty for an average.
        for (let i = 0; i < data.length; i += 16) {
          total += luma(data[i], data[i + 1], data[i + 2])
          count++
        }
        resolve(classifyBrightness(count > 0 ? total / count : 128))
      } catch (error) {
        reject(error instanceof Error ? error : new Error('ANALYZE_FAILED'))
      }
    }
    img.onerror = () => reject(new Error('IMAGE_LOAD_ERROR'))
    img.src = url
  })
}
