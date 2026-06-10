/**
 * Fallback card when the ceremony step has no dedicated panel in this view yet.
 *
 * Shown in the standard (non-tunnel) layout when every panel flag is false —
 * typically for future journey steps or edge cases not wired up in KB-004–006.
 */

import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { dataComponent } from "@/lib/data-component"

export function CatCeremonyLaterStepPlaceholder() {
  return (
    <>
      <Card {...dataComponent("CatCeremonyLaterStepPlaceholder")} className="ceremony-panel">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Continue your ceremony</CardTitle>
          <CardDescription>
            This step is handled in a later part of the journey. Use the progress
            bar above or return from the dashboard.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </>
  )
}
