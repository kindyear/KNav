import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { migrateIconValue } from './iconUtils'

export interface IconRendererProps {
  /** Iconify icon name, e.g. `simple-icons:google`. Legacy values auto-migrate. */
  icon: string
  className?: string
  /**
   * Optional explicit color. When omitted the icon inherits `currentColor`.
   * Brand marks look best with their own color; pass e.g. a hex accent here.
   */
  color?: string
  /** Accessible label; when omitted the icon is decorative (aria-hidden). */
  label?: string
}

/**
 * IconRenderer
 * The single, project-wide icon component. Every icon in the app renders
 * through here — never import `@iconify/react`'s `<Icon>` directly elsewhere.
 *
 * Icons are fetched on demand from the Iconify API and cached by `@iconify/react`
 * (memory + browser cache); no icon library is bundled. Centralizing here means
 * caching, lazy-loading, color, and animation behavior can evolve in one place.
 */
export function IconRenderer({
  icon,
  className,
  color,
  label,
}: IconRendererProps) {
  const name = migrateIconValue(icon)
  return (
    <Icon
      icon={name}
      className={cn('inline-block', className)}
      color={color}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  )
}
