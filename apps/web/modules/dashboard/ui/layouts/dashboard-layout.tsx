import { AuthGuard } from "@/modules/auth/ui/components/auth-guard"
import { DashboardHeader } from "@/modules/dashboard/ui/components/dashboard-header"
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { cookies } from "next/headers"
import type { CSSProperties } from "react"

import { dataComponent } from "@/lib/data-component"

export const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const cookieStore = await cookies()
  // Open on desktop by default; only stay collapsed when the user previously closed it.
  // Mobile uses a separate sheet state that always starts closed.
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <AuthGuard>
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={
          {
            "--sidebar-width": "18rem",
          } as CSSProperties
        }
      >
        <DashboardSidebar />
        <SidebarInset
          {...dataComponent("DashboardLayout")}
          className="flex flex-1 flex-col"
        >
          <DashboardHeader />
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
