/**
 * Sidebar column for the naming tunnel — unlock teaser and cat summary card.
 *
 * Passed to `CeremonyTunnelLayout` as the `sidebar` slot when the owner has
 * a family favourite and the journey enters the two-column naming tunnel.
 */

import { CeremonyUnlockSidebar } from "@/modules/ceremony/ui/components/ceremony-unlock-sidebar"
import { CatSummary } from "@/modules/cats/ui/components/cat-summary"
import type { CatCeremonyDoc } from "@/modules/cats/lib/cat-ceremony-types"
import { dataComponent } from "@/lib/data-component"

type CatCeremonyTunnelSidebarProps = {
  cat: CatCeremonyDoc
}

export function CatCeremonyTunnelSidebar({ cat }: CatCeremonyTunnelSidebarProps) {
  return (
    <div {...dataComponent("CatCeremonyTunnelSidebar")} className="contents">
      <CeremonyUnlockSidebar cat={cat} />
      <CatSummary catId={cat._id} />
    </div>
  )
}
