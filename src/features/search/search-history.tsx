import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { IconRenderer } from '@/components/icon-system'
import { useSearchHistoryStore } from './use-search-history-store'
import { useSearchQueryStore } from './use-search-query-store'
import { useSearchProviderStore } from './use-search-provider-store'
import { useProviderStore, resolveProviderMeta } from './providerStore'
import { SearchHistoryDialog } from './search-history-dialog'
import type { SearchHistoryEntry } from './use-search-history-store'

/** Exit-animation duration (ms) — keep in sync with the collapse transition. */
const COLLAPSE_MS = 320

/** Max entries shown inline on the home page before "View All" appears. */
const INLINE_LIMIT = 10

/**
 * SearchHistory
 * Inline recent-search pills below the search box, capped at INLINE_LIMIT
 * (most-recent-first). When more history exists, a ghost "View All History"
 * button opens the full history manager dialog. Clicking a pill restores the
 * search: it fills the query text AND switches to the engine used at the time.
 *
 * When cleared, the block collapses smoothly (height + opacity) instead of
 * vanishing instantly, so the elements below glide up rather than jump. This
 * uses the grid `1fr → 0fr` rows trick to animate intrinsic height.
 */
export function SearchHistory() {
  const { t } = useTranslation('search')
  const entries = useSearchHistoryStore((s) => s.entries)
  const clear = useSearchHistoryStore((s) => s.clear)
  const setQuery = useSearchQueryStore((s) => s.setQuery)
  const setProviderId = useSearchProviderStore((s) => s.setProviderId)
  const providers = useProviderStore((s) => s.providers)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Entries frozen for rendering — retained during the exit animation so the
  // pills stay visible while the block collapses.
  const [displayEntries, setDisplayEntries] = useState<SearchHistoryEntry[]>(
    () => entries
  )
  const [collapsed, setCollapsed] = useState(entries.length === 0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (entries.length > 0) {
      // New/updated history: show it and expand.
      setDisplayEntries(entries)
      setCollapsed(false)
      return
    }

    // Cleared: keep the current pills, collapse, then drop them after the
    // transition so the height animation can play out.
    setCollapsed(true)
    timerRef.current = window.setTimeout(() => {
      setDisplayEntries([])
      timerRef.current = null
    }, COLLAPSE_MS)
  }, [entries])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const inlineEntries = displayEntries.slice(0, INLINE_LIMIT)
  const hasMore = displayEntries.length > INLINE_LIMIT

  return (
    <>
      {/* Nothing to show and fully collapsed — skip the block to avoid gaps. */}
      {displayEntries.length === 0 && collapsed ? null : (
        <div
          className="grid w-full max-w-[720px] transition-[grid-template-rows,opacity,margin-top] duration-[320ms] ease-[var(--ease-standard)]"
          style={{
            gridTemplateRows: collapsed ? '0fr' : '1fr',
            opacity: collapsed ? 0 : 1,
            // Cancel the parent flex `gap-lg` while collapsing so the elements
            // below glide up smoothly instead of snapping 16px on unmount.
            marginTop: collapsed ? 'calc(-1 * var(--spacing-lg))' : undefined,
          }}
        >
          <div className="overflow-hidden">
            <div className="flex w-full flex-col items-center gap-sm">
              <div className="flex w-full items-center justify-between px-xs">
                <span className="fg-mute font-mono text-caption-mono-sm uppercase">
                  {t('history.title')}
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  aria-label={t('history.clearAriaLabel')}
                  className="fg-mute flex items-center gap-[6px] rounded-pill px-sm py-xxs font-sans text-caption-mono-sm outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:bg-[var(--glass-bg)] hover:text-[var(--fg-ink)] focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2 className="size-[14px]" />
                  {t('history.clear')}
                </button>
              </div>

              <div className="flex w-full flex-wrap justify-center gap-sm">
                {inlineEntries.map((entry) => {
                  const meta = resolveProviderMeta(providers, entry.providerId)
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => {
                        setQuery(entry.query)
                        setProviderId(entry.providerId)
                      }}
                      aria-label={t('history.fillAriaLabel', {
                        query: entry.query,
                        provider: meta.name,
                      })}
                      className="glass-surface glass-surface-hover fg-body flex h-8 shrink-0 items-center gap-[6px] whitespace-nowrap rounded-pill px-md font-sans text-body-sm outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:text-[var(--fg-ink)] focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <IconRenderer
                        icon={meta.icon}
                        className="size-4 shrink-0"
                      />
                      <span className="max-w-[200px] truncate">
                        {entry.query}
                      </span>
                    </button>
                  )
                })}
              </div>

              {hasMore ? (
                <button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className="fg-mute mt-xs rounded-pill px-md py-xs font-sans text-body-sm outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:bg-[var(--glass-bg)] hover:text-[var(--fg-ink)] focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t('history.viewAll')} →
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <SearchHistoryDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {/* Clear-all confirmation. */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-[26rem]">
          <DialogHeader>
            <DialogTitle>{t('historyDialog.confirm.title')}</DialogTitle>
            <DialogDescription>
              {t('historyDialog.confirm.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {t('historyDialog.confirm.cancel')}
            </Button>
            <Button
              onClick={() => {
                clear()
                setConfirmOpen(false)
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {t('historyDialog.confirm.clear')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
