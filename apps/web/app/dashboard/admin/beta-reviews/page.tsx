import { dataComponent } from "@/lib/data-component"
import { AdminReviewsView } from "@/modules/feedback/ui/views/admin-reviews-view"

export default function Page() {
  return (
    <div
      {...dataComponent("AdminReviewsPage")}
      className="flex flex-1 flex-col p-4 md:p-6"
    >
      <AdminReviewsView />
    </div>
  )
}
