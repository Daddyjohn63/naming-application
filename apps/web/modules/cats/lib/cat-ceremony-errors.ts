/**
 * Toast helpers for cat ceremony mutations (summary pipeline, family names, profile return).
 *
 * Keeps user-facing error copy consistent and reports unexpected errors for beta review.
 * Used by `use-cat-ceremony-page` when Convex mutations fail.
 */

import { getConvexErrorMessage } from "@workspace/shared/utils/convex-error"
import { toast } from "@workspace/ui/components/sonner"

type ReportFn = (options: {
  area: string
  error: unknown
  path?: string
  catId?: string
  meta?: Record<string, string>
}) => void

/**
 * Shows a toast with optional error detail appended, logs to the console,
 * and reports unexpected (non-ConvexError-code) failures when `report` is provided.
 *
 * @param label - Short user-facing prefix (e.g. "Failed to retry summary pipeline")
 * @param err - Caught value from try/catch (Error, string, or unknown)
 * @param report - Optional client error reporter from `useReportClientError`
 * @param context - Optional area/catId for the durable log
 */
export function toastCatCeremonyMutationError(
  label: string,
  err: unknown,
  report?: ReportFn,
  context?: { area?: string; catId?: string },
) {
  const detail = getConvexErrorMessage(err)

  console.error(label, err)
  toast.error(detail.length > 0 ? `${label}: ${detail}` : label)

  report?.({
    area: context?.area ?? "catCeremony",
    error: err,
    path: label,
    catId: context?.catId,
  })
}
