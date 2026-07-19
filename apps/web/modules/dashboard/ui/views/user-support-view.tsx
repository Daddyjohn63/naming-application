import { dataComponent } from "@/lib/data-component"
import { UserSupportContact } from "@/modules/dashboard/ui/components/user-support-contact"
import { UserSupportFaq } from "@/modules/dashboard/ui/components/user-support-faq"
import { UserSupportHowto } from "@/modules/dashboard/ui/components/user-support-howto"
import { APP_NAME } from "@workspace/shared/constants/app"

/** Dashboard User Support — how-to guide, FAQ, and contact. */
export function UserSupportView() {
  return (
    <div
      {...dataComponent("UserSupportView")}
      className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-14"
    >
      <header className="space-y-3">
        <h1 className="font-sans text-3xl font-semibold tracking-tight">
          User support
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-pretty text-muted-foreground">
          A friendly guide to {APP_NAME} — how the ceremony flows, what each
          name means, the limits that apply, and answers to common questions.
          If you still need a hand, our support email is at the bottom.
        </p>
      </header>

      <UserSupportHowto />
      <UserSupportFaq />
      <UserSupportContact />
    </div>
  )
}
