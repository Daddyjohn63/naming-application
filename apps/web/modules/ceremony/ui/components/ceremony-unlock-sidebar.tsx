"use client"

import Link from "next/link"
import { Lock } from "lucide-react"

import type { Doc } from "@workspace/backend/_generated/dataModel"
import { showCeremonyUnlockSidebar } from "@/modules/ceremony/lib/ceremony-layout"
import { useCeremonyStageContinue } from "@/modules/ceremony/lib/use-ceremony-stage-continue"
import { useCeremonyUnlock } from "@/modules/ceremony/lib/use-ceremony-unlock"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { dataComponent } from "@/lib/data-component"

type CeremonyUnlockSidebarProps = {
  cat: Doc<"cats">
}

/**
 * KB-006A — persistent unlock sidebar: teasers, pricing, Unlock now, Save & exit.
 * KB-007 stub unlock on `awaiting_payment`; KB-009/010 continue CTAs after unlock.
 */
export function CeremonyUnlockSidebar({ cat }: CeremonyUnlockSidebarProps) {
  const {
    continuingToCatWorld,
    continueToCatWorld,
    showContinueToCatWorld,
  } = useCeremonyStageContinue(cat)

  const {
    unlocked,
    step,
    unlockEnabled,
    showUnlockCheckout,
    showStubUnlock,
    unlocking,
    paying,
    onBeginUnlock,
    onStubUnlock,
  } = useCeremonyUnlock(cat)

  if (!showCeremonyUnlockSidebar(cat)) {
    return null
  }

  const title =
    step === "awaiting_payment"
      ? "Complete your unlock"
      : step === "awaiting_cat_world_names"
        ? "Generating cat-world names"
        : step === "naming_cat_world" && cat.selectedCatWorldName === undefined
          ? "Continue your ceremony"
          : step === "naming_cat_world" && cat.selectedCatWorldName !== undefined
            ? "Almost there"
            : step === "naming_ineffable" && cat.selectedIneffableName === undefined
              ? "Almost there"
              : unlocked
                ? "Your ceremony"
                : "What's next"

  const description =
    step === "awaiting_payment"
      ? "Your family name and shortlist stay saved if checkout is interrupted."
      : step === "awaiting_cat_world_names"
        ? "We're crafting distinctive cat-world names — this usually takes a moment."
        : step === "naming_cat_world" && cat.selectedCatWorldName === undefined
          ? "Choose a cat-world name next. You can still switch your family name favourite from the shortlist above."
          : step === "naming_cat_world" && cat.selectedCatWorldName !== undefined
            ? "Continue in the main column when you're ready for your ineffable near-name."
            : step === "naming_ineffable" && cat.selectedIneffableName === undefined
              ? "One more stage — playful approximations of the secret name."
              : unlocked
                ? "Switch stages in the main column to review or change your picks before the certificate."
                : "Your family name is free. Unlock once per cat to reveal cat-world and ineffable names, then receive your certificate."

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
        {showUnlockCheckout || showStubUnlock ? (
          <div className="hidden flex-col gap-4 lg:flex">
            <p className="text-foreground text-sm font-semibold tracking-tight">
              $3.99 USD
            </p>

            {showUnlockCheckout ? (
              <>
                <p className="text-muted-foreground text-sm">
                  {unlockEnabled
                    ? "Ready when you are — your shortlist and favourite stay saved if checkout is interrupted."
                    : "Save at least one name to your shortlist and pick a favourite to unlock."}
                </p>
                <Button
                  type="button"
                  disabled={!unlockEnabled || unlocking}
                  onClick={() => void onBeginUnlock()}
                >
                  {unlocking ? "Opening unlock…" : "Unlock now"}
                </Button>
              </>
            ) : null}

            {showStubUnlock ? (
              <>
                <p className="text-muted-foreground text-sm">
                  Stub unlock for development — no charge. Your names remain visible
                  while you complete payment.
                </p>
                <Button
                  type="button"
                  disabled={paying}
                  onClick={() => void onStubUnlock()}
                >
                  {paying ? "Unlocking…" : "Unlock now ($3.99 — no charge)"}
                </Button>
              </>
            ) : null}
          </div>
        ) : null}

        {unlocked && showContinueToCatWorld ? (
          <Button
            type="button"
            variant="default"
            disabled={continuingToCatWorld}
            onClick={() => void continueToCatWorld()}
          >
            {continuingToCatWorld ? "Starting…" : "Continue to cat-world names"}
          </Button>
        ) : null}

        <Button variant="outline" asChild className="border-primary/30">
          <Link href="/dashboard">Save &amp; exit</Link>
        </Button>
      </div>
    </Card>
  )
}
