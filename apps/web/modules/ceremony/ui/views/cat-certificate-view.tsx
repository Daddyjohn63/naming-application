"use client"

/**
 * KB-011 — `/cats/[catId]/certificate` page body.
 *
 * Guards: redirects back to the ceremony when the three names aren't chosen
 * yet (KB-012 illegal-skip recovery). Pre-completion the user can free-text
 * edit the family name; generating stores the PDF and marks the ceremony
 * complete (final — name editing locks), then reveals share + download links.
 */

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { format } from "date-fns"
import { ArrowLeft, BadgeCheck, Download, ImageIcon, PencilLine } from "lucide-react"

import { api } from "@workspace/backend/_generated/api"
import { getConvexErrorMessage } from "@workspace/shared/utils/convex-error"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "@workspace/ui/components/sonner"

import { dataComponent } from "@/lib/data-component"
import type { CatCeremonyDoc } from "@/modules/cats/lib/cat-ceremony-types"
import { allThreeCeremonyNamesChosen } from "@/modules/ceremony/lib/ceremony-naming-view"
import {
  ceremonyFieldLabelClassName,
  ceremonyInputClassName,
} from "@/modules/ceremony/lib/ceremony-styles"
import {
  useCertificateDownload,
  useCertificatePhotoDataUrl,
} from "@/modules/ceremony/lib/use-certificate-download"
import { CertificateRecordingOverlay } from "@/modules/ceremony/ui/components/certificate-recording-overlay"
import { CertificateSharePanel } from "@/modules/ceremony/ui/components/certificate-share-panel"
import type { CeremonyCertificateData } from "@/modules/ceremony/ui/components/ceremony-certificate-document"
import { CeremonyCertificateDocument } from "@/modules/ceremony/ui/components/ceremony-certificate-document"
import { CertificateFeedbackBanner, CertificateFeedbackDialog, useCertificateFeedbackState } from "@/modules/feedback/ui/components/certificate-feedback-prompt"

export function CatCertificateView() {
  const params = useParams()
  const raw = params.catId
  const catIdParam =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined

  const cat = useQuery(
    api.cats.getCatByIdForOwner,
    catIdParam !== undefined ? { catId: catIdParam } : "skip"
  )

  if (catIdParam === undefined || cat === undefined) {
    return <CatCertificateSkeleton />
  }
  if (cat === null) {
    return <CatCertificateNotFound />
  }
  return <CatCertificateBody cat={cat} />
}

