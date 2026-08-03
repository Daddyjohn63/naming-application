"use client"

/**
 * Public share page body for `/c/[shareId]`.
 * Same empty state when the token is unknown or sharing is off.
 */

import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { format } from "date-fns"

import { api } from "@workspace/backend/_generated/api"
import { APP_NAME } from "@workspace/shared/constants/app"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import type { FunctionReturnType } from "convex/server"

import { dataComponent } from "@/lib/data-component"
import { useCertificatePhotoDataUrl } from "@/modules/ceremony/lib/use-certificate-download"
import type { CeremonyCertificateData } from "@/modules/ceremony/ui/components/ceremony-certificate-document"
import { CeremonyCertificateDocument } from "@/modules/ceremony/ui/components/ceremony-certificate-document"

type PublicCertificateDoc = NonNullable<
  FunctionReturnType<typeof api.certificate.getPublicCertificate>
>

export function PublicCertificateView() {
  const params = useParams()
  const raw = params.shareId
  const shareId =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined

  const certificate = useQuery(
    api.certificate.getPublicCertificate,
    shareId !== undefined && shareId.length > 0 ? { shareId } : "skip",
  )

  if (shareId === undefined || shareId.length === 0) {
    return <PublicCertificateUnavailable />
  }

  if (certificate === undefined) {
    return <PublicCertificateSkeleton />
  }

  if (certificate === null) {
    return <PublicCertificateUnavailable />
  }

  return <PublicCertificateBody certificate={certificate} />
}

function PublicCertificateBody({
  certificate,
}: {
  certificate: PublicCertificateDoc
}) {
  const photoSrc = useCertificatePhotoDataUrl(
    certificate.photoUrl ?? undefined,
  )

  const dateLabel =
    certificate.ceremonyCompletedAt !== null
      ? `Named on ${format(new Date(certificate.ceremonyCompletedAt), "d MMMM yyyy")}`
      : "Named with care"

  const data: CeremonyCertificateData = {
    everydayName: certificate.everydayName,
    catWorldName: certificate.catWorldName,
    ineffableName: certificate.ineffableName,
    everydayNameRationale:
      certificate.everydayNameRationale.length > 0
        ? certificate.everydayNameRationale
        : undefined,
    catWorldNameRationale:
      certificate.catWorldNameRationale.length > 0
        ? certificate.catWorldNameRationale
        : undefined,
    ineffableNameRationale:
      certificate.ineffableNameRationale.length > 0
        ? certificate.ineffableNameRationale
        : undefined,
    summaryText: certificate.summaryText ?? undefined,
    photoSrc,
    dateLabel,
  }

  return (
    <div
      {...dataComponent("PublicCertificateView")}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:py-14"
    >
      <div className="flex flex-col gap-2 text-center">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          {APP_NAME}
        </p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-balance">
          {certificate.everydayName}&rsquo;s naming certificate
        </h1>
        <p className="text-sm text-muted-foreground text-pretty">
          A keepsake from their naming ceremony — family name, cat-world name,
          and ineffable near-name.
        </p>
      </div>

      <CeremonyCertificateDocument data={data} />

      <div className="flex flex-col items-center gap-3 border-t border-border/50 pt-8 text-center">
        <p className="max-w-md text-sm text-muted-foreground text-pretty">
          Curious what your own cat&apos;s three names might be?
        </p>
        <Button asChild>
          <Link href="/">Name your cat</Link>
        </Button>
      </div>
    </div>
  )
}

function PublicCertificateSkeleton() {
  return (
    <div
      {...dataComponent("PublicCertificateSkeleton")}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-14"
    >
      <Skeleton className="mx-auto h-8 w-64 rounded-md" />
      <Skeleton className="mx-auto h-4 w-96 max-w-full rounded-md" />
      <Skeleton className="h-150 w-full rounded-2xl" />
    </div>
  )
}

function PublicCertificateUnavailable() {
  return (
    <div
      {...dataComponent("PublicCertificateUnavailable")}
      className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-4 px-4 py-20 text-center"
    >
      <h1 className="font-serif text-2xl font-semibold tracking-tight">
        Certificate unavailable
      </h1>
      <p className="text-sm text-muted-foreground text-pretty">
        This link may be private, expired, or incorrect. Ask the owner to share
        it again from their certificate page.
      </p>
      <Button variant="outline" asChild>
        <Link href="/">Visit {APP_NAME}</Link>
      </Button>
    </div>
  )
}
