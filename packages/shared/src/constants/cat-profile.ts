/** Default story shown on KB-002 draft rows until the owner submits KB-003 profile. */
export const DRAFT_CAT_DESCRIPTION_PLACEHOLDER =
  "Tell your cat's story in the next steps — a photo is optional. You can replace this anytime before the summary is approved."

/** Optional cat sex values for KB-003 profile and summary pronouns. */
export const CAT_SEX_VALUES = ["male", "female"] as const

export type CatSex = (typeof CAT_SEX_VALUES)[number]

export const CAT_SEX_LABELS: Record<CatSex, string> = {
  male: "Male",
  female: "Female",
}

export function formatCatSexLabel(sex: CatSex | undefined): string | undefined {
  if (sex === undefined) {
    return undefined
  }
  return CAT_SEX_LABELS[sex]
}

/** Example story shown in the KB-003 description field before the owner types. */
export const CAT_STORY_PLACEHOLDER = `For example: Miso arrived as a tiny grey tabby with ears far too big for her head and an immediate opinion about everything. She is perfectly polite with visitors but runs the house on her own schedule, usually from the top of the bookshelf where she can supervise the room without being disturbed.

She has strong feelings about doorways (they must stay open), breakfast at 4am (non-negotiable), and the patch of sunlight on the living room rug (reserved exclusively for her). When she is pleased, she chirps rather than meows. When she is offended, she sits with her back turned until an apology is offered in the form of treats.

She thinks of herself as the household manager and allows us to live here as long as we remember who really owns the sofa. She is affectionate on her own terms: one slow blink, a head bump, then back to important cat thoughts.`

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
  step: string
): step is CatProfileEditableCeremonyStep {
  return (CAT_PROFILE_EDITABLE_CEREMONY_STEPS as readonly string[]).includes(
    step
  )
}

/**
 * Max successful `submitCatProfile` calls per cat (any editable step).
 * Increase if product allows more profile re-submissions.
 */
export const MAX_CAT_PROFILE_SUBMIT_COUNT = 3
