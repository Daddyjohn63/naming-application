"use client"

import * as React from "react"
import { useMutation } from "convex/react"

import { api } from "@workspace/backend/_generated/api"
import type { Doc } from "@workspace/backend/_generated/dataModel"
import { isCeremonyUnlocked } from "@/modules/ceremony/lib/ceremony-layout"
import { isStubUnlockUiEnabled } from "@/modules/ceremony/lib/stub-unlock-config"
import {
  FAMILY_UNLOCK_CHECKOUT_STEPS,
} from "@workspace/shared/constants/naming-curation"
import { getConvexErrorMessage } from "@workspace/shared/utils/convex-error"
import { toast } from "@workspace/ui/components/sonner"

type CeremonyUnlockCat = Pick<
  Doc<"cats">,
  | "_id"
  | "ceremonyStep"
  | "selectedFamilyName"
  | "selectedFamilyRationale"
  | "ceremonyPaymentId"
>

/** Shared unlock / stub-checkout actions for sidebar and main-column prompts. */
export function useCeremonyUnlock(cat: CeremonyUnlockCat) {
  const beginUnlock = useMutation(api.familyNaming.beginUnlock)
  const completeStubUnlock = useMutation(api.ceremonyUnlock.completeStubUnlock)
  const [unlocking, setUnlocking] = React.useState(false)
  const [paying, setPaying] = React.useState(false)

  const unlocked = isCeremonyUnlocked(cat)
  const step = cat.ceremonyStep
  const hasFavourite =
    cat.selectedFamilyName !== undefined &&
    cat.selectedFamilyRationale !== undefined

  const isFamilyUnlockCheckoutStep = (
    FAMILY_UNLOCK_CHECKOUT_STEPS as readonly string[]
  ).includes(step)

  const unlockEnabled = isFamilyUnlockCheckoutStep && hasFavourite && !unlocked

  const showUnlockCheckout = isFamilyUnlockCheckoutStep && !unlocked
  const showStubUnlock = step === "awaiting_payment" && isStubUnlockUiEnabled()
  const showUnlockPrompt = showUnlockCheckout || showStubUnlock
  const showAwaitingPaymentPlaceholder =
    step === "awaiting_payment" && !showStubUnlock && !unlocked

  const completeUnlockFlow = React.useCallback(async () => {
    if (step !== "awaiting_payment") {
      await beginUnlock({ catId: cat._id })
    }
    if (isStubUnlockUiEnabled()) {
      await completeStubUnlock({ catId: cat._id })
      return "stub" as const
    }
    return "checkout" as const
  }, [beginUnlock, cat._id, completeStubUnlock, step])

  const onBeginUnlock = React.useCallback(async () => {
    setUnlocking(true)
    try {
      const result = await completeUnlockFlow()
      toast.success(
        result === "stub"
          ? "Unlocked — generating cat-world names…"
          : "Ready to complete your unlock.",
      )
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setUnlocking(false)
    }
  }, [completeUnlockFlow])

  const onStubUnlock = React.useCallback(async () => {
    setPaying(true)
    try {
      await completeStubUnlock({ catId: cat._id })
      toast.success("Unlocked — generating cat-world names…")
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setPaying(false)
    }
  }, [cat._id, completeStubUnlock])

  return {
    unlocked,
    step,
    hasFavourite,
    unlockEnabled,
    showUnlockCheckout,
    showStubUnlock,
    showUnlockPrompt,
    showAwaitingPaymentPlaceholder,
    unlocking,
    paying,
    onBeginUnlock,
    onStubUnlock,
  }
}
