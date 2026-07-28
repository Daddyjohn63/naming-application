/**
 * In-progress / generating labels shown while ceremony pipelines run.
 * Edit copy here — components import from this file.
 */

export type PipelineStatusCopy = {
  title: string
  description: string
}

/** Photo check — `awaiting_photo_validation` */
export const PHOTO_CHECK_LOADING = {
  title: "Checking your photo…",
  description:
    "A moment of feline scrutiny — confirming this portrait really is of a cat (and only one).",
} as const satisfies PipelineStatusCopy

/** Personality summary — `awaiting_summary` */
export const SUMMARY_LOADING = {
  title: "Reading your cat's character…",
  description:
    "Distilling whiskers, habits, and half-told stories into a personality portrait. You may wander off — we'll keep the thread.",
} as const satisfies PipelineStatusCopy

/** Family name generation — `awaiting_family_names` */
export const FAMILY_NAMES_LOADING = {
  title: "Inventing everyday names…",
  description:
    "Ten names fit for calling across a kitchen — drawn from their summary and the style you chose. Slip away if you like; nothing is lost.",
} as const satisfies PipelineStatusCopy

/** Cat-world name generation — `awaiting_cat_world_names` (main column) */
export const CAT_WORLD_NAMES_LOADING = {
  title: "Consulting the cat-world…",
  description:
    "Ten literary aliases for the life they lead when humans aren't looking. You can leave — the shortlist will wait.",
} as const satisfies PipelineStatusCopy

/** Cat-world name generation — `awaiting_cat_world_names` (unlock sidebar) */
export const CAT_WORLD_NAMES_SIDEBAR = {
  title: "Consulting the cat-world",
  description:
    "The cat-world is murmuring ten names into being — a moment more.",
} as const satisfies PipelineStatusCopy

/** Ineffable near-name generation — `awaiting_ineffable_names` */
export const INEFFABLE_NAMES_LOADING = {
  title: "Approaching the ineffable…",
  description:
    "Ten playful guesses at the name no tongue can quite say — close enough to hum, never quite to know.",
} as const satisfies PipelineStatusCopy
