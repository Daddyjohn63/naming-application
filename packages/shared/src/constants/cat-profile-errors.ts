export const CAT_PROFILE_SUBMIT_ERROR_CODE = {
  NOT_AUTHENTICATED: "not_authenticated",
  NOT_FOUND: "not_found",
  NOT_OWNER: "not_owner",
  PROFILE_STEP_LOCKED: "profile_step_locked",
  SUBMIT_LIMIT_REACHED: "submit_limit_reached",
  INVALID_FIELDS: "invalid_fields",
  PLACEHOLDER_DESCRIPTION: "placeholder_description",
  PHOTO_REQUIRED: "photo_required",
  PHOTO_NOT_FOUND: "photo_not_found",
  PHOTO_TOO_LARGE: "photo_too_large",
  PHOTO_INVALID_TYPE: "photo_invalid_type",
  PHOTO_DIMENSIONS_TOO_SMALL: "photo_dimensions_too_small",
  PHOTO_DIMENSIONS_TOO_LARGE: "photo_dimensions_too_large",
  PHOTO_UNREADABLE: "photo_unreadable",
  PHOTO_VALIDATION_LIMIT_REACHED: "photo_validation_limit_reached",
} as const

export type CatProfileSubmitErrorCode =
  (typeof CAT_PROFILE_SUBMIT_ERROR_CODE)[keyof typeof CAT_PROFILE_SUBMIT_ERROR_CODE]

const MESSAGES: Record<CatProfileSubmitErrorCode, string> = {
  [CAT_PROFILE_SUBMIT_ERROR_CODE.NOT_AUTHENTICATED]:
    "Please sign in to continue.",
  [CAT_PROFILE_SUBMIT_ERROR_CODE.NOT_FOUND]:
    "This ceremony could not be found.",
  [CAT_PROFILE_SUBMIT_ERROR_CODE.NOT_OWNER]:
    "You do not have access to this ceremony.",
  [CAT_PROFILE_SUBMIT_ERROR_CODE.PROFILE_STEP_LOCKED]:
    "Profile edits are not available at this stage of the ceremony. Continue from the progress steps above.",
  [CAT_PROFILE_SUBMIT_ERROR_CODE.SUBMIT_LIMIT_REACHED]:
    "You have reached the maximum number of profile submissions for this cat.",
  [CAT_PROFILE_SUBMIT_ERROR_CODE.INVALID_FIELDS]:
    "Please fix the highlighted fields and try again.",
  [CAT_PROFILE_SUBMIT_ERROR_CODE.PLACEHOLDER_DESCRIPTION]:
    "Replace the placeholder story with at least 20 characters about your cat.",
  [CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_REQUIRED]:
    "Please upload a photo of your cat.",
  [CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_NOT_FOUND]:
    "That photo could not be found. Please upload again.",
  [CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_TOO_LARGE]:
    "That file is too large. Use a photo under 10MB.",
  [CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_INVALID_TYPE]:
    "Use a JPEG, PNG, or WebP image.",
  [CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_DIMENSIONS_TOO_SMALL]:
    "The image is too small. Use at least 200×200 pixels.",
  [CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_DIMENSIONS_TOO_LARGE]:
    "The image is too large. Use at most 4096×4096 pixels.",
  [CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_UNREADABLE]:
    "We could not read that image. Try a different file.",
  [CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_VALIDATION_LIMIT_REACHED]:
    "You've used all automated photo checks for this ceremony. Start a new ceremony from your dashboard, or contact support for help.",
}

export function catProfileSubmitErrorMessage(
  code: string | undefined,
  fallback = "Something went wrong. Please try again.",
): string {
  if (code !== undefined && Object.hasOwn(MESSAGES, code)) {
    return MESSAGES[code as CatProfileSubmitErrorCode]
  }
  return fallback
}
