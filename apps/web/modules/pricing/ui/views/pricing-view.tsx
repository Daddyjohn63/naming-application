import { dataComponent } from "@/lib/data-component"
import { FinalCta } from "@/modules/landing/ui/components/final-cta"
import { PricingSection } from "@/modules/landing/ui/components/pricing-section"
import { PricingFaq } from "@/modules/pricing/ui/components/pricing-faq"
import { PricingHero } from "@/modules/pricing/ui/components/pricing-hero"
import { PricingHowItWorks } from "@/modules/pricing/ui/components/pricing-how-it-works"

/** Public Pricing page — explain free-to-unlock, then show the comparison cards. */
export function PricingView() {
  return (
    <main {...dataComponent("PricingView")} className="flex flex-1 flex-col">
      <PricingHero />
      <PricingHowItWorks />
      <PricingSection />
      <PricingFaq />
      <FinalCta />
    </main>
  )
}
