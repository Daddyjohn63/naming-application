"use client"

import * as React from "react"
import Link from "next/link"
import { useMutation } from "convex/react"
import { ArrowRight, Lock } from "lucide-react"

import { api } from "@workspace/backend/_generated/api"
import type { Doc } from "@workspace/backend/_generated/dataModel"
import {
  isCeremonyUnlocked,
  showCeremonyUnlockSidebar,
} from "@/modules/ceremony/lib/ceremony-layout"
import { useCeremonyStageContinue } from "@/modules/ceremony/lib/use-ceremony-stage-continue"
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
 * KB-007 stub unlock on `awaiting_payment`; KB-009/010 continue CTAs after unlock.
 */
export function CeremonyUnlockSidebar({ cat }: CeremonyUnlockSidebarProps) {
  const beginUnlock = useMutation(api.familyNaming.beginUnlock)
  const completeStubUnlock = useMutation(api.ceremonyUnlock.completeStubUnlock)
  const startCatWorldNaming = useMutation(api.catWorldNaming.startCatWorldNaming)

  const {
    continuing: continuingToIneffable,
    continueToIneffable,
    showContinueToIneffable,
    needsCatWorldConfirm,
  } = useCeremonyStageContinue(cat)

  const [unlocking, setUnlocking] = React.useState(false)
  const [paying, setPaying] = React.useState(false)
  const [continuing, setContinuing] = React.useState(false)

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

  const onBeginUnlock = async () => {
    setUnlocking(true)
    try {
      await beginUnlock({ catId: cat._id })
      toast.success("Ready to complete your unlock.")
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setUnlocking(false)
    }
  }

  const onStubUnlock = async () => {
    setPaying(true)
    try {
      await completeStubUnlock({ catId: cat._id })
      toast.success("Unlocked — your cat-world names await!")
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setPaying(false)
    }
  }

  const onContinueCatWorld = async () => {
    setContinuing(true)
    try {
      await startCatWorldNaming({ catId: cat._id })
      toast.success("Generating cat-world names…")
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setContinuing(false)
    }
  }

  const title =
    step === "awaiting_payment"
      ? "Complete your unlock"
      : showContinueToIneffable
        ? "Next: ineffable names"
        : step === "naming_cat_world" && cat.selectedCatWorldName === undefined
          ? "Continue your ceremony"
          : step === "naming_ineffable" && cat.selectedIneffableName === undefined
            ? "Almost there"
            : unlocked
              ? "Your ceremony"
              : "What's next"

  const description =
    step === "awaiting_payment"
      ? "Your everyday name and shortlist stay saved if checkout is interrupted."
      : showContinueToIneffable
        ? needsCatWorldConfirm
          ? `You chose “${cat.selectedCatWorldName}”. Continue to generate ineffable near-names.`
          : "Continue to generate your ineffable near-name suggestions."
        : step === "naming_cat_world" && cat.selectedCatWorldName === undefined
          ? "Choose a cat-world name next. You can still switch your everyday favourite from the shortlist above."
          : step === "naming_ineffable" && cat.selectedIneffableName === undefined
            ? "One more stage — playful approximations of the secret name."
            : unlocked
              ? "Switch stages in the main column to review or change your picks before the certificate."
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
            $3.99 USD
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
              onClick={() => void onBeginUnlock()}
            >
              {unlocking ? "Opening unlock…" : "Unlock now"}
            </Button>
          </>
        ) : null}

        {step === "awaiting_payment" ? (
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

        {unlocked &&
        (step === "naming_cat_world" || step === "awaiting_cat_world_names") &&
        cat.selectedCatWorldName === undefined ? (
          <Button
            type="button"
            variant="default"
            disabled={continuing || step === "awaiting_cat_world_names"}
            onClick={() => void onContinueCatWorld()}
          >
            {step === "awaiting_cat_world_names"
              ? "Generating cat-world names…"
              : continuing
                ? "Starting…"
                : "Continue to cat-world names"}
          </Button>
        ) : null}

        {unlocked && showContinueToIneffable ? (
          <Button
            type="button"
            variant="default"
            disabled={
              continuingToIneffable || step === "awaiting_ineffable_names"
            }
            onClick={() => void continueToIneffable()}
          >
            {step === "awaiting_ineffable_names"
              ? "Generating ineffable names…"
              : continuingToIneffable
                ? "Continuing…"
                : "Continue to ineffable names"}
            {step !== "awaiting_ineffable_names" && !continuingToIneffable ? (
              <ArrowRight className="ml-2 size-4" aria-hidden />
            ) : null}
          </Button>
        ) : null}

        <Button variant="outline" asChild className="border-primary/30">
          <Link href="/dashboard">Save &amp; exit</Link>
        </Button>
      </div>
    </Card>
  )
}
