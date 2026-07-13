import { dataComponent } from "@/lib/data-component"
import { ExamplesGallery } from "@/modules/examples/ui/components/examples-gallery"
import { ExamplesHero } from "@/modules/examples/ui/components/examples-hero"
import { FinalCta } from "@/modules/landing/ui/components/final-cta"

/** Public Examples page — sample certificates in a browsable gallery. */
export function ExamplesView() {
  return (
    <main {...dataComponent("ExamplesView")} className="flex flex-1 flex-col">
      <ExamplesHero />
      <ExamplesGallery />
      <FinalCta />
    </main>
  )
}
