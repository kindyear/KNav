import { useEffect, useState } from 'react'

/**
 * useDebouncedValue
 * Returns a copy of `value` that only updates after `delay` ms of no changes.
 * Used to debounce icon-picker search input before hitting the Iconify API.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
