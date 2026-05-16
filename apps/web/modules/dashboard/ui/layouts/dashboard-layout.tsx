import { AuthGuard } from "@/modules/auth/ui/components/auth-guard"
import { DashboardHeader } from "@/modules/dashboard/ui/components/dashboard-header"
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
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
        <DashboardSidebar />
        <SidebarInset className="flex flex-1 flex-col">
          <DashboardHeader />
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
