import { DashboardLayout } from "@/modules/dashboard/ui/layouts/dashboard-layout"
import { dataComponent } from "@/lib/data-component"
import { NO_INDEX_ROBOTS } from "@/lib/seo/metadata"
import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: NO_INDEX_ROBOTS,
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div {...dataComponent("DashboardRouteLayout")} className="contents">
      <DashboardLayout>{children}</DashboardLayout>
    </div>
  )
}

export default Layout
