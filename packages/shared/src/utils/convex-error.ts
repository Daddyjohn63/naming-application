import { catProfileSubmitErrorMessage } from "../constants/cat-profile-errors"
import { catSummaryErrorMessage } from "../constants/cat-summary-errors"
import { familyNamingErrorMessage } from "../constants/family-naming-errors"
import { rateLimitErrorMessage } from "../constants/rate-limit-errors"
import { stagedNamingErrorMessage } from "../constants/staged-naming-errors"

type ConvexErrorData = {
  code?: string
  fieldErrors?: Record<string, string>
}

/** Extract structured `ConvexError` data from a failed mutation/action. */
export function getConvexErrorData(error: unknown): ConvexErrorData | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof (error as { data: unknown }).data === "object" &&
    (error as { data: unknown }).data !== null
  ) {
    return (error as { data: ConvexErrorData }).data
  }
  return null
}

const UNKNOWN_ERROR_MESSAGE = "__convex_error_unknown__"

export function getConvexErrorMessage(error: unknown): string {
  const data = getConvexErrorData(error)
  if (data?.code !== undefined) {
    for (const resolve of [
      catProfileSubmitErrorMessage,
      catSummaryErrorMessage,
      familyNamingErrorMessage,
      rateLimitErrorMessage,
      stagedNamingErrorMessage,
    ]) {
      const message = resolve(data.code, UNKNOWN_ERROR_MESSAGE)
      if (message !== UNKNOWN_ERROR_MESSAGE) {
        return message
      }
    }
  }
  if (error instanceof Error && error.message.length > 0) {
    return error.message
  }
  return catProfileSubmitErrorMessage(undefined)
}
