"use client"

/**
 * KB-004 ceremony shell — one route that swaps UI panels by `cat.ceremonyStep`.
 *
 * Orchestrates the full `/cats/[catId]` experience: loading/empty states,
 * progress stepper, standard single-column layout, or naming tunnel layout.
 * Data and mutations live in `use-cat-ceremony-page`; panel visibility in lib.
 */

import { CeremonyStepper } from "@/modules/ceremony/ui/components/ceremony-stepper"
import { CeremonyTunnelLayout } from "@/modules/ceremony/ui/layouts/ceremony-tunnel-layout"
import { useCatCeremonyPage } from "@/modules/cats/ui/hooks/use-cat-ceremony-page"
import {
  CatCeremonyMissingIdState,
  CatCeremonyNotFoundState,
} from "@/modules/cats/ui/views/cat-ceremony-empty-states"
import { CatCeremonySkeleton } from "@/modules/cats/ui/views/cat-ceremony-skeleton"
import { CatCeremonyStandardLayout } from "@/modules/cats/ui/views/cat-ceremony-standard-layout"
import { CatCeremonyTunnelMain } from "@/modules/cats/ui/views/cat-ceremony-tunnel-main"
import { CatCeremonyTunnelSidebar } from "@/modules/cats/ui/views/cat-ceremony-tunnel-sidebar"
import { dataComponent } from "@/lib/data-component"

export function CatCeremonyView() {
  const {
    catIdParam,
    cat,
    panels,
    photoBlock,
    setEditingProfileFromSummary,
    retrying,
    returningToProfile,
    retryingFamilyNames,
    onRetryPipeline,
    onRetryFamilyNames,
    onBackToProfile,
  } = useCatCeremonyPage()

  // Invalid URL — no cat id to query.
  if (catIdParam === undefined) {
    return <CatCeremonyMissingIdState />
  }

  // Convex query still loading.
  if (cat === undefined) {
    return <CatCeremonySkeleton />
  }

  // Not found or not owned by the signed-in user.
  if (cat === null) {
    return <CatCeremonyNotFoundState />
  }

  return (
    <div {...dataComponent("CatCeremonyView")} className="contents">
      <CeremonyStepper currentStep={cat.ceremonyStep} />

      {panels.showNamingTunnel ? (
        <CeremonyTunnelLayout
          main={
            <CatCeremonyTunnelMain
              cat={cat}
              panels={panels}
              retryingFamilyNames={retryingFamilyNames}
              onRetryFamilyNames={() => void onRetryFamilyNames()}
            />
          }
          sidebar={<CatCeremonyTunnelSidebar cat={cat} />}
        />
      ) : (
        <CatCeremonyStandardLayout
          cat={cat}
          panels={panels}
          photoBlock={photoBlock}
          retrying={retrying}
          returningToProfile={returningToProfile}
          retryingFamilyNames={retryingFamilyNames}
          onRetryPipeline={() => void onRetryPipeline()}
          onBackToProfile={() => void onBackToProfile()}
          onRetryFamilyNames={() => void onRetryFamilyNames()}
          onEditProfileFromSummary={() => setEditingProfileFromSummary(true)}
        />
      )}
    </div>
  )
}
