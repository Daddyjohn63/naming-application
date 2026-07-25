import { dataComponent } from "@/lib/data-component"
import { LANDING_FAQ_ITEMS } from "@/modules/landing/lib/landing-faq"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"

/** Frequently asked questions about the ceremony, pricing, and certificate. */
export function FaqSection() {
  return (
    <section
      id="faq"
      {...dataComponent("FaqSection")}
      className="w-full scroll-mt-16 border-b border-border/40 bg-muted/30"
    >
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base/7 font-semibold">FAQ</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-6 text-lg text-pretty text-muted-foreground">
            Everything owners usually ask before the ceremony begins.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-12">
          {LANDING_FAQ_ITEMS.map(({ question, answer }) => (
            <AccordionItem key={question} value={question}>
              <AccordionTrigger className="py-4 text-base">
                {question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-base leading-relaxed text-muted-foreground">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
