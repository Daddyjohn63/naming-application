/**
 * Stable error codes for application-layer rate limiting (SECURITY.md M6).
 * Thrown as `ConvexError({ code })` from the backend; mapped in the web UI.
 */

/** Machine-readable codes returned in ConvexError.data.code. */
export const RATE_LIMIT_ERROR_CODE = {
  TOO_MANY_ATTEMPTS: "too_many_attempts",
} as const

export type RateLimitErrorCode =
  (typeof RATE_LIMIT_ERROR_CODE)[keyof typeof RATE_LIMIT_ERROR_CODE]

const MESSAGES: Record<RateLimitErrorCode, string> = {
  [RATE_LIMIT_ERROR_CODE.TOO_MANY_ATTEMPTS]:
    "Too many attempts — try again shortly.",
}

/** Resolve a server error code to human-readable text for toasts and alerts. */
export function rateLimitErrorMessage(
  code: string | undefined,
  fallback = "Something went wrong. Please try again.",
): string {
  if (code !== undefined && Object.hasOwn(MESSAGES, code)) {
    return MESSAGES[code as RateLimitErrorCode]
  }
  return fallback
}
