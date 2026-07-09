import { useTranslation } from 'react-i18next'

const AUTHOR_URL = 'https://www.kindyear.cn'

/**
 * Footer
 * Minimal page footer: brand name, version, and author attribution linking to
 * the author's site. All visible strings come from i18n; version is injected at
 * build time from package.json (see vite.config.ts).
 */
export function Footer() {
  const { t } = useTranslation('footer')
  const { t: tNav } = useTranslation('navigation')

  return (
    <footer className="fg-mute fg-text-shadow flex w-full flex-wrap items-center justify-center gap-x-md gap-y-xs px-lg py-lg text-caption-mono-sm">
      <span className="fg-ink font-mono uppercase">{tNav('brand')}</span>
      <span className="font-mono">
        {t('version', { version: __APP_VERSION__ })}
      </span>
      <span className="font-mono">
        {t('builtBy')}{' '}
        <a
          href={AUTHOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-4 outline-none transition-colors duration-[var(--duration-fast)] hover:text-[var(--fg-ink)] hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t('author')}
        </a>
      </span>
    </footer>
  )
}
