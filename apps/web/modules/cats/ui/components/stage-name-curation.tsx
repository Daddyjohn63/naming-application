"use client"

/**
 * KB-009 / KB-010 — shared curation UI for cat-world and ineffable naming stages.
 *
 * Props `stage` selects which Convex mutations/queries to use. Family naming
 * keeps its own component (`family-name-curation.tsx`) because regen includes
 * style pickers. Pass `onConfirmContinue` to show the stage-advance button
 * (cat-world → ineffable, or ineffable → certificate prep).
 */

import * as React from "react"
import { useMutation } from "convex/react"

import { api } from "@workspace/backend/_generated/api"
import type { Doc } from "@workspace/backend/_generated/dataModel"
import {
  MAX_NAME_REGENERATIONS,
  MAX_SHORTLIST_PER_BATCH,
  MAX_SHORTLIST_TOTAL,
  normalizeNameForDedupe,
} from "@workspace/shared/constants/naming-curation"
import { getConvexErrorMessage } from "@workspace/shared/utils/convex-error"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"

import { scrollToCeremonyThreeNames } from "@/modules/ceremony/lib/scroll-to-ceremony-three-names"
import type { NamingStageKind } from "@/modules/cats/ui/components/stage-name-pipeline-status"
import { dataComponent } from "@/lib/data-component"

type StageNamingState = {
  shortlist: Array<{ name: string; rationale: string }>
  selectedName?: string
  selectedRationale?: string
  regenerationsUsed: number
  currentBatch: {
    generationIndex: number
    names: Array<{ name: string; rationale: string }>
  } | null
  savedFromCurrentBatchCount: number
}

type StageNameCurationProps = {
  cat: Doc<"cats">
  stage: NamingStageKind
  state: StageNamingState | null | undefined
  title: string
  description: string
  framingCopy?: string
  onConfirmContinue?: () => Promise<void>
  confirmLabel?: string
}

