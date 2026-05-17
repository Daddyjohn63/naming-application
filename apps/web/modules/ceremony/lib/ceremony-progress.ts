/**
 * Linear ceremony order mirrors `cats.ceremonyStep` / `packages/backend/convex/schema.ts`.
 * Used for Recommendation 1 stepper UX (guided tunnel).
 */
export const CEREMONY_STEP_SEQUENCE = [
  "draft",
  "awaiting_portrait",
  "portrait_review",
  "awaiting_payment",
  "naming_family",
  "naming_cat_world",
  "naming_ineffable",
  "awaiting_character_image",
  "ceremony_complete",
] as const

export type CeremonyStepLiteral = (typeof CEREMONY_STEP_SEQUENCE)[number]

const STEP_LABELS: Record<CeremonyStepLiteral, string> = {
  draft: "Profile",
  awaiting_portrait: "Portrait",
  portrait_review: "Summary",
  awaiting_payment: "Unlock",
  naming_family: "Family names",
  naming_cat_world: "Cat-world",
  naming_ineffable: "Ineffable",
  awaiting_character_image: "Character",
  ceremony_complete: "Certificate",
}

export function ceremonyStepIndex(step: string): number {
  const i = (CEREMONY_STEP_SEQUENCE as readonly string[]).indexOf(step)
  return i === -1 ? 0 : i
}

export function ceremonyStepsForUi(): readonly {
  id: CeremonyStepLiteral
  label: string
}[] {
  return CEREMONY_STEP_SEQUENCE.map((id) => ({
    id,
    label: STEP_LABELS[id],
  }))
}

export function ceremonyStepShortLabel(step: string): string {
  if (
    CEREMONY_STEP_SEQUENCE.includes(step as CeremonyStepLiteral)
  ) {
    return STEP_LABELS[step as CeremonyStepLiteral]
  }
  return step.replaceAll("_", " ")
}
