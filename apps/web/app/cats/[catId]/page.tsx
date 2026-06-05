"use client"

/**
 * KB-004 ceremony shell — one route that swaps UI panels by `cat.ceremonyStep`.
 *
 * Renders profile form, AI loading states, or summary editor without separate URLs
 * per substate. Reactive Convex queries update when background actions finish.
 */

import * as React from "react"
import { useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { api } from "@workspace/backend/_generated/api"
import { CeremonyStepper } from "@/modules/ceremony/ui/components/ceremony-stepper"
import { CeremonyThreeNamesView } from "@/modules/ceremony/ui/components/ceremony-three-names-view"
import { CeremonyUnlockSidebar } from "@/modules/ceremony/ui/components/ceremony-unlock-sidebar"
import { usesCeremonyNamingTunnel } from "@/modules/ceremony/lib/ceremony-layout"
import { ceremonyStepShortLabel } from "@/modules/ceremony/lib/ceremony-progress"
import { CeremonyTunnelLayout } from "@/modules/ceremony/ui/layouts/ceremony-tunnel-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { isCatProfileEditableStep } from "@workspace/shared/constants/cat-profile"
import { resolvePhotoIssueDisplay } from "@workspace/shared/constants/cat-photo-validation"
import { isCatSummaryCeremonyStep } from "@workspace/shared/constants/cat-summary"
import { toast } from "@workspace/ui/components/sonner"

import { CatProfileForm } from "@/modules/cats/ui/components/cat-profile-form"
import {
  CatPhotoBlockAlert,
  CatSummaryPipelineStatus,
} from "@/modules/cats/ui/components/cat-summary-pipeline-status"
import { CatSummaryReview } from "@/modules/cats/ui/components/cat-summary-review"
import { FamilyNameCuration } from "@/modules/cats/ui/components/family-name-curation"
import { FamilyNamePipelineStatus } from "@/modules/cats/ui/components/family-name-pipeline-status"
import { FamilyNameStylePicker } from "@/modules/cats/ui/components/family-name-style-picker"
import { dataComponent } from "@/lib/data-component"

/** User-facing summary-ceremony copy plus dev-visible error details. */
function toastSummaryMutationError(label: string, err: unknown) {
  const detail =
    err instanceof Error && err.message.length > 0
      ? err.message
      : err != null
        ? String(err)
        : ""
  console.error(label, err)
  toast.error(detail.length > 0 ? `${label}: ${detail}` : label)
}

/** Placeholder layout while the cat query is loading. */
function CatCeremonySkeleton() {
  return (
    <div
      {...dataComponent("CatCeremonySkeleton")}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 lg:max-w-4xl"
    >
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-20 w-full rounded-lg" />
    </div>
  )
}

export default function CatCeremonyPage() {
  const params = useParams()
  const raw = params.catId
  const catIdParam =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined

  const cat = useQuery(
    api.cats.getCatByIdForOwner,
    catIdParam !== undefined ? { catId: catIdParam } : "skip" //skip query if catIdParam is undefined
  )
  const retryPipeline = useMutation(api.catSummary.retrySummaryPipeline)
  const retryFamilyNames = useMutation(
    api.familyNaming.retryFamilyNameGeneration
  )
  const returnToProfile = useMutation(
    api.catSummary.returnToProfileForPhotoReplace
  )
  /** True while the Retry button mutation is in flight. */
  const [retrying, setRetrying] = React.useState(false)
  /** True while Back to profile is in flight after a photo pipeline error. */
  const [returningToProfile, setReturningToProfile] = React.useState(false)
  /** True while family name generation retry is in flight. */
  const [retryingFamilyNames, setRetryingFamilyNames] = React.useState(false)
  /** When true at summary_review, show profile form instead of summary editor. */
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
    const catId = cat?._id
    if (catId === undefined) {
      return
    }
    void (async () => {
      try {
        await returnToProfile({ catId })
      } catch (err) {
        toastSummaryMutationError("Could not return to profile", err)
      }
    })()
  }, [cat?._id, cat?.ceremonyStep, returnToProfile])

  if (catIdParam === undefined) {
    return (
      <main
        {...dataComponent("CatCeremonyPage")}
        className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-12"
      >
        <p className="text-sm text-muted-foreground">Missing ceremony id.</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </main>
    )
  }

  if (cat === undefined) {
    return <CatCeremonySkeleton />
  }

  if (cat === null) {
    return (
      <main
        {...dataComponent("CatCeremonyPage")}
        className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-12"
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          This ceremony isn&apos;t on your shelf, or it was removed from your
          account.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Return to dashboard</Link>
          </Button>
        </div>
      </main>
    )
  }

  // --- Panel visibility: derived from server ceremonyStep (single source of truth) ---

  /** KB-003 form — draft (incl. photo issues), or summary_review when editing profile. */
  const showProfileForm =
    (isCatProfileEditableStep(cat.ceremonyStep) ||
      cat.ceremonyStep === "photo_quality_review") &&
    (cat.ceremonyStep !== "summary_review" || editingProfileFromSummary)

  /** Spinner while photo validation or summary generation runs in the background. */
  const showSummaryPipeline =
    isCatSummaryCeremonyStep(cat.ceremonyStep) &&
    (cat.ceremonyStep === "awaiting_photo_validation" ||
      cat.ceremonyStep === "awaiting_summary")

  /** Editable AI summary textarea with Save / Submit. */
  const showSummaryReview =
    cat.ceremonyStep === "summary_review" && !editingProfileFromSummary

  /** KB-005 style multi-select. */
  const showFamilyStyle = cat.ceremonyStep === "family_style"

  /** KB-006 generation loading / error. */
  const showFamilyNamePipeline = cat.ceremonyStep === "awaiting_family_names"

  /** KB-006 curation (single column until favourite, then tunnel). */
  const showFamilyCuration =
    cat.ceremonyStep === "family_curation" ||
    cat.ceremonyStep === "family_preview"

  /** KB-006A two-column tunnel once a family favourite exists. */
  const showNamingTunnel = usesCeremonyNamingTunnel(cat)

  /** Photo issue — show alert above profile form when sent back from validation. */
  const onProfileStep =
    cat.ceremonyStep === "draft" || cat.ceremonyStep === "photo_quality_review"
  const photoIssueDisplay =
    onProfileStep && cat.photoValidation !== undefined
      ? resolvePhotoIssueDisplay({
          userMessage: cat.photoValidation.userMessage,
          isCat: cat.photoValidation.isCat,
          isSingleCat: cat.photoValidation.isSingleCat ?? true,
          qualityScore: cat.photoValidation.qualityScore,
        })
      : null
  const photoBlockMessage = photoIssueDisplay?.message ?? null
  const photoBlockTitle = photoIssueDisplay?.title ?? null

  /** Re-schedule family name generation after familyNameGenerationError. */
  const onRetryFamilyNames = async () => {
    setRetryingFamilyNames(true)
    try {
      await retryFamilyNames({ catId: cat._id })
    } catch (err) {
      toastSummaryMutationError("Failed to retry family name generation", err)
    } finally {
      setRetryingFamilyNames(false)
    }
  }

  /** Re-schedule summary generation after a transient summaryGenerationError. */
  const onRetryPipeline = async () => {
    setRetrying(true)
    try {
      await retryPipeline({ catId: cat._id })
    } catch (err) {
      toastSummaryMutationError("Failed to retry summary pipeline", err)
    } finally {
      setRetrying(false)
    }
  }

  /** Open profile form so the owner can upload a new photo after validation failed. */
  const onBackToProfile = async () => {
    if (cat.ceremonyStep === "draft") {
      return
    }
    setReturningToProfile(true)
    try {
      await returnToProfile({ catId: cat._id })
    } catch (err) {
      toastSummaryMutationError("Could not return to profile", err)
    } finally {
      setReturningToProfile(false)
    }
  }

  const ceremonyHeader = (
    <>
      <nav
        className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link
          href="/dashboard"
          className="font-medium underline-offset-4 hover:text-primary hover:underline"
        >
          Dashboard
        </Link>
        <span aria-hidden className="text-muted-foreground/70">
          /
        </span>
        <span className="line-clamp-1 font-semibold tracking-tight text-foreground">
          {cat.title}
        </span>
      </nav>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-full border border-primary/15 bg-accent/80 px-3 text-accent-foreground"
          >
            {ceremonyStepShortLabel(cat.ceremonyStep)}
          </Badge>
        </div>
      </div>
    </>
  )

  const standardPanels = (
    <>
      {photoBlockMessage !== null && photoBlockTitle !== null ? (
        <CatPhotoBlockAlert
          title={photoBlockTitle}
          message={photoBlockMessage}
        />
      ) : null}

      {showProfileForm ? (
        <CatProfileForm cat={cat} photoIssueMessage={photoBlockMessage} />
      ) : null}

      {showSummaryPipeline ? (
        <CatSummaryPipelineStatus
          cat={cat}
          onRetry={() => void onRetryPipeline()}
          retrying={retrying}
          onBackToProfile={() => void onBackToProfile()}
          returningToProfile={returningToProfile}
        />
      ) : null}

      {showSummaryReview ? (
        <CatSummaryReview
          cat={cat}
          onEditProfile={() => setEditingProfileFromSummary(true)}
        />
      ) : null}

      {showFamilyStyle ? <FamilyNameStylePicker cat={cat} /> : null}

      {showFamilyNamePipeline ? (
        <FamilyNamePipelineStatus
          cat={cat}
          onRetry={() => void onRetryFamilyNames()}
          retrying={retryingFamilyNames}
        />
      ) : null}

      {showFamilyCuration && !showNamingTunnel ? (
        <FamilyNameCuration cat={cat} />
      ) : null}
    </>
  )

  const namingTunnelMain = (
    <>
      {ceremonyHeader}

      {showFamilyNamePipeline ? (
        <FamilyNamePipelineStatus
          cat={cat}
          onRetry={() => void onRetryFamilyNames()}
          retrying={retryingFamilyNames}
        />
      ) : null}

      <CeremonyThreeNamesView cat={cat} />

      {showFamilyCuration ? <FamilyNameCuration cat={cat} tunnelMode /> : null}
    </>
  )

  const showLaterStepPlaceholder =
    !showProfileForm &&
    !showSummaryPipeline &&
    !showSummaryReview &&
    !showFamilyStyle &&
    !showFamilyNamePipeline &&
    !showFamilyCuration &&
    !showNamingTunnel

  return (
    <div {...dataComponent("CatCeremonyPage")} className="contents">
      <CeremonyStepper currentStep={cat.ceremonyStep} />
      {showNamingTunnel ? (
        <CeremonyTunnelLayout
          main={namingTunnelMain}
          sidebar={<CeremonyUnlockSidebar cat={cat} />}
        />
      ) : (
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 lg:max-w-4xl">
          {ceremonyHeader}
          {standardPanels}
          {showLaterStepPlaceholder ? (
            <>
              <Card className="ceremony-panel">
                <CardHeader className="border-b">
                  <CardTitle className="text-base">
                    Continue your ceremony
                  </CardTitle>
                  <CardDescription>
                    This step is handled in a later part of the journey. Use the
                    progress bar above or return from the dashboard.
                  </CardDescription>
                </CardHeader>
              </Card>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Back to dashboard</Link>
                </Button>
              </div>
            </>
          ) : null}
        </main>
      )}
    </div>
  )
}
