"use client"

import { useMutation, useQuery } from "convex/react"
import { useEffect, useRef } from "react"

import { api } from "@workspace/backend/_generated/api"
import { formatCatCeremonyQuotaMessage } from "@workspace/shared/constants/cat-ceremony-limits"

/**
 * Lifetime create entitlement for dashboard Add-a-cat CTAs.
 * While loading, `canCreate` stays true so controls don’t flash disabled;
 * mutations still enforce the server-side cap.
 *
 * Also commits a durable `catsCreatedTotal` baseline once so deletes cannot
 * undercount lifetime usage before the first create.
 */
export function useCatCeremonyEntitlement() {
  const entitlement = useQuery(api.cats.getMyCatCeremonyEntitlement)
  const ensureBaseline = useMutation(api.cats.ensureMyCatCeremonyQuotaBaseline)
  const ensureStartedRef = useRef(false)

  useEffect(() => {
    if (entitlement === undefined || entitlement === null) {
      return
    }
    if (ensureStartedRef.current) {
      return
    }
    ensureStartedRef.current = true
    void ensureBaseline().catch(() => {
      // Allow retry on next mount if the first attempt fails.
      ensureStartedRef.current = false
    })
  }, [entitlement, ensureBaseline])

  const isLoading = entitlement === undefined
  const canCreate = entitlement?.canCreate !== false

  let quotaMessage: string | null = null
  if (
    entitlement !== null &&
    entitlement !== undefined &&
    entitlement.enforced &&
    !entitlement.unlimited &&
    entitlement.remaining !== null &&
    entitlement.limit !== null
  ) {
    quotaMessage = formatCatCeremonyQuotaMessage({
      remaining: entitlement.remaining,
      limit: entitlement.limit,
    })
  }

  return {
    entitlement,
    isLoading,
    canCreate,
    quotaMessage,
  }
}
