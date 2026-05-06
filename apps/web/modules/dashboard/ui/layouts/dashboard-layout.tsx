import { AuthGuard } from "@/modules/auth/ui/components/auth-guard"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { cookies } from "next/headers"
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar"

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
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
          </header>

          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
