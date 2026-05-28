"use client"

/**
 * KB-006 — family name curation: batch list, shortlist, regen, favourite, paywall teaser.
 */

import * as React from "react"
import { useMutation, useQuery } from "convex/react"

import { api } from "@workspace/backend/_generated/api"
import type { Doc } from "@workspace/backend/_generated/dataModel"
import {
  FAMILY_NAME_STYLE_IDS,
  FAMILY_NAME_STYLE_LABELS,
  MAX_FAMILY_NAME_REGENERATIONS,
  MAX_FAMILY_SHORTLIST_PER_BATCH,
  MAX_FAMILY_SHORTLIST_TOTAL,
  normalizeFamilyName,
  type FamilyNameStyleId,
} from "@workspace/shared/constants/family-naming"
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

import { FamilyNamePaywallTeaser } from "./family-name-paywall-teaser"

type FamilyNameCurationProps = {
  cat: Doc<"cats">
  /** KB-006A tunnel: shortlist + paywall live in three-name layout / sidebar. */
  tunnelMode?: boolean
}

function isFamilyStyleId(value: string): value is FamilyNameStyleId {
  return (FAMILY_NAME_STYLE_IDS as readonly string[]).includes(value)
}

export function FamilyNameCuration({
  cat,
  tunnelMode = false,
}: FamilyNameCurationProps) {
  const state = useQuery(api.familyNaming.getFamilyNamingStateForOwner, {
    catId: cat._id,
  })

  const addToShortlist = useMutation(api.familyNaming.addToFamilyShortlist)
  const removeFromShortlist = useMutation(api.familyNaming.removeFromFamilyShortlist)
  const setFavourite = useMutation(api.familyNaming.setFamilyFavourite)
  const regenerateNames = useMutation(api.familyNaming.regenerateFamilyNames)
  const beginUnlock = useMutation(api.familyNaming.beginUnlock)
  const [savingName, setSavingName] = React.useState<string | null>(null)
  const [removingName, setRemovingName] = React.useState<string | null>(null)
  const [settingFavourite, setSettingFavourite] = React.useState<string | null>(
    null,
  )
  const [regenerating, setRegenerating] = React.useState(false)
  const [unlocking, setUnlocking] = React.useState(false)
  const [showRegenStyles, setShowRegenStyles] = React.useState(false)
  const [regenStyleSelection, setRegenStyleSelection] = React.useState<
    FamilyNameStyleId[]
  >([])

  React.useEffect(() => {
    if (state?.familyNameStyles !== undefined) {
      setRegenStyleSelection(
        state.familyNameStyles.filter(isFamilyStyleId),
      )
    }
  }, [state?.familyNameStyles])

  if (state === undefined) {
    return (
      <Card className="ceremony-panel">
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
      <Card className="ceremony-panel">
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
  const regenUsed = state.familyNameRegenerationsUsed
  const regenExhausted = regenUsed >= MAX_FAMILY_NAME_REGENERATIONS
  const savedFromBatch = state.savedFromCurrentBatchCount
  const batchSaveRemaining = MAX_FAMILY_SHORTLIST_PER_BATCH - savedFromBatch
  const shortlistRemaining = MAX_FAMILY_SHORTLIST_TOTAL - shortlist.length

  const shortlistNormalized = new Set(
    shortlist.map((entry) => normalizeFamilyName(entry.name)),
  )

  const favouriteNormalized =
    state.selectedFamilyName !== undefined
      ? normalizeFamilyName(state.selectedFamilyName)
      : null

  const toggleRegenStyle = (id: FamilyNameStyleId) => {
    setRegenStyleSelection((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  const onSaveName = async (name: string) => {
    setSavingName(name)
    try {
      await addToShortlist({ catId: cat._id, name })
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
      await removeFromShortlist({ catId: cat._id, name })
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setRemovingName(null)
    }
  }

  const onSetFavourite = async (name: string) => {
    setSettingFavourite(name)
    try {
      await setFavourite({ catId: cat._id, name })
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setSettingFavourite(null)
    }
  }

  const onRegenerate = async () => {
    if (regenStyleSelection.length === 0) {
      toast.error("Choose at least one style before regenerating.")
      return
    }
    setRegenerating(true)
    try {
      await regenerateNames({
        catId: cat._id,
        styleIds: regenStyleSelection,
      })
      setShowRegenStyles(false)
      toast.success("Generating ten fresh names…")
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setRegenerating(false)
    }
  }

  const busySaving = savingName !== null
  const unlockEnabled =
    favouriteNormalized !== null && shortlist.length >= 1
  const showShortlistPanel = !tunnelMode && shortlist.length > 0

  const onUnlock = async () => {
    setUnlocking(true)
    try {
      await beginUnlock({ catId: cat._id })
      toast.success("Ready to unlock the rest of your ceremony.")
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setUnlocking(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="ceremony-panel">
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">Family name suggestions</CardTitle>
              <CardDescription>
                Save up to three names from this batch ({batchSaveRemaining}{" "}
                remaining here · {shortlistRemaining} slots left overall).
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
                onClick={() => setShowRegenStyles((open) => !open)}
              >
                {showRegenStyles ? "Hide styles" : "Regenerate batch"}
              </Button>
            ) : (
              <Badge variant="secondary" className="rounded-full">
                Regeneration used
              </Badge>
            )}
          </div>
        </CardHeader>

        {showRegenStyles && !regenExhausted ? (
          <div className="border-b bg-muted/20 px-4 py-4">
            <p className="mb-3 text-sm text-muted-foreground">
              Adjust your styles before generating ten new names. Your shortlist
              stays saved.
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {FAMILY_NAME_STYLE_IDS.map((id) => {
                const isSelected = regenStyleSelection.includes(id)
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={regenerating}
                    aria-pressed={isSelected}
                    onClick={() => toggleRegenStyle(id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    {FAMILY_NAME_STYLE_LABELS[id]}
                  </button>
                )
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={regenerating}
                onClick={() => void onRegenerate()}
              >
                {regenerating ? "Regenerating…" : "Generate 10 new names"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowRegenStyles(false)}
              >
                Skip for now
              </Button>
            </div>
          </div>
        ) : null}

        <ul className="flex flex-col divide-y">
          {batchNames.map((entry) => {
            const normalized = normalizeFamilyName(entry.name)
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

      {showShortlistPanel ? (
        <Card className="ceremony-panel">
          <CardHeader className="border-b">
            <CardTitle className="text-base">Your shortlist</CardTitle>
            <CardDescription>
              {shortlist.length} of {MAX_FAMILY_SHORTLIST_TOTAL} saved · pick one
              favourite before unlocking.
            </CardDescription>
          </CardHeader>
          <ul className="flex flex-col divide-y">
            {shortlist.map((entry) => {
              const isFavourite =
                favouriteNormalized === normalizeFamilyName(entry.name)
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

      {!tunnelMode ? (
        <FamilyNamePaywallTeaser
          unlockEnabled={unlockEnabled}
          unlocking={unlocking}
          onUnlock={() => void onUnlock()}
        />
      ) : null}
    </div>
  )
}
