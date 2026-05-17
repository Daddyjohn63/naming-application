import { AuthGuard } from "@/modules/auth/ui/components/auth-guard"
import { CeremonyShell } from "@/modules/ceremony/ui/layouts/ceremony-shell"

export default function CatsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <CeremonyShell>{children}</CeremonyShell>
    </AuthGuard>
  )
}
