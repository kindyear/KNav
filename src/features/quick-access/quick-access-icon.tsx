import { IconRenderer } from '@/components/icon-system'

export interface QuickAccessIconProps {
  /** Iconify icon name (e.g. `simple-icons:google`). Legacy keys auto-migrate. */
  iconKey: string
  className?: string
  /** Optional accent color override (hex); otherwise inherits currentColor. */
  accentColor?: string
}

/**
 * QuickAccessIcon
 * Thin wrapper over the project-wide IconRenderer for quick-access tiles.
 * Applies an optional accent color; otherwise the icon inherits currentColor.
 */
export function QuickAccessIcon({
  iconKey,
  className,
  accentColor,
}: QuickAccessIconProps) {
  return (
    <IconRenderer icon={iconKey} className={className} color={accentColor} />
  )
}
