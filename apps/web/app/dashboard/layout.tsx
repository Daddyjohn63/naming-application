import { DashboardLayout } from "@/modules/dashboard/ui/layouts/dashboard-layout"
import { dataComponent } from "@/lib/data-component"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div {...dataComponent("DashboardRouteLayout")} className="contents">
      <DashboardLayout>{children}</DashboardLayout>
    </div>
  )
}

export default Layout
