import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/stores/settings'
import { clockTickMs, formatTime } from '@/utils/time'
import { formatDate } from '@/utils/date'

/**
 * DigitalClock
 * Hero-centre live clock driven by the General settings:
 * - Time honours `timeFormat` (24/12) and `showSeconds`.
 * - Tick interval drops to once a minute when seconds are hidden.
 * - Date honours `dateFormat` (auto/…) + `showWeekday`, formatted via the
 *   shared `formatDate()` utility using the active language.
 */
export function DigitalClock() {
  const { i18n } = useTranslation()
  const timeFormat = useSettingsStore((s) => s.general.timeFormat)
  const showSeconds = useSettingsStore((s) => s.general.showSeconds)
  const dateFormat = useSettingsStore((s) => s.general.dateFormat)
  const showWeekday = useSettingsStore((s) => s.general.showWeekday)

  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    // Refresh immediately so toggling seconds on/off never shows a stale value
    // (e.g. the second captured while the minute-only timer was running).
    setNow(new Date())
    const tick = clockTickMs(showSeconds)
    const id = window.setInterval(() => setNow(new Date()), tick)
    return () => window.clearInterval(id)
  }, [showSeconds])

  const language = i18n.resolvedLanguage ?? 'en-US'
  const timeLabel = formatTime(now, timeFormat, showSeconds)
  const dateLabel = formatDate(now, {
    format: dateFormat,
    language,
    showWeekday,
  })

  return (
    <div className="flex flex-col items-center gap-md">
      <time
        dateTime={now.toISOString()}
        className="fg-ink fg-text-shadow font-display text-display-lg tabular-nums"
      >
        {timeLabel}
      </time>
      <p className="fg-body fg-text-shadow text-body-md">{dateLabel}</p>
    </div>
  )
}
