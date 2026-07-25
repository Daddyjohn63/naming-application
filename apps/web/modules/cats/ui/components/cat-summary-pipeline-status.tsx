"use client"

/**
 * KB-004 loading and error UI for the async summary pipeline.
 *
 * Shown during awaiting_photo_validation / awaiting_summary, or when
 * summaryGenerationError is set. Photo issues offer Back to profile; transient
 * / AI-unavailable failures offer Retry and Back to profile.
 */

import type { Doc } from "@workspace/backend/_generated/dataModel"
import {
  CAT_PHOTO_CHECK_FAILED_MESSAGE,
  resolvePhotoIssueDisplay,
} from "@workspace/shared/constants/cat-photo-validation"
import { isCatSummaryCeremonyStep } from "@workspace/shared/constants/cat-summary"
import {
  AI_SERVICE_UNAVAILABLE_MESSAGE,
  pipelineErrorUsesBackToProfile,
} from "@workspace/shared/utils/summary-pipeline-error"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Spinner } from "@workspace/ui/components/spinner"

import { dataComponent } from "@/lib/data-component"

type CatSummaryPipelineStatusProps = {
  cat: Doc<"cats">
  /** Re-run summary generation after a transient failure on awaiting_summary. */
  onRetry: () => void
  retrying: boolean
  /** Return to profile to upload a new photo after a photo validation failure. */
  onBackToProfile: () => void
  returningToProfile: boolean
}

/** Headline copy differs for photo check vs summary generation. */
function loadingTitle(step: Doc<"cats">["ceremonyStep"]): string {
  if (step === "awaiting_photo_validation") {
    return "Checking your photo…"
  }
  return "Generating your summary"
}

/** Supporting text under the spinner for each loading substate. */
function loadingDescription(step: Doc<"cats">["ceremonyStep"]): string {
  if (step === "awaiting_photo_validation") {
    return "We're making sure your photo shows your cat before we write the personality summary."
  }
  return "We're crafting a personality summary from your profile. You can leave and come back — your progress is saved."
}

function resolvePhotoPipelineErrorDisplay(cat: Doc<"cats">): {
  title: string
  message: string
} {
  if (cat.photoValidation !== undefined) {
    return resolvePhotoIssueDisplay({
      userMessage: cat.photoValidation.userMessage,
      isCat: cat.photoValidation.isCat,
      isSingleCat: cat.photoValidation.isSingleCat ?? true,
      qualityScore: cat.photoValidation.qualityScore,
    })
  }

  const message =
    cat.summaryGenerationError?.trim() ?? CAT_PHOTO_CHECK_FAILED_MESSAGE

  return {
    title: "Please update your cat photo",
    message,
  }
}

export function CatSummaryPipelineStatus({
  cat,
  onRetry,
  retrying,
  onBackToProfile,
  returningToProfile,
}: CatSummaryPipelineStatusProps) {
  if (cat.summaryGenerationError !== undefined) {
    const useBackToProfile =
      isCatSummaryCeremonyStep(cat.ceremonyStep) &&
      pipelineErrorUsesBackToProfile({
        ceremonyStep: cat.ceremonyStep,
        summaryGenerationError: cat.summaryGenerationError,
        hasPhotoValidation: cat.photoValidation !== undefined,
      })

    if (useBackToProfile) {
      const { title, message } = resolvePhotoPipelineErrorDisplay(cat)
      return (
        <Card {...dataComponent("CatSummaryPipelineStatus")} className="ceremony-panel">
          <CardHeader className="border-b">
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <div className="px-4 py-4">
            <Button
              type="button"
              disabled={returningToProfile}
              onClick={onBackToProfile}
            >
              {returningToProfile ? "Opening profile…" : "Back to profile"}
            </Button>
          </div>
        </Card>
      )
    }

    const transientTitle =
      cat.summaryGenerationError === AI_SERVICE_UNAVAILABLE_MESSAGE
        ? "Please try again shortly"
        : "Something went wrong"
    const actionsDisabled = retrying || returningToProfile

    return (
      <Card {...dataComponent("CatSummaryPipelineStatus")} className="ceremony-panel">
        <CardHeader className="border-b">
          <CardTitle className="text-base">{transientTitle}</CardTitle>
          <CardDescription>{cat.summaryGenerationError}</CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-2 px-4 py-4">
          <Button
            type="button"
            disabled={actionsDisabled}
            onClick={onRetry}
          >
            {retrying ? "Retrying…" : "Retry"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={actionsDisabled}
            onClick={onBackToProfile}
          >
            {returningToProfile ? "Opening profile…" : "Back to profile"}
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card
      {...dataComponent("CatSummaryPipelineStatus")}
      className="ceremony-highlight-panel border-primary/25"
    >
      <CardHeader className="flex flex-row items-center gap-3 border-0 pb-0">
        <Spinner className="text-primary size-5 shrink-0" />
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base">{loadingTitle(cat.ceremonyStep)}</CardTitle>
          <CardDescription>{loadingDescription(cat.ceremonyStep)}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  )
}

type CatPhotoBlockAlertProps = {
  title: string
  message: string
}

/** Destructive alert when photo validation sends the owner back to profile. */
export function CatPhotoBlockAlert({
  title,
  message,
}: CatPhotoBlockAlertProps) {
  return (
    <Alert {...dataComponent("CatPhotoBlockAlert")} variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
