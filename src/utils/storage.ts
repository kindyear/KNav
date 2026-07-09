/**
 * storageUtils — thin, safe localStorage helpers.
 * All access is wrapped so a disabled/full storage never throws into the app.
 */

/** Read and JSON-parse a value; returns null on miss or parse error. */
export function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/** JSON-serialize and write a value; best-effort (never throws). */
export function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore quota / serialization errors — persistence is best-effort.
  }
}

/** Remove a single key (best-effort). */
export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // no-op
  }
}

/** Remove several keys (best-effort). */
export function removeKeys(keys: readonly string[]): void {
  keys.forEach(removeKey)
}
