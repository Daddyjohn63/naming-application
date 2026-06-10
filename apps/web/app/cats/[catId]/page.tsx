/**
 * Next.js route entry for `/cats/[catId]`.
 *
 * Thin wrapper — ceremony logic lives in `CatCeremonyView` under modules/cats.
 * Auth and shell layout are handled by `app/cats/layout.tsx`.
 */

import { CatCeremonyView } from "@/modules/cats/ui/views/cat-ceremony-view"
import { dataComponent } from "@/lib/data-component"

export default function CatCeremonyPage() {
  return (
    <div {...dataComponent("CatCeremonyPage")} className="contents">
      <CatCeremonyView />
    </div>
  )
}
