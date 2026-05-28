"use client"

/**
 * KB-006 paywall teaser — Unlock now (KB-007 entry).
 */

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

type FamilyNamePaywallTeaserProps = {
  unlockEnabled: boolean
  unlocking: boolean
  onUnlock: () => void
}

export function FamilyNamePaywallTeaser({
  unlockEnabled,
  unlocking,
  onUnlock,
}: FamilyNamePaywallTeaserProps) {
  return (
    <Card className="ceremony-sidebar-panel border-primary/20">
      <CardHeader className="border-b">
        <CardTitle className="text-base">Unlock the rest of the ceremony</CardTitle>
        <CardDescription>
          Your everyday family name is free. Unlock once per cat to reveal
          cat-world and ineffable names, then receive your certificate.
        </CardDescription>
      </CardHeader>

      <div className="flex flex-col gap-4 px-4 py-6">
        <p className="text-sm text-muted-foreground">
          {unlockEnabled
            ? "Ready when you are — your shortlist and favourite stay saved if checkout is interrupted."
            : "Save at least one name to your shortlist and pick a favourite to unlock."}
        </p>

        <Button
          type="button"
          disabled={!unlockEnabled || unlocking}
          onClick={onUnlock}
        >
          {unlocking ? "Opening unlock…" : "Unlock now"}
        </Button>
      </div>
    </Card>
  )
}
