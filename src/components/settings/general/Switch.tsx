import { cn } from '@/lib/utils'

/**
 * Switch
 * A pill toggle matching the readability controls' switch style. UI-only —
 * controlled via checked/onChange.
 */
export function Switch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-10 shrink-0 rounded-pill outline-none transition-colors duration-[var(--duration-fast)] focus-visible:ring-2 focus-visible:ring-ring',
        checked ? 'bg-primary' : 'bg-canvas-mid'
      )}
    >
      <span
        className={cn(
          'absolute top-1/2 size-4 -translate-y-1/2 rounded-pill bg-canvas-card transition-[left] duration-[var(--duration-fast)]',
          checked ? 'left-[20px]' : 'left-[4px]'
        )}
      />
    </button>
  )
}
