import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { IconRenderer } from '@/components/icon-system'
import { useProviderStore } from './providerStore'
import {
  useSearchProviderStore,
  useResolvedProviderId,
} from './use-search-provider-store'
import { getEnabledProviders } from './providerUtils'

/**
 * SearchProvider
 * A horizontal, browser-tab-style provider bar inside a single pill container
 * (canvas-card + hairline border). Fully config-driven: it renders the enabled
 * providers from the store, ordered by `order`. Exactly one is selected.
 *
 * - Selected tab: adaptive fill/text (fg-active vars); logo goes monochrome.
 * - Unselected tab: transparent, brand-colored logo, subtle hover.
 * - No wrapping; narrow screens scroll horizontally (text never compresses).
 * - Only background-color / color / opacity transitions (150ms).
 */
export function SearchProvider() {
  const { t } = useTranslation('search')
  const providers = useProviderStore((s) => s.providers)
  const setProviderId = useSearchProviderStore((s) => s.setProviderId)
  const selectedId = useResolvedProviderId()

  const barProviders = getEnabledProviders(providers)
  if (barProviders.length === 0) return null

  return (
    <div
      role="radiogroup"
      aria-label={t('engineGroupLabel')}
      className="glass-surface w-fit max-w-full overflow-x-auto rounded-pill [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex h-[44px] items-center gap-xs p-xs">
        {barProviders.map((provider) => {
          const selected = provider.id === selectedId
          return (
            <button
              key={provider.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={provider.name}
              onClick={() => setProviderId(provider.id)}
              className={cn(
                'flex h-full shrink-0 items-center gap-[6px] whitespace-nowrap rounded-pill px-md font-sans text-button-md outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] focus-visible:ring-2 focus-visible:ring-ring sm:px-lg',
                selected
                  ? 'bg-[var(--fg-active-bg)] text-[var(--fg-active-fg)]'
                  : 'fg-ink bg-transparent hover:bg-[var(--glass-bg-hover)]'
              )}
            >
              <IconRenderer
                icon={provider.icon}
                className="size-[17px] shrink-0"
              />
              <span className="hidden sm:inline">{provider.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
