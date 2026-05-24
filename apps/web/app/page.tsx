import { auth } from "@clerk/nextjs/server"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { LandingView } from "@/modules/landing/ui/views/landing-view"

export const metadata: Metadata = {
  title: "Naming Buddy — Start your cat naming ceremony",
  description:
    "Guided funnel for cat owners: family names, cat-world names, and the ineffable one — from profile to certificate.",
}

export default async function HomePage() {
  const { userId } = await auth()
  if (userId !== null && userId !== "") {
    redirect("/dashboard")
  }

  return <LandingView />
}
