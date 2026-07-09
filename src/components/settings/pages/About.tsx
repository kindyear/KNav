import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui'
import { IconRenderer } from '@/components/icon-system'
import {
  BUILD_INFO,
  COPYRIGHT,
  DEVELOPER_ENTRIES,
  ENVIRONMENT_ENTRIES,
  LIBRARY_FALLBACK_ICON,
  PROJECT_LINKS,
  getLibraries,
  type LibraryEntry,
} from '@/config/about'

/** External-link button that always opens in a new tab. */
function LinkButton({
  href,
  children,
  icon,
}: {
  href: string
  children: React.ReactNode
  icon?: string
}) {
  const isMailto = href.startsWith('mailto:')
  return (
    <Button asChild variant="outline" size="sm">
      <a
        href={href}
        target={isMailto ? undefined : '_blank'}
        rel={isMailto ? undefined : 'noreferrer noopener'}
      >
        {icon ? <IconRenderer icon={icon} /> : null}
        {children}
      </a>
    </Button>
  )
}

function DeveloperCard() {
  const { t } = useTranslation('about')
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('developer.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-sm">
        {DEVELOPER_ENTRIES.map((entry) => {
          const label =
            entry.key === 'id'
              ? entry.value
              : t(`developer.fields.${entry.key}`)
          const isMailto = entry.href?.startsWith('mailto:')
          const className =
            'inline-flex items-center gap-xs rounded-pill border border-hairline px-md py-xs text-body-sm text-ink transition-colors hover:bg-canvas-soft'
          const content = (
            <>
              <IconRenderer
                icon={entry.icon}
                className="size-4 text-body-mid"
              />
              {label}
            </>
          )
          return entry.href ? (
            <a
              key={entry.key}
              href={entry.href}
              target={isMailto ? undefined : '_blank'}
              rel={isMailto ? undefined : 'noreferrer noopener'}
              className={className}
            >
              {content}
            </a>
          ) : (
            <span key={entry.key} className={className}>
              {content}
            </span>
          )
        })}
      </CardContent>
    </Card>
  )
}

function VersionCard() {
  const { t } = useTranslation('about')
  const buildTime = useMemo(() => {
    if (!BUILD_INFO.buildTime) return t('version.notAvailable')
    try {
      return new Date(BUILD_INFO.buildTime).toLocaleString()
    } catch {
      return BUILD_INFO.buildTime
    }
  }, [t])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('version.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-lg">
        <div className="grid gap-lg sm:grid-cols-2">
          <div className="flex flex-col gap-xxs">
            <span className="text-caption-mono-sm uppercase tracking-[var(--tracking-caption-mono-sm)] text-body-mid">
              {t('version.current')}
            </span>
            <span className="font-mono text-body-sm text-ink">
              v{BUILD_INFO.version}
            </span>
          </div>
          <div className="flex flex-col gap-xxs">
            <span className="text-caption-mono-sm uppercase tracking-[var(--tracking-caption-mono-sm)] text-body-mid">
              {t('version.buildTime')}
            </span>
            <span className="font-mono text-body-sm text-ink">{buildTime}</span>
          </div>
        </div>
        <div className="flex flex-col gap-sm border-t border-hairline pt-lg">
          <span className="text-caption-mono-sm uppercase tracking-[var(--tracking-caption-mono-sm)] text-body-mid">
            {t('version.environment')}
          </span>
          <div className="flex flex-wrap gap-sm">
            {ENVIRONMENT_ENTRIES.map((env) => (
              <span
                key={env.name}
                className="inline-flex items-center gap-xs rounded-pill border border-hairline px-md py-xxs text-body-sm text-ink"
              >
                <IconRenderer
                  icon={env.icon}
                  color={env.color}
                  className="size-4"
                />
                {env.name}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LibrariesDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation('about')
  const libraries = useMemo(() => getLibraries(), [])
  const deps = libraries.filter((l) => !l.dev)
  const devDeps = libraries.filter((l) => l.dev)

  const renderGroup = (title: string, list: LibraryEntry[]) => (
    <div className="flex flex-col gap-sm">
      <span className="text-caption-mono-sm uppercase tracking-[var(--tracking-caption-mono-sm)] text-body-mid">
        {title}
      </span>
      <ul className="flex flex-col gap-xs">
        {list.map((lib) => (
          <li
            key={lib.name}
            className="flex items-center justify-between gap-md"
          >
            <span className="flex min-w-0 items-center gap-sm">
              <IconRenderer
                icon={lib.meta.icon ?? LIBRARY_FALLBACK_ICON}
                color={lib.meta.color}
                className="size-4 shrink-0 text-body-mid"
              />
              <span className="truncate text-body-sm text-ink">{lib.name}</span>
            </span>
            <span className="shrink-0 font-mono text-caption-mono-sm text-body-mid">
              v{lib.version}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('libraries.title')}</DialogTitle>
          <DialogDescription>{t('libraries.description')}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-lg">
          {renderGroup(t('libraries.dependencies'), deps)}
          {renderGroup(t('libraries.devDependencies'), devDeps)}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * OpenSourceCard
 * Consolidated card covering the project's open-source facets: dependency list
 * (dialog), repository link, and the license badge.
 */
function OpenSourceCard() {
  const { t } = useTranslation('about')
  const [librariesOpen, setLibrariesOpen] = useState(false)
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('openSource.title')}</CardTitle>
        <CardDescription>{t('openSource.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-lg">
        <div className="flex flex-wrap items-center gap-sm">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLibrariesOpen(true)}
          >
            <IconRenderer icon="lucide:package" />
            {t('openSource.dependencies')}
          </Button>
          <LinkButton
            href={PROJECT_LINKS.repository}
            icon="simple-icons:github"
          >
            {t('openSource.repository')}
          </LinkButton>
        </div>
        <LibrariesDialog open={librariesOpen} onOpenChange={setLibrariesOpen} />
      </CardContent>
    </Card>
  )
}

export function About() {
  const { t } = useTranslation('about')
  return (
    <div className="flex flex-col gap-xl">
      {/* Header */}
      <div className="flex flex-col items-center gap-md py-lg text-center">
        <h2 className="font-display text-display-sm text-ink">
          {t('common:app.name', { defaultValue: 'KNav' })}
        </h2>
        <p className="max-w-[32rem] text-body-md text-body">
          {t('header.subtitle')}
        </p>
        <p className="max-w-[32rem] text-body-sm text-body-mid">
          {t('header.intro')}
        </p>
        <span className="inline-flex items-center gap-xs rounded-pill border border-hairline px-md py-xxs font-mono text-caption-mono-sm text-body-mid">
          {t('header.version', { version: BUILD_INFO.version })}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-md">
        <DeveloperCard />
        <VersionCard />
        <OpenSourceCard />
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-xs border-t border-hairline py-xl text-center">
        <span className="font-display text-body-md text-ink">
          {t('common:app.name', { defaultValue: 'KNav' })}
        </span>
        <span className="text-caption-mono-sm text-body-mid">
          {t('footer.copyright', {
            year: COPYRIGHT.year,
            holder: COPYRIGHT.holder,
          })}
        </span>
        <span className="text-caption-mono-sm text-body-mid">
          {t('footer.madeWith')}
        </span>
      </div>
    </div>
  )
}
