/**
 * Ceremony stepper helpers — maps server `ceremonyStep` to UI pills.
 *
 * KB-004: four summary substates share the "Summary" pill.
 * KB-005/006: `awaiting_family_names` + `family_curation` share "Family names".
 * Server order mirrors `packages/backend/convex/schema.ts`.
 */

/** Full server-side ceremony order (includes KB-004 summary substates). */
export const CEREMONY_STEP_SEQUENCE = [
  "draft",
  "awaiting_photo_validation",
  "photo_quality_review",
  "awaiting_summary",
  "summary_review",
  "family_style",
  "awaiting_family_names",
  "family_curation",
  "awaiting_payment",
  "naming_cat_world",
  "naming_ineffable",
  "ceremony_complete",
  /** Legacy values kept for resume of older rows. */
  "family_preview",
  "naming_family",
] as const

export type CeremonyStepLiteral = (typeof CEREMONY_STEP_SEQUENCE)[number]

/** User-facing stepper pills — one per FinalRequirements journey beat. */
export const CEREMONY_UI_STEP_SEQUENCE = [
  "profile",
  "summary",
  "family_style",
  "family_names",
  "unlock",
  "naming_cat_world",
  "naming_ineffable",
  "certificate",
] as const

export type CeremonyUiStepId = (typeof CEREMONY_UI_STEP_SEQUENCE)[number]

/** Human-readable labels for each stepper pill. */
const UI_STEP_LABELS: Record<CeremonyUiStepId, string> = {
  profile: "Profile",
  summary: "Summary",
  family_style: "Family style",
  family_names: "Family names",
  unlock: "Unlock",
  naming_cat_world: "Cat-world",
  naming_ineffable: "Ineffable",
  certificate: "Certificate",
}

/**
 * KB-004 summary substates → "Summary" pill.
 * KB-006 generation + curation → "Family names" pill.
 */
const SERVER_STEP_TO_UI_INDEX: Record<CeremonyStepLiteral, number> = {
  draft: 0,
  awaiting_photo_validation: 1,
  photo_quality_review: 1,
  awaiting_summary: 1,
  summary_review: 1,
  family_style: 2,
  awaiting_family_names: 3,
  family_curation: 3,
  family_preview: 3,
  awaiting_payment: 4,
  naming_family: 3,
  naming_cat_world: 5,
  naming_ineffable: 6,
  ceremony_complete: 7,
}

/** Badge text on the ceremony page header for each server step. */
const SERVER_STEP_SHORT_LABEL: Record<CeremonyStepLiteral, string> = {
  draft: "Profile",
  awaiting_photo_validation: "Summary",
  photo_quality_review: "Summary",
  awaiting_summary: "Summary",
  summary_review: "Summary",
  family_style: "Family style",
  awaiting_family_names: "Family names",
  family_curation: "Family names",
  family_preview: "Family names",
  awaiting_payment: "Unlock",
  naming_family: "Family names",
  naming_cat_world: "Cat-world",
  naming_ineffable: "Ineffable",
  ceremony_complete: "Certificate",
}

/** Stepper pill index for a server step, or -1 if unmapped. */
export function ceremonyStepIndex(step: string): number {
  if (CEREMONY_STEP_SEQUENCE.includes(step as CeremonyStepLiteral)) {
    return SERVER_STEP_TO_UI_INDEX[step as CeremonyStepLiteral]
  }
  return -1
}

/** Ordered list of stepper pills with id + label for CeremonyStepper. */
export function ceremonyStepsForUi(): readonly {
  id: CeremonyUiStepId
  label: string
}[] {
  return CEREMONY_UI_STEP_SEQUENCE.map((id) => ({
    id,
    label: UI_STEP_LABELS[id],
  }))
}

/** Short label for the current step badge on /cats/[catId]. */
export function ceremonyStepShortLabel(step: string): string {
  if (CEREMONY_STEP_SEQUENCE.includes(step as CeremonyStepLiteral)) {
    return SERVER_STEP_SHORT_LABEL[step as CeremonyStepLiteral]
  }
  return step.replaceAll("_", " ")
}
