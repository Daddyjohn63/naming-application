"use client"

/**
 * Main column content for the KB-006A naming tunnel layout.
 *
 * Shown once the owner has picked a family favourite: three-name cards,
 * optional family pipeline status, and curation in tunnel mode.
 *
 * KB-009/010 additions:
 * - `CeremonyStageSwitcher` — user picks cat-world vs ineffable vs certificate tab
 * - `StageNameCuration` / `StageNamePipelineStatus` — paid stages share one UI pair
 * - `useCeremonyStageContinue` — prominent handoff after cat-world favourite
 * - `activeView` syncs from ceremonyStep (not from favourite alone — see ceremony-naming-view.ts)
 */

import * as React from "react"
import { useMutation, useQuery } from "convex/react"

import { api } from "@workspace/backend/_generated/api"
import { CeremonyCertificatePrep } from "@/modules/ceremony/ui/components/ceremony-certificate-prep"
import {
  CeremonyStageSwitcher,
  type CeremonyNamingView,
} from "@/modules/ceremony/ui/components/ceremony-stage-switcher"
import { CeremonyStageContinuePrompt } from "@/modules/ceremony/ui/components/ceremony-stage-continue-prompt"
import { CeremonyThreeNamesView } from "@/modules/ceremony/ui/components/ceremony-three-names-view"
import { CeremonyUnlockPrompt } from "@/modules/ceremony/ui/components/ceremony-unlock-prompt"
import { defaultCeremonyNamingView } from "@/modules/ceremony/lib/ceremony-naming-view"
import { useCeremonyStageContinue } from "@/modules/ceremony/lib/use-ceremony-stage-continue"
import { FamilyNameCuration } from "@/modules/cats/ui/components/family-name-curation"
import { FamilyNamePipelineStatus } from "@/modules/cats/ui/components/family-name-pipeline-status"
import { StageNameCuration } from "@/modules/cats/ui/components/stage-name-curation"
import { StageNamePipelineStatus } from "@/modules/cats/ui/components/stage-name-pipeline-status"
import type { CatCeremonyPanelFlags } from "@/modules/cats/lib/cat-ceremony-panel-visibility"
import type { CatCeremonyDoc } from "@/modules/cats/lib/cat-ceremony-types"
import { CatCeremonyHeader } from "@/modules/cats/ui/views/cat-ceremony-header"
import { dataComponent } from "@/lib/data-component"

type CatCeremonyTunnelMainProps = {
  cat: CatCeremonyDoc
  panels: CatCeremonyPanelFlags
  retryingFamilyNames: boolean
  retryingCatWorldNames: boolean
  retryingIneffableNames: boolean
  onRetryFamilyNames: () => void
  onRetryCatWorldNames: () => void
  onRetryIneffableNames: () => void
}

