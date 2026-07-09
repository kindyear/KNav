import { cn } from '@/lib/utils'

/**
 * GradientCard
 * A 16:9 rounded-sm gradient preview tile used in the Gradient wallpaper grid.
 * `gradient` is any valid CSS background-image value (e.g. a linear-gradient).
 * Selected state draws an inner ring. `removable` shows a UI-only remove
 * affordance in the top-right corner.
 */
export function GradientCard({
  gradient,
  label,
  selected = false,
  removable = false,
  onSelect,
  onRemove,
  removeAriaLabel,
}: {
  gradient: string
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
        style={{ backgroundImage: gradient }}
        className={cn(
          'aspect-video w-full rounded-sm border border-hairline outline-none transition-[box-shadow] duration-[var(--duration-fast)] focus-visible:ring-2 focus-visible:ring-ring',
          selected && 'ring-2 ring-ink ring-offset-2 ring-offset-canvas-card'
        )}
      />
      {removable ? (
        <button
          type="button"
          aria-label={removeAriaLabel}
          onClick={onRemove}
          className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-pill border border-hairline bg-canvas-card text-body-mid opacity-0 outline-none transition-opacity duration-[var(--duration-fast)] hover:text-ink focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
        >
          <span aria-hidden="true" className="text-xs leading-none">
            ×
          </span>
        </button>
      ) : null}
    </div>
  )
}
