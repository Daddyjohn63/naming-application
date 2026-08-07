"use client"

/**
 * Data and interaction hook for the `/cats/[catId]` ceremony page.
 *
 * Owns:
 * - Route param parsing and Convex query subscription
 * - Mutation handlers (retry pipeline, retry family names, return to profile)
 * - Local UI state (loading flags, edit-profile-from-summary overlay)
 * - Side effects (legacy step migration, reset overlay when leaving summary_review)
 *
 * Returns everything `CatCeremonyView` needs to render without embedding Convex logic.
 */

import * as React from "react"
import { useMutation, useQuery } from "convex/react"
import { useParams } from "next/navigation"

import { api } from "@workspace/backend/_generated/api"
import { useReportClientError } from "@/lib/use-report-client-error"
import { toastCatCeremonyMutationError } from "@/modules/cats/lib/cat-ceremony-errors"
import {
  deriveCatCeremonyPanelFlags,
  deriveCatCeremonyPhotoBlock,
  type CatCeremonyPanelFlags,
  type CatCeremonyPhotoBlock,
} from "@/modules/cats/lib/cat-ceremony-panel-visibility"
import type { CatCeremonyDoc } from "@/modules/cats/lib/cat-ceremony-types"

export type UseCatCeremonyPageResult = {
  /** Raw `catId` from the URL, or undefined if missing/invalid. */
  catIdParam: string | undefined
  /**
   * Convex query result:
   * - `undefined` → still loading
   * - `null` → not found or not owned
   * - `CatCeremonyDoc` → ready to render
   */
  cat: CatCeremonyDoc | null | undefined
  /** Derived panel visibility flags from server ceremonyStep. */
  panels: CatCeremonyPanelFlags
  /** Photo validation alert copy for profile steps. */
  photoBlock: CatCeremonyPhotoBlock
  /** When true at summary_review, profile form replaces the summary editor. */
  editingProfileFromSummary: boolean
  setEditingProfileFromSummary: React.Dispatch<React.SetStateAction<boolean>>
  /** True while summary pipeline retry mutation is in flight. */
  retrying: boolean
  /** True while "back to profile" mutation is in flight after a photo error. */
  returningToProfile: boolean
  /** True while family name generation retry is in flight. */
  retryingFamilyNames: boolean
  /** True while cat-world name generation retry is in flight. */
  retryingCatWorldNames: boolean
  /** True while ineffable name generation retry is in flight. */
  retryingIneffableNames: boolean
  /** Re-schedule summary generation after a transient error. */
  onRetryPipeline: () => Promise<void>
  /** Re-schedule family name generation after an error. */
  onRetryFamilyNames: () => Promise<void>
  /** Re-schedule cat-world name generation after an error. */
  onRetryCatWorldNames: () => Promise<void>
  /** Re-schedule ineffable name generation after an error. */
  onRetryIneffableNames: () => Promise<void>
  /** Return to profile form so the owner can upload a new photo. */
  onBackToProfile: () => Promise<void>
}

