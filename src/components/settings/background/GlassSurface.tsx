import type { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * GlassSurface
 * A frosted-glass container for content that sits over the wallpaper (search
 * box, cards, footer, buttons). Styling comes from the readability CSS
 * variables via the `.glass-surface` utility, so it adapts to background
 * brightness and animates on change. Blur is scoped to this surface only.
 *
 * `as` lets callers render a button/label/etc. while keeping the glass styling.
 * `hover` enables the subtle opacity lift on hover.
 */
export function GlassSurface<T extends ElementType = 'div'>({
  as,
  hover = false,
  className,
  children,
  ...rest
}: {
  as?: T
  hover?: boolean
  className?: string
  children?: ReactNode
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>) {
  const Component = (as ?? 'div') as ElementType
  return (
    <Component
      className={cn(
        'glass-surface',
        hover && 'glass-surface-hover',
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}
