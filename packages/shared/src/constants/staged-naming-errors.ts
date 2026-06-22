/**
 * KB-009 / KB-010 — stable error codes for cat-world and ineffable naming mutations.
 *
 * Thrown as ConvexError({ code }) from backend; mapped to user strings in
 * `packages/shared/src/utils/convex-error.ts` via stagedNamingErrorMessage().
 */

export const STAGED_NAMING_ERROR_CODE = {
  NOT_AUTHENTICATED: "not_authenticated",
  NOT_FOUND: "not_found",
  NOT_OWNER: "not_owner",
  STEP_LOCKED: "step_locked",
  NOT_UNLOCKED: "not_unlocked",
  NO_EVERYDAY_NAME: "no_everyday_name",
  NO_CAT_WORLD_NAME: "no_cat_world_name",
  GENERATION_IN_PROGRESS: "generation_in_progress",
  BATCH_NOT_READY: "batch_not_ready",
  SHORTLIST_FULL: "shortlist_full",
  BATCH_SAVE_LIMIT: "batch_save_limit",
  DUPLICATE_NAME: "duplicate_name",
  NAME_NOT_IN_BATCH: "name_not_in_batch",
  NAME_NOT_IN_SHORTLIST: "name_not_in_shortlist",
  REGEN_EXHAUSTED: "regen_exhausted",
  NO_FAVOURITE: "no_favourite",
  NAME_GLOBALLY_TAKEN: "name_globally_taken",
  ALL_NAMES_COMPLETE: "all_names_complete",
} as const

export type StagedNamingErrorCode =
  (typeof STAGED_NAMING_ERROR_CODE)[keyof typeof STAGED_NAMING_ERROR_CODE]

const MESSAGES: Record<StagedNamingErrorCode, string> = {
  [STAGED_NAMING_ERROR_CODE.NOT_AUTHENTICATED]: "Please sign in to continue.",
  [STAGED_NAMING_ERROR_CODE.NOT_FOUND]: "This ceremony could not be found.",
  [STAGED_NAMING_ERROR_CODE.NOT_OWNER]:
    "You do not have access to this ceremony.",
  [STAGED_NAMING_ERROR_CODE.STEP_LOCKED]:
    "This naming stage is not available right now.",
  [STAGED_NAMING_ERROR_CODE.NOT_UNLOCKED]:
    "Complete unlock before choosing cat-world names.",
  [STAGED_NAMING_ERROR_CODE.NO_EVERYDAY_NAME]:
    "Choose an everyday name before continuing.",
  [STAGED_NAMING_ERROR_CODE.NO_CAT_WORLD_NAME]:
    "Choose a cat-world name before continuing to the ineffable stage.",
  [STAGED_NAMING_ERROR_CODE.GENERATION_IN_PROGRESS]:
    "We're still generating names. Please wait a moment.",
  [STAGED_NAMING_ERROR_CODE.BATCH_NOT_READY]:
    "Name suggestions aren't ready yet. Try again shortly.",
  [STAGED_NAMING_ERROR_CODE.SHORTLIST_FULL]:
    "Your shortlist is full (6 names maximum). Remove one to save another.",
  [STAGED_NAMING_ERROR_CODE.BATCH_SAVE_LIMIT]:
    "You can save up to 3 names from this batch.",
  [STAGED_NAMING_ERROR_CODE.DUPLICATE_NAME]:
    "That name is already on your shortlist.",
  [STAGED_NAMING_ERROR_CODE.NAME_NOT_IN_BATCH]:
    "That name isn't in the current suggestions.",
  [STAGED_NAMING_ERROR_CODE.NAME_NOT_IN_SHORTLIST]:
    "Pick a favourite from your saved shortlist.",
  [STAGED_NAMING_ERROR_CODE.REGEN_EXHAUSTED]:
    "You've already used your one regeneration for this stage.",
  [STAGED_NAMING_ERROR_CODE.NO_FAVOURITE]:
    "Choose a favourite from your shortlist to continue.",
  [STAGED_NAMING_ERROR_CODE.NAME_GLOBALLY_TAKEN]:
    "That cat-world name was just claimed by another ceremony. Pick another from your shortlist or regenerate if you still can.",
  [STAGED_NAMING_ERROR_CODE.ALL_NAMES_COMPLETE]:
    "All three names are chosen — you're ready for your certificate.",
}

export function stagedNamingErrorMessage(
  code: string | undefined,
  fallback = "Something went wrong. Please try again.",
): string {
  if (code !== undefined && Object.hasOwn(MESSAGES, code)) {
    return MESSAGES[code as StagedNamingErrorCode]
  }
  return fallback
}
