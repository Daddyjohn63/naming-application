/**
 * KB-004 — stable error codes and user messages for summary pipeline mutations.
 * Thrown as `ConvexError({ code })` from `catSummary.ts`; mapped in the web UI.
 */

/** Machine-readable codes returned in ConvexError.data.code. */
export const CAT_SUMMARY_ERROR_CODE = {
  NOT_AUTHENTICATED: "not_authenticated",
  NOT_FOUND: "not_found",
  NOT_OWNER: "not_owner",
  STEP_LOCKED: "step_locked",
  INVALID_SUMMARY: "invalid_summary",
  NO_SUMMARY_VERSION: "no_summary_version",
  GENERATION_IN_PROGRESS: "generation_in_progress",
} as const

export type CatSummaryErrorCode =
  (typeof CAT_SUMMARY_ERROR_CODE)[keyof typeof CAT_SUMMARY_ERROR_CODE]

/** Default copy shown when a code is known; fallback for unexpected errors. */
const MESSAGES: Record<CatSummaryErrorCode, string> = {
  [CAT_SUMMARY_ERROR_CODE.NOT_AUTHENTICATED]: "Please sign in to continue.",
  [CAT_SUMMARY_ERROR_CODE.NOT_FOUND]: "This ceremony could not be found.",
  [CAT_SUMMARY_ERROR_CODE.NOT_OWNER]:
    "You do not have access to this ceremony.",
  [CAT_SUMMARY_ERROR_CODE.STEP_LOCKED]:
    "Summary edits are not available at this stage.",
  [CAT_SUMMARY_ERROR_CODE.INVALID_SUMMARY]:
    "Please write a valid summary before continuing.",
  [CAT_SUMMARY_ERROR_CODE.NO_SUMMARY_VERSION]:
    "No summary is ready yet. Try again in a moment.",
  [CAT_SUMMARY_ERROR_CODE.GENERATION_IN_PROGRESS]:
    "We're still working on your summary. Please wait.",
}

/** Resolve a server error code to human-readable text for toasts and alerts. */
export function catSummaryErrorMessage(
  code: string | undefined,
  fallback = "Something went wrong. Please try again.",
): string {
  if (code !== undefined && Object.hasOwn(MESSAGES, code)) {
    return MESSAGES[code as CatSummaryErrorCode]
  }
  return fallback
}
