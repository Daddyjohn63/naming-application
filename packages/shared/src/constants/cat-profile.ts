/** Default story shown on KB-002 draft rows until the owner submits KB-003 profile. */
export const DRAFT_CAT_DESCRIPTION_PLACEHOLDER =
  "Tell your cat's story in the next steps — a photo is optional. You can replace this anytime before the summary is approved."

/**
 * Ceremony steps where the owner may edit and re-submit the KB-003 profile form.
 * Aligns with §4a pre-summary edits; tighten when KB-013 adds post-approval rules.
 */
export const CAT_PROFILE_EDITABLE_CEREMONY_STEPS = [
  "draft",
  "summary_review",
] as const

export type CatProfileEditableCeremonyStep =
  (typeof CAT_PROFILE_EDITABLE_CEREMONY_STEPS)[number]

export function isCatProfileEditableStep(
  step: string,
): step is CatProfileEditableCeremonyStep {
  return (CAT_PROFILE_EDITABLE_CEREMONY_STEPS as readonly string[]).includes(
    step,
  )
}

/**
 * Max successful `submitCatProfile` calls per cat (any editable step).
 * Increase if product allows more profile re-submissions.
 */
export const MAX_CAT_PROFILE_SUBMIT_COUNT = 3
