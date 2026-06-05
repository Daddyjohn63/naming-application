import { DashboardHomeView } from "@/modules/dashboard/ui/views/dashboard-home-view"
import { dataComponent } from "@/lib/data-component"

export default function Page() {
  return (
    <div
      {...dataComponent("DashboardPage")}
      className="flex flex-1 flex-col p-4 md:p-6"
    >
      <DashboardHomeView />
    </div>
  )
}
