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
    question: "When am I charged?",
    answer: `Only when you tap Unlock on a ceremony. Sign-up is free, creating a cat is free, and finishing the family-name stage is free. The ${UNLOCK_PRICE_USD} charge happens at unlock — not before.`,
  },
  {
    question: "Is unlock per cat or per account?",
    answer: `Per cat. Each naming ceremony is unlocked separately. If you have three cats and unlock all three, that’s three one-time ${UNLOCK_PRICE_USD} payments — one for each certificate-ready ceremony.`,
  },
  {
    question: "Is there a subscription?",
    answer:
      "No. Naming Buddy does not use monthly or annual plans. You pay once per cat when you choose to finish that ceremony.",
  },
  {
    question: "Can I try the product before paying?",
    answer:
      "Yes — that’s the point of free-to-begin. You can complete a full profile, personality summary, and family-name curation before deciding whether to unlock.",
  },
  {
    question: "What if I stop halfway?",
    answer:
      "Progress is saved. You can leave a ceremony mid-way and return later. You’re never charged for pausing, and unlock is always optional until you choose it.",
  },
  {
    question: "Where does payment happen?",
    answer:
      "On the ceremony page itself. You stay in the naming flow — no separate checkout redirect away from your cat’s ceremony.",
  },
] as const

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
            The short version: free to explore, one small payment per cat to
            finish.
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
