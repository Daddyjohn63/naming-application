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
import { scrollToCeremonyUnlockOnMobile } from "@/modules/ceremony/lib/scroll-to-ceremony-unlock"
import { normalizeFamilyName } from "@workspace/shared/constants/family-naming"
import { normalizeNameForDedupe } from "@workspace/shared/constants/naming-curation"
import { getConvexErrorMessage } from "@workspace/shared/utils/convex-error"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"

import { dataComponent } from "@/lib/data-component"

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
 * KB-006A hero cards + KB-009/010 shortlist chips under each name slot.
 *
 * Before certificate: clicking a shortlist chip calls setFamilyFavourite,
 * setCatWorldFavourite, or setIneffableFavourite so users can change their mind
 * without re-running AI. Cat-world favourite changes release/reclaim the global
 * `cat_world_name_claims` row.
 */
export function CeremonyThreeNamesView({
  cat,
  className,
}: CeremonyThreeNamesViewProps) {
  const namingState = useQuery(api.familyNaming.getFamilyNamingStateForOwner, {
    catId: cat._id,
  })
  const catWorldNamingState = useQuery(api.catWorldNaming.getCatWorldNamingStateForOwner, {
    catId: cat._id,
  })
  const ineffableNamingState = useQuery(
    api.ineffableNaming.getIneffableNamingStateForOwner,
    { catId: cat._id },
  )
  const setFavourite = useMutation(api.familyNaming.setFamilyFavourite)
  const setCatWorldFavourite = useMutation(api.catWorldNaming.setCatWorldFavourite)
  const setIneffableFavourite = useMutation(api.ineffableNaming.setIneffableFavourite)
  const [settingFavourite, setSettingFavourite] = React.useState<string | null>(
    null,
  )
  const [settingStage, setSettingStage] = React.useState<
    "family" | "cat_world" | "ineffable" | null
  >(null)

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
    false,
    unlocked,
  )
  const catWorldSlotState = slotState(
    cat.selectedCatWorldName,
    cat.selectedCatWorldRationale,
    false,
    unlocked,
  )
  const ineffableSlotState = slotState(
    cat.selectedIneffableName,
    cat.selectedIneffableRationale,
    false,
    unlocked,
  )

  const onSetFavourite = async (name: string) => {
    setSettingFavourite(name)
    setSettingStage("family")
    try {
      await setFavourite({ catId: cat._id, name })
      scrollToCeremonyThreeNames()
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setSettingFavourite(null)
      setSettingStage(null)
    }
  }

  const onSetCatWorldFavourite = async (name: string) => {
    setSettingFavourite(name)
    setSettingStage("cat_world")
    try {
      await setCatWorldFavourite({ catId: cat._id, name })
      scrollToCeremonyThreeNames()
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setSettingFavourite(null)
      setSettingStage(null)
    }
  }

  const onSetIneffableFavourite = async (name: string) => {
    setSettingFavourite(name)
    setSettingStage("ineffable")
    try {
      await setIneffableFavourite({ catId: cat._id, name })
      scrollToCeremonyThreeNames()
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setSettingFavourite(null)
      setSettingStage(null)
    }
  }

  const canChangeCatWorldFavourite =
    unlocked &&
    cat.ceremonyStep !== "ceremony_complete" &&
    (catWorldNamingState?.shortlist.length ?? 0) > 1

  const canChangeIneffableFavourite =
    unlocked &&
    cat.ceremonyStep !== "ceremony_complete" &&
    (ineffableNamingState?.shortlist.length ?? 0) > 1

  const subtitle = unlocked
    ? "Your three names will appear here as you complete each stage."
    : cat.ceremonyStep === "awaiting_payment"
      ? "Your everyday name is chosen — complete unlock for the rest of the ceremony."
      : "Your everyday name is chosen — unlock for the rest of the ceremony."

  const scrollLockedNameToUnlock = () => {
    scrollToCeremonyUnlockOnMobile()
  }

  return (
    <section
      {...dataComponent("CeremonyThreeNamesView")}
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
          badge={everydayState === "filled" ? "★ Your choice" : undefined}
          className="min-w-0"
        />

        <CeremonyNameSlot
          label="Cat-world name"
          name={cat.selectedCatWorldName}
          rationale={cat.selectedCatWorldRationale}
          state={catWorldSlotState}
          badge={catWorldSlotState === "filled" ? "★ Your choice" : undefined}
          className="min-w-0"
          placeholderHint={
            unlocked && catWorldSlotState === "placeholder"
              ? "Choose in the cat-world stage"
              : "Unlock to discover"
          }
          onPlaceholderHintClick={
            !unlocked && catWorldSlotState === "placeholder"
              ? scrollLockedNameToUnlock
              : undefined
          }
        />

        <CeremonyNameSlot
          label="Ineffable near-name"
          name={cat.selectedIneffableName}
          rationale={cat.selectedIneffableRationale}
          state={ineffableSlotState}
          badge={ineffableSlotState === "filled" ? "★ Your choice" : undefined}
          className="min-w-0"
          placeholderHint={
            unlocked && ineffableSlotState === "placeholder"
              ? "Choose in the ineffable stage"
              : "Unlock to discover"
          }
          onPlaceholderHintClick={
            !unlocked && ineffableSlotState === "placeholder"
              ? scrollLockedNameToUnlock
              : undefined
          }
        />

        {shortlist.length > 0 ? (
          <div className="flex flex-col gap-2 sm:col-start-1">
            <p className="text-sm font-medium">Everyday shortlist</p>
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
                        {settingFavourite === entry.name &&
                        settingStage === "family"
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
                Tap a shortlist name to change your everyday favourite.
              </p>
            ) : null}
          </div>
        ) : null}

        {(catWorldNamingState?.shortlist.length ?? 0) > 0 ? (
          <div className="flex flex-col gap-2 sm:col-start-2">
            <p className="text-sm font-medium">Cat-world shortlist</p>
            <ul className="flex flex-wrap gap-2">
              {(catWorldNamingState?.shortlist ?? []).map((entry) => {
                const isFavourite =
                  cat.selectedCatWorldName !== undefined &&
                  normalizeNameForDedupe(cat.selectedCatWorldName) ===
                    normalizeNameForDedupe(entry.name)

                return (
                  <li key={entry.name}>
                    {canChangeCatWorldFavourite && !isFavourite ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={settingFavourite !== null}
                        className="rounded-full"
                        onClick={() => void onSetCatWorldFavourite(entry.name)}
                      >
                        {settingFavourite === entry.name &&
                        settingStage === "cat_world"
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
            {canChangeCatWorldFavourite ? (
              <p className="text-muted-foreground text-xs">
                Tap a shortlist name to change your cat-world favourite.
              </p>
            ) : null}
          </div>
        ) : null}

        {(ineffableNamingState?.shortlist.length ?? 0) > 0 ? (
          <div className="flex flex-col gap-2 sm:col-start-3">
            <p className="text-sm font-medium">Ineffable shortlist</p>
            <ul className="flex flex-wrap gap-2">
              {(ineffableNamingState?.shortlist ?? []).map((entry) => {
                const isFavourite =
                  cat.selectedIneffableName !== undefined &&
                  normalizeNameForDedupe(cat.selectedIneffableName) ===
                    normalizeNameForDedupe(entry.name)

                return (
                  <li key={entry.name}>
                    {canChangeIneffableFavourite && !isFavourite ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={settingFavourite !== null}
                        className="rounded-full"
                        onClick={() => void onSetIneffableFavourite(entry.name)}
                      >
                        {settingFavourite === entry.name &&
                        settingStage === "ineffable"
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
            {canChangeIneffableFavourite ? (
              <p className="text-muted-foreground text-xs">
                Tap a shortlist name to change your ineffable near-name favourite.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
