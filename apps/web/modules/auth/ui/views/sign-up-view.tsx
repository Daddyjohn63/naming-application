import { SignUp } from "@clerk/nextjs"

import { dataComponent } from "@/lib/data-component"

export const SignUpView = () => {
  return (
    <div {...dataComponent("SignUpView")} className="contents">
      <SignUp
        routing="hash"
        fallbackRedirectUrl="/dashboard"
        signInFallbackRedirectUrl="/dashboard"
      />
    </div>
  )
}
