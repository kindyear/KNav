import { Toaster as SonnerToaster, toast } from 'sonner'
import { useTheme } from '@/hooks/use-theme'

/**
 * Toaster — sonner toasts skinned to KNav tokens.
 * Mount once near the app root. Trigger with the exported `toast()`.
 */
function Toaster() {
  const { resolvedTheme } = useTheme()

  return (
    <SonnerToaster
      theme={resolvedTheme}
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'group rounded-sm border border-hairline bg-canvas text-ink font-sans text-body-sm',
          description: 'text-body-mid',
          actionButton: 'rounded-pill bg-primary text-on-primary',
          cancelButton: 'rounded-pill bg-canvas-soft text-ink',
        },
      }}
      style={
        {
          '--normal-bg': 'var(--canvas)',
          '--normal-text': 'var(--ink)',
          '--normal-border': 'var(--hairline)',
        } as React.CSSProperties
      }
    />
  )
}

export { Toaster, toast }
