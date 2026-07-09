import { useTranslation } from 'react-i18next'
import { useQuickAccessStore } from '@/features/quick-access'
import { getEnabledItems } from '@/features/quick-access/quickAccessUtils'
import { QuickAccessCard } from './QuickAccessCard'

/**
 * QuickAccess
 * A restrained, Raycast / Arc-style grid of common site tiles below the search
 * box. Width matches the search box (max 720px), centered.
 *
 * Fully config-driven: tiles come from the quick-access store, filtered by
 * `enabled` and ordered by `order` — nothing is hardcoded. If the user has no
 * enabled tiles, the entire section is not rendered (no empty state).
 *
 * Uses an auto-fill / minmax grid so tiles keep a stable ~size and the column
 * count adapts smoothly across resolutions without hard breakpoint jumps.
 */
export function QuickAccess() {
  const { t } = useTranslation('quickAccess')
  const items = useQuickAccessStore((s) => s.items)
  const tiles = getEnabledItems(items)

  if (tiles.length === 0) return null

  return (
    <section aria-label={t('ariaLabel')} className="w-full max-w-[720px]">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-md sm:gap-lg">
        {tiles.map((item) => (
          <QuickAccessCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
