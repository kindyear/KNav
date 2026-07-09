import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Settings } from 'lucide-react'
import { SETTINGS_CATEGORIES } from './categories'
import type { SettingsCategoryId } from './types'

const ANIM_MS = 220

/**
 * The settings sheet body (and every settings page it pulls in) is code-split.
 * Nothing settings-related is downloaded until the user first opens the panel.
 */
const SettingsSheet = lazy(() =>
  import('./SettingsSheet').then((m) => ({ default: m.SettingsSheet }))
)

/**
 * SettingsPanel
 * A bottom-sheet settings surface (not a dialog / drawer). Includes the
 * top-right trigger button. The page stays visible behind a dim backdrop.
 *
 * Open: slide up from the bottom (translateY 100%→0) + fade in, 220ms ease-out.
 * Close: reverse. Closes via the X button, ESC, or backdrop click.
 * The sheet body is lazy-loaded on first open to keep the initial bundle small.
 */
export function SettingsPanel() {
  const { t } = useTranslation('settings')
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [activeId, setActiveId] = useState<SettingsCategoryId>(
    SETTINGS_CATEGORIES[0].id
  )

  const close = useCallback(() => setOpen(false), [])

  // Drive mount + enter/exit transitions from `open`.
  useEffect(() => {
    if (open) {
      setMounted(true)
      // Double rAF: let the initial (hidden) state paint first, then flip to
      // visible so the enter transition actually runs.
      let inner = 0
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setVisible(true))
      })
      return () => {
        cancelAnimationFrame(outer)
        cancelAnimationFrame(inner)
      }
    }
    setVisible(false)
    const timer = window.setTimeout(() => setMounted(false), ANIM_MS)
    return () => window.clearTimeout(timer)
  }, [open])

  // ESC to close + lock body scroll while open.
  useEffect(() => {
    if (!mounted) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [mounted, close])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('openAriaLabel')}
        aria-haspopup="dialog"
        className="glass-surface glass-surface-hover fg-ink fixed right-xl top-xl z-40 flex size-10 items-center justify-center rounded-pill outline-none transition-colors duration-[var(--duration-fast)] focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Settings className="size-5" aria-hidden="true" />
      </button>

      {mounted
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-end justify-center">
              {/* Backdrop */}
              <div
                onClick={close}
                aria-hidden="true"
                className="absolute inset-0 bg-black/60 transition-opacity duration-[220ms] ease-out"
                style={{ opacity: visible ? 1 : 0 }}
              />

              {/* Bottom sheet (lazy-loaded) */}
              <Suspense fallback={null}>
                <SettingsSheet
                  visible={visible}
                  activeId={activeId}
                  onSelect={setActiveId}
                  onClose={close}
                />
              </Suspense>
            </div>,
            document.body
          )
        : null}
    </>
  )
}
