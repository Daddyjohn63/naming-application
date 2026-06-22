"use client"

/**
 * KB-010 → KB-011 handoff — certificate generation CTA (PDF render arrives in KB-011).
 */

import type { Doc } from "@workspace/backend/_generated/dataModel"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { dataComponent } from "@/lib/data-component"

type CeremonyCertificatePrepProps = {
  cat: Doc<"cats">
}

function allThreeNamesChosen(cat: Doc<"cats">): boolean {
  return (
    cat.selectedFamilyName !== undefined &&
    cat.selectedFamilyRationale !== undefined &&
    cat.selectedCatWorldName !== undefined &&
    cat.selectedCatWorldRationale !== undefined &&
    cat.selectedIneffableName !== undefined &&
    cat.selectedIneffableRationale !== undefined
  )
}

export function CeremonyCertificatePrep({ cat }: CeremonyCertificatePrepProps) {
  if (!allThreeNamesChosen(cat)) {
    return null
  }

  return (
    <Card
      {...dataComponent("CeremonyCertificatePrep")}
      className="ceremony-highlight-panel border-primary/30"
    >
      <CardHeader className="border-b">
        <CardTitle className="text-base">Your three names are complete</CardTitle>
        <CardDescription>
          You can still switch between cat-world and ineffable above to change your
          mind. When you&apos;re happy, generate your whimsical naming certificate.
        </CardDescription>
      </CardHeader>
      <div className="flex flex-col gap-3 px-4 py-6">
        <p className="text-muted-foreground text-sm">
          Certificate preview and PDF download arrive in the next milestone — your
          selections are saved and ready.
        </p>
        <Button type="button" disabled aria-disabled>
          Generate certificate — coming soon
        </Button>
      </div>
    </Card>
  )
}
