import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui'
import { IconRenderer } from './IconRenderer'
import { IconSearch } from './IconSearch'
import { IconTabs } from './IconTabs'
import { IconGrid } from './IconGrid'
import { IconPreview } from './IconPreview'
import { useDebouncedValue } from './useDebouncedValue'
import { useRecentIconsStore } from './useRecentIcons'
import { ICON_TABS, type IconTabId } from './iconCollections'
import { browseIcons, searchIcons } from './iconUtils'

interface IconPickerProps {
  /** Currently selected Iconify name, e.g. `simple-icons:google`. */
  value: string
  /** Called with the chosen Iconify name. */
  onChange: (icon: string) => void
}

/**
 * IconPicker
 * The single, project-wide icon picker. Browses & searches the Iconify library
 * on demand via the Iconify API:
 * - Tabs (Recent / All / Brands / System / Developer / Other) lazy-load only
 *   the collections they need.
 * - Search is debounced and queries across the active tab's collections.
 * - Results render in a virtualized grid, so even thousands of icons stay smooth.
 * - Recently-used icons are remembered and shown first.
 */
export function IconPicker({ value, onChange }: IconPickerProps) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const recent = useRecentIconsStore((s) => s.recent)
  const addRecent = useRecentIconsStore((s) => s.add)

  const [tab, setTab] = useState<IconTabId>(recent.length ? 'recent' : 'all')
  const [rawQuery, setRawQuery] = useState('')
  const query = useDebouncedValue(rawQuery.trim(), 300)

  const [icons, setIcons] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)

  const activeTab = useMemo(
    () => ICON_TABS.find((tt) => tt.id === tab),
    [tab]
  )

  // Load icons whenever the tab or (debounced) query changes while open.
  const reqIdRef = useRef(0)
  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    const reqId = ++reqIdRef.current

    async function load() {
      // Recent tab: show remembered icons (or nothing when searching within it).
      if (tab === 'recent' && !query) {
        setIcons(recent)
        return
      }
      if (!activeTab) return
      setLoading(true)
      try {
        const result = query
          ? await searchIcons(
              query,
              tab === 'recent'
                ? ICON_TABS[0].searchPrefixes
                : activeTab.searchPrefixes,
              controller.signal
            )
          : await browseIcons(activeTab.browsePrefixes, controller.signal)
        if (reqId === reqIdRef.current) setIcons(result)
      } catch {
        if (reqId === reqIdRef.current) setIcons([])
      } finally {
        if (reqId === reqIdRef.current) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [open, tab, query, activeTab, recent])

  function handleSelect(icon: string) {
    addRecent(icon)
    onChange(icon)
    setOpen(false)
    setRawQuery('')
    setHovered(null)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t('iconPicker.trigger')}
          className="flex size-11 shrink-0 items-center justify-center rounded-sm border border-hairline bg-canvas-soft outline-none transition-colors hover:bg-canvas-mid focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IconRenderer icon={value} className="size-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(92vw,26rem)] p-md">
        <div className="flex flex-col gap-md">
          <IconSearch value={rawQuery} onChange={setRawQuery} />
          <IconTabs
            active={tab}
            onChange={setTab}
            showRecent={recent.length > 0}
          />

          {loading ? (
            <div className="flex h-[320px] items-center justify-center text-body-sm text-body-mid">
              {t('iconPicker.loading')}
            </div>
          ) : icons.length === 0 ? (
            <div className="flex h-[320px] items-center justify-center text-body-sm text-body-mid">
              {query ? t('iconPicker.noResults') : t('iconPicker.empty')}
            </div>
          ) : (
            <IconGrid
              icons={icons}
              selected={value}
              onSelect={handleSelect}
              onHover={setHovered}
            />
          )}

          <div className="border-t border-hairline pt-sm">
            <IconPreview icon={hovered ?? value} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
