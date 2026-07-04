import type { Metadata } from "next"

import { CertificateShowcase } from "@/modules/landing/ui/components/certificate-showcase"
import { FaqSection } from "@/modules/landing/ui/components/faq-section"
import { FinalCta } from "@/modules/landing/ui/components/final-cta"
import { HowItWorks } from "@/modules/landing/ui/components/how-it-works"
import { LandingHero } from "@/modules/landing/ui/components/landing-hero"
import { PoemTribute } from "@/modules/landing/ui/components/poem-tribute"
import { PricingSection } from "@/modules/landing/ui/components/pricing-section"
import { ThreeNamesSection } from "@/modules/landing/ui/components/three-names-section"

export const metadata: Metadata = {
  title: "Naming Buddy — Discover your cat's three names",
  description:
    "A guided AI naming ceremony for cat owners: an everyday family name, a globally unique cat-world name, and a playful guess at the ineffable one — finished with a keepsake certificate. Free to start, $3.99 per cat to complete.",
}

export default function HomePage() {
  return (
    <>
      <LandingHero />
      <ThreeNamesSection />
      <PoemTribute />
      <HowItWorks />
      <CertificateShowcase />
      <PricingSection />
      <FaqSection />
      <FinalCta />
    </>
  )
}
