/**
 * KB-005 / KB-006 — family name style options, shortlist caps, and dedupe rules.
 */

/** Selectable family name styles (KB-005). */
export const FAMILY_NAME_STYLE_IDS = [
  "elegant",
  "silly",
  "classic",
  "nature_inspired",
  "non_human_names",
] as const

export type FamilyNameStyleId = (typeof FAMILY_NAME_STYLE_IDS)[number]

/** User-facing labels for style chips. */
export const FAMILY_NAME_STYLE_LABELS: Record<FamilyNameStyleId, string> = {
  elegant: "Elegant",
  silly: "Silly",
  classic: "Classic",
  nature_inspired: "Nature-inspired",
  non_human_names: "Non-human names",
}

export const FAMILY_NAME_BATCH_SIZE = 10
export const MAX_FAMILY_SHORTLIST_TOTAL = 6
export const MAX_FAMILY_NAME_REGENERATIONS = 1
/** User-provided family names allowed per ceremony (not from AI batches). */
export const MAX_CUSTOM_FAMILY_NAMES = 1

export const FAMILY_SHORTLIST_SOURCES = ["ai", "custom"] as const
export type FamilyShortlistSource = (typeof FAMILY_SHORTLIST_SOURCES)[number]

/** Rationale stored when the user adds their own family name. */
export const CUSTOM_FAMILY_NAME_RATIONALE = "A name you chose yourself."

export function isCustomFamilyShortlistEntry(entry: {
  source?: FamilyShortlistSource
}): boolean {
  return entry.source === "custom"
}

/** Ceremony steps where KB-006 curation UI is active (including generation substates). */
export const FAMILY_CURATION_CEREMONY_STEPS = [
  "awaiting_family_names",
  "family_curation",
] as const

export type FamilyCurationCeremonyStep =
  (typeof FAMILY_CURATION_CEREMONY_STEPS)[number]

export function isFamilyCurationCeremonyStep(
  step: string,
): step is FamilyCurationCeremonyStep {
  return (FAMILY_CURATION_CEREMONY_STEPS as readonly string[]).includes(step)
}

/**
 * Normalize a family name for duplicate detection.
 * Rule: trim, lowercase, collapse internal whitespace — case-insensitive match.
 */
export function normalizeFamilyName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ")
}

/** Expand stored style ids to prompt-facing labels. */
export function familyStyleLabelsForPrompt(
  styleIds: readonly FamilyNameStyleId[],
): string[] {
  return styleIds.map((id) => FAMILY_NAME_STYLE_LABELS[id])
}
