import { useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { useProviderStore } from './providerStore'
import { buildSearchUrl, getEnabledProviders } from './providerUtils'
import {
  useSearchProviderStore,
  useResolvedProviderId,
} from './use-search-provider-store'
import { useSearchQueryStore } from './use-search-query-store'
import { useSearchHistoryStore } from './use-search-history-store'
import { useSearchFocusStore } from './use-search-focus'
import { useSettingsStore } from '@/stores/settings'

/**
 * SearchBox
 * Hero-centre search input in the card-content language: canvas-card surface,
 * 1px hairline border, rounded-sm, 24px horizontal padding.
 *
 * Layout: [Search Icon]  input  [Enter ↵]
 * - Fully config-driven: resolves the active provider from the provider store.
 * - Auto-focuses on mount when General → autoFocusSearch is on (one-time; it
 *   does not steal focus back if the user clicks elsewhere).
 * - Enter: open the current provider's search in the current or a new tab
 *   according to General → enterBehavior, and record history.
 * - Esc: clear the input.
 * Only opacity / border-color / background-color transitions are used (150ms).
 */
export function SearchBox() {
  const { t } = useTranslation('search')
  const query = useSearchQueryStore((s) => s.query)
  const setQuery = useSearchQueryStore((s) => s.setQuery)
  const inputRef = useRef<HTMLInputElement>(null)
  const providers = useProviderStore((s) => s.providers)
  const providerId = useResolvedProviderId()
  const setProviderId = useSearchProviderStore((s) => s.setProviderId)
  const addHistory = useSearchHistoryStore((s) => s.addEntry)
  const enterBehavior = useSettingsStore((s) => s.general.enterBehavior)
  const autoFocusSearch = useSettingsStore((s) => s.general.autoFocusSearch)
  const registerFocus = useSearchFocusStore((s) => s.register)

  const activeProvider = providers.find((p) => p.id === providerId) ?? null
  const providerName = activeProvider?.name ?? ''

  // One-time auto-focus on mount (never re-steals focus afterwards).
  useEffect(() => {
    if (autoFocusSearch) inputRef.current?.focus()
    // Intentionally run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Expose a focus handler so other components (e.g. the history dialog) can
  // refocus the input after selecting an entry.
  useEffect(() => {
    registerFocus(() => inputRef.current?.focus())
    return () => registerFocus(null)
  }, [registerFocus])

  function submit() {
    const q = query.trim()
    if (!q) return
    // Resolve the provider live: selected one, else the first enabled provider.
    const provider =
      providers.find((p) => p.id === providerId) ??
      getEnabledProviders(providers)[0]
    if (!provider) return
    if (provider.id !== providerId) setProviderId(provider.id)
    addHistory(q, provider.id)
    const url = buildSearchUrl(provider, q)
    if (enterBehavior === 'current') {
      window.location.assign(url)
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submit()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setQuery('')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="glass-surface flex h-[56px] w-full max-w-[720px] items-center gap-md rounded-sm px-xl transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] focus-within:border-[var(--fg-ink)]"
    >
      <Search className="size-5 shrink-0 fg-mute" aria-hidden="true" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('placeholderWithProvider', { provider: providerName })}
        aria-label={t('ariaLabel')}
        className="fg-ink h-full w-full bg-transparent font-sans text-body-md outline-none placeholder:text-[var(--fg-mute)]"
      />
      <kbd className="fg-mute shrink-0 select-none font-mono text-caption-mono-sm uppercase">
        {t('enterHint')}
      </kbd>
    </form>
  )
}
