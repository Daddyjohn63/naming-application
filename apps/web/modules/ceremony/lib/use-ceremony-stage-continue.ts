"use client"

import * as React from "react"
import { useMutation, useQuery } from "convex/react"

import { api } from "@workspace/backend/_generated/api"
import type { Doc } from "@workspace/backend/_generated/dataModel"
import { getConvexErrorMessage } from "@workspace/shared/utils/convex-error"
import { toast } from "@workspace/ui/components/sonner"

/** True when cat-world favourite is set but the stage has not advanced yet. */
export function needsCatWorldConfirm(
  cat: Pick<Doc<"cats">, "ceremonyStep" | "selectedCatWorldName">,
): boolean {
  return (
    cat.ceremonyStep === "naming_cat_world" &&
    cat.selectedCatWorldName !== undefined
  )
}

/** True when user should start (or is waiting on) ineffable name generation. */
export function needsIneffableGenerationStart(
  cat: Pick<Doc<"cats">, "ceremonyStep" | "selectedIneffableName">,
): boolean {
  return (
    (cat.ceremonyStep === "naming_ineffable" ||
      cat.ceremonyStep === "awaiting_ineffable_names") &&
    cat.selectedIneffableName === undefined
  )
}

/**
 * Client hook for the cat-world → ineffable handoff (sidebar + banner + curation).
 *
 * Two server steps are bundled into one button for UX:
 * 1. confirmCatWorldFavourite — lock stage advance when favourite picked on naming_cat_world
 * 2. startIneffableNaming — set awaiting_ineffable_names and schedule AI
 *
 * showContinueToIneffable is true when either step is still pending.
 */
export function useCeremonyStageContinue(
  cat: Pick<
    Doc<"cats">,
    "_id" | "ceremonyStep" | "selectedCatWorldName" | "selectedIneffableName"
  >,
) {
  const confirmCatWorld = useMutation(api.catWorldNaming.confirmCatWorldFavourite)
  const startIneffableNaming = useMutation(api.ineffableNaming.startIneffableNaming)
  const ineffableState = useQuery(
    api.ineffableNaming.getIneffableNamingStateForOwner,
    { catId: cat._id },
  )

  const [continuing, setContinuing] = React.useState(false)

  const hasIneffableBatch =
    ineffableState?.currentBatch !== null &&
    ineffableState?.currentBatch !== undefined

  const continueToIneffable = React.useCallback(async () => {
    setContinuing(true)
    try {
      if (needsCatWorldConfirm(cat)) {
        await confirmCatWorld({ catId: cat._id })
      }
      await startIneffableNaming({ catId: cat._id })
      toast.success("Generating your ineffable near-names…")
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
      throw error
    } finally {
      setContinuing(false)
    }
  }, [cat, confirmCatWorld, startIneffableNaming])

  const showContinueToIneffable =
    needsCatWorldConfirm(cat) ||
    (cat.ceremonyStep === "naming_ineffable" && !hasIneffableBatch)

  return {
    continuing,
    continueToIneffable,
    showContinueToIneffable,
    needsCatWorldConfirm: needsCatWorldConfirm(cat),
  }
}
