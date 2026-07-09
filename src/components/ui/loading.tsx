import { Loader2 } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const spinnerVariants = cva('animate-spin text-body-mid', {
  variants: {
    size: {
      sm: 'size-4',
      md: 'size-6',
      lg: 'size-8',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export interface LoadingProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /** Optional caption rendered beneath the spinner. */
  label?: string
}

/**
 * Loading — centered spinner with optional caption. Uses Lucide Loader2.
 */
function Loading({ className, size, label, ...props }: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-sm',
        className
      )}
      {...props}
    >
      <Loader2 className={cn(spinnerVariants({ size }))} />
      {label ? (
        <span className="font-mono text-caption-mono-sm uppercase text-body-mid">
          {label}
        </span>
      ) : null}
      <span className="sr-only">Loading</span>
    </div>
  )
}

export { Loading, spinnerVariants }
