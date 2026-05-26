/**
 * KB-004 §2.3a — code-side gates for AI photo validation outcomes.
 *
 * The vision model returns scores; these thresholds turn them into block / warn / pass
 * so product can tune behaviour without changing the prompt.
 */

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
  catLikelihoodScore: number
  qualityScore: number
}): CatPhotoValidationOutcome {
  if (
    !args.isCat ||
    args.catLikelihoodScore < CAT_PHOTO_BLOCK_LIKELIHOOD_THRESHOLD
  ) {
    return "block"
  }
  if (args.qualityScore <= CAT_PHOTO_WARN_QUALITY_THRESHOLD) {
    return "warn"
  }
  return "pass"
}
