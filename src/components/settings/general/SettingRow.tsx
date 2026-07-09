import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * SettingRow
 * A single setting rendered as its own card (matching the Background page's
 * card language):
 *   [icon] [title / description] ........................ [control]
 * `danger` gives the card a subtle red tint + border for destructive rows.
 * UI-only — the control is provided by the caller.
 */
export function SettingRow({
  icon: Icon,
  title,
  description,
  danger = false,
  control,
}: {
  icon: LucideIcon
  title: string
  description: string
  danger?: boolean
  control: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex min-h-[64px] items-center gap-lg rounded-sm border px-lg py-md',
        danger
          ? 'border-destructive/20 bg-destructive/5'
          : 'border-hairline bg-canvas-card'
      )}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-sm border',
          danger
            ? 'border-destructive/20 text-destructive'
            : 'border-hairline text-body'
        )}
      >
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-xxs">
        <span className="text-body-md font-medium text-ink">{title}</span>
        <span className="text-body-sm text-body-mid">{description}</span>
      </div>
      <div className="flex shrink-0 items-center justify-end">{control}</div>
    </div>
  )
}
