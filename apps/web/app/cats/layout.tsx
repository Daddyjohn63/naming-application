import { AuthGuard } from "@/modules/auth/ui/components/auth-guard"
import { CeremonyShell } from "@/modules/ceremony/ui/layouts/ceremony-shell"
import { dataComponent } from "@/lib/data-component"
import { NO_INDEX_ROBOTS } from "@/lib/seo/metadata"
import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: NO_INDEX_ROBOTS,
}

export default function CatsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div {...dataComponent("CatsLayout")} className="contents">
      <AuthGuard>
        <CeremonyShell>{children}</CeremonyShell>
      </AuthGuard>
    </div>
  )
}
