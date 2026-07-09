/**
 * Generic, framework-agnostic utility helpers.
 * (Styling helpers such as `cn` live in `@/lib/utils`.)
 */

/** Clamp a number into the inclusive [min, max] range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
