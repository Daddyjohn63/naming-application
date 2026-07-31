"use client"

import { useQuery } from "convex/react"

import { api } from "@workspace/backend/_generated/api"
import { formatCatCeremonyQuotaMessage } from "@workspace/shared/constants/cat-ceremony-limits"

/**
 * Lifetime create entitlement for dashboard Add-a-cat CTAs.
 * While loading, `canCreate` stays true so controls don’t flash disabled;
 * mutations still enforce the server-side cap.
 */
export function useCatCeremonyEntitlement() {
  const entitlement = useQuery(api.cats.getMyCatCeremonyEntitlement)

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
