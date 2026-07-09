import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * SettingsGroup
 * A titled group inside the General page. Matches the Background page's section
 * form: a body-lg title (optional description) above a vertical stack of
 * individual setting cards. `danger` renders the title in the destructive color
 * (Danger Zone); the red card tint is applied per-row via SettingRow.
 */
export function SettingsGroup({
  title,
  description,
  danger = false,
  children,
}: {
  title: string
  description?: string
  danger?: boolean
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-md">
      <div className="flex flex-col gap-xxs">
        <h4
          className={cn(
            'text-body-lg',
            danger ? 'text-destructive' : 'text-ink'
          )}
        >
          {title}
        </h4>
        {description ? (
          <p className="text-body-sm text-body-mid">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-sm">{children}</div>
    </section>
  )
}
