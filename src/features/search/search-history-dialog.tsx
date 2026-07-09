import { useMemo, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'
import { Search, X, Trash2 } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { useSettingsStore } from '@/stores/settings'
import { formatHistoryTimestamp } from '@/utils/history-time'
import { cn } from '@/lib/utils'
import { IconRenderer } from '@/components/icon-system'
import { useProviderStore, resolveProviderMeta } from './providerStore'
import { useSearchHistoryStore } from './use-search-history-store'
import { useSearchQueryStore } from './use-search-query-store'
import { useSearchProviderStore } from './use-search-provider-store'
import { useSearchFocusStore } from './use-search-focus'
import type { SearchHistoryEntry } from './use-search-history-store'

/**
 * SearchHistoryDialog
 * Full history manager. Centered dialog on desktop (~820px, 70vh), a bottom
 * sheet on mobile. Supports real-time filtering (query / engine / date),
 * per-row deletion, whole-history clearing (with confirmation), and row click
 * to restore a search (fills query + switches engine + closes + refocuses).
 * Presentation-only over the shared history store — search logic is untouched.
 */
export function SearchHistoryDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t, i18n } = useTranslation('search')
  const entries = useSearchHistoryStore((s) => s.entries)
  const removeEntry = useSearchHistoryStore((s) => s.removeEntry)
  const clear = useSearchHistoryStore((s) => s.clear)
  const setQuery = useSearchQueryStore((s) => s.setQuery)
  const setProviderId = useSearchProviderStore((s) => s.setProviderId)
  const focusSearch = useSearchFocusStore((s) => s.focus)
  const providers = useProviderStore((s) => s.providers)
  const timeFormat = useSettingsStore((s) => s.general.timeFormat)

  const [filter, setFilter] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const language = i18n.resolvedLanguage ?? 'en-US'
  const todayLabel = t('history.today')
  const yesterdayLabel = t('history.yesterday')

  const formatStamp = (timestamp: number) =>
    formatHistoryTimestamp(timestamp, {
      timeFormat,
      language,
      todayLabel,
      yesterdayLabel,
    })

  // Real-time, case-insensitive filter across query, engine name, and the
  // rendered timestamp label.
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return entries
    return entries.filter((e) => {
      const providerName = resolveProviderMeta(providers, e.providerId).name
      const stamp = formatStamp(e.timestamp)
      return (
        e.query.toLowerCase().includes(q) ||
        providerName.toLowerCase().includes(q) ||
        stamp.toLowerCase().includes(q)
      )
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    entries,
    filter,
    providers,
    language,
    timeFormat,
    todayLabel,
    yesterdayLabel,
  ])

  function handleSelect(entry: SearchHistoryEntry) {
    setQuery(entry.query)
    setProviderId(entry.providerId)
    onOpenChange(false)
    // Focus after the close animation settles.
    window.setTimeout(() => focusSearch(), 60)
  }

  function handleClearAll() {
    clear()
    setConfirmOpen(false)
  }

  return (
    <>
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className={cn(
              'fixed z-50 flex flex-col overflow-hidden border border-hairline bg-canvas-card/90 shadow-lg backdrop-blur-[16px]',
              // Mobile: bottom sheet.
              'inset-x-0 bottom-0 h-[85vh] rounded-t-[24px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
              // Desktop: centered dialog with fade + scale.
              'sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-[70vh] sm:w-[min(820px,92vw)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95',
              'duration-[var(--duration-base)]'
            )}
          >
            {/* Grab handle — mobile bottom-sheet affordance. */}
            <div
              aria-hidden="true"
              className="flex shrink-0 justify-center pt-sm sm:hidden"
            >
              <span className="h-1 w-9 rounded-pill bg-canvas-mid" />
            </div>

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-md px-xl py-lg">
              <DialogPrimitive.Title className="font-display text-display-xs text-ink">
                {t('historyDialog.title')}
              </DialogPrimitive.Title>
              <div className="flex items-center gap-sm">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmOpen(true)}
                  disabled={entries.length === 0}
                  className="border-destructive/40 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                  {t('historyDialog.clearAll')}
                </Button>
                <DialogPrimitive.Close
                  aria-label={t('historyDialog.closeAriaLabel')}
                  className="flex size-8 items-center justify-center rounded-full text-body-mid outline-none transition-colors hover:bg-canvas-soft hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-4" />
                </DialogPrimitive.Close>
              </div>
            </div>

            {/* Filter */}
            <div className="shrink-0 px-xl pb-md">
              <div className="flex h-10 items-center gap-sm rounded-sm border border-hairline bg-canvas-soft px-md focus-within:border-ink">
                <Search
                  className="size-4 shrink-0 text-body-mid"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder={t('historyDialog.searchPlaceholder')}
                  className="h-full w-full bg-transparent font-sans text-body-sm text-ink outline-none placeholder:text-body-mid"
                />
              </div>
            </div>

            <div className="h-px w-full shrink-0 bg-hairline" />

            {/* List */}
            <div className="min-h-0 flex-1 overflow-y-auto px-md py-sm [-webkit-overflow-scrolling:touch]">
              {filtered.length === 0 ? (
                <div className="flex h-full items-center justify-center px-xl py-2xl text-center text-body-sm text-body-mid">
                  {entries.length === 0
                    ? t('historyDialog.empty')
                    : t('historyDialog.noResults')}
                </div>
              ) : (
                <ul className="flex flex-col">
                  {filtered.map((entry) => {
                    const meta = resolveProviderMeta(
                      providers,
                      entry.providerId
                    )
                    return (
                      <li key={entry.id}>
                        <div className="group flex items-center gap-md rounded-sm px-md py-sm transition-colors duration-[var(--duration-fast)] hover:bg-canvas-soft">
                          <button
                            type="button"
                            onClick={() => handleSelect(entry)}
                            className="flex min-w-0 flex-1 items-center gap-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <IconRenderer
                              icon={meta.icon}
                              className="size-5 shrink-0"
                            />
                            <div className="flex min-w-0 flex-1 flex-col">
                              <span
                                title={entry.query}
                                className="truncate font-sans text-body-sm text-ink"
                              >
                                {entry.query}
                              </span>
                              <span className="truncate font-sans text-body-sm text-body-mid">
                                {meta.name}
                              </span>
                            </div>
                            <span className="shrink-0 whitespace-nowrap font-mono text-caption-mono-sm text-body-mid">
                              {formatStamp(entry.timestamp)}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeEntry(entry.id)}
                            aria-label={t('historyDialog.deleteAriaLabel')}
                            className="flex size-8 shrink-0 items-center justify-center rounded-full text-body-mid outline-none transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div className="h-px w-full shrink-0 bg-hairline" />

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between gap-md px-xl py-md pb-[calc(env(safe-area-inset-bottom)+var(--spacing-md))] sm:pb-md">
              <span className="font-mono text-caption-mono-sm text-body-mid">
                {t('historyDialog.count', { count: entries.length })}
              </span>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

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
              onClick={handleClearAll}
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
