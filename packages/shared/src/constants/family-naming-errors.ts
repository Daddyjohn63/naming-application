/**
 * KB-005 / KB-006 — stable error codes for family naming mutations.
 */

export const FAMILY_NAMING_ERROR_CODE = {
  NOT_AUTHENTICATED: "not_authenticated",
  NOT_FOUND: "not_found",
  NOT_OWNER: "not_owner",
  STEP_LOCKED: "step_locked",
  INVALID_STYLES: "invalid_styles",
  NO_ACCEPTED_SUMMARY: "no_accepted_summary",
  GENERATION_IN_PROGRESS: "generation_in_progress",
  BATCH_NOT_READY: "batch_not_ready",
  SHORTLIST_FULL: "shortlist_full",
  BATCH_SAVE_LIMIT: "batch_save_limit",
  DUPLICATE_NAME: "duplicate_name",
  NAME_NOT_IN_BATCH: "name_not_in_batch",
  NAME_NOT_IN_SHORTLIST: "name_not_in_shortlist",
  REGEN_EXHAUSTED: "regen_exhausted",
  NO_FAVOURITE: "no_favourite",
  CUSTOM_NAME_LIMIT: "custom_name_limit",
  NAME_ALREADY_SUGGESTED: "name_already_suggested",
  INVALID_NAME: "invalid_name",
} as const

export type FamilyNamingErrorCode =
  (typeof FAMILY_NAMING_ERROR_CODE)[keyof typeof FAMILY_NAMING_ERROR_CODE]

const MESSAGES: Record<FamilyNamingErrorCode, string> = {
  [FAMILY_NAMING_ERROR_CODE.NOT_AUTHENTICATED]: "Please sign in to continue.",
  [FAMILY_NAMING_ERROR_CODE.NOT_FOUND]: "This ceremony could not be found.",
  [FAMILY_NAMING_ERROR_CODE.NOT_OWNER]:
    "You do not have access to this ceremony.",
  [FAMILY_NAMING_ERROR_CODE.STEP_LOCKED]:
    "Family naming is not available at this stage.",
  [FAMILY_NAMING_ERROR_CODE.INVALID_STYLES]:
    "Choose at least one family name style to continue.",
  [FAMILY_NAMING_ERROR_CODE.NO_ACCEPTED_SUMMARY]:
    "Submit your personality summary before choosing family names.",
  [FAMILY_NAMING_ERROR_CODE.GENERATION_IN_PROGRESS]:
    "We're still generating names. Please wait a moment.",
  [FAMILY_NAMING_ERROR_CODE.BATCH_NOT_READY]:
    "Name suggestions aren't ready yet. Try again shortly.",
  [FAMILY_NAMING_ERROR_CODE.SHORTLIST_FULL]:
    "Your shortlist is full (6 names maximum). Remove one to save another.",
  [FAMILY_NAMING_ERROR_CODE.BATCH_SAVE_LIMIT]:
    "You can save up to 3 names from this batch.",
  [FAMILY_NAMING_ERROR_CODE.DUPLICATE_NAME]:
    "That name is already on your shortlist.",
  [FAMILY_NAMING_ERROR_CODE.NAME_NOT_IN_BATCH]:
    "That name isn't in the current suggestions.",
  [FAMILY_NAMING_ERROR_CODE.NAME_NOT_IN_SHORTLIST]:
    "Pick a favourite from your saved shortlist.",
  [FAMILY_NAMING_ERROR_CODE.REGEN_EXHAUSTED]:
    "You've already used your one regeneration for family names.",
  [FAMILY_NAMING_ERROR_CODE.NO_FAVOURITE]:
    "Choose a favourite from your shortlist before unlocking.",
  [FAMILY_NAMING_ERROR_CODE.CUSTOM_NAME_LIMIT]:
    "You can add one name of your own. Remove it to add a different one.",
  [FAMILY_NAMING_ERROR_CODE.NAME_ALREADY_SUGGESTED]:
    "That name was already suggested in an earlier family name batch. Choose a different name to add as your own.",
  [FAMILY_NAMING_ERROR_CODE.INVALID_NAME]:
    "Enter a name between 1 and 80 characters.",
}

export function familyNamingErrorMessage(
  code: string | undefined,
  fallback = "Something went wrong. Please try again.",
): string {
  if (code !== undefined && Object.hasOwn(MESSAGES, code)) {
    return MESSAGES[code as FamilyNamingErrorCode]
  }
  return fallback
}
