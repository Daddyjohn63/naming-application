"use client"

import * as React from "react"
import Link from "next/link"
import { useMutation } from "convex/react"
import { Lock } from "lucide-react"

import { api } from "@workspace/backend/_generated/api"
import type { Doc } from "@workspace/backend/_generated/dataModel"
import {
  isCeremonyUnlocked,
  showCeremonyUnlockSidebar,
} from "@/modules/ceremony/lib/ceremony-layout"
import { getConvexErrorMessage } from "@workspace/shared/utils/convex-error"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"

import { dataComponent } from "@/lib/data-component"

type CeremonyUnlockSidebarProps = {
  cat: Doc<"cats">
}

/**
 * KB-006A — persistent unlock sidebar: teasers, pricing, Unlock now, Save & exit.
 * KB-007 checkout content merges here when `awaiting_payment`.
 */
export function CeremonyUnlockSidebar({ cat }: CeremonyUnlockSidebarProps) {
  const beginUnlock = useMutation(api.familyNaming.beginUnlock)
  const [unlocking, setUnlocking] = React.useState(false)

  if (!showCeremonyUnlockSidebar(cat)) {
    return null
  }

  const unlocked = isCeremonyUnlocked(cat)
  const step = cat.ceremonyStep
  const hasFavourite =
    cat.selectedFamilyName !== undefined &&
    cat.selectedFamilyRationale !== undefined

  const unlockEnabled =
    step === "family_curation" && hasFavourite && !unlocked

  const onUnlock = async () => {
    setUnlocking(true)
    try {
      await beginUnlock({ catId: cat._id })
      toast.success("Ready to unlock the rest of your ceremony.")
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setUnlocking(false)
    }
  }

  const title =
    step === "awaiting_payment"
      ? "Complete your unlock"
      : unlocked && step === "naming_cat_world"
        ? "Continue your ceremony"
        : "What's next"

  const description =
    step === "awaiting_payment"
      ? "Your everyday name and shortlist stay saved if checkout is interrupted."
      : unlocked && step === "naming_cat_world"
        ? "Your everyday name is locked in. Choose a cat-world name next."
        : "Your everyday family name is free. Unlock once per cat to reveal cat-world and ineffable names, then receive your certificate."

  return (
    <Card {...dataComponent("CeremonyUnlockSidebar")} className="ceremony-sidebar-panel border-primary/20">
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <Lock className="text-primary size-4 shrink-0" aria-hidden />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <div className="flex flex-col gap-4 px-4 py-6">
        {step === "awaiting_payment" || (step === "family_curation" && !unlocked) ? (
          <p className="text-foreground text-sm font-semibold tracking-tight">
            £2.99 · $3.99
          </p>
        ) : null}

        {step === "family_curation" && !unlocked ? (
          <>
            <p className="text-muted-foreground text-sm">
              {unlockEnabled
                ? "Ready when you are — your shortlist and favourite stay saved if checkout is interrupted."
                : "Save at least one name to your shortlist and pick a favourite to unlock."}
            </p>
            <Button
              type="button"
              disabled={!unlockEnabled || unlocking}
              onClick={() => void onUnlock()}
            >
              {unlocking ? "Opening unlock…" : "Unlock now"}
            </Button>
          </>
        ) : null}

        {step === "awaiting_payment" ? (
          <>
            <p className="text-muted-foreground text-sm">
              Stripe checkout and stub unlock arrive in the next milestone. Your
              names remain visible while you complete payment.
            </p>
            <Button type="button" disabled aria-disabled>
              Unlock now — coming soon
            </Button>
          </>
        ) : null}

        {unlocked && step === "naming_cat_world" ? (
          <Button type="button" variant="default" disabled aria-disabled>
            Continue to cat-world — coming soon
          </Button>
        ) : null}

        <Button variant="outline" asChild className="border-primary/30">
          <Link href="/dashboard">Save &amp; exit</Link>
        </Button>
      </div>
    </Card>
  )
}
