import { dataComponent } from "@/lib/data-component"
import { UserSupportView } from "@/modules/dashboard/ui/views/user-support-view"

export default function Page() {
  return (
    <div
      {...dataComponent("UserSupportPage")}
      className="flex flex-1 flex-col p-4 md:p-6"
    >
      <UserSupportView />
    </div>
  )
}
