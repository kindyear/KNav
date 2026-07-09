import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

/**
 * SettingsHeader
 * Fixed top row: "Settings" title on the left (display-sm), close button on the
 * right. A hairline divider sits below (rendered by the parent panel).
 */
export function SettingsHeader({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('settings')
  return (
    <div className="flex shrink-0 items-center justify-between px-lg py-md sm:px-xl sm:py-lg">
      <h2 className="font-display text-display-xs text-ink sm:text-display-sm">
        {t('title')}
      </h2>
      <button
        type="button"
        onClick={onClose}
        aria-label={t('closeAriaLabel')}
        className="flex size-9 items-center justify-center rounded-pill text-body-mid outline-none transition-colors duration-[var(--duration-fast)] hover:bg-canvas-soft hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-5" aria-hidden="true" />
      </button>
    </div>
  )
}
