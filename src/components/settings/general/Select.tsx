import { Check, ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface SelectOption<T extends string> {
  value: T
  label: string
}

/**
 * Select
 * A minimal dropdown built on the shared Popover primitive. Shows the current
 * option with a chevron; the panel lists options with a check on the active
 * one. UI-only — controlled via value/onChange.
 */
export function Select<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: SelectOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel?: string
}) {
  const current = options.find((o) => o.value === value)
  return (
    <Popover>
      <PopoverTrigger
        aria-label={ariaLabel}
        className="flex h-9 min-w-[150px] items-center justify-between gap-sm rounded-pill border border-hairline bg-transparent px-md text-button-md text-ink outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:bg-canvas-soft focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="truncate">{current?.label}</span>
        <ChevronDown className="size-4 shrink-0 text-body-mid" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[200px] p-xs">
        <div className="flex flex-col gap-xxs">
          {options.map((opt) => {
            const selected = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className={cn(
                  'flex items-center justify-between gap-sm rounded-sm px-md py-sm text-left text-body-sm outline-none transition-colors duration-[var(--duration-fast)] hover:bg-canvas-mid focus-visible:ring-2 focus-visible:ring-ring',
                  selected ? 'text-ink' : 'text-body'
                )}
              >
                <span className="truncate">{opt.label}</span>
                {selected ? (
                  <Check className="size-4 shrink-0 text-ink" aria-hidden="true" />
                ) : null}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
