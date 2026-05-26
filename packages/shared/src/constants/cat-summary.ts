/**
 * KB-004 ceremony substates and summary text limits.
 *
 * Used by the ceremony page router, stepper mapping, and summary form validation.
 */

/** Four server steps grouped under the single "Summary" UI stepper pill. */
export const CAT_SUMMARY_CEREMONY_STEPS = [
  "awaiting_photo_validation",
  "photo_quality_review",
  "awaiting_summary",
  "summary_review",
] as const

export type CatSummaryCeremonyStep = (typeof CAT_SUMMARY_CEREMONY_STEPS)[number]

/** True when the cat is anywhere in the KB-004 summary pipeline. */
export function isCatSummaryCeremonyStep(
  step: string,
): step is CatSummaryCeremonyStep {
  return (CAT_SUMMARY_CEREMONY_STEPS as readonly string[]).includes(step)
}

/** Max characters for the editable personality summary (plain prose). */
export const MAX_CAT_SUMMARY_TEXT_LENGTH = 4000

/** Min characters required to save or submit a summary draft. */
export const MIN_CAT_SUMMARY_TEXT_LENGTH = 40
