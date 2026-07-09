import type { DateFormatSetting } from '@/types/settings'

/**
 * dateUtils — date formatting helpers.
 * A single `formatDate()` is the app-wide entry point so every date display
 * follows the user's format + language + weekday preferences consistently.
 */

/** Zero-pad a number to two digits. */
function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Whether the active language is Chinese. */
function isZh(lang: string): boolean {
  return lang.toLowerCase().startsWith('zh')
}

interface FormatDateOptions {
  /** The date format preference. */
  format: DateFormatSetting
  /** Resolved active language (e.g. `zh-CN` / `en-US`). Used for `auto`. */
  language: string
  /** Whether to prepend/append the weekday. */
  showWeekday: boolean
}

/** Localized full weekday label (e.g. `星期三` / `Wednesday`). */
function weekdayLabel(date: Date, language: string): string {
  return new Intl.DateTimeFormat(language, { weekday: 'long' }).format(date)
}

/**
 * Format the date part (no weekday) for a given format + language.
 * - auto:       zh → `2026-07-08`, en → `Jul 8, 2026`
 * - yyyy-mm-dd: `2026-07-08`
 * - mm-dd-yyyy: `07/08/2026`
 * - dd-mm-yyyy: `08/07/2026`
 */
function formatDatePart(
  date: Date,
  format: DateFormatSetting,
  language: string
): string {
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())

  switch (format) {
    case 'yyyy-mm-dd':
      return `${y}-${m}-${d}`
    case 'mm-dd-yyyy':
      return `${m}/${d}/${y}`
    case 'dd-mm-yyyy':
      return `${d}/${m}/${y}`
    case 'auto':
    default:
      if (isZh(language)) return `${y}-${m}-${d}`
      return new Intl.DateTimeFormat(language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date)
  }
}

/**
 * Format a full date label according to the user's preferences.
 * When `showWeekday` is on, the weekday is prepended (zh) or appended (en)
 * following each locale's natural convention.
 */
export function formatDate(
  date: Date,
  { format, language, showWeekday }: FormatDateOptions
): string {
  const datePart = formatDatePart(date, format, language)
  if (!showWeekday) return datePart

  const weekday = weekdayLabel(date, language)
  return isZh(language)
    ? `${datePart} ${weekday}`
    : `${weekday}, ${datePart}`
}
