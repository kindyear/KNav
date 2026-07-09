import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Input — standard text field on dark (design.md `text-input`).
 * Surface canvas-soft, hairline border, rounded-sm.
 */
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-sm border border-hairline bg-canvas-soft px-lg py-md font-sans text-body-md text-ink outline-none transition-colors duration-[var(--duration-fast)] placeholder:text-body-mid focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }
