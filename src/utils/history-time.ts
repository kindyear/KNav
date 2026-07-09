import type { TimeFormatSetting } from '@/types/settings'
import { formatTime } from './time'

/**
 * historyTime — relative timestamp labels for the search-history list.
 * Reuses the shared `formatTime()` so the clock preference (12h/24h) is honored
 * everywhere. Same-day entries read "Today HH:mm", the previous day
 * "Yesterday HH:mm", otherwise a short localized date + time (e.g. "Jul 8 18:22").
 */

interface FormatHistoryOptions {
  /** Clock time-format preference (12h / 24h). */
  timeFormat: TimeFormatSetting
  /** Resolved active language (e.g. `zh-CN` / `en-US`). */
  language: string
  /** Localized "Today" / "Yesterday" labels. */
  todayLabel: string
  yesterdayLabel: string
}

/** Whole-day difference between two dates (ignoring the time of day). */
function dayDiff(a: Date, b: Date): number {
  const da = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()
  const db = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()
  return Math.round((da - db) / 86_400_000)
}

/** Format a history entry timestamp into a compact relative label. */
export function formatHistoryTimestamp(
  timestamp: number,
  { timeFormat, language, todayLabel, yesterdayLabel }: FormatHistoryOptions,
  now: Date = new Date()
): string {
  const date = new Date(timestamp)
  const time = formatTime(date, timeFormat, false)
  const diff = dayDiff(now, date)

  if (diff === 0) return `${todayLabel} ${time}`
  if (diff === 1) return `${yesterdayLabel} ${time}`

  const datePart = new Intl.DateTimeFormat(language, {
    month: 'short',
    day: 'numeric',
  }).format(date)
  return `${datePart} ${time}`
}
