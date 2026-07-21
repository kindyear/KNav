import { lazy, Suspense } from 'react'
import { Loading } from '@/components/ui'
import type { SettingsCategoryId } from './types'

/**
 * Per-category settings pages are code-split with React.lazy so opening the
 * settings panel only downloads the active tab's code (and its heavy deps like
 * the wallpaper editor or provider/quick-access managers) on demand.
 */
const PAGES: Record<SettingsCategoryId, React.LazyExoticComponent<() => React.JSX.Element>> = {
  general: lazy(() =>
    import('./pages/General').then((m) => ({ default: m.General }))
  ),
  background: lazy(() =>
    import('./pages/Background').then((m) => ({ default: m.Background }))
  ),
  search: lazy(() =>
    import('./pages/Search').then((m) => ({ default: m.Search }))
  ),
  'quick-access': lazy(() =>
    import('./pages/QuickAccess').then((m) => ({ default: m.QuickAccess }))
  ),
  about: lazy(() =>
    import('./pages/About').then((m) => ({ default: m.About }))
  ),
}

/**
 * SettingsContent
 * Right pane — renders the (lazily-loaded) page for the active category.
 * Scrolls independently.
 */
export function SettingsContent({
  activeId,
}: {
  activeId: SettingsCategoryId
}) {
  const Page = PAGES[activeId]
  return (
    <div className="flex-1 overflow-y-auto p-lg pb-[calc(env(safe-area-inset-bottom)+var(--spacing-lg))] [-webkit-overflow-scrolling:touch] sm:p-xl sm:pb-xl">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <Loading size="lg" />
          </div>
        }
      >
        <Page />
      </Suspense>
    </div>
  )
}
