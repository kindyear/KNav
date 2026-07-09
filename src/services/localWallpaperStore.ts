/**
 * IndexedDB-backed storage for the single active local wallpaper.
 *
 * Why: local wallpapers used to be persisted as Base64 data URLs inside the
 * (localStorage-backed) wallpaper config. A single 4K JPEG is several MB of
 * Base64 that then lived in localStorage AND in memory (and was re-serialized
 * by `JSON.stringify` on every render). Storing the raw Blob in IndexedDB and
 * handing the UI a short-lived object URL keeps only ONE decoded copy of the
 * active image around and keeps localStorage tiny.
 *
 * Only one image is ever kept (fixed key); uploading a new one overwrites it.
 */

const DB_NAME = 'knav'
const STORE_NAME = 'wallpaper'
const IMAGE_KEY = 'local-image'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IDB_OPEN_FAILED'))
  })
  return dbPromise
}

/** Persist the active local wallpaper blob (overwrites any existing one). */
export async function saveLocalWallpaperBlob(blob: Blob): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(blob, IMAGE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IDB_WRITE_FAILED'))
  })
}

/** Load the active local wallpaper blob, or null when none is stored. */
export async function loadLocalWallpaperBlob(): Promise<Blob | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(IMAGE_KEY)
    req.onsuccess = () => resolve((req.result as Blob) ?? null)
    req.onerror = () => reject(req.error ?? new Error('IDB_READ_FAILED'))
  })
}

/** Remove the stored local wallpaper blob (no-op when none). */
export async function deleteLocalWallpaperBlob(): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(IMAGE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IDB_DELETE_FAILED'))
  })
}

/** The fixed key under which the single active local wallpaper is stored. */
export const LOCAL_WALLPAPER_KEY = IMAGE_KEY

/** One stored wallpaper: its IndexedDB key plus the raw blob. */
export interface StoredWallpaper {
  id: string
  blob: Blob
}

/**
 * Read every stored wallpaper blob (currently at most one). Returns key+blob
 * pairs so the caller can encode them for export. Blobs are fetched one at a
 * time to avoid holding many decoded images in memory simultaneously.
 */
export async function getAllLocalWallpapers(): Promise<StoredWallpaper[]> {
  const db = await openDb()
  const keys = await new Promise<IDBValidKey[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).getAllKeys()
    req.onsuccess = () => resolve(req.result ?? [])
    req.onerror = () => reject(req.error ?? new Error('IDB_KEYS_FAILED'))
  })

  const result: StoredWallpaper[] = []
  for (const key of keys) {
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(key)
      req.onsuccess = () => resolve((req.result as Blob) ?? null)
      req.onerror = () => reject(req.error ?? new Error('IDB_READ_FAILED'))
    })
    if (blob) result.push({ id: String(key), blob })
  }
  return result
}

/** Persist a wallpaper blob under a specific key (used by import/restore). */
export async function saveLocalWallpaperBlobById(
  id: string,
  blob: Blob
): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(blob, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IDB_WRITE_FAILED'))
  })
}

/** Remove every stored wallpaper blob (used by reset / clear). */
export async function clearAllLocalWallpapers(): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IDB_CLEAR_FAILED'))
  })
}

/** Convert a Base64 data URL to a Blob (used to migrate legacy persisted data). */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',')
  const mimeMatch = header.match(/data:([^;]+)/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}
