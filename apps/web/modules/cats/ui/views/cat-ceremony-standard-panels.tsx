/**
 * Step panels for the standard (single-column) ceremony layout.
 *
 * Renders profile, summary, family style, and family curation panels based on
 * `ceremonyStep`. Does not include the naming tunnel — that branch uses
 * `CatCeremonyTunnelMain` instead.
 */

import { CatProfileForm } from "@/modules/cats/ui/components/cat-profile-form"
import {
  CatPhotoBlockAlert,
  CatSummaryPipelineStatus,
} from "@/modules/cats/ui/components/cat-summary-pipeline-status"
import { CatSummaryReview } from "@/modules/cats/ui/components/cat-summary-review"
import { FamilyNameCuration } from "@/modules/cats/ui/components/family-name-curation"
import { FamilyNamePipelineStatus } from "@/modules/cats/ui/components/family-name-pipeline-status"
import { FamilyNameStylePicker } from "@/modules/cats/ui/components/family-name-style-picker"
import type {
  CatCeremonyPanelFlags,
  CatCeremonyPhotoBlock,
} from "@/modules/cats/lib/cat-ceremony-panel-visibility"
import type { CatCeremonyDoc } from "@/modules/cats/lib/cat-ceremony-types"
import { dataComponent } from "@/lib/data-component"

type CatCeremonyStandardPanelsProps = {
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

export function CatCeremonyStandardPanels({
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
}: CatCeremonyStandardPanelsProps) {
  const { title: photoBlockTitle, message: photoBlockMessage } = photoBlock

  return (
    <div {...dataComponent("CatCeremonyStandardPanels")} className="contents">
      {/* Photo validation failure — alert above profile form when sent back from validation */}
      {photoBlockMessage !== null && photoBlockTitle !== null ? (
        <CatPhotoBlockAlert
          title={photoBlockTitle}
          message={photoBlockMessage}
        />
      ) : null}

      {panels.showProfileForm ? (
        <CatProfileForm cat={cat} photoIssueMessage={photoBlockMessage} />
      ) : null}

      {panels.showSummaryPipeline ? (
        <CatSummaryPipelineStatus
          cat={cat}
          onRetry={onRetryPipeline}
          retrying={retrying}
          onBackToProfile={onBackToProfile}
          returningToProfile={returningToProfile}
        />
      ) : null}

      {panels.showSummaryReview ? (
        <CatSummaryReview
          cat={cat}
          onEditProfile={onEditProfileFromSummary}
        />
      ) : null}

      {panels.showFamilyStyle ? <FamilyNameStylePicker cat={cat} /> : null}

      {panels.showFamilyNamePipeline ? (
        <FamilyNamePipelineStatus
          cat={cat}
          onRetry={onRetryFamilyNames}
          retrying={retryingFamilyNames}
        />
      ) : null}

      {/* Single-column curation until a family favourite unlocks the tunnel layout */}
      {panels.showFamilyCuration && !panels.showNamingTunnel ? (
        <FamilyNameCuration cat={cat} />
      ) : null}
    </div>
  )
}
