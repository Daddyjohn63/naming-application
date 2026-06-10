/**
 * Toast helpers for cat ceremony mutations (summary pipeline, family names, profile return).
 *
 * Keeps user-facing error copy consistent and logs the raw error for debugging.
 * Used by `use-cat-ceremony-page` when Convex mutations fail.
 */

import { toast } from "@workspace/ui/components/sonner"

/**
 * Shows a toast with optional error detail appended, and logs to the console.
 *
 * @param label - Short user-facing prefix (e.g. "Failed to retry summary pipeline")
 * @param err - Caught value from try/catch (Error, string, or unknown)
 */
export function toastCatCeremonyMutationError(label: string, err: unknown) {
  const detail =
    err instanceof Error && err.message.length > 0
      ? err.message
      : err != null
        ? String(err)
        : ""

  console.error(label, err)
  toast.error(detail.length > 0 ? `${label}: ${detail}` : label)
}
