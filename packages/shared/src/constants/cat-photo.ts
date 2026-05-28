/** Server and client must agree on these limits (see `catPhotoConstraintsLabel`). */

export const MAX_CAT_PHOTO_BYTES = 10 * 1024 * 1024

export const MAX_CAT_PHOTO_DIMENSION_PX = 4096

export const MIN_CAT_PHOTO_DIMENSION_PX = 200

export const ALLOWED_CAT_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

export type AllowedCatPhotoMimeType =
  (typeof ALLOWED_CAT_PHOTO_MIME_TYPES)[number]

/** Human-readable constraints for file inputs and helper copy. */
export function catPhotoConstraintsLabel(): string {
  const mb = MAX_CAT_PHOTO_BYTES / (1024 * 1024)
  return `JPEG, PNG, or WebP · max ${mb}MB · ${MIN_CAT_PHOTO_DIMENSION_PX}–${MAX_CAT_PHOTO_DIMENSION_PX}px per side · one cat per photo`
}
