/**
 * Shared caps and helpers for family, cat-world, and ineffable name curation.
 *
 * Family naming imports shortlist caps from here where possible; family-specific
 * style IDs remain in `family-naming.ts`. Cat-world / ineffable use these values
 * exclusively (see KANBAN KB-009 / KB-010).
 */

export const NAME_BATCH_SIZE = 10
export const MAX_SHORTLIST_TOTAL = 6
export const MAX_NAME_REGENERATIONS = 1

/** Normalize a name for duplicate detection (case-insensitive, collapsed whitespace). */
export function normalizeNameForDedupe(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ")
}

/** Ceremony steps where KB-009 curation UI or pipeline should be active. */
export const CAT_WORLD_CURATION_STEPS = [
  "awaiting_cat_world_names",
  "naming_cat_world",
] as const

/** Ceremony steps where KB-010 curation UI or pipeline should be active. */
export const INEFFABLE_CURATION_STEPS = [
  "awaiting_ineffable_names",
  "naming_ineffable",
] as const

export type CatWorldCurationStep = (typeof CAT_WORLD_CURATION_STEPS)[number]
export type IneffableCurationStep = (typeof INEFFABLE_CURATION_STEPS)[number]

/** Future list price in minor units ($3.99). Unlock is free during beta. */
export const CEREMONY_UNLOCK_AMOUNT_MINOR_USD = 399

/** Pre-unlock checkout steps that share the family curation unlock UX. */
export const FAMILY_UNLOCK_CHECKOUT_STEPS = [
  "family_curation",
  "family_preview",
] as const

export type FamilyUnlockCheckoutStep =
  (typeof FAMILY_UNLOCK_CHECKOUT_STEPS)[number]
