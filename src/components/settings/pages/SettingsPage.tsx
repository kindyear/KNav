import type { ReactNode } from 'react'

/**
 * SettingsPage
 * Shared shell for each settings page: title (display-xs), description
 * (body-sm), followed by a vertical stack of placeholder cards.
 */
export function SettingsPage({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-xl">
      <div className="flex flex-col gap-xs">
        <h3 className="font-display text-display-xs text-ink">{title}</h3>
        <p className="text-body-sm text-body-mid">{description}</p>
      </div>
      <div className="flex flex-col gap-md">{children}</div>
    </div>
  )
}