export function StageNameCuration({
  cat,
  stage,
  state,
  title,
  description,
  framingCopy,
  onConfirmContinue,
  confirmLabel = "Continue",
}: StageNameCurationProps) {
  const addToCatWorldShortlist = useMutation(api.catWorldNaming.addToCatWorldShortlist)
  const removeFromCatWorldShortlist = useMutation(
    api.catWorldNaming.removeFromCatWorldShortlist,
  )
  const setCatWorldFavourite = useMutation(api.catWorldNaming.setCatWorldFavourite)
  const regenerateCatWorld = useMutation(api.catWorldNaming.regenerateCatWorldNames)

  const addToIneffableShortlist = useMutation(
    api.ineffableNaming.addToIneffableShortlist,
  )
  const removeFromIneffableShortlist = useMutation(
    api.ineffableNaming.removeFromIneffableShortlist,
  )
  const setIneffableFavourite = useMutation(api.ineffableNaming.setIneffableFavourite)
  const regenerateIneffable = useMutation(api.ineffableNaming.regenerateIneffableNames)

  const [savingName, setSavingName] = React.useState<string | null>(null)
  const [removingName, setRemovingName] = React.useState<string | null>(null)
  const [settingFavourite, setSettingFavourite] = React.useState<string | null>(
    null,
  )
  const [regenerating, setRegenerating] = React.useState(false)
  const [confirming, setConfirming] = React.useState(false)

  if (state === undefined) {
    return (
      <Card {...dataComponent("StageNameCuration")} className="ceremony-panel">
        <CardHeader className="border-b">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-2 h-4 w-full max-w-md" />
        </CardHeader>
        <div className="flex flex-col gap-3 px-4 py-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </Card>
    )
  }

  if (state === null || state.currentBatch === null) {
    return (
      <Card {...dataComponent("StageNameCuration")} className="ceremony-panel">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Names not ready</CardTitle>
          <CardDescription>
            Your name suggestions are still being prepared. Refresh in a moment
            or return from the dashboard.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const shortlist = state.shortlist
  const batchNames = state.currentBatch.names
  const regenUsed = state.regenerationsUsed
  const regenExhausted = regenUsed >= MAX_NAME_REGENERATIONS
  const savedFromBatch = state.savedFromCurrentBatchCount
  const batchSaveRemaining = MAX_SHORTLIST_PER_BATCH - savedFromBatch
  const shortlistRemaining = MAX_SHORTLIST_TOTAL - shortlist.length

  const shortlistNormalized = new Set(
    shortlist.map((entry) => normalizeNameForDedupe(entry.name)),
  )

  const selectedName = state.selectedName
  const favouriteNormalized =
    selectedName !== undefined ? normalizeNameForDedupe(selectedName) : null

  const onSaveName = async (name: string) => {
    setSavingName(name)
    try {
      if (stage === "cat_world") {
        await addToCatWorldShortlist({ catId: cat._id, name })
      } else {
        await addToIneffableShortlist({ catId: cat._id, name })
      }
      toast.success(`Saved "${name}" to your shortlist.`)
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setSavingName(null)
    }
  }

  const onRemoveName = async (name: string) => {
    setRemovingName(name)
    try {
      if (stage === "cat_world") {
        await removeFromCatWorldShortlist({ catId: cat._id, name })
      } else {
        await removeFromIneffableShortlist({ catId: cat._id, name })
      }
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setRemovingName(null)
    }
  }

  const onSetFavourite = async (name: string) => {
    setSettingFavourite(name)
    try {
      if (stage === "cat_world") {
        await setCatWorldFavourite({ catId: cat._id, name })
      } else {
        await setIneffableFavourite({ catId: cat._id, name })
      }
      scrollToCeremonyThreeNames()
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setSettingFavourite(null)
    }
  }

  const onRegenerate = async () => {
    setRegenerating(true)
    try {
      if (stage === "cat_world") {
        await regenerateCatWorld({ catId: cat._id })
      } else {
        await regenerateIneffable({ catId: cat._id })
      }
      toast.success("Generating ten fresh names…")
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setRegenerating(false)
    }
  }

  const onConfirm = async () => {
    if (onConfirmContinue === undefined) {
      return
    }
    setConfirming(true)
    try {
      await onConfirmContinue()
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setConfirming(false)
    }
  }

  const busySaving = savingName !== null
  const continueEnabled =
    favouriteNormalized !== null && shortlist.length >= 1 && onConfirmContinue !== undefined

  return (
    <div {...dataComponent("StageNameCuration")} className="flex flex-col gap-6">
      {framingCopy !== undefined ? (
        <p className="text-muted-foreground text-sm leading-relaxed">{framingCopy}</p>
      ) : null}

      <Card className="ceremony-panel">
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>
                {description} ({batchSaveRemaining} remaining here ·{" "}
                {shortlistRemaining} slots left overall).
                {state.currentBatch.generationIndex === 1
                  ? " These are from your regeneration."
                  : null}
              </CardDescription>
            </div>
            {!regenExhausted ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={regenerating || busySaving}
                onClick={() => void onRegenerate()}
              >
                {regenerating ? "Regenerating…" : "Regenerate batch"}
              </Button>
            ) : (
              <Badge variant="secondary" className="rounded-full">
                Regeneration used
              </Badge>
            )}
          </div>
        </CardHeader>

        <ul className="flex flex-col divide-y">
          {batchNames.map((entry) => {
            const normalized = normalizeNameForDedupe(entry.name)
            const onShortlist = shortlistNormalized.has(normalized)
            const isFavourite = favouriteNormalized === normalized
            const canSave =
              !onShortlist &&
              batchSaveRemaining > 0 &&
              shortlistRemaining > 0 &&
              !busySaving

            return (
              <li
                key={`${state.currentBatch!.generationIndex}-${entry.name}`}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold tracking-tight">
                      {entry.name}
                    </span>
                    {onShortlist ? (
                      <Badge variant="secondary" className="rounded-full">
                        Saved
                      </Badge>
                    ) : null}
                    {isFavourite ? (
                      <Badge className="bg-primary rounded-full">Favourite</Badge>
                    ) : null}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {entry.rationale}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {onShortlist ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant={isFavourite ? "default" : "outline"}
                        disabled={
                          settingFavourite !== null || removingName !== null
                        }
                        onClick={() => void onSetFavourite(entry.name)}
                      >
                        {settingFavourite === entry.name
                          ? "Setting…"
                          : isFavourite
                            ? "Favourite"
                            : "Set favourite"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={
                          removingName !== null || settingFavourite !== null
                        }
                        onClick={() => void onRemoveName(entry.name)}
                      >
                        {removingName === entry.name ? "Removing…" : "Remove"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={!canSave || savingName !== null}
                      onClick={() => void onSaveName(entry.name)}
                    >
                      {savingName === entry.name ? "Saving…" : "Save to shortlist"}
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </Card>

      {shortlist.length > 0 ? (
        <Card className="ceremony-panel">
          <CardHeader className="border-b">
            <CardTitle className="text-base">Your shortlist</CardTitle>
            <CardDescription>
              {shortlist.length} of {MAX_SHORTLIST_TOTAL} saved · pick one favourite
              to continue.
            </CardDescription>
          </CardHeader>
          <ul className="flex flex-col divide-y">
            {shortlist.map((entry) => {
              const isFavourite =
                favouriteNormalized === normalizeNameForDedupe(entry.name)
              return (
                <li
                  key={entry.name}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <span className="font-medium">{entry.name}</span>
                    {isFavourite ? (
                      <Badge className="bg-primary ml-2 rounded-full">Favourite</Badge>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={isFavourite ? "default" : "outline"}
                    disabled={settingFavourite !== null}
                    onClick={() => void onSetFavourite(entry.name)}
                  >
                    {settingFavourite === entry.name
                      ? "Setting…"
                      : isFavourite
                        ? "Favourite"
                        : "Set favourite"}
                  </Button>
                </li>
              )
            })}
          </ul>
        </Card>
      ) : null}

      {onConfirmContinue !== undefined ? (
        <div className="flex flex-col gap-2">
          {continueEnabled ? (
            <Card className="ceremony-highlight-panel border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ready for the next stage?</CardTitle>
                <CardDescription>
                  {selectedName !== undefined ? (
                    <>
                      Your favourite is{" "}
                      <span className="text-foreground font-medium">
                        {selectedName}
                      </span>
                      . Continue when you&apos;re happy with your choice.
                    </>
                  ) : (
                    "Pick a favourite from your shortlist to continue."
                  )}
                </CardDescription>
              </CardHeader>
              <div className="px-4 pb-4">
                <Button
                  type="button"
                  disabled={confirming}
                  onClick={() => void onConfirm()}
                >
                  {confirming ? "Continuing…" : confirmLabel}
                </Button>
              </div>
            </Card>
          ) : null}
          {!continueEnabled ? (
            <p className="text-muted-foreground text-xs">
              Save at least one name and pick a favourite to continue.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
