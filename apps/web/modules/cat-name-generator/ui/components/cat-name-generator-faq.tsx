import { dataComponent } from "@/lib/data-component"
import { CAT_NAME_GENERATOR_FAQ_ITEMS } from "@/modules/cat-name-generator/lib/cat-name-generator-faq"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"

/** FAQ aimed at people searching for a cat name generator. */
export function CatNameGeneratorFaq() {
  return (
    <section
      {...dataComponent("CatNameGeneratorFaq")}
      className="w-full border-b border-border/40 bg-muted/30"
    >
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base/7 font-semibold">FAQ</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Cat name generator questions
          </h2>
          <p className="mt-6 text-lg text-pretty text-muted-foreground">
            Straight answers before you start the ceremony.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-12">
          {CAT_NAME_GENERATOR_FAQ_ITEMS.map(({ question, answer }) => (
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
