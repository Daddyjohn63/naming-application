import { dataComponent } from "@/lib/data-component"
import { PRICING_FAQ_ITEMS } from "@/modules/pricing/lib/pricing-faq"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"

/** Pricing-specific FAQ for the dedicated Pricing page. */
export function PricingFaq() {
  return (
    <section
      {...dataComponent("PricingFaq")}
      className="w-full border-b border-border/40"
    >
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base/7 font-semibold">Questions</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Pricing questions, answered
          </h2>
          <p className="mt-6 text-lg text-pretty text-muted-foreground">
            The short version: free to explore, and free to unlock during beta.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-12">
          {PRICING_FAQ_ITEMS.map(({ question, answer }) => (
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
