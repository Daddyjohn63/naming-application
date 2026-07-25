/**
 * KB-004 — classify summary-pipeline failures as photo-fixable vs transient retry.
 *
 * Keep this file dependency-free: the Node test runner and the Convex TypeScript build
 * disagree about `.ts` import extensions, so we inline shared copy instead of importing.
 */

/** Must match `CAT_PHOTO_CHECK_FAILED_MESSAGE` in constants/cat-photo-validation. */
const CAT_PHOTO_CHECK_FAILED_MESSAGE =
  "We couldn't check your photo. Please try uploading a clear photo of your cat alone."

export const CAT_PHOTO_LOAD_FAILED_MESSAGE =
  "That photo could not be loaded. Please upload it again."

export const CAT_PHOTO_SUMMARY_FAILED_MESSAGE =
  "We couldn't use this photo for your summary. Please upload a clearer photo of your cat alone."

export const SUMMARY_PIPELINE_TRANSIENT_ERROR_MESSAGE =
  "We couldn't complete that step. Please try again."

/** OpenAI / provider outage — apologize and invite a later retry (does not blame the photo). */
export const AI_SERVICE_UNAVAILABLE_MESSAGE =
  "Sorry — our naming assistant is temporarily unavailable. Please try again in a little while."

export type SummaryPipelineFailureKind = "photo" | "transient"

export type SummaryPipelineFailure = {
  kind: SummaryPipelineFailureKind
  userMessage: string
}

const PHOTO_URL_RESOLVED_PATTERN = /photo url could not be resolved/i
const EMPTY_SUMMARY_PATTERN = /summary came back empty/i
const PHOTO_RELATED_ERROR_PATTERN =
  /\b(image|photo|vision|content.?policy|invalid.?image|unsupported.?format|not.?supported)\b/i

/** Provider / infra failures that should not burn a photo-check attempt. */
const AI_UNAVAILABLE_ERROR_PATTERN =
  /\b(503|502|500|529|overloaded|service unavailable|temporarily unavailable|timeout|timed out|econnreset|enotfound|network|fetch failed|api.?connection|rate limit|too many requests|internal server error|bad gateway|gateway timeout|openai)\b/i

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return ""
}

function isAiUnavailableError(message: string): boolean {
  return message.length > 0 && AI_UNAVAILABLE_ERROR_PATTERN.test(message)
}

/** Map thrown errors during summary generation to photo vs transient handling. */
export function classifySummaryPipelineError(args: {
  error: unknown
  hasPhoto: boolean
}): SummaryPipelineFailure {
  const message = errorMessage(args.error)

  // Provider outages apply even when no photo is attached (text-only summary).
  if (isAiUnavailableError(message)) {
    return {
      kind: "transient",
      userMessage: AI_SERVICE_UNAVAILABLE_MESSAGE,
    }
  }

  if (!args.hasPhoto) {
    return {
      kind: "transient",
      userMessage: SUMMARY_PIPELINE_TRANSIENT_ERROR_MESSAGE,
    }
  }

  if (PHOTO_URL_RESOLVED_PATTERN.test(message)) {
    return { kind: "photo", userMessage: CAT_PHOTO_LOAD_FAILED_MESSAGE }
  }

  if (EMPTY_SUMMARY_PATTERN.test(message)) {
    return { kind: "photo", userMessage: CAT_PHOTO_SUMMARY_FAILED_MESSAGE }
  }

  if (PHOTO_RELATED_ERROR_PATTERN.test(message)) {
    return { kind: "photo", userMessage: CAT_PHOTO_SUMMARY_FAILED_MESSAGE }
  }

  return {
    kind: "transient",
    userMessage: SUMMARY_PIPELINE_TRANSIENT_ERROR_MESSAGE,
  }
}

/** True when the message means “retry later”, not “replace your photo”. */
export function isTransientPipelineUserMessage(message: string): boolean {
  const trimmed = message.trim()
  return (
    trimmed === SUMMARY_PIPELINE_TRANSIENT_ERROR_MESSAGE ||
    trimmed === AI_SERVICE_UNAVAILABLE_MESSAGE
  )
}

const PHOTO_PIPELINE_USER_MESSAGES = new Set<string>([
  CAT_PHOTO_CHECK_FAILED_MESSAGE,
  CAT_PHOTO_LOAD_FAILED_MESSAGE,
  CAT_PHOTO_SUMMARY_FAILED_MESSAGE,
])

/** True when the pipeline error copy should send the owner back to profile, not Retry. */
export function isPhotoPipelineUserMessage(message: string): boolean {
  const trimmed = message.trim()
  return trimmed.length > 0 && PHOTO_PIPELINE_USER_MESSAGES.has(trimmed)
}

/**
 * Photo-classified copy → Back to profile.
 * Transient / AI-unavailable copy → Retry (including during photo validation).
 */
export function pipelineErrorUsesBackToProfile(args: {
  ceremonyStep: string
  summaryGenerationError?: string
  /** Set when validation already persisted a photo issue on the cat row. */
  hasPhotoValidation?: boolean
}): boolean {
  if (args.hasPhotoValidation === true) {
    return true
  }
  if (args.summaryGenerationError === undefined) {
    return false
  }
  if (isTransientPipelineUserMessage(args.summaryGenerationError)) {
    return false
  }
  if (args.ceremonyStep === "awaiting_photo_validation") {
    // Non-transient errors on this step are treated as photo issues.
    return true
  }
  if (args.ceremonyStep === "awaiting_summary") {
    return isPhotoPipelineUserMessage(args.summaryGenerationError)
  }
  return false
}

/** Whether the owner can call returnToProfileForPhotoReplace for this cat snapshot. */
export function canReturnToProfileForPhotoReplace(args: {
  ceremonyStep: string
  summaryGenerationError?: string
  hasPhotoValidation?: boolean
}): boolean {
  if (args.ceremonyStep === "draft") {
    return true
  }
  if (
    args.ceremonyStep === "photo_quality_review" ||
    args.ceremonyStep === "awaiting_photo_validation"
  ) {
    return true
  }
  if (args.ceremonyStep === "awaiting_summary") {
    // Photo issues and transient/AI-unavailable errors can leave this step.
    return args.summaryGenerationError !== undefined
  }
  return args.hasPhotoValidation === true
}
