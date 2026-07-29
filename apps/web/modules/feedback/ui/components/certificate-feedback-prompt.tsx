"use client"

import { useEffect, useState } from "react"
import { useQuery } from "convex/react"
import { MessageSquareText } from "lucide-react"

import { ResponsiveDialog } from "@/components/ResponsiveDialog"
import { dataComponent } from "@/lib/data-component"
import { FeedbackForm } from "@/modules/feedback/ui/components/feedback-form"
import { api } from "@workspace/backend/_generated/api"
import type { Id } from "@workspace/backend/_generated/dataModel"
import { Button } from "@workspace/ui/components/button"

/** localStorage — suppress auto-open after “Not now” until they submit a review. */
const DISMISS_STORAGE_KEY = "naming-buddy:beta-feedback-prompt-dismissed"

/** Delay so the PDF download / success toast settle before the dialog appears. */
const OPEN_AFTER_COMPLETE_MS = 600

function isDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

function markDismissed(): void {
  try {
    localStorage.setItem(DISMISS_STORAGE_KEY, "1")
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function useCertificateFeedbackState({
  ceremonyComplete,
  openSignal,
}: {
  ceremonyComplete: boolean
  openSignal: number
}) {
  const existing = useQuery(api.betaReviews.getMyBetaReview)
  const [open, setOpen] = useState(false)
  const [autoOpened, setAutoOpened] = useState(false)

  const loading = existing === undefined
  const alreadyReviewed = existing !== null && existing !== undefined
  const canLeaveFeedback = existing === null

  useEffect(() => {
    if (!ceremonyComplete || autoOpened || loading || alreadyReviewed) {
      return
    }
    if (isDismissed()) {
      return
    }
    setOpen(true)
    setAutoOpened(true)
  }, [alreadyReviewed, autoOpened, ceremonyComplete, loading])

  useEffect(() => {
    if (openSignal === 0 || alreadyReviewed) {
      return
    }
    const timer = window.setTimeout(() => {
      setOpen(true)
    }, OPEN_AFTER_COMPLETE_MS)
    return () => window.clearTimeout(timer)
  }, [alreadyReviewed, openSignal])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      markDismissed()
    }
    setOpen(next)
  }

  return {
    loading,
    alreadyReviewed,
    canLeaveFeedback,
    open,
    openPrompt: () => setOpen(true),
    handleOpenChange,
    onSubmitSuccess: () => {
      markDismissed()
      setOpen(false)
    },
  }
}

type CertificateFeedbackBannerProps = {
  loading: boolean
  alreadyReviewed: boolean
  canLeaveFeedback: boolean
  onLeaveFeedback: () => void
}

/** Soft CTA / thanks line — show on prepare and complete, above the certificate. */
export function CertificateFeedbackBanner({
  loading,
  alreadyReviewed,
  canLeaveFeedback,
  onLeaveFeedback,
}: CertificateFeedbackBannerProps) {
  if (loading) {
    return null
  }

  if (alreadyReviewed) {
    return (
      <p
        {...dataComponent("CertificateFeedbackThanks")}
        className="text-sm text-muted-foreground"
      >
        Thanks — you&apos;ve already left beta feedback.
      </p>
    )
  }

  if (!canLeaveFeedback) {
    return null
  }

  return (
    <div
      {...dataComponent("CertificateFeedbackSoftCta")}
      className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="space-y-1">
        <p className="text-sm font-medium">Got 30 seconds for beta feedback?</p>
        <p className="text-sm text-muted-foreground">
          A quick rating helps us improve the naming ceremony.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        className="shrink-0 border-primary/30"
        onClick={onLeaveFeedback}
      >
        <MessageSquareText className="size-4" aria-hidden />
        Leave feedback
      </Button>
    </div>
  )
}

type CertificateFeedbackDialogProps = {
  catId: Id<"cats">
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmitSuccess: () => void
}

export function CertificateFeedbackDialog({
  catId,
  open,
  onOpenChange,
  onSubmitSuccess,
}: CertificateFeedbackDialogProps) {
  return (
    <ResponsiveDialog
      title="Got 30 seconds for beta feedback?"
      description="A quick star rating helps us improve. Comments are optional."
      open={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-md"
    >
      <div className="flex flex-col gap-4">
        <FeedbackForm
          source="certificate"
          catId={catId}
          onSuccess={onSubmitSuccess}
        />
        <Button
          type="button"
          variant="ghost"
          className="w-fit text-muted-foreground"
          onClick={() => onOpenChange(false)}
        >
          Not now
        </Button>
      </div>
    </ResponsiveDialog>
  )
}
