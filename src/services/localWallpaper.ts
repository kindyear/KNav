import { LOCAL_ACCEPTED_TYPES } from '@/config/wallpaper'

/** Whether the given file is an accepted wallpaper image type. */
export function isAcceptedImageFile(file: File): boolean {
  return (LOCAL_ACCEPTED_TYPES as readonly string[]).includes(file.type)
}

/**
 * Validate an uploaded image File for use as a local wallpaper.
 * The File itself is a Blob and is stored as-is in IndexedDB (no Base64), so
 * this only needs to gate the MIME type. Throws for unsupported types.
 */
export function validateImageFile(file: File): void {
  if (!isAcceptedImageFile(file)) {
    throw new Error('UNSUPPORTED_FILE_TYPE')
  }
}
