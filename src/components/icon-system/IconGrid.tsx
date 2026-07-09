import { useEffect, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from '@/lib/utils'
import { IconRenderer } from './IconRenderer'

interface IconGridProps {
  icons: string[]
  selected: string
  onSelect: (icon: string) => void
  onHover: (icon: string | null) => void
}

/** Cell size (px) — icon glyph is ~40-48px inside a slightly larger hit area. */
const CELL = 56
/** Column counts by container width breakpoint (mobile 4 → desktop 10). */
function columnsForWidth(width: number): number {
  if (width >= 640) return 10
  if (width >= 480) return 6
  return 4
}

/**
 * IconGrid
 * Responsive, virtualized icon grid. Only the visible rows are rendered (via
 * `@tanstack/react-virtual`), so the grid stays smooth even with thousands of
 * icons. Each icon is fetched on demand by IconRenderer.
 */
export function IconGrid({
  icons,
  selected,
  onSelect,
  onHover,
}: IconGridProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState(6)

  // Track container width to pick a responsive column count.
  useEffect(() => {
    const el = parentRef.current
    if (!el) return
    const update = () => setColumns(columnsForWidth(el.clientWidth))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const rowCount = Math.ceil(icons.length / columns)
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CELL,
    overscan: 4,
  })

  return (
    <div
      ref={parentRef}
      // Stop wheel/touch propagation so the modal Dialog's scroll-lock
      // (react-remove-scroll) doesn't swallow scrolling inside this portaled
      // popover.
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      className="h-[320px] overflow-y-auto overscroll-contain"
    >
      <div
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        className="relative w-full"
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const start = virtualRow.index * columns
          const rowIcons = icons.slice(start, start + columns)
          return (
            <div
              key={virtualRow.key}
              className="absolute left-0 top-0 grid w-full"
              style={{
                height: `${CELL}px`,
                transform: `translateY(${virtualRow.start}px)`,
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {rowIcons.map((icon) => {
                const isSelected = icon === selected
                return (
                  <button
                    key={icon}
                    type="button"
                    title={icon}
                    aria-label={icon}
                    aria-pressed={isSelected}
                    onClick={() => onSelect(icon)}
                    onMouseEnter={() => onHover(icon)}
                    onFocus={() => onHover(icon)}
                    onMouseLeave={() => onHover(null)}
                    className={cn(
                      // m-[3px] insets each cell so the selection ring has room
                      // and isn't clipped by the scroll container edges.
                      'm-[3px] flex items-center justify-center rounded-sm outline-none transition-colors hover:bg-canvas-mid focus-visible:ring-2 focus-visible:ring-ring',
                      isSelected && 'bg-canvas-mid ring-1 ring-ink'
                    )}
                  >
                    <IconRenderer icon={icon} className="size-6" />
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
