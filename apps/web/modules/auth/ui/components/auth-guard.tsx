"use client"

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react"
import { dataComponent } from "@/lib/data-component"
import { AuthLayout } from "../layouts/auth-layout"
import { SignInView } from "../views/sign-in-view"

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div {...dataComponent("AuthGuard")} className="contents">
      <AuthLoading>
        <AuthLayout>
          <p>Loading...</p>
        </AuthLayout>
      </AuthLoading>
      <Authenticated>{children}</Authenticated>
      <Unauthenticated>
        <AuthLayout>
          <SignInView />
        </AuthLayout>
      </Unauthenticated>
    </div>
  )
}
