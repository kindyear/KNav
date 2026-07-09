import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Button — brand pill is the universal interactive shape (design.md).
 * Variants map to design.md button specs:
 *  - primary: rare white-filled pill (bg primary / text on-primary)
 *  - outline: canonical translucent-border outline pill
 *  - ghost:   no chrome; hover fills with canvas-soft
 *  - link:    inline text affordance
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans text-button-md outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'rounded-pill bg-primary text-on-primary border border-primary hover:opacity-90',
        outline:
          'rounded-pill bg-transparent text-ink border border-hairline hover:bg-canvas-soft',
        ghost: 'rounded-pill bg-transparent text-ink hover:bg-canvas-soft',
        link: 'text-ink underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-md',
        md: 'h-10 px-lg',
        lg: 'h-11 px-xl',
        icon: 'size-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
