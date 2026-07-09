import { READABILITY_TRANSITION_MS } from '@/config/readability'

/**
 * BackgroundOverlay
 * A single fixed scrim layer between the wallpaper and page content. Its opacity
 * is driven by `--overlay-opacity` (set by the readability manager from
 * wallpaper brightness / user settings) and transitions smoothly on change.
 * Uses a neutral black tint — light enough to preserve the wallpaper while
 * lifting foreground contrast (never a heavy blackout, capped at 35%).
 */
export function BackgroundOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-[9] bg-black"
      style={{
        opacity: 'var(--overlay-opacity)',
        transition: `opacity ${READABILITY_TRANSITION_MS}ms ease`,
      }}
    />
  )
}
