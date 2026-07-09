/**
 * Blob ⇄ Base64 helpers for config import/export.
 *
 * Wallpapers are stored as binary Blobs in IndexedDB but must travel as JSON
 * (text) inside an export file. These are the single, shared conversion pair —
 * do not re-implement Blob/Base64 conversion in business code.
 *
 * Reads/writes are intentionally one-at-a-time friendly: convert a single blob,
 * let it be GC'd, then move to the next, so we never hold dozens of MB at once.
 */

/**
 * Convert a Blob to a raw Base64 string (no `data:` prefix).
 * Uses FileReader's data URL then strips the header — this streams the bytes
 * natively instead of building a giant JS string via btoa on a huge array.
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('BLOB_READ_NON_STRING'))
        return
      }
      // result looks like "data:<mime>;base64,<payload>"
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(reader.error ?? new Error('BLOB_READ_FAILED'))
    reader.readAsDataURL(blob)
  })
}

/**
 * Convert a raw Base64 string back into a Blob of the given MIME type.
 * Accepts either a bare payload or a full `data:` URL (header is ignored).
 */
export function base64ToBlob(base64: string, mime: string): Blob {
  const comma = base64.indexOf(',')
  const payload = base64.startsWith('data:') && comma >= 0
    ? base64.slice(comma + 1)
    : base64
  const binary = atob(payload)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime || 'application/octet-stream' })
}
