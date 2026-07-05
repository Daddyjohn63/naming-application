/**
 * Next.js route entry for `/cats/[catId]/certificate` (KB-011).
 *
 * Thin wrapper — certificate logic lives in `CatCertificateView` under
 * modules/ceremony. Auth and shell layout are handled by `app/cats/layout.tsx`.
 */

import { CatCertificateView } from "@/modules/ceremony/ui/views/cat-certificate-view"
import { dataComponent } from "@/lib/data-component"

export default function CatCertificatePage() {
  return (
    <div {...dataComponent("CatCertificatePage")} className="contents">
      <CatCertificateView />
    </div>
  )
}
