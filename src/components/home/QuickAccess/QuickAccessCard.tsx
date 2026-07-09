import { memo, useRef, useState } from 'react'
import { QuickAccessIcon } from '@/features/quick-access'
import type { QuickAccessItem } from '@/features/quick-access'

/** Horizontal auto-scroll speed for overflowing names (px per second). */
const SCROLL_SPEED = 45
/** Minimum scroll duration (s) so short overflows still animate gently. */
const MIN_SCROLL_DURATION = 0.6

/**
 * ScrollingName
 * Shows the site name with an ellipsis when it fits within its tile. When the
 * name overflows, hovering the tile smoothly scrolls the full text into view
 * (and back out when the pointer leaves). Non-overflowing names never move.
 */
function ScrollingName({ name }: { name: string }) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [offset, setOffset] = useState(0)
  const [duration, setDuration] = useState(0)

  function handleEnter() {
    const container = containerRef.current
    const text = textRef.current
    if (!container || !text) return
    const overflow = text.scrollWidth - container.clientWidth
    if (overflow <= 0) return
    setOffset(overflow)
    setDuration(Math.max(overflow / SCROLL_SPEED, MIN_SCROLL_DURATION))
  }

  function handleLeave() {
    setOffset(0)
  }

  return (
    <span
      ref={containerRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="block max-w-full overflow-hidden"
    >
      <span
        ref={textRef}
        className="fg-body block whitespace-nowrap text-body-sm"
        style={{
          transform: `translateX(-${offset}px)`,
          transition: `transform ${duration}s linear`,
          // Keep the ellipsis affordance only while the text is at rest.
          textOverflow: offset === 0 ? 'ellipsis' : 'clip',
          overflow: 'hidden',
        }}
      >
        {name}
      </span>
    </span>
  )
}

/**
 * QuickAccessCard
 * A single site tile (~96×96): brand logo on top, name beneath. Opens in a new
 * tab. Restrained by design — only background-color / border-color / opacity
 * transitions (150ms). No shadow, scale, glow, or blur.
 *
 * `item.name` is user data and is rendered as-is (never translated).
 *
 * Memoized: tiles are static between renders, so re-rendering the grid (e.g. on
 * unrelated state changes) shouldn't re-render every card.
 */
export const QuickAccessCard = memo(function QuickAccessCard({
  item,
}: {
  item: QuickAccessItem
}) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={item.name}
      className="glass-surface glass-surface-hover fg-body flex aspect-square flex-col items-center justify-center gap-sm rounded-sm p-md outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:text-[var(--fg-ink)] focus-visible:ring-2 focus-visible:ring-ring"
    >
      <QuickAccessIcon
        iconKey={item.icon}
        accentColor={item.accentColor}
        className="size-8 shrink-0 fg-ink"
      />
      <ScrollingName name={item.name} />
    </a>
  )
})
