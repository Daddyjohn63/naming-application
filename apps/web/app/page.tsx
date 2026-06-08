import type { Metadata } from "next"

//import { LandingView } from "@/modules/landing/ui/views/landing-view"
import { SectionHeader } from "@/modules/landing/ui/components/section-header"
import { LandingHero } from "@/modules/landing/ui/components/landing-hero"
export const metadata: Metadata = {
  title: "Naming Buddy — Start your cat naming ceremony",
  description:
    "Guided funnel for cat owners: family names, cat-world names, and the ineffable one — from profile to certificate.",
}

export default async function HomePage() {
  return (
    <>
      {/* <LandingView /> */}
      <LandingHero />
      <SectionHeader
        eyebrow="Stussy cold-pressed offil"
        title="Post-rock neutral"
        description="Squid dog dad vegan locavore girl dinner aeropress dembow akerman bode late capitalism shabby chic pour-over cred."
      />
    </>
  )
}