export function useCatCeremonyPage(): UseCatCeremonyPageResult {
  const params = useParams()
  const raw = params.catId

  // Next.js dynamic segments can be string | string[] depending on catch-all routes.
  const catIdParam =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined

  const cat = useQuery(
    api.cats.getCatByIdForOwner,
    catIdParam !== undefined ? { catId: catIdParam } : "skip",
  )

  const retryPipeline = useMutation(api.catSummary.retrySummaryPipeline)
  const retryFamilyNames = useMutation(
    api.familyNaming.retryFamilyNameGeneration,
  )
  const retryCatWorldNames = useMutation(
    api.catWorldNaming.retryCatWorldNameGeneration,
  )
  const retryIneffableNames = useMutation(
    api.ineffableNaming.retryIneffableNameGeneration,
  )
  const returnToProfile = useMutation(
    api.catSummary.returnToProfileForPhotoReplace,
  )
  const reportClientError = useReportClientError()

  const [retrying, setRetrying] = React.useState(false)
  const [returningToProfile, setReturningToProfile] = React.useState(false)
  const [retryingFamilyNames, setRetryingFamilyNames] = React.useState(false)
  const [retryingCatWorldNames, setRetryingCatWorldNames] = React.useState(false)
  const [retryingIneffableNames, setRetryingIneffableNames] = React.useState(false)
  const [editingProfileFromSummary, setEditingProfileFromSummary] =
    React.useState(false)

  // Leaving summary_review clears the "edit profile from summary" overlay.
  React.useEffect(() => {
    if (
      cat !== undefined &&
      cat !== null &&
      cat.ceremonyStep !== "summary_review"
    ) {
      setEditingProfileFromSummary(false)
    }
  }, [cat?.ceremonyStep, cat])

  // Legacy ceremonies stuck on the old photo-quality review step → profile form.
  React.useEffect(() => {
    if (cat?.ceremonyStep !== "photo_quality_review") {
      return
    }
    const catId = cat._id
    void (async () => {
      try {
        await returnToProfile({ catId })
      } catch (err) {
        toastCatCeremonyMutationError(
          "Could not return to profile",
          err,
          reportClientError,
          { area: "catCeremony.returnToProfile", catId },
        )
      }
    })()
  }, [cat?._id, cat?.ceremonyStep, reportClientError, returnToProfile])

  // Panel flags and photo block only apply once we have a loaded cat document.
  const loadedCat = cat ?? null
  const panels =
    loadedCat !== null
      ? deriveCatCeremonyPanelFlags(loadedCat, editingProfileFromSummary)
      : emptyPanelFlags()

  const photoBlock =
    loadedCat !== null
      ? deriveCatCeremonyPhotoBlock(loadedCat)
      : { title: null, message: null }

  const onRetryFamilyNames = React.useCallback(async () => {
    if (loadedCat === null) {
      return
    }
    setRetryingFamilyNames(true)
    try {
      await retryFamilyNames({ catId: loadedCat._id })
    } catch (err) {
      toastCatCeremonyMutationError(
        "Failed to retry family name generation",
        err,
        reportClientError,
        {
          area: "catCeremony.retryFamilyNames",
          catId: loadedCat._id,
        },
      )
    } finally {
      setRetryingFamilyNames(false)
    }
  }, [loadedCat, reportClientError, retryFamilyNames])

  const onRetryCatWorldNames = React.useCallback(async () => {
    if (loadedCat === null) {
      return
    }
    setRetryingCatWorldNames(true)
    try {
      await retryCatWorldNames({ catId: loadedCat._id })
    } catch (err) {
      toastCatCeremonyMutationError(
        "Failed to retry cat-world name generation",
        err,
        reportClientError,
        {
          area: "catCeremony.retryCatWorldNames",
          catId: loadedCat._id,
        },
      )
    } finally {
      setRetryingCatWorldNames(false)
    }
  }, [loadedCat, reportClientError, retryCatWorldNames])

  const onRetryIneffableNames = React.useCallback(async () => {
    if (loadedCat === null) {
      return
    }
    setRetryingIneffableNames(true)
    try {
      await retryIneffableNames({ catId: loadedCat._id })
    } catch (err) {
      toastCatCeremonyMutationError(
        "Failed to retry ineffable name generation",
        err,
        reportClientError,
        {
          area: "catCeremony.retryIneffableNames",
          catId: loadedCat._id,
        },
      )
    } finally {
      setRetryingIneffableNames(false)
    }
  }, [loadedCat, reportClientError, retryIneffableNames])

  const onRetryPipeline = React.useCallback(async () => {
    if (loadedCat === null) {
      return
    }
    setRetrying(true)
    try {
      await retryPipeline({ catId: loadedCat._id })
    } catch (err) {
      toastCatCeremonyMutationError(
        "Failed to retry summary pipeline",
        err,
        reportClientError,
        {
          area: "catCeremony.retrySummaryPipeline",
          catId: loadedCat._id,
        },
      )
    } finally {
      setRetrying(false)
    }
  }, [loadedCat, reportClientError, retryPipeline])

  const onBackToProfile = React.useCallback(async () => {
    if (loadedCat === null || loadedCat.ceremonyStep === "draft") {
      return
    }
    setReturningToProfile(true)
    try {
      await returnToProfile({ catId: loadedCat._id })
    } catch (err) {
      toastCatCeremonyMutationError(
        "Could not return to profile",
        err,
        reportClientError,
        {
          area: "catCeremony.returnToProfile",
          catId: loadedCat._id,
        },
      )
    } finally {
      setReturningToProfile(false)
    }
  }, [loadedCat, reportClientError, returnToProfile])

  return {
    catIdParam,
    cat,
    panels,
    photoBlock,
    editingProfileFromSummary,
    setEditingProfileFromSummary,
    retrying,
    returningToProfile,
    retryingFamilyNames,
    retryingCatWorldNames,
    retryingIneffableNames,
    onRetryPipeline,
    onRetryFamilyNames,
    onRetryCatWorldNames,
    onRetryIneffableNames,
    onBackToProfile,
  }
}

/** Default flags while cat is loading or absent — nothing visible. */
function emptyPanelFlags(): CatCeremonyPanelFlags {
  return {
    showProfileForm: false,
    showSummaryPipeline: false,
    showSummaryReview: false,
    showFamilyStyle: false,
    showFamilyNamePipeline: false,
    showFamilyCuration: false,
    showNamingTunnel: false,
    showPaidNaming: false,
    showCatWorldNamePipeline: false,
    showCatWorldCuration: false,
    showIneffableNamePipeline: false,
    showIneffableCuration: false,
    showLaterStepPlaceholder: false,
  }
}
