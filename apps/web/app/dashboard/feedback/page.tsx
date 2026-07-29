import { dataComponent } from "@/lib/data-component"
import { FeedbackView } from "@/modules/feedback/ui/views/feedback-view"

export default function Page() {
  return (
    <div
      {...dataComponent("FeedbackPage")}
      className="flex flex-1 flex-col p-4 md:p-6"
    >
      <FeedbackView />
    </div>
  )
}
