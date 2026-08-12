import { dataComponent } from "@/lib/data-component"
import { CatNameGeneratorDifference } from "@/modules/cat-name-generator/ui/components/cat-name-generator-difference"
import { CatNameGeneratorFaq } from "@/modules/cat-name-generator/ui/components/cat-name-generator-faq"
import { CatNameGeneratorHero } from "@/modules/cat-name-generator/ui/components/cat-name-generator-hero"
import { CatNameGeneratorSteps } from "@/modules/cat-name-generator/ui/components/cat-name-generator-steps"
import { CatNameGeneratorThreeNames } from "@/modules/cat-name-generator/ui/components/cat-name-generator-three-names"
import { FinalCta } from "@/modules/landing/ui/components/final-cta"

/** Public SEO hub for “cat name generator” intent. */
export function CatNameGeneratorView() {
  return (
    <main
      {...dataComponent("CatNameGeneratorView")}
      className="flex flex-1 flex-col"
    >
      <CatNameGeneratorHero />
      <CatNameGeneratorDifference />
      <CatNameGeneratorThreeNames />
      <CatNameGeneratorSteps />
      <CatNameGeneratorFaq />
      <FinalCta />
    </main>
  )
}
