"use client"

import { useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import { useCallback, useRef, useState } from "react"

import { api } from "@workspace/backend/_generated/api"
import { getConvexErrorMessage } from "@workspace/shared/utils/convex-error"

/**
 * Creates a draft ceremony server-side and navigates to its editor page.
 * Exposes loading/error state for the UI and a synchronous guard against
 * overlapping calls (double-clicks, slow networks).
 */
export function useCreateDraftCeremony() {
  const router = useRouter()
  const createDraftCat = useMutation(api.cats.createDraftCat)

  /**
   * Ref-based “is a request already in flight?” flag.
   *
   * Why useRef instead of state?
   * - Reading/updating `.current` is synchronous and does not schedule a re-render.
   *   That lets the guard at the top of `execute()` run immediately on the next
   *   click — important when two fires happen back-to-back before React flushes
   *   a state update from the first call.
   * - `pending` state below is still used for UI (spinner/disabled button); this
   *   ref is only for deduping concurrent execution, not for display.
   */
  const isExecutingRef = useRef(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  async function execute() {
    // Bail out instantly if another invocation is still running (same tick or later).
    if (isExecutingRef.current) {
      return
    }
    isExecutingRef.current = true
    setError(null)
    setPending(true)
    try {
      const id = await createDraftCat()
      router.push(`/cats/${id}`)
    } catch (err) {
      setError(getConvexErrorMessage(err))
    } finally {
      // Always release the guard so a retry after failure works.
      isExecutingRef.current = false
      setPending(false)
    }
  }

  return {
    execute,
    pending,
    error,
    clearError,
  }
}
