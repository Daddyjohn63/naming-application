import { catProfileSubmitErrorMessage } from "../constants/cat-profile-errors"

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

export function getConvexErrorMessage(error: unknown): string {
  const data = getConvexErrorData(error)
  if (data?.code !== undefined) {
    return catProfileSubmitErrorMessage(data.code)
  }
  if (error instanceof Error && error.message.length > 0) {
    return error.message
  }
  return catProfileSubmitErrorMessage(undefined)
}
