/**
 * Main column content for the KB-006A naming tunnel layout.
 *
 * Shown once the owner has picked a family favourite: three-name cards,
 * optional family pipeline status, and curation in tunnel mode.
 */

import { CeremonyThreeNamesView } from "@/modules/ceremony/ui/components/ceremony-three-names-view"
import { FamilyNameCuration } from "@/modules/cats/ui/components/family-name-curation"
import { FamilyNamePipelineStatus } from "@/modules/cats/ui/components/family-name-pipeline-status"
import type { CatCeremonyPanelFlags } from "@/modules/cats/lib/cat-ceremony-panel-visibility"
import type { CatCeremonyDoc } from "@/modules/cats/lib/cat-ceremony-types"
import { CatCeremonyHeader } from "@/modules/cats/ui/views/cat-ceremony-header"
import { dataComponent } from "@/lib/data-component"

type CatCeremonyTunnelMainProps = {
  cat: CatCeremonyDoc
  panels: CatCeremonyPanelFlags
  retryingFamilyNames: boolean
  onRetryFamilyNames: () => void
}

export function CatCeremonyTunnelMain({
  cat,
  panels,
  retryingFamilyNames,
  onRetryFamilyNames,
}: CatCeremonyTunnelMainProps) {
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

      {panels.showFamilyCuration ? (
        <FamilyNameCuration cat={cat} tunnelMode />
      ) : null}
    </div>
  )
}
