import type { TimeFormatSetting } from '@/types/settings'

/**
 * timeUtils — clock formatting helpers.
 * Pure functions so the clock component stays declarative.
 */

/** Zero-pad a number to two digits. */
function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * Format a time according to the user's time format + seconds preference.
 * - 24h: `21:08` or `21:08:45`
 * - 12h: `09:08 PM` or `09:08:45 PM`
 */
export function formatTime(
  date: Date,
  format: TimeFormatSetting,
  showSeconds: boolean
): string {
  const seconds = showSeconds ? `:${pad(date.getSeconds())}` : ''
  if (format === '12') {
    const h24 = date.getHours()
    const period = h24 >= 12 ? 'PM' : 'AM'
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12
    return `${pad(h12)}:${pad(date.getMinutes())}${seconds} ${period}`
  }
  return `${pad(date.getHours())}:${pad(date.getMinutes())}${seconds}`
}

/**
 * Tick interval (ms) for the clock: every second when seconds are shown,
 * otherwise once a minute to avoid needless re-renders.
 */
export function clockTickMs(showSeconds: boolean): number {
  return showSeconds ? 1000 : 60_000
}
