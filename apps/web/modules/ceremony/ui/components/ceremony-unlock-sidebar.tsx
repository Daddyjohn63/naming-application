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
import { CAT_WORLD_NAMES_SIDEBAR } from "@/modules/cats/lib/pipeline-status-copy"

type CeremonyUnlockSidebarProps = {
  cat: Doc<"cats">
}

type UnlockSidebarCopyInput = {
  step: Doc<"cats">["ceremonyStep"]
  selectedCatWorldName: string | undefined
  selectedIneffableName: string | undefined
  unlocked: boolean
}

/** Ordered precedence for unlock-sidebar title/description copy. */
function unlockSidebarCopy({
  step,
  selectedCatWorldName,
  selectedIneffableName,
  unlocked,
}: UnlockSidebarCopyInput): { title: string; description: string } {
  if (step === "awaiting_payment") {
    return {
      title: "Complete your unlock",
      description:
        "Your family name and shortlist stay saved if checkout is interrupted.",
    }
  }
  if (step === "awaiting_cat_world_names") {
    return CAT_WORLD_NAMES_SIDEBAR
  }
  if (step === "naming_cat_world" && selectedCatWorldName === undefined) {
    return {
      title: "Continue your ceremony",
      description:
        "Choose a cat-world name next. You can still switch your family name favourite from its shortlist.",
    }
  }
  if (step === "naming_cat_world" && selectedCatWorldName !== undefined) {
    return {
      title: "Almost there",
      description:
        "Continue when you're ready for your ineffable near-name.",
    }
  }
  if (step === "naming_ineffable" && selectedIneffableName === undefined) {
    return {
      title: "Almost there",
      description:
        "One more stage — playful approximations of the secret name.",
    }
  }
  if (unlocked) {
    return {
      title: "Your naming ceremony",
      description:
        "Keep going with your naming — you can change a favourite from your shortlist until the certificate is generated.",
    }
  }
  return {
    title: "What's next?",
    description:
      "Your family name is free. As our app is currently in Beta phase you can unlock the cat-world and ineffable names for free, then receive your certificate for free.",
  }
}

/**
 * KB-006A — persistent unlock sidebar: teasers, pricing, Unlock now, Save & exit.
 * KB-007 stub unlock on `awaiting_payment`; KB-009/010 continue CTAs after unlock.
 * Hidden once all three names are chosen — `CeremonyCertificatePrep` then owns
 * certificate create/view and Save & exit.
 */
export function CeremonyUnlockSidebar({ cat }: CeremonyUnlockSidebarProps) {
  const { continuingToCatWorld, continueToCatWorld, showContinueToCatWorld } =
    useCeremonyStageContinue(cat)

  const {
    unlocked,
    step,
    unlockEnabled,
    showUnlockCheckout,
    showStubUnlock,
    showAwaitingPaymentPlaceholder,
    unlocking,
    paying,
    onBeginUnlock,
    onStubUnlock,
  } = useCeremonyUnlock(cat)

  if (!showCeremonyUnlockSidebar(cat)) {
    return null
  }

  const { title, description } = unlockSidebarCopy({
    step,
    selectedCatWorldName: cat.selectedCatWorldName,
    selectedIneffableName: cat.selectedIneffableName,
    unlocked,
  })

  return (
    <Card
      {...dataComponent("CeremonyUnlockSidebar")}
      className="ceremony-sidebar-panel border-primary/20"
    >
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <Lock className="size-4 shrink-0 text-primary" aria-hidden />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <div className="flex flex-col gap-4 px-4 py-6">
        {showUnlockCheckout || showStubUnlock ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold tracking-tight text-foreground">
              Free during beta
            </p>

            {showUnlockCheckout ? (
              <>
                <p className="text-sm text-muted-foreground">
                  {unlockEnabled
                    ? "Ready when you are — your shortlist and favourite stay saved if checkout is interrupted."
                    : "Save at least one name to your shortlist and pick a favourite to unlock."}
                </p>
                <Button
                  type="button"
                  disabled={!unlockEnabled || unlocking}
                  onClick={() => void onBeginUnlock()}
                >
                  {unlocking ? "Opening unlock…" : "Unlock"}
                </Button>
              </>
            ) : null}

            {showStubUnlock ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Unlock is free during beta. Your names remain visible while
                  you continue.
                </p>
                <Button
                  type="button"
                  disabled={paying}
                  onClick={() => void onStubUnlock()}
                >
                  {paying ? "Unlocking…" : "Unlock — free during beta"}
                </Button>
              </>
            ) : null}
          </div>
        ) : null}

        {showAwaitingPaymentPlaceholder ? (
          <p className="text-sm text-muted-foreground">
            Checkout is disabled in this environment (stub unlock requires{" "}
            <code className="text-foreground">
              NEXT_PUBLIC_ENABLE_STUB_UNLOCK=true
            </code>
            ). Your family name and shortlist are saved — return when payment is
            available.
          </p>
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
