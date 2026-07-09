import { cn } from '@/lib/utils'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
}

/**
 * Segmented
 * iOS/macOS-style segmented control (pill container with equal segments).
 * Exactly one option is active. UI-only — controlled via value/onChange.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel?: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex rounded-pill border border-hairline bg-canvas-soft p-xs"
    >
      {options.map((opt) => {
        const selected = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              'whitespace-nowrap rounded-pill px-md py-xs text-button-md outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] focus-visible:ring-2 focus-visible:ring-ring',
              selected
                ? 'bg-primary text-on-primary'
                : 'bg-transparent text-body hover:text-ink'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
