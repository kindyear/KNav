import {
  GRADIENT_MAX_COLORS,
  GRADIENT_MIN_COLORS,
} from '@/config/wallpaper'
import type { GradientConfig } from '@/types/wallpaper'

/**
 * Build a CSS background-image value from a gradient configuration.
 * Centralizes gradient string generation so no component hand-writes CSS.
 *
 * - linear: `linear-gradient(<angle>deg, <stops>)`
 * - radial: `radial-gradient(circle, <stops>)`
 * - conic:  `conic-gradient(from <angle>deg, <stops>)`
 */
export function buildGradientCss(config: GradientConfig): string {
  const stops = config.colors.join(', ')
  switch (config.mode) {
    case 'radial':
      return `radial-gradient(circle, ${stops})`
    case 'conic':
      return `conic-gradient(from ${config.angle}deg, ${stops})`
    case 'linear':
    default:
      return `linear-gradient(${config.angle}deg, ${stops})`
  }
}

/** Clamp a gradient's color-stop count into the allowed range. */
export function isGradientColorCountValid(count: number): boolean {
  return count >= GRADIENT_MIN_COLORS && count <= GRADIENT_MAX_COLORS
}

/** Whether another color stop can be added. */
export function canAddGradientColor(config: GradientConfig): boolean {
  return config.colors.length < GRADIENT_MAX_COLORS
}

/** Whether a color stop can be removed. */
export function canRemoveGradientColor(config: GradientConfig): boolean {
  return config.colors.length > GRADIENT_MIN_COLORS
}

/** A stable-ish unique id for user-created gradients / custom entries. */
export function createId(prefix = 'g'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
}
