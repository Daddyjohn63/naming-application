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

import { dataComponent } from "@/lib/data-component"

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
    <Card
      {...dataComponent("FamilyNamePaywallTeaser")}
      className="ceremony-sidebar-panel border-primary/20"
    >
      <CardHeader className="border-b">
        <CardTitle className="text-base">
          Pick your favourite family name and unlock the rest of the ceremony.
          You can always change your favourite family name later if you want to.
        </CardTitle>
        <CardDescription>
          Your family name is free. As our app is currently in Beta phase you
          can unlock the cat-world and ineffable names for free,then receive
          your certificate for free.
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
