import { SignIn } from "@clerk/nextjs"

import { dataComponent } from "@/lib/data-component"

export const SignInView = () => {
  return (
    <div {...dataComponent("SignInView")} className="contents">
      <SignIn
        routing="hash"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  )
}
