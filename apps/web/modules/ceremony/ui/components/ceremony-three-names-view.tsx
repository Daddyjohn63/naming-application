"use client"

import * as React from "react"
import { useMutation, useQuery } from "convex/react"

import { api } from "@workspace/backend/_generated/api"
import type { Doc } from "@workspace/backend/_generated/dataModel"
import {
  canChangeFamilyFavourite,
  isCeremonyUnlocked,
} from "@/modules/ceremony/lib/ceremony-layout"
import {
  CEREMONY_THREE_NAMES_SECTION_ID,
  scrollToCeremonyThreeNames,
} from "@/modules/ceremony/lib/scroll-to-ceremony-three-names"
import { normalizeFamilyName } from "@workspace/shared/constants/family-naming"
import { getConvexErrorMessage } from "@workspace/shared/utils/convex-error"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"

import {
  CeremonyNameSlot,
  type CeremonyNameSlotState,
} from "./ceremony-name-slot"

type CeremonyThreeNamesViewProps = {
  cat: Doc<"cats">
  className?: string
}

function slotState(
  name: string | undefined,
  rationale: string | undefined,
  lockedAfterUnlock: boolean,
  unlocked: boolean,
): CeremonyNameSlotState {
  if (name !== undefined && rationale !== undefined) {
    return lockedAfterUnlock && unlocked ? "locked" : "filled"
  }
  return "placeholder"
}

/**
 * KB-006A — hero everyday card, locked cat-world / ineffable placeholders, shortlist chips.
 */
export function CeremonyThreeNamesView({
  cat,
  className,
}: CeremonyThreeNamesViewProps) {
  const namingState = useQuery(api.familyNaming.getFamilyNamingStateForOwner, {
    catId: cat._id,
  })
  const setFavourite = useMutation(api.familyNaming.setFamilyFavourite)
  const [settingFavourite, setSettingFavourite] = React.useState<string | null>(
    null,
  )

  const unlocked = isCeremonyUnlocked(cat)
  const canChangeFavourite = canChangeFamilyFavourite(cat)
  const shortlist = namingState?.shortlist ?? cat.familyNameShortlist ?? []
  const selectedFamilyName =
    namingState?.selectedFamilyName ?? cat.selectedFamilyName
  const favouriteNormalized =
    selectedFamilyName !== undefined
      ? normalizeFamilyName(selectedFamilyName)
      : null

  const everydayState = slotState(
    cat.selectedFamilyName,
    cat.selectedFamilyRationale,
    true,
    unlocked,
  )
  const catWorldState = slotState(
    cat.selectedCatWorldName,
    cat.selectedCatWorldRationale,
    false,
    unlocked,
  )
  const ineffableState = slotState(
    cat.selectedIneffableName,
    cat.selectedIneffableRationale,
    false,
    unlocked,
  )

  const onSetFavourite = async (name: string) => {
    setSettingFavourite(name)
    try {
      await setFavourite({ catId: cat._id, name })
      scrollToCeremonyThreeNames()
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setSettingFavourite(null)
    }
  }

  const subtitle = unlocked
    ? "Your three names will appear here as you complete each stage."
    : cat.ceremonyStep === "awaiting_payment"
      ? "Your everyday name is chosen — complete unlock for the rest of the ceremony."
      : "Your everyday name is chosen — unlock for the rest of the ceremony."

  return (
    <section
      id={CEREMONY_THREE_NAMES_SECTION_ID}
      className={cn("flex scroll-mt-24 flex-col gap-6", className)}
      aria-label="Your cat's three names"
    >
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Your cat&apos;s three names
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
          {subtitle}
        </p>
      </header>

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <CeremonyNameSlot
          label="Everyday name"
          name={cat.selectedFamilyName}
          rationale={cat.selectedFamilyRationale}
          state={everydayState}
          badge={
            everydayState === "filled"
              ? "★ Your choice"
              : everydayState === "locked"
                ? "Locked in"
                : undefined
          }
          className="min-w-0"
        />

        <CeremonyNameSlot
          label="Cat-world name"
          name={cat.selectedCatWorldName}
          rationale={cat.selectedCatWorldRationale}
          state={catWorldState}
          className="min-w-0"
          placeholderHint={
            unlocked && catWorldState === "placeholder"
              ? "Choose in the cat-world stage"
              : "Unlock to discover"
          }
        />

        <CeremonyNameSlot
          label="Ineffable near-name"
          name={cat.selectedIneffableName}
          rationale={cat.selectedIneffableRationale}
          state={ineffableState}
          className="min-w-0"
          placeholderHint={
            unlocked && ineffableState === "placeholder"
              ? "Choose in the ineffable stage"
              : "Unlock to discover"
          }
        />

        {shortlist.length > 0 ? (
          <div className="flex flex-col gap-2 sm:col-start-1">
            <p className="text-sm font-medium">Your shortlist</p>
            <ul className="flex flex-wrap gap-2">
              {shortlist.map((entry) => {
                const isFavourite =
                  favouriteNormalized === normalizeFamilyName(entry.name)

                return (
                  <li key={entry.name}>
                    {canChangeFavourite && !isFavourite ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={settingFavourite !== null}
                        className="rounded-full"
                        onClick={() => void onSetFavourite(entry.name)}
                      >
                        {settingFavourite === entry.name
                          ? "Setting…"
                          : entry.name}
                      </Button>
                    ) : (
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-3 py-1 text-sm font-medium",
                          isFavourite
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-secondary text-secondary-foreground",
                        )}
                      >
                        {entry.name}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
            {canChangeFavourite && shortlist.length > 1 ? (
              <p className="text-muted-foreground text-xs">
                Tap a shortlist name to change your everyday favourite before
                unlock.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
