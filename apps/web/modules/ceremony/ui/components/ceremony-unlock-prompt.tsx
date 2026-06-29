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
    unlockEnabled,
    unlocking,
    paying,
    onBeginUnlock,
    onStubUnlock,
  } = useCeremonyUnlock(cat)

  if (!showUnlockPrompt) {
    return null
  }

  return (
    <Card
      {...dataComponent("CeremonyUnlockPrompt")}
      id={CEREMONY_UNLOCK_SECTION_ID}
      className={cn(
        "ceremony-highlight-panel scroll-mt-24 border-primary/35 shadow-sm lg:hidden",
        className,
      )}
    >
      <CardHeader className="gap-3 border-b pb-4">
        <div className="flex items-center gap-2">
          <Lock className="text-primary size-4 shrink-0" aria-hidden />
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
              <span className="text-foreground font-semibold">
                {cat.selectedFamilyName}
              </span>
              {" — "}
              unlock once per cat to reveal cat-world and ineffable names, then
              receive your certificate.
            </>
          ) : (
            <>
              Your family name is free. Unlock once per cat to reveal
              cat-world and ineffable names, then receive your certificate.
            </>
          )}
        </CardDescription>
      </CardHeader>

      <div className="flex flex-col gap-4 px-4 py-4">
        {showUnlockCheckout || showStubUnlock ? (
          <p className="text-foreground text-sm font-semibold tracking-tight">
            $3.99 USD
          </p>
        ) : null}

        {showUnlockCheckout ? (
          <>
            <p className="text-muted-foreground text-sm">
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
            <p className="text-muted-foreground text-sm">
              Stub unlock for development — no charge. Your names remain visible
              while you complete payment.
            </p>
            <Button
              type="button"
              size="lg"
              className="w-full sm:w-auto"
              disabled={paying}
              onClick={() => void onStubUnlock()}
            >
              {paying ? "Unlocking…" : "Unlock now ($3.99 — no charge)"}
            </Button>
          </>
        ) : null}
      </div>
    </Card>
  )
}
