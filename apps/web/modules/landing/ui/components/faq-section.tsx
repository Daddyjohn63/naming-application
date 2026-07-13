import { dataComponent } from "@/lib/data-component"
import { UNLOCK_PRICE_USD } from "@/modules/landing/lib/pricing"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"

const FAQ_ITEMS = [
  {
    question: "Do I need a photo of my cat?",
    answer:
      "Yes — a clear photo of your cat is required to generate their personality summary and appears on the certificate. We quickly check it really is a single cat before the ceremony continues. You can still save a draft profile without a photo and come back to upload one later.",
  },
  {
    question: "What does it cost, and when am I charged?",
    answer: `Everything up to and including your cat's everyday family name is free. Finishing the ceremony — the cat-world name, the ineffable near-name, and the certificate — is a one-time ${UNLOCK_PRICE_USD} (USD) per cat. You're only charged when you tap Unlock, never at sign-up, and payment happens right on the ceremony page without redirecting you anywhere.`,
  },
  {
    question: "Is the cat-world name really unique?",
    answer:
      "Yes. In Eliot's telling, a cat's second name is theirs and theirs alone — so ours are too. When you confirm your favourite, it's claimed globally across every cat named with Naming Buddy, and no other cat can ever take it. If a name has already been claimed, you'll simply pick another from your shortlist.",
  },
  {
    question: "What if I don't like the names the AI suggests?",
    answer:
      "Each naming stage gives you 10 suggestions with a short rationale for each. You can shortlist up to six names from those suggestions, regenerate once for 10 completely fresh names (and keep choosing across both batches), and for the family name you can even add one of your own.",
  },
  {
    question: "Can I edit the AI's summary of my cat?",
    answer:
      "Absolutely — the summary is yours to shape. Edit and save it as many times as you like until it sounds exactly like your cat. Once you submit it, it locks in as the creative truth behind every name that follows.",
  },
  {
    question: "Can I name more than one cat?",
    answer: `Yes — your dashboard supports as many cats as live with you (or visit regularly). Each cat gets their own profile, summary, names, and certificate. Each ceremony is unlocked separately at ${UNLOCK_PRICE_USD}.`,
  },
  {
    question: "Can I stop halfway and come back later?",
    answer:
      "Any time. Your progress is saved at every step — a half-written profile, a saved-but-not-submitted summary, a shortlist in progress. When you return, the ceremony resumes exactly where you left off.",
  },
  {
    question: "What's on the certificate?",
    answer:
      "Your cat's photo, their personality summary, all three names — family, cat-world, and ineffable — and the ceremony date. You can adjust the family name one last time before it's generated, then download it as a PDF and reopen it from your dashboard whenever you like.",
  },
  {
    question: "What is an “ineffable” name, anyway?",
    answer:
      "It's our nod to the third name in T. S. Eliot's poem — the secret name a cat keeps entirely to itself, which no owner can ever truly learn. Since it can't be discovered, the ceremony offers its best poetic approximation instead: a near-name that feels like it might be close.",
  },
] as const

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
          {FAQ_ITEMS.map(({ question, answer }) => (
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
