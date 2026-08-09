"use client"

/**
 * KB-011 — certificate tab card: hands off to `/cats/[catId]/certificate`
 * where the everyday-name edit, preview, and PDF download live.
 */

import Link from "next/link"
import { Award } from "lucide-react"

import type { Doc } from "@workspace/backend/_generated/dataModel"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { dataComponent } from "@/lib/data-component"
import { allThreeCeremonyNamesChosen } from "@/modules/ceremony/lib/ceremony-naming-view"
import { CEREMONY_CERTIFICATE_PREP_SECTION_ID } from "@/modules/ceremony/lib/scroll-to-ceremony-certificate-prep"

type CeremonyCertificatePrepProps = {
  cat: Doc<"cats">
}

export function CeremonyCertificatePrep({ cat }: CeremonyCertificatePrepProps) {
  if (!allThreeCeremonyNamesChosen(cat)) {
    return null
  }

  const complete = cat.ceremonyStep === "ceremony_complete"
  const href = `/cats/${encodeURIComponent(cat._id)}/certificate`

  return (
    <Card
      {...dataComponent("CeremonyCertificatePrep")}
      id={CEREMONY_CERTIFICATE_PREP_SECTION_ID}
      className="ceremony-highlight-panel scroll-mt-24 border-primary/30"
    >
      <CardHeader className="border-b">
        <CardTitle className="text-base">
          {complete
            ? "Your ceremony is complete"
            : "Your three names are complete"}
        </CardTitle>
        <CardDescription>
          {complete
            ? "Your certificate has been generated. View it or download the PDF again any time."
            : "You can still change a favourite from the shortlists under the name cards. When you're happy, create your whimsical naming certificate."}
        </CardDescription>
      </CardHeader>
      <div className="flex flex-col gap-3 px-4 py-6">
        {!complete ? (
          <p className="text-sm text-muted-foreground">
            On the certificate page you can adjust the family name one last time
            before generating — generating makes your names final. Shortlists
            stay locked at this stage.
          </p>
        ) : null}
        <Button asChild>
          <Link href={href}>
            <Award className="size-4" aria-hidden />
            {complete ? "View certificate" : "Create certificate"}
          </Link>
        </Button>
        {!complete ? (
          <Button variant="outline" asChild className="border-primary/30">
            <Link href="/dashboard">Save &amp; exit</Link>
          </Button>
        ) : null}
      </div>
    </Card>
  )
}
