/**
 * KB-004 §2.3a — code-side gates for AI photo validation outcomes.
 *
 * The vision model returns scores; these thresholds turn them into block / warn / pass
 * so product can tune behaviour without changing the prompt.
 */

/**
 * Max AI vision checks per cat ceremony (each submit with a photo consumes one).
 * Caps token spend; when exhausted the owner must start a new ceremony or contact support.
 */
export const MAX_PHOTO_VALIDATION_ATTEMPTS = 5

/** Block when the model says not a cat or confidence is below this score (§2.3a). */
export const CAT_PHOTO_BLOCK_LIKELIHOOD_THRESHOLD = 5

/** Warn when quality is at or below this score (§2.3a). */
export const CAT_PHOTO_WARN_QUALITY_THRESHOLD = 5

/** Three outcomes the ceremony UI and backend mutations branch on. */
export type CatPhotoValidationOutcome = "pass" | "warn" | "block"

/**
 * Map raw model scores to block, warn, or pass.
 * Used by `validateCatPhotoWithAi` before persisting via `applyPhotoValidationResult`.
 */
export function classifyCatPhotoValidation(args: {
  isCat: boolean
  isSingleCat: boolean
  catLikelihoodScore: number
  qualityScore: number
}): CatPhotoValidationOutcome {
  if (
    !args.isCat ||
    !args.isSingleCat ||
    args.catLikelihoodScore < CAT_PHOTO_BLOCK_LIKELIHOOD_THRESHOLD
  ) {
    return "block"
  }
  if (args.qualityScore <= CAT_PHOTO_WARN_QUALITY_THRESHOLD) {
    return "warn"
  }
  return "pass"
}

/** Owner-facing fallback when the model returns an empty userMessage on block. */
export function catPhotoBlockFallbackMessage(args: {
  isCat: boolean
  isSingleCat: boolean
  qualityScore?: number
}): string {
  if (args.isCat && !args.isSingleCat) {
    return "We spotted more than one cat in this photo. Please upload a clear photo with just your cat."
  }
  if (!args.isCat) {
    return "That photo doesn't look like a cat. Please upload a photo of your cat."
  }
  if (
    args.qualityScore !== undefined &&
    args.qualityScore <= CAT_PHOTO_WARN_QUALITY_THRESHOLD
  ) {
    return "We can see your cat, but this photo isn't clear enough. Please upload a clearer one."
  }
  return "That photo can't be used. Please upload a clear photo of your cat alone."
}

/** When the vision check throws before a structured result is saved. */
export const CAT_PHOTO_CHECK_FAILED_MESSAGE =
  "We couldn't check your photo. Please try uploading a clear photo of your cat alone."

/** Resolve the owner-facing message from AI validation or structured fallbacks. */
export function resolvePhotoIssueUserMessage(args: {
  userMessage: string
  isCat: boolean
  isSingleCat: boolean
  qualityScore: number
}): string {
  const trimmed = args.userMessage.trim()
  if (trimmed.length > 0) {
    return trimmed
  }
  return catPhotoBlockFallbackMessage({
    isCat: args.isCat,
    isSingleCat: args.isSingleCat,
    qualityScore: args.qualityScore,
  })
}

type PhotoIssueDisplayInput = {
  userMessage: string
  isCat: boolean
  isSingleCat: boolean
  qualityScore: number
}

/** Title + body for pipeline error cards and profile alerts after a failed photo check. */
export function resolvePhotoIssueDisplay(
  validation: PhotoIssueDisplayInput,
): { title: string; message: string } {
  return {
    title: catPhotoBlockAlertTitle({
      isCat: validation.isCat,
      isSingleCat: validation.isSingleCat,
      qualityScore: validation.qualityScore,
    }),
    message: resolvePhotoIssueUserMessage(validation),
  }
}

/** Used AI photo checks for this cat (defaults to 0 for legacy rows). */
export function photoValidationAttemptsUsed(
  cat: { photoValidationAttemptsUsed?: number },
): number {
  return cat.photoValidationAttemptsUsed ?? 0
}

/** Remaining AI photo checks before submit is blocked for this ceremony. */
export function photoValidationAttemptsRemaining(used: number): number {
  return Math.max(0, MAX_PHOTO_VALIDATION_ATTEMPTS - used)
}

/** Short owner-facing copy for the profile form photo field. */
export function catPhotoUploadGuidanceLines(): readonly string[] {
  return [
    "One cat only — group shots or photos with multiple cats will not pass.",
    "Use a clear, well-lit photo where your cat is the main subject.",
    `You have up to ${MAX_PHOTO_VALIDATION_ATTEMPTS} automated photo checks for this ceremony — choose your photo carefully.`,
  ] as const
}

/** Alert title when the owner is sent back to profile for a photo issue. */
export function catPhotoBlockAlertTitle(args: {
  isCat: boolean
  isSingleCat: boolean
  qualityScore?: number
}): string {
  if (args.isCat && !args.isSingleCat) {
    return "More than one cat in this photo"
  }
  if (!args.isCat) {
    return "That photo doesn't look like a cat"
  }
  if (
    args.qualityScore !== undefined &&
    args.qualityScore <= CAT_PHOTO_WARN_QUALITY_THRESHOLD
  ) {
    return "Please upload a clearer photo"
  }
  return "Please update your cat photo"
}
