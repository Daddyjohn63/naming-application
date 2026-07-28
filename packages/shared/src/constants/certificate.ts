/** Certificate PDF uploads (KB-011 / SECURITY.md M3). */
export const MAX_CERTIFICATE_PDF_BYTES = 10 * 1024 * 1024

/** PDF file header (`%PDF`). */
export const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46] as const

export function bufferLooksLikePdf(bytes: Uint8Array): boolean {
  if (bytes.byteLength < PDF_MAGIC_BYTES.length) {
    return false
  }
  return PDF_MAGIC_BYTES.every((expected, index) => bytes[index] === expected)
}
