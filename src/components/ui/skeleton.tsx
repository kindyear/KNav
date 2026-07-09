import { cn } from '@/lib/utils'

/**
 * Skeleton — loading placeholder. Uses canvas-soft with a subtle pulse.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-sm bg-canvas-soft', className)}
      {...props}
    />
  )
}

export { Skeleton }
