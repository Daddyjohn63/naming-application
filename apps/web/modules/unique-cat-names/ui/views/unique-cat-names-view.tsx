import { dataComponent } from "@/lib/data-component"
import { FinalCta } from "@/modules/landing/ui/components/final-cta"
import { UniqueCatNamesFaq } from "@/modules/unique-cat-names/ui/components/unique-cat-names-faq"
import { UniqueCatNamesHero } from "@/modules/unique-cat-names/ui/components/unique-cat-names-hero"
import { UniqueCatNamesLayers } from "@/modules/unique-cat-names/ui/components/unique-cat-names-layers"
import { UniqueCatNamesPromise } from "@/modules/unique-cat-names/ui/components/unique-cat-names-promise"
import { UniqueCatNamesSteps } from "@/modules/unique-cat-names/ui/components/unique-cat-names-steps"

/** Public SEO hub for unique / unusual / literary cat-name intent. */
export function UniqueCatNamesView() {
  return (
    <main
      {...dataComponent("UniqueCatNamesView")}
      className="flex flex-1 flex-col"
    >
      <UniqueCatNamesHero />
      <UniqueCatNamesPromise />
      <UniqueCatNamesLayers />
      <UniqueCatNamesSteps />
      <UniqueCatNamesFaq />
      <FinalCta />
    </main>
  )
}
