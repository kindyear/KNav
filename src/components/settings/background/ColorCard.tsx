import { cn } from '@/lib/utils'

/**
 * ColorCard
 * A 48×48 rounded-sm solid-color swatch used in the Solid wallpaper grid.
 * Selected state draws an inner ring using the design ring token. When
 * `removable` is set, a placeholder remove affordance sits in the top-right
 * corner (UI-only — wired to `onRemove` but no real deletion logic here).
 */
export function ColorCard({
  color,
  label,
  selected = false,
  removable = false,
  onSelect,
  onRemove,
  removeAriaLabel,
}: {
  color: string
  label: string
  selected?: boolean
  removable?: boolean
  onSelect?: () => void
  onRemove?: () => void
  removeAriaLabel?: string
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        aria-label={label}
        aria-pressed={selected}
        onClick={onSelect}
        style={{ backgroundColor: color }}
        className={cn(
          'size-12 rounded-sm border border-hairline outline-none transition-[box-shadow] duration-[var(--duration-fast)] focus-visible:ring-2 focus-visible:ring-ring',
          selected && 'ring-2 ring-ink ring-offset-2 ring-offset-canvas-card'
        )}
      />
      {removable ? (
        <button
          type="button"
          aria-label={removeAriaLabel}
          onClick={onRemove}
          className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-pill border border-hairline bg-canvas-card text-body-mid opacity-0 outline-none transition-opacity duration-[var(--duration-fast)] hover:text-ink focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
        >
          <span aria-hidden="true" className="text-[10px] leading-none">
            ×
          </span>
        </button>
      ) : null}
    </div>
  )
}
