import { dataComponent } from "@/lib/data-component"
import { FeedbackForm } from "@/modules/feedback/ui/components/feedback-form"
import { APP_NAME } from "@workspace/shared/constants/app"

/** Dashboard feedback page — rating + optional free text for beta users. */
export function FeedbackView() {
  return (
    <div
      {...dataComponent("FeedbackView")}
      className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8"
    >
      <header className="space-y-3">
        <h1 className="font-sans text-3xl font-semibold tracking-tight">
          Leave feedback
        </h1>
        <p className="text-base leading-relaxed text-pretty text-muted-foreground">
          Got 30 seconds? A quick rating helps us improve {APP_NAME} during
          beta. Comments are optional.
        </p>
      </header>

      <FeedbackForm source="dashboard" />
    </div>
  )
}
