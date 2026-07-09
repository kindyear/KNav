import type { StateStorage } from 'zustand/middleware'

/**
 * Create a StateStorage backed by localStorage whose writes are throttled.
 * Reads pass through immediately; writes coalesce within `waitMs` (leading +
 * trailing) so rapid updates (e.g. dragging a slider) don't hammer storage.
 * A `beforeunload` flush guarantees the last value is persisted.
 */
export function createThrottledLocalStorage(waitMs: number): StateStorage {
  let timer: ReturnType<typeof setTimeout> | null = null
  let pending: { key: string; value: string } | null = null

  const flush = () => {
    if (pending) {
      try {
        window.localStorage.setItem(pending.key, pending.value)
      } catch {
        // Ignore quota / serialization errors — persistence is best-effort.
      }
      pending = null
    }
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', flush)
  }

  return {
    getItem: (name) => {
      try {
        return window.localStorage.getItem(name)
      } catch {
        return null
      }
    },
    setItem: (name, value) => {
      pending = { key: name, value }
      if (timer) return
      timer = setTimeout(() => {
        timer = null
        flush()
      }, waitMs)
    },
    removeItem: (name) => {
      pending = null
      try {
        window.localStorage.removeItem(name)
      } catch {
        // no-op
      }
    },
  }
}
