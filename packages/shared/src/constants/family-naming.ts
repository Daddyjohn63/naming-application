/**
 * KB-005 / KB-006 — family name style options, shortlist caps, and dedupe rules.
 */

/** Selectable family name styles (KB-005). Mix-it-up picks a random subset of the others. */
export const FAMILY_NAME_STYLE_IDS = [
  "elegant",
  "silly",
  "classic",
  "nature_inspired",
  "non_human_names",
  "mix_it_up",
] as const

export type FamilyNameStyleId = (typeof FAMILY_NAME_STYLE_IDS)[number]

/** Styles that can be randomly chosen when the user picks Mix-it-up. */
export const FAMILY_NAME_STYLE_POOL_FOR_MIX: readonly Exclude<
  FamilyNameStyleId,
  "mix_it_up"
>[] = [
  "elegant",
  "silly",
  "classic",
  "nature_inspired",
  "non_human_names",
]

/** User-facing labels for style chips. */
export const FAMILY_NAME_STYLE_LABELS: Record<FamilyNameStyleId, string> = {
  elegant: "Elegant",
  silly: "Silly",
  classic: "Classic",
  nature_inspired: "Nature-inspired",
  non_human_names: "Non-human names",
  mix_it_up: "Mix-it-up",
}

export const FAMILY_NAME_BATCH_SIZE = 10
export const MAX_FAMILY_SHORTLIST_TOTAL = 6
export const MAX_FAMILY_SHORTLIST_PER_BATCH = 3
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

/** Pick 1–3 random styles when the user selects Mix-it-up (deterministic per call). */
export function resolveMixItUpStyles(
  random: () => number = Math.random,
): Exclude<FamilyNameStyleId, "mix_it_up">[] {
  const pool = [...FAMILY_NAME_STYLE_POOL_FOR_MIX]
  const r = Math.min(random(), 0.999999999999)
  const count = 1 + Math.floor(r * 3)
  const picked: Exclude<FamilyNameStyleId, "mix_it_up">[] = []
  while (picked.length < count && pool.length > 0) {
    const index = Math.floor(random() * pool.length)
    const [style] = pool.splice(index, 1)
    if (style !== undefined) {
      picked.push(style)
    }
  }
  return picked
}

/** Expand stored style ids to prompt-facing labels (resolves mix-it-up at persist time). */
export function familyStyleLabelsForPrompt(
  styleIds: readonly FamilyNameStyleId[],
): string[] {
  return styleIds.map((id) => FAMILY_NAME_STYLE_LABELS[id])
}
