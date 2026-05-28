"use client"

/**
 * KB-007 placeholder — unlock step until Stripe/stub payment is implemented.
 */

import Link from "next/link"

import type { Doc } from "@workspace/backend/_generated/dataModel"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

type CeremonyUnlockPlaceholderProps = {
  cat: Doc<"cats">
}

export function CeremonyUnlockPlaceholder({ cat }: CeremonyUnlockPlaceholderProps) {
  return (
    <Card className="ceremony-panel">
      <CardHeader className="border-b">
        <CardTitle className="text-base">Unlock your ceremony</CardTitle>
        <CardDescription>
          Payment checkout (Stripe or stub unlock) arrives in the next milestone.
          Your family name choice
          {cat.selectedFamilyName !== undefined
            ? ` (“${cat.selectedFamilyName}”)`
            : ""}{" "}
          and shortlist are saved — you can leave and return here.
        </CardDescription>
      </CardHeader>
      <div className="flex flex-wrap gap-3 px-4 py-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </Card>
  )
}
