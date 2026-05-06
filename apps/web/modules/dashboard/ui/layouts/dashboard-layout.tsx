import { AuthGuard } from "@/modules/auth/ui/components/auth-guard"
import {
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { cookies } from "next/headers"

export const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <AuthGuard>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SidebarTrigger />
        <main className="flex flex-1 flex-col">{children}</main>
      </SidebarProvider>
    </AuthGuard>
  )
}
