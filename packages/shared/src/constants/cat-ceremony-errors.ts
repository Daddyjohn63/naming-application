import { MAX_STANDARD_USER_CAT_CEREMONIES } from "./cat-ceremony-limits"

/**
 * Stable error codes for the lifetime cat-ceremony create quota.
 * Thrown as `ConvexError({ code })` from create mutations; mapped in the web UI.
 */

/** Machine-readable codes returned in ConvexError.data.code. */
export const CAT_CEREMONY_ERROR_CODE = {
  LIMIT_REACHED: "cat_ceremony_limit_reached",
} as const

export type CatCeremonyErrorCode =
  (typeof CAT_CEREMONY_ERROR_CODE)[keyof typeof CAT_CEREMONY_ERROR_CODE]

const MESSAGES: Record<CatCeremonyErrorCode, string> = {
  [CAT_CEREMONY_ERROR_CODE.LIMIT_REACHED]: `You've reached the limit of ${MAX_STANDARD_USER_CAT_CEREMONIES} naming ceremonies.`,
}

/** Resolve a server error code to human-readable text for toasts and alerts. */
export function catCeremonyErrorMessage(
  code: string | undefined,
  fallback = "Something went wrong. Please try again.",
): string {
  if (code !== undefined && Object.hasOwn(MESSAGES, code)) {
    return MESSAGES[code as CatCeremonyErrorCode]
  }
  return fallback
}
