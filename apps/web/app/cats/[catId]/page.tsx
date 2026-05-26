"use client"

/**
 * KB-004 ceremony shell — one route that swaps UI panels by `cat.ceremonyStep`.
 *
 * Renders profile form, AI loading states, photo quality review, or summary editor
 * without separate URLs per substate. Reactive Convex queries update when background
 * actions finish.
 */

import * as React from "react"
import { useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { api } from "@workspace/backend/_generated/api"
import { CeremonyStepper } from "@/modules/ceremony/ui/components/ceremony-stepper"
import { ceremonyStepShortLabel } from "@/modules/ceremony/lib/ceremony-progress"
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
import { isCatSummaryCeremonyStep } from "@workspace/shared/constants/cat-summary"

import { CatProfileForm } from "@/modules/cats/ui/components/cat-profile-form"
import { CatPhotoQualityReview } from "@/modules/cats/ui/components/cat-photo-quality-review"
import {
  CatPhotoBlockAlert,
  CatSummaryPipelineStatus,
} from "@/modules/cats/ui/components/cat-summary-pipeline-status"
import { CatSummaryReview } from "@/modules/cats/ui/components/cat-summary-review"

/** Placeholder layout while the cat query is loading. */
function CatCeremonySkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 lg:max-w-4xl">
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
    catIdParam !== undefined ? { catId: catIdParam } : "skip",
  )
  const retryPipeline = useMutation(api.catSummary.retrySummaryPipeline)
  const returnToProfile = useMutation(api.catSummary.returnToProfileForPhotoReplace)
  /** True while the Retry button mutation is in flight. */
  const [retrying, setRetrying] = React.useState(false)
  /** True while returnToProfileForPhotoReplace is in flight. */
  const [returningToProfile, setReturningToProfile] = React.useState(false)
  /** When true at summary_review, show profile form instead of summary editor. */
  const [editingProfileFromSummary, setEditingProfileFromSummary] =
    React.useState(false)

  // Leaving summary_review clears the "edit profile from summary" overlay.
  React.useEffect(() => {
    if (cat !== undefined && cat !== null && cat.ceremonyStep !== "summary_review") {
      setEditingProfileFromSummary(false)
    }
  }, [cat?.ceremonyStep, cat])

  if (catIdParam === undefined) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-12">
        <p className="text-muted-foreground text-sm">Missing ceremony id.</p>
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
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-12">
        <p className="text-muted-foreground text-sm leading-relaxed">
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

  /** KB-003 form — draft, or summary_review when user clicks "Edit profile". */
  const showProfileForm =
    isCatProfileEditableStep(cat.ceremonyStep) &&
    (cat.ceremonyStep !== "summary_review" || editingProfileFromSummary)

  /** Spinner while photo validation or summary generation runs in the background. */
  const showSummaryPipeline =
    isCatSummaryCeremonyStep(cat.ceremonyStep) &&
    (cat.ceremonyStep === "awaiting_photo_validation" ||
      cat.ceremonyStep === "awaiting_summary")

  /** Warn outcome — user must continue or replace photo before summary runs. */
  const showPhotoQualityReview = cat.ceremonyStep === "photo_quality_review"

  /** Editable AI summary textarea with Save / Submit. */
  const showSummaryReview =
    cat.ceremonyStep === "summary_review" && !editingProfileFromSummary

  /** Block outcome — validation failed; show alert above profile form at draft step. */
  const photoBlockMessage =
    cat.ceremonyStep === "draft" && cat.photoValidation !== undefined
      ? cat.photoValidation.userMessage.trim() ||
        "That photo doesn't look like a cat. Please upload a photo of your cat."
      : null

  /** Re-schedule validateCatPhoto or generateCatSummary after summaryGenerationError. */
  const onRetryPipeline = async () => {
    setRetrying(true)
    try {
      await retryPipeline({ catId: cat._id })
    } finally {
      setRetrying(false)
    }
  }

  /** From quality review — mutation sets ceremonyStep back to draft for new upload. */
  const onReplacePhoto = async () => {
    setReturningToProfile(true)
    try {
      await returnToProfile({ catId: cat._id })
    } finally {
      setReturningToProfile(false)
    }
  }

  return (
    <>
      <CeremonyStepper currentStep={cat.ceremonyStep} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 lg:max-w-4xl">
        <nav
          className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm"
          aria-label="Breadcrumb"
        >
          <Link
            href="/dashboard"
            className="hover:text-foreground font-medium underline-offset-4 hover:underline"
          >
            Dashboard
          </Link>
          <span aria-hidden className="text-muted-foreground/70">
            /
          </span>
          <span className="text-foreground line-clamp-1 font-semibold tracking-tight">
            {cat.title}
          </span>
        </nav>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3">
              {ceremonyStepShortLabel(cat.ceremonyStep)}
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-prose leading-relaxed text-pretty">
            You&apos;re inside the guided tunnel: one dominant column carries
            the next story beat (photo, summary, style, preview, unlock, then
            paid naming stages). This shell already tracks your server step so
            refresh or return visits land in the right place.
          </p>
        </div>

        {photoBlockMessage !== null ? (
          <CatPhotoBlockAlert message={photoBlockMessage} />
        ) : null}

        {showProfileForm ? <CatProfileForm cat={cat} /> : null}

        {showSummaryPipeline ? (
          <CatSummaryPipelineStatus
            cat={cat}
            onRetry={() => void onRetryPipeline()}
            retrying={retrying}
          />
        ) : null}

        {showPhotoQualityReview ? (
          <CatPhotoQualityReview
            cat={cat}
            onReplacePhoto={() => void onReplacePhoto()}
          />
        ) : null}

        {returningToProfile ? (
          <p className="text-muted-foreground text-sm">Opening profile…</p>
        ) : null}

        {showSummaryReview ? (
          <CatSummaryReview
            cat={cat}
            onEditProfile={() => setEditingProfileFromSummary(true)}
          />
        ) : null}

        {!showProfileForm &&
        !showSummaryPipeline &&
        !showPhotoQualityReview &&
        !showSummaryReview ? (
          <>
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-base">Continue your ceremony</CardTitle>
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
    </>
  )
}
