"use client"

import * as React from "react"
import { useMutation, useQuery } from "convex/react"
import { ChevronDown } from "lucide-react"

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
import {
  isCustomFamilyShortlistEntry,
  normalizeFamilyName,
} from "@workspace/shared/constants/family-naming"
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

type ShortlistChip = {
  name: string
  label: string
  isFavourite: boolean
}

function slotState(
  name: string | undefined,
  rationale: string | undefined,
  lockedAfterUnlock: boolean,
  unlocked: boolean
): CeremonyNameSlotState {
  if (name !== undefined && rationale !== undefined) {
    return lockedAfterUnlock && unlocked ? "locked" : "filled"
  }
  return "placeholder"
}

/**
 * Shortlist under a name card. On mobile: collapsed dropdown. On sm+: always open.
 */
function CeremonyShortlistUnderCard({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium",
          "bg-muted/10 transition-colors hover:bg-muted/20",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "sm:hidden"
        )}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{title}</span>
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <p className="hidden text-sm font-medium sm:block">{title}</p>
      <div className={cn("flex-col gap-2", open ? "flex" : "hidden sm:flex")}>
        {children}
        {hint !== undefined ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </div>
  )
}

function ShortlistChipList({
  chips,
  canChangeFavourite,
  settingFavourite,
  busy,
  onSelect,
}: {
  chips: ShortlistChip[]
  canChangeFavourite: boolean
  settingFavourite: string | null
  busy: boolean
  onSelect: (name: string) => void
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <li key={chip.name}>
          {canChangeFavourite && !chip.isFavourite ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              className="rounded-full"
              onClick={() => onSelect(chip.name)}
            >
              {settingFavourite === chip.name ? "Setting…" : chip.label}
            </Button>
          ) : (
            <span
              className={cn(
                "inline-flex rounded-full border px-3 py-1 text-sm font-medium",
                chip.isFavourite
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {chip.label}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
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
  const catWorldNamingState = useQuery(
    api.catWorldNaming.getCatWorldNamingStateForOwner,
    {
      catId: cat._id,
    }
  )
  const ineffableNamingState = useQuery(
    api.ineffableNaming.getIneffableNamingStateForOwner,
    { catId: cat._id }
  )
  const setFavourite = useMutation(api.familyNaming.setFamilyFavourite)
  const setCatWorldFavourite = useMutation(
    api.catWorldNaming.setCatWorldFavourite
  )
  const setIneffableFavourite = useMutation(
    api.ineffableNaming.setIneffableFavourite
  )
  const [settingFavourite, setSettingFavourite] = React.useState<string | null>(
    null
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
    unlocked
  )
  const catWorldSlotState = slotState(
    cat.selectedCatWorldName,
    cat.selectedCatWorldRationale,
    false,
    unlocked
  )
  const ineffableSlotState = slotState(
    cat.selectedIneffableName,
    cat.selectedIneffableRationale,
    false,
    unlocked
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
      // Completing the third name opens Certificate in the main column;
      // changing an existing ineffable pick can stay on the three-name cards.
      if (
        cat.selectedFamilyName === undefined ||
        cat.selectedCatWorldName === undefined ||
        cat.selectedIneffableName !== undefined
      ) {
        scrollToCeremonyThreeNames()
      }
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
      ? "Your family name is chosen — complete unlock to complete the rest of the ceremony."
      : "Your family name is chosen — unlock to complete the rest of the ceremony."

  const scrollLockedNameToUnlock = () => {
    scrollToCeremonyUnlockOnMobile()
  }

  const familyChips: ShortlistChip[] = shortlist.map((entry) => {
    const isCustom = isCustomFamilyShortlistEntry(entry)
    return {
      name: entry.name,
      label: isCustom ? `${entry.name} (your idea)` : entry.name,
      isFavourite: favouriteNormalized === normalizeFamilyName(entry.name),
    }
  })

  const catWorldChips: ShortlistChip[] = (
    catWorldNamingState?.shortlist ?? []
  ).map((entry) => ({
    name: entry.name,
    label: entry.name,
    isFavourite:
      cat.selectedCatWorldName !== undefined &&
      normalizeNameForDedupe(cat.selectedCatWorldName) ===
        normalizeNameForDedupe(entry.name),
  }))

  const ineffableChips: ShortlistChip[] = (
    ineffableNamingState?.shortlist ?? []
  ).map((entry) => ({
    name: entry.name,
    label: entry.name,
    isFavourite:
      cat.selectedIneffableName !== undefined &&
      normalizeNameForDedupe(cat.selectedIneffableName) ===
        normalizeNameForDedupe(entry.name),
  }))

  const busy = settingFavourite !== null

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
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {subtitle}
        </p>
      </header>

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="flex min-w-0 flex-col gap-3">
          <CeremonyNameSlot
            label="Family name"
            name={cat.selectedFamilyName}
            rationale={cat.selectedFamilyRationale}
            state={everydayState}
            badge={everydayState === "filled" ? "★ Your choice" : undefined}
            className="min-w-0"
          />
          {familyChips.length > 0 ? (
            <CeremonyShortlistUnderCard
              title="Family name shortlist"
              hint={
                canChangeFavourite && shortlist.length > 1
                  ? "Tap a shortlist name to change your family name favourite."
                  : undefined
              }
            >
              <ShortlistChipList
                chips={familyChips}
                canChangeFavourite={canChangeFavourite}
                settingFavourite={
                  settingStage === "family" ? settingFavourite : null
                }
                busy={busy}
                onSelect={(name) => void onSetFavourite(name)}
              />
            </CeremonyShortlistUnderCard>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-3">
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
          {catWorldChips.length > 0 ? (
            <CeremonyShortlistUnderCard
              title="Cat-world shortlist"
              hint={
                canChangeCatWorldFavourite
                  ? "Tap a shortlist name to change your cat-world favourite."
                  : undefined
              }
            >
              <ShortlistChipList
                chips={catWorldChips}
                canChangeFavourite={canChangeCatWorldFavourite}
                settingFavourite={
                  settingStage === "cat_world" ? settingFavourite : null
                }
                busy={busy}
                onSelect={(name) => void onSetCatWorldFavourite(name)}
              />
            </CeremonyShortlistUnderCard>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <CeremonyNameSlot
            label="Ineffable near-name"
            name={cat.selectedIneffableName}
            rationale={cat.selectedIneffableRationale}
            state={ineffableSlotState}
            badge={
              ineffableSlotState === "filled" ? "★ Your choice" : undefined
            }
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
          {ineffableChips.length > 0 ? (
            <CeremonyShortlistUnderCard
              title="Ineffable shortlist"
              hint={
                canChangeIneffableFavourite
                  ? "Tap a shortlist name to change your ineffable near-name favourite."
                  : undefined
              }
            >
              <ShortlistChipList
                chips={ineffableChips}
                canChangeFavourite={canChangeIneffableFavourite}
                settingFavourite={
                  settingStage === "ineffable" ? settingFavourite : null
                }
                busy={busy}
                onSelect={(name) => void onSetIneffableFavourite(name)}
              />
            </CeremonyShortlistUnderCard>
          ) : null}
        </div>
      </div>
    </section>
  )
}
