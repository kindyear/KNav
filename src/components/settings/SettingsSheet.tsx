import { useTranslation } from 'react-i18next'
import { SettingsHeader } from './SettingsHeader'
import { SettingsSidebar } from './SettingsSidebar'
import { SettingsContent } from './SettingsContent'
import type { SettingsCategoryId } from './types'

/**
 * SettingsSheet
 * The settings bottom-sheet body (header + sidebar + active page). Extracted
 * into its own module so it can be code-split via React.lazy: none of the
 * settings UI or its page bundles load until the user actually opens settings.
 */
export function SettingsSheet({
  visible,
  activeId,
  onSelect,
  onClose,
}: {
  visible: boolean
  activeId: SettingsCategoryId
  onSelect: (id: SettingsCategoryId) => void
  onClose: () => void
}) {
  const { t } = useTranslation('settings')
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('title')}
      className="relative flex h-[92vh] max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[24px] border border-hairline bg-canvas-card/85 backdrop-blur-[16px] transition-[transform,opacity] duration-[220ms] ease-out sm:h-[70vh] sm:max-h-[80vh] sm:w-[min(1100px,92vw)]"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Grab handle — mobile-only bottom-sheet affordance */}
      <div
        aria-hidden="true"
        className="flex shrink-0 justify-center pt-sm sm:hidden"
      >
        <span className="h-1 w-9 rounded-pill bg-canvas-mid" />
      </div>
      <SettingsHeader onClose={onClose} />
      <div className="h-px w-full shrink-0 bg-hairline" />
      <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
        <SettingsSidebar activeId={activeId} onSelect={onSelect} />
        <SettingsContent activeId={activeId} />
      </div>
    </div>
  )
}
