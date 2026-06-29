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

/** True when unlock is done but the first cat-world name batch has not started yet. */
export function needsCatWorldGenerationStart(
  cat: Pick<Doc<"cats">, "ceremonyStep" | "selectedCatWorldName">,
): boolean {
  return (
    cat.ceremonyStep === "naming_cat_world" &&
    cat.selectedCatWorldName === undefined
  )
}

/**
 * Client hook for paid-stage continue CTAs (sidebar + banner + curation).
 *
 * Cat-world: `startCatWorldNaming` once after unlock — hidden while generating or
 * once a batch exists (main column owns pipeline + curation UI).
 *
 * Ineffable handoff bundles two server steps:
 * 1. confirmCatWorldFavourite — lock stage advance when favourite picked on naming_cat_world
 * 2. startIneffableNaming — set awaiting_ineffable_names and schedule AI
 */
export function useCeremonyStageContinue(
  cat: Pick<
    Doc<"cats">,
    "_id" | "ceremonyStep" | "selectedCatWorldName" | "selectedIneffableName"
  >,
) {
  const confirmCatWorld = useMutation(api.catWorldNaming.confirmCatWorldFavourite)
  const startCatWorldNaming = useMutation(api.catWorldNaming.startCatWorldNaming)
  const startIneffableNaming = useMutation(api.ineffableNaming.startIneffableNaming)
  const catWorldState = useQuery(api.catWorldNaming.getCatWorldNamingStateForOwner, {
    catId: cat._id,
  })
  const ineffableState = useQuery(
    api.ineffableNaming.getIneffableNamingStateForOwner,
    { catId: cat._id },
  )

  const [continuingToCatWorld, setContinuingToCatWorld] = React.useState(false)
  const [continuing, setContinuing] = React.useState(false)

  const catWorldStateLoaded = catWorldState !== undefined
  const hasCatWorldBatch =
    catWorldState !== undefined &&
    catWorldState !== null &&
    catWorldState.currentBatch !== null

  const ineffableStateLoaded = ineffableState !== undefined
  const hasIneffableBatch =
    ineffableState !== undefined &&
    ineffableState !== null &&
    ineffableState.currentBatch !== null

  const continueToCatWorld = React.useCallback(async () => {
    if (!catWorldStateLoaded || catWorldState === null) {
      return
    }
    if (catWorldState.currentBatch !== null) {
      return
    }

    setContinuingToCatWorld(true)
    try {
      await startCatWorldNaming({ catId: cat._id })
      toast.success("Generating cat-world names…")
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setContinuingToCatWorld(false)
    }
  }, [cat._id, catWorldState, catWorldStateLoaded, startCatWorldNaming])

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

  const showContinueToCatWorld =
    needsCatWorldGenerationStart(cat) &&
    catWorldStateLoaded &&
    catWorldState !== null &&
    !hasCatWorldBatch

  const showContinueToIneffable =
    needsCatWorldConfirm(cat) ||
    (cat.ceremonyStep === "naming_ineffable" &&
      ineffableStateLoaded &&
      ineffableState !== null &&
      !hasIneffableBatch)

  return {
    continuingToCatWorld,
    continueToCatWorld,
    showContinueToCatWorld,
    continuing,
    continueToIneffable,
    showContinueToIneffable,
    needsCatWorldConfirm: needsCatWorldConfirm(cat),
  }
}
