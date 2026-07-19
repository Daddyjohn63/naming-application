import type { Metadata } from "next"

import { LandingHeroLegacy } from "@/modules/landing/ui/legacy/landing-hero-legacy"
import { NameCards } from "@/modules/landing/ui/components/name-cards"
import { SectionHeader } from "@/modules/landing/ui/components/section-header"
import { APP_NAME } from "@workspace/shared/constants/app"

export const metadata: Metadata = {
  title: `${APP_NAME} — Previous home page`,
  description:
    "Snapshot of the previous home page, kept for reference during the redesign.",
  robots: { index: false, follow: false },
}

/** Snapshot of the home page before the redesign — kept so nothing is lost. */
export default function HomeLegacyPage() {
  return (
    <>
      <LandingHeroLegacy />
      <SectionHeader
        eyebrow="Inspired by T.S Eliot's 'The Naming of Cats'"
        title="Find your cat's three names "
        description="Cat's have three names: a family name, a cat-world name, and an ineffable name. Use our guided ceremony to find the perfect names for your cat."
      />
      <NameCards />
    </>
  )
}