export function CatCeremonyTunnelMain({
  cat,
  panels,
  retryingFamilyNames,
  retryingCatWorldNames,
  retryingIneffableNames,
  onRetryFamilyNames,
  onRetryCatWorldNames,
  onRetryIneffableNames,
}: CatCeremonyTunnelMainProps) {
  const catWorldState = useQuery(api.catWorldNaming.getCatWorldNamingStateForOwner, {
    catId: cat._id,
  })
  const ineffableState = useQuery(api.ineffableNaming.getIneffableNamingStateForOwner, {
    catId: cat._id,
  })

  const confirmIneffable = useMutation(api.ineffableNaming.confirmIneffableFavourite)
  const {
    continuing: continuingToIneffable,
    continueToIneffable,
    showContinueToIneffable,
    needsCatWorldConfirm,
  } = useCeremonyStageContinue(cat)

  const [activeView, setActiveView] = React.useState<CeremonyNamingView>(() =>
    defaultCeremonyNamingView(cat),
  )

  // Re-sync tab when step advances (e.g. naming_cat_world → naming_ineffable).
  // Do not depend on selectedCatWorldName — that caused premature tab switch before Continue.
  React.useEffect(() => {
    setActiveView(defaultCeremonyNamingView(cat))
  }, [cat.ceremonyStep, cat.selectedIneffableName])

  const onContinueToIneffable = async () => {
    await continueToIneffable()
    setActiveView("ineffable")
  }

  const catWorldNamingState =
    catWorldState === null || catWorldState === undefined
      ? catWorldState
      : {
          shortlist: catWorldState.shortlist,
          selectedName: catWorldState.selectedCatWorldName,
          selectedRationale: catWorldState.selectedCatWorldRationale,
          regenerationsUsed: catWorldState.catWorldNameRegenerationsUsed,
          currentBatch: catWorldState.currentBatch,
          savedFromCurrentBatchCount: catWorldState.savedFromCurrentBatchCount,
        }

  const ineffableNamingState =
    ineffableState === null || ineffableState === undefined
      ? ineffableState
      : {
          shortlist: ineffableState.shortlist,
          selectedName: ineffableState.selectedIneffableName,
          selectedRationale: ineffableState.selectedIneffableRationale,
          regenerationsUsed: ineffableState.ineffableNameRegenerationsUsed,
          currentBatch: ineffableState.currentBatch,
          savedFromCurrentBatchCount: ineffableState.savedFromCurrentBatchCount,
        }

  return (
    <div {...dataComponent("CatCeremonyTunnelMain")} className="contents">
      <CatCeremonyHeader cat={cat} />

      {panels.showFamilyNamePipeline ? (
        <FamilyNamePipelineStatus
          cat={cat}
          onRetry={onRetryFamilyNames}
          retrying={retryingFamilyNames}
        />
      ) : null}

      <CeremonyThreeNamesView cat={cat} />

      <CeremonyUnlockPrompt cat={cat} />

      {panels.showPaidNaming && showContinueToIneffable ? (
        <CeremonyStageContinuePrompt
          title={
            needsCatWorldConfirm
              ? "Cat-world name chosen — ready for the next stage?"
              : "Start your ineffable near-names"
          }
          description={
            needsCatWorldConfirm
              ? "lock it in and we'll generate playful approximations of your cat's secret name."
              : "We'll generate ten whimsical near-names for you to choose from."
          }
          highlightName={
            needsCatWorldConfirm ? cat.selectedCatWorldName : undefined
          }
          buttonLabel="Continue to ineffable names"
          continuing={continuingToIneffable}
          onContinue={() => void onContinueToIneffable()}
        />
      ) : null}

      {panels.showPaidNaming ? (
        <>
          <CeremonyStageSwitcher
            cat={cat}
            activeView={activeView}
            onChange={setActiveView}
          />

          {activeView === "cat_world" ? (
            <>
              {panels.showCatWorldNamePipeline ? (
                <StageNamePipelineStatus
                  stage="cat_world"
                  cat={cat}
                  onRetry={onRetryCatWorldNames}
                  retrying={retryingCatWorldNames}
                />
              ) : null}
              {!panels.showCatWorldNamePipeline &&
              catWorldNamingState?.currentBatch !== null &&
              catWorldNamingState?.currentBatch !== undefined ? (
                <StageNameCuration
                  cat={cat}
                  stage="cat_world"
                  state={catWorldNamingState}
                  title="Cat-world name suggestions"
                  description="Save up to three names from this batch"
                />
              ) : null}
            </>
          ) : null}

          {activeView === "ineffable" ? (
            <>
              {panels.showIneffableNamePipeline ? (
                <StageNamePipelineStatus
                  stage="ineffable"
                  cat={cat}
                  onRetry={onRetryIneffableNames}
                  retrying={retryingIneffableNames}
                />
              ) : null}
              {!panels.showIneffableNamePipeline &&
              ineffableNamingState?.currentBatch !== null &&
              ineffableNamingState?.currentBatch !== undefined ? (
                <StageNameCuration
                  cat={cat}
                  stage="ineffable"
                  state={ineffableNamingState}
                  title="Ineffable near-name suggestions"
                  description="Save up to three approximations from this batch"
                  framingCopy="These are playful guesses at your cat's secret name — the one no human can truly know. Pick the near-name that feels closest to the mystery."
                  onConfirmContinue={
                    cat.ceremonyStep === "naming_ineffable"
                      ? async () => {
                          await confirmIneffable({ catId: cat._id })
                          setActiveView("certificate")
                        }
                      : undefined
                  }
                  confirmLabel="Finish naming — prepare certificate"
                />
              ) : null}
            </>
          ) : null}

          {activeView === "certificate" ? <CeremonyCertificatePrep cat={cat} /> : null}
        </>
      ) : null}

      {panels.showFamilyCuration ? (
        <FamilyNameCuration cat={cat} tunnelMode />
      ) : null}
    </div>
  )
}
