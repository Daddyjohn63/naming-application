import { CertificateShowcase } from "@/modules/landing/ui/components/certificate-showcase"
import { FaqSection } from "@/modules/landing/ui/components/faq-section"
import { FinalCta } from "@/modules/landing/ui/components/final-cta"
import { HowItWorks } from "@/modules/landing/ui/components/how-it-works"
import { LandingHero } from "@/modules/landing/ui/components/landing-hero"
import { PoemTribute } from "@/modules/landing/ui/components/poem-tribute"
import { PricingSection } from "@/modules/landing/ui/components/pricing-section"
import { ThreeNamesSection } from "@/modules/landing/ui/components/three-names-section"
import { WhoItsFor } from "@/modules/landing/ui/components/who-its-for"
import { LANDING_FAQ_ITEMS } from "@/modules/landing/lib/landing-faq"
import {
  JsonLd,
  buildFaqPageJsonLd,
  buildWebsiteJsonLd,
} from "@/lib/seo/json-ld"
import { createPageMetadata } from "@/lib/seo/metadata"
import { APP_NAME } from "@workspace/shared/constants/app"
import {
  SITE_DESCRIPTION,
  SITE_TAGLINE,
} from "@workspace/shared/constants/site"

export const metadata = createPageMetadata({
  title: `${APP_NAME} — ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
})

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildWebsiteJsonLd()} />
      <JsonLd data={buildFaqPageJsonLd(LANDING_FAQ_ITEMS)} />
      <LandingHero />
      <ThreeNamesSection />
      <PoemTribute />
      <WhoItsFor />
      <HowItWorks />
      <CertificateShowcase />
      <PricingSection />
      <FaqSection />
      <FinalCta />
    </>
  )
}
