import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Typography — the single source of text styling, mapping design.md's ladder.
 * Use `variant` to pick a role; `as` to control the rendered element.
 * The brand never bolds — weight 400 is baked into the tokens.
 */
const typographyVariants = cva('font-sans text-ink', {
  variants: {
    variant: {
      'display-xl': 'font-display text-display-xl',
      'display-lg': 'font-display text-display-lg',
      'display-md': 'font-display text-display-md',
      'display-sm': 'font-display text-display-sm',
      'display-xs': 'font-display text-display-xs',
      'body-lg': 'text-body-lg',
      'body-md': 'text-body-md',
      'body-sm': 'text-body-sm',
      'caption-mono': 'font-mono text-caption-mono uppercase',
      'caption-mono-sm': 'font-mono text-caption-mono-sm uppercase',
    },
    tone: {
      ink: 'text-ink',
      body: 'text-body',
      mute: 'text-body-mid',
    },
  },
  defaultVariants: {
    variant: 'body-md',
    tone: 'ink',
  },
})

type TypographyElement =
  'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div' | 'label'

export interface TypographyProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: TypographyElement
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, tone, as = 'p', ...props }, ref) => {
    const Comp = as as React.ElementType
    return (
      <Comp
        ref={ref}
        className={cn(typographyVariants({ variant, tone, className }))}
        {...props}
      />
    )
  }
)
Typography.displayName = 'Typography'

/** Convenience: the brand's uppercase tracked GeistMono eyebrow. */
const Eyebrow = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('font-mono text-caption-mono uppercase text-ink', className)}
    {...props}
  />
))
Eyebrow.displayName = 'Eyebrow'

export { Typography, Eyebrow, typographyVariants }
