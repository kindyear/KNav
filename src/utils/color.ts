/**
 * Color helpers for wallpaper solid colors.
 * Kept minimal and framework-agnostic.
 */

/** Normalize a hex color to lowercase for comparison/dedup. */
export function normalizeHex(hex: string): string {
  return hex.trim().toLowerCase()
}

/** Whether `hex` already exists (case-insensitive) in `colors`. */
export function isDuplicateColor(colors: string[], hex: string): boolean {
  const target = normalizeHex(hex)
  return colors.some((c) => normalizeHex(c) === target)
}

/** An RGB color as 0–255 channels. */
export interface Rgb {
  r: number
  g: number
  b: number
}

/** Full 3/6-digit hex color, with leading `#`. */
export const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

/** Whether `value` is a valid 3/6-digit hex color. */
export function isValidHex(value: string): boolean {
  return HEX_RE.test(value.trim())
}

/** Clamp a number to the 0–255 channel range (rounded). */
export function clampChannel(n: number): number {
  if (Number.isNaN(n)) return 0
  return Math.min(255, Math.max(0, Math.round(n)))
}

/** Parse a hex color to RGB, expanding shorthand. Returns null when invalid. */
export function hexToRgb(hex: string): Rgb | null {
  const value = hex.trim()
  if (!isValidHex(value)) return null
  let body = value.slice(1)
  if (body.length === 3) {
    body = body
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const int = parseInt(body, 16)
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}

/** Format an RGB color as a 6-digit lowercase hex string. */
export function rgbToHex({ r, g, b }: Rgb): string {
  const to = (n: number) => clampChannel(n).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}
