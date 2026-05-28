import { CAT_PROFILE_SUBMIT_ERROR_CODE } from "../constants/cat-profile-errors"
import { catProfileSubmitErrorMessage } from "../constants/cat-profile-errors"
import type { CatProfileActionResult } from "../schemas/cat-profile-action"

type ApplyCatProfileActionErrorOptions = {
  setServerFieldErrors: (
    value:
      | Partial<Record<string, string>>
      | ((
          prev: Partial<Record<string, string>>,
        ) => Partial<Record<string, string>>),
  ) => void
  setFormError: (value: string | null) => void
}

/** Apply a structured profile action failure to form state (no throw / console noise). */
export function applyCatProfileActionError(
  result: Extract<CatProfileActionResult, { ok: false }>,
  { setServerFieldErrors, setFormError }: ApplyCatProfileActionErrorOptions,
): void {
  if (result.fieldErrors !== undefined) {
    setServerFieldErrors(result.fieldErrors)
  }
  const message = catProfileSubmitErrorMessage(result.code)
  if (
    result.code === CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_REQUIRED ||
    result.code.startsWith("photo_")
  ) {
    setServerFieldErrors((prev) => ({ ...prev, photo: message }))
  } else if (result.fieldErrors === undefined) {
    setFormError(message)
  }
}
