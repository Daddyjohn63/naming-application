"use client"

import { Lock } from "lucide-react"

import type { Doc } from "@workspace/backend/_generated/dataModel"
import { useCeremonyUnlock } from "@/modules/ceremony/lib/use-ceremony-unlock"
import { CEREMONY_UNLOCK_SECTION_ID } from "@/modules/ceremony/lib/scroll-to-ceremony-unlock"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

import { dataComponent } from "@/lib/data-component"

type CeremonyUnlockPromptProps = {
  cat: Doc<"cats">
  /** Hidden on large screens where the sticky sidebar owns unlock UX. */
  className?: string
}

/**
 * Main-column unlock CTA for narrow viewports — placed near the three-name cards
 * so owners do not scroll past curation to reach the sidebar unlock panel.
 */
export function CeremonyUnlockPrompt({
  cat,
  className,
}: CeremonyUnlockPromptProps) {
  const {
    showUnlockPrompt,
    showUnlockCheckout,
    showStubUnlock,
    showAwaitingPaymentPlaceholder,
    unlockEnabled,
    unlocking,
    paying,
    onBeginUnlock,
  } = useCeremonyUnlock(cat)

  if (!showUnlockPrompt && !showAwaitingPaymentPlaceholder) {
    return null
  }

  return (
    <Card
      {...dataComponent("CeremonyUnlockPrompt")}
      id={CEREMONY_UNLOCK_SECTION_ID}
      className={cn(
        "ceremony-highlight-panel scroll-mt-24 border-primary/35 shadow-sm lg:hidden",
        className
      )}
    >
      <CardHeader className="gap-3 border-b pb-4">
        <div className="flex items-center gap-2">
          <Lock className="size-4 shrink-0 text-primary" aria-hidden />
          <CardTitle className="text-base">
            {showStubUnlock
              ? "Complete your unlock"
              : "Unlock the rest of your ceremony"}
          </CardTitle>
        </div>
        <CardDescription className="text-sm leading-relaxed">
          {showStubUnlock ? (
            <>
              Your family name and shortlist stay saved if checkout is
              interrupted.
            </>
          ) : cat.selectedFamilyName !== undefined ? (
            <>
              You chose{" "}
              <span className="font-semibold text-foreground">
                {cat.selectedFamilyName}
              </span>
              {" — "}
              unlock once per cat to reveal cat-world and ineffable names, then
              receive your certificate.
            </>
          ) : (
            <>
              Your family name is free. Unlock once per cat to reveal cat-world
              and ineffable names, then receive your certificate.
            </>
          )}
        </CardDescription>
      </CardHeader>

      <div className="flex flex-col gap-4 px-4 py-4">
        {showUnlockCheckout || showStubUnlock ? (
          <p className="text-sm font-semibold tracking-tight text-foreground">
            No charge
          </p>
        ) : null}

        {showUnlockCheckout ? (
          <>
            <p className="text-sm text-muted-foreground">
              {unlockEnabled
                ? "Ready when you are — your shortlist and favourite stay saved if checkout is interrupted."
                : "Save at least one name to your shortlist and pick a favourite to unlock."}
            </p>
            <Button
              type="button"
              size="lg"
              className="w-full sm:w-auto"
              disabled={!unlockEnabled || unlocking}
              onClick={() => void onBeginUnlock()}
            >
              {unlocking ? "Opening unlock…" : "Unlock now"}
            </Button>
          </>
        ) : null}

        {showStubUnlock ? (
          <>
            <p className="text-sm text-muted-foreground">
              Stub unlock for development — no charge. Your names remain visible
              while you complete payment.
            </p>
            <Button
              type="button"
              size="lg"
              className="w-full sm:w-auto"
              disabled={paying || unlocking}
              onClick={() => void onBeginUnlock()}
            >
              {paying || unlocking
                ? "Unlocking…"
                : "Unlock now ($3.99 — no charge)"}
            </Button>
          </>
        ) : null}

        {showAwaitingPaymentPlaceholder ? (
          <p className="text-sm text-muted-foreground">
            Checkout is not configured in this environment. Your family name and
            shortlist are saved — return when payment is available.
          </p>
        ) : null}
      </div>
    </Card>
  )
}
