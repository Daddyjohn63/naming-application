"use client"

/**
 * Main column content for the KB-006A naming tunnel layout.
 *
 * Shown once the owner has picked a family favourite: three-name cards,
 * optional family pipeline status, and curation in tunnel mode.
 *
 * KB-009/010 additions:
 * - `CeremonyStageSwitcher` — cat-world vs ineffable vs certificate (curation tabs
 *   lock once all three names are chosen)
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
import {
  allThreeCeremonyNamesChosen,
  defaultCeremonyNamingView,
} from "@/modules/ceremony/lib/ceremony-naming-view"
import { scrollToCeremonyCertificatePrep } from "@/modules/ceremony/lib/scroll-to-ceremony-certificate-prep"
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
    continuingToCatWorld,
    continueToCatWorld,
    showContinueToCatWorld,
  } = useCeremonyStageContinue(cat)

  const readyForCertificate = allThreeCeremonyNamesChosen(cat)
  const [activeView, setActiveView] = React.useState<CeremonyNamingView>(() =>
    defaultCeremonyNamingView(cat),
  )
  const wasReadyForCertificateRef = React.useRef(readyForCertificate)

  // Re-sync tab when step advances (e.g. naming_cat_world → naming_ineffable).
  // Do not depend on selectedCatWorldName — that caused premature tab switch before Continue.
  React.useEffect(() => {
    setActiveView(defaultCeremonyNamingView(cat))
  }, [cat.ceremonyStep, cat.selectedIneffableName])

  // When the third name is chosen, open Certificate and bring the main CTA into view.
  React.useEffect(() => {
    if (readyForCertificate && !wasReadyForCertificateRef.current) {
      wasReadyForCertificateRef.current = true
      setActiveView("certificate")
      scrollToCeremonyCertificatePrep()
      return
    }
    if (!readyForCertificate) {
      wasReadyForCertificateRef.current = false
    }
  }, [
    readyForCertificate,
    cat.selectedFamilyName,
    cat.selectedCatWorldName,
    cat.selectedIneffableName,
  ])

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
          generatedBatches: catWorldState.generatedBatches,
          currentBatch: catWorldState.currentBatch,
        }

  const ineffableNamingState =
    ineffableState === null || ineffableState === undefined
      ? ineffableState
      : {
          shortlist: ineffableState.shortlist,
          selectedName: ineffableState.selectedIneffableName,
          selectedRationale: ineffableState.selectedIneffableRationale,
          regenerationsUsed: ineffableState.ineffableNameRegenerationsUsed,
          generatedBatches: ineffableState.generatedBatches,
          currentBatch: ineffableState.currentBatch,
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

      {panels.showPaidNaming && showContinueToCatWorld ? (
        <CeremonyStageContinuePrompt
          title="Start your cat-world names"
          description="We'll generate ten distinctive names for you to choose from."
          buttonLabel="Generate cat-world names"
          continuing={continuingToCatWorld}
          onContinue={() => void continueToCatWorld()}
        />
      ) : null}

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
          {/* Stage tabs only while curating — once all three names are chosen,
              the three-name cards + shortlists + certificate CTA are enough. */}
          {!readyForCertificate ? (
            <CeremonyStageSwitcher
              cat={cat}
              activeView={activeView}
              onChange={setActiveView}
            />
          ) : null}

          {!readyForCertificate && activeView === "cat_world" ? (
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
              catWorldNamingState?.generatedBatches !== null &&
              catWorldNamingState?.generatedBatches !== undefined ? (
                <StageNameCuration
                  cat={cat}
                  stage="cat_world"
                  state={catWorldNamingState}
                  title="Cat-world name suggestions"
                  description="Save up to six names to your shortlist"
                />
              ) : null}
            </>
          ) : null}

          {!readyForCertificate && activeView === "ineffable" ? (
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
              ineffableNamingState?.generatedBatches !== null &&
              ineffableNamingState?.generatedBatches !== undefined ? (
                <StageNameCuration
                  cat={cat}
                  stage="ineffable"
                  state={ineffableNamingState}
                  title="Ineffable near-name suggestions"
                  description="Save up to six approximations to your shortlist"
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

          {readyForCertificate || activeView === "certificate" ? (
            <CeremonyCertificatePrep cat={cat} />
          ) : null}
        </>
      ) : null}

      {panels.showFamilyCuration ? (
        <FamilyNameCuration cat={cat} tunnelMode />
      ) : null}
    </div>
  )
}
