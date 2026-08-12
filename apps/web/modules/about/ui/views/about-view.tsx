import { dataComponent } from "@/lib/data-component"
import { AboutHero } from "@/modules/about/ui/components/about-hero"
import { AboutInspiration } from "@/modules/about/ui/components/about-inspiration"
import { AboutLoveOfCats } from "@/modules/about/ui/components/about-love-of-cats"
import { AboutProductDefinition } from "@/modules/about/ui/components/about-product-definition"
import { AboutWhatWeDo } from "@/modules/about/ui/components/about-what-we-do"
import { AboutWhoFor } from "@/modules/about/ui/components/about-who-for"
import { FinalCta } from "@/modules/landing/ui/components/final-cta"

/** Public About page — origin story, love of cats, and what the ceremony offers. */
export function AboutView() {
  return (
    <main {...dataComponent("AboutView")} className="flex flex-1 flex-col">
      <AboutHero />
      <AboutProductDefinition />
      <AboutLoveOfCats />
      <AboutInspiration />
      <AboutWhatWeDo />
      <AboutWhoFor />
      <FinalCta />
    </main>
  )
}
