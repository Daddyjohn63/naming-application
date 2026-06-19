import type { Metadata } from "next"

//import { LandingView } from "@/modules/landing/ui/views/landing-view"
import { SectionHeader } from "@/modules/landing/ui/components/section-header"
import { LandingHero } from "@/modules/landing/ui/components/landing-hero"
import { NameCards } from "@/modules/landing/ui/components/name-cards"
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
        eyebrow="Inspired by T.S Eliot's 'The Naming of Cats'"
        title="Find your cat's three names "
        description="Cat's have three names: a family name, a cat-world name, and an ineffable name. Use our guided ceremony to find the perfect names for your cat."
      />
      <NameCards />
    </>
  )
}
