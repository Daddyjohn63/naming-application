"use client"

/**
 * KB-004 loading and error UI for the async summary pipeline.
 *
 * Shown during awaiting_photo_validation / awaiting_summary, or when
 * summaryGenerationError is set (Retry button).
 */

import type { Doc } from "@workspace/backend/_generated/dataModel"
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

type CatSummaryPipelineStatusProps = {
  cat: Doc<"cats">
  /** Calls retrySummaryPipeline on the ceremony page. */
  onRetry: () => void
  retrying: boolean
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

export function CatSummaryPipelineStatus({
  cat,
  onRetry,
  retrying,
}: CatSummaryPipelineStatusProps) {
  if (cat.summaryGenerationError !== undefined) {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Something went wrong</CardTitle>
          <CardDescription>{cat.summaryGenerationError}</CardDescription>
        </CardHeader>
        <div className="px-4 py-4">
          <Button type="button" disabled={retrying} onClick={onRetry}>
            {retrying ? "Retrying…" : "Retry"}
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
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
  message: string
}

/** Destructive alert when photo validation outcome was "block" (non-cat image). */
export function CatPhotoBlockAlert({ message }: CatPhotoBlockAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Please upload a photo of your cat</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
