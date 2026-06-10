/**
 * Standard single-column ceremony layout (non-tunnel steps).
 *
 * Stacks header, step panels, and optional "later step" placeholder inside
 * the max-width main column used for profile → family style journey stages.
 */

import type {
  CatCeremonyPanelFlags,
  CatCeremonyPhotoBlock,
} from "@/modules/cats/lib/cat-ceremony-panel-visibility"
import type { CatCeremonyDoc } from "@/modules/cats/lib/cat-ceremony-types"
import { CatCeremonyHeader } from "@/modules/cats/ui/views/cat-ceremony-header"
import { CatCeremonyLaterStepPlaceholder } from "@/modules/cats/ui/views/cat-ceremony-later-step-placeholder"
import { CatCeremonyStandardPanels } from "@/modules/cats/ui/views/cat-ceremony-standard-panels"
import { dataComponent } from "@/lib/data-component"

type CatCeremonyStandardLayoutProps = {
  cat: CatCeremonyDoc
  panels: CatCeremonyPanelFlags
  photoBlock: CatCeremonyPhotoBlock
  retrying: boolean
  returningToProfile: boolean
  retryingFamilyNames: boolean
  onRetryPipeline: () => void
  onBackToProfile: () => void
  onRetryFamilyNames: () => void
  onEditProfileFromSummary: () => void
}

export function CatCeremonyStandardLayout({
  cat,
  panels,
  photoBlock,
  retrying,
  returningToProfile,
  retryingFamilyNames,
  onRetryPipeline,
  onBackToProfile,
  onRetryFamilyNames,
  onEditProfileFromSummary,
}: CatCeremonyStandardLayoutProps) {
  return (
    <main
      {...dataComponent("CatCeremonyStandardLayout")}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 lg:max-w-4xl"
    >
      <CatCeremonyHeader cat={cat} />

      <CatCeremonyStandardPanels
        cat={cat}
        panels={panels}
        photoBlock={photoBlock}
        retrying={retrying}
        returningToProfile={returningToProfile}
        retryingFamilyNames={retryingFamilyNames}
        onRetryPipeline={onRetryPipeline}
        onBackToProfile={onBackToProfile}
        onRetryFamilyNames={onRetryFamilyNames}
        onEditProfileFromSummary={onEditProfileFromSummary}
      />

      {panels.showLaterStepPlaceholder ? (
        <CatCeremonyLaterStepPlaceholder />
      ) : null}
    </main>
  )
}