function CatCertificateBody({ cat }: { cat: CatCeremonyDoc }) {
  const router = useRouter()
  const eligible = allThreeCeremonyNamesChosen(cat)
  const complete = cat.ceremonyStep === "ceremony_complete"
  const [feedbackOpenSignal, setFeedbackOpenSignal] = React.useState(0)

  React.useEffect(() => {
    if (!eligible) {
      router.replace(`/cats/${encodeURIComponent(cat._id)}`)
    }
  }, [cat._id, eligible, router])

  const latestSummary = useQuery(api.catSummary.getLatestSummaryForOwner, {
    catId: cat._id,
  })
  const photoSrc = useCertificatePhotoDataUrl(cat.photoUrl)

  const captureRef = React.useRef<HTMLDivElement | null>(null)
  const everydayName = cat.selectedFamilyName ?? ""
  const { working, downloadPdf, downloadPng } = useCertificateDownload({
    catId: cat._id,
    everydayName,
    alreadyComplete: complete,
    captureRef,
    onCeremonyComplete: () => {
      setFeedbackOpenSignal((n) => n + 1)
    },
  })

  const feedback = useCertificateFeedbackState({
    ceremonyComplete: complete,
    openSignal: feedbackOpenSignal,
  })

  if (!eligible) {
    return <CatCertificateSkeleton />
  }

  const completedAt = cat.ceremonyCompletedAt
  const certificateData: CeremonyCertificateData = {
    everydayName,
    catWorldName: cat.selectedCatWorldName ?? "",
    ineffableName: cat.selectedIneffableName ?? "",
    everydayNameRationale: cat.selectedFamilyRationale,
    catWorldNameRationale: cat.selectedCatWorldRationale,
    ineffableNameRationale: cat.selectedIneffableRationale,
    summaryText: latestSummary?.summaryText,
    photoSrc,
    dateLabel: `Named on ${format(
      completedAt !== undefined ? new Date(completedAt) : new Date(),
      "d MMMM yyyy"
    )}`,
  }

  return (
    <div
      {...dataComponent("CatCertificateView")}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={`/cats/${encodeURIComponent(cat._id)}`}>
            <ArrowLeft className="size-4" aria-hidden />
            Back to ceremony
          </Link>
        </Button>
        {complete ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ceremony-complete/40 bg-ceremony-complete/10 px-3 py-1 text-xs font-medium text-ceremony-complete">
            <BadgeCheck className="size-3.5" aria-hidden />
            Ceremony complete
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {complete ? "Your naming certificate" : "Prepare your certificate"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {complete
            ? "Your ceremony is complete. Download as PDF or PNG, or share a private link with friends."
            : "Review your cat's completed profile below. You can still adjust the family name before generating."}
        </p>
      </div>

      <CertificateFeedbackBanner
        loading={feedback.loading}
        alreadyReviewed={feedback.alreadyReviewed}
        canLeaveFeedback={feedback.canLeaveFeedback}
        onLeaveFeedback={feedback.openPrompt}
      />

      {!complete ? <EverydayNameEditCard cat={cat} disabled={working} /> : null}

      <CeremonyCertificateDocument data={certificateData} />

      {complete ? (
        <CertificateSharePanel
          catId={cat._id}
          everydayName={everydayName}
          shareEnabled={cat.certificateShareEnabled === true}
          shareId={cat.certificateShareId}
        />
      ) : null}

      <Card className="ceremony-highlight-panel border-primary/30">
        <div className="flex flex-col gap-3 px-4 py-5">
          {!complete ? (
            <p className="text-sm text-muted-foreground">
              Generating your certificate completes the ceremony — your three
              names become final and can no longer be changed.
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              disabled={working || (latestSummary === undefined && !complete)}
              onClick={() => void downloadPdf()}
            >
              <Download className="size-4" aria-hidden />
              {working
                ? "Preparing…"
                : complete
                  ? "Download PDF"
                  : "Generate certificate"}
            </Button>
            {complete ? (
              <Button
                type="button"
                variant="outline"
                className="border-primary/30"
                disabled={working}
                onClick={() => void downloadPng()}
              >
                <ImageIcon className="size-4" aria-hidden />
                Download PNG
              </Button>
            ) : null}
            {feedback.canLeaveFeedback ? (
              <Button
                type="button"
                variant="outline"
                className="border-primary/30"
                onClick={feedback.openPrompt}
              >
                Leave feedback
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      <CertificateFeedbackDialog
        catId={cat._id}
        open={feedback.open}
        onOpenChange={feedback.handleOpenChange}
        onSubmitSuccess={feedback.onSubmitSuccess}
      />

      {/* First generate only — re-downloads keep the quieter “Preparing…” button. */}
      <CertificateRecordingOverlay open={working && !complete} />

      {/* Off-screen fixed-width instance captured for the PDF (consistent on all viewports). */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-[-2000px]"
      >
        <CeremonyCertificateDocument
          ref={captureRef}
          data={certificateData}
          fixed
        />
      </div>
    </div>
  )
}

function EverydayNameEditCard({
  cat,
  disabled,
}: {
  cat: CatCeremonyDoc
  disabled: boolean
}) {
  const updateEverydayName = useMutation(api.certificate.updateEverydayName)
  const currentName = cat.selectedFamilyName ?? ""
  const [name, setName] = React.useState(currentName)
  const [saving, setSaving] = React.useState(false)

  // Re-sync the input if the server value changes (e.g. after save).
  React.useEffect(() => {
    setName(currentName)
  }, [currentName])

  const trimmed = name.trim()
  const dirty = trimmed !== currentName && trimmed.length > 0

  const onSave = async () => {
    if (!dirty || saving) {
      return
    }
    setSaving(true)
    try {
      await updateEverydayName({ catId: cat._id, name: trimmed })
      toast.success("Family name updated.")
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card {...dataComponent("EverydayNameEditCard")} className="ceremony-panel">
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <PencilLine className="size-4 shrink-0 text-primary" aria-hidden />
          <CardTitle className="text-base">Family name</CardTitle>
        </div>
        <CardDescription>
          The first ceremony name — the one your family will use every day. You
          can change it here before the certificate is generated.
        </CardDescription>
      </CardHeader>
      <form
        className="flex flex-col gap-3 px-4 py-5 sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault()
          void onSave()
        }}
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label
            htmlFor="everyday-name"
            className={ceremonyFieldLabelClassName}
          >
            Name
          </label>
          <Input
            id="everyday-name"
            value={name}
            maxLength={80}
            disabled={disabled || saving}
            onChange={(event) => setName(event.target.value)}
            className={ceremonyInputClassName}
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          className="border-primary/30"
          disabled={disabled || saving || !dirty}
        >
          {saving ? "Saving…" : "Save name"}
        </Button>
      </form>
    </Card>
  )
}

function CatCertificateSkeleton() {
  return (
    <div
      {...dataComponent("CatCertificateSkeleton")}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8"
    >
      <Skeleton className="h-8 w-40 rounded-md" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-128 w-full rounded-2xl" />
    </div>
  )
}

function CatCertificateNotFound() {
  return (
    <div
      {...dataComponent("CatCertificateNotFound")}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-4 px-4 py-16 text-center"
    >
      <h1 className="text-xl font-semibold">Ceremony not found</h1>
      <p className="text-sm text-muted-foreground">
        This ceremony doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Button variant="outline" asChild className="border-primary/30">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  )
}
