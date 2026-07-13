import { dataComponent } from "@/lib/data-component"
import { UNLOCK_PRICE_USD } from "@/modules/landing/lib/pricing"
import { MAX_CAT_PROFILE_SUBMIT_COUNT } from "@workspace/shared/constants/cat-profile"
import { MAX_PHOTO_VALIDATION_ATTEMPTS } from "@workspace/shared/constants/cat-photo-validation"
import {
  MAX_CUSTOM_FAMILY_NAMES,
  MAX_FAMILY_NAME_REGENERATIONS,
  MAX_FAMILY_SHORTLIST_TOTAL,
} from "@workspace/shared/constants/family-naming"
import {
  MAX_NAME_REGENERATIONS,
  MAX_SHORTLIST_TOTAL,
  NAME_BATCH_SIZE,
} from "@workspace/shared/constants/naming-curation"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"

const FAQ_ITEMS = [
  {
    question: "Where do I start a naming ceremony?",
    answer:
      "Open your dashboard and choose Add a cat (also available in the sidebar). That creates a new ceremony you can open anytime from Your Cats or the ceremony cards on the dashboard home.",
  },
  {
    question: "Do I need a photo of my cat?",
    answer:
      "Yes — a clear photo is required to generate the personality summary and appears on the certificate. We quickly check it really is a single cat before the ceremony continues. You can still save a draft without a photo and upload one when you’re ready to submit.",
  },
  {
    question: "What are the three names for?",
    answer:
      "The family name is the everyday name you call your cat. The cat-world name is unique among Naming Buddy cats — a second identity inspired by T. S. Eliot. The ineffable near-name is a poetic approximation of the secret third name no owner can truly know.",
  },
  {
    question: "How many names do I get, and how many can I shortlist?",
    answer: `Each naming stage shows ${NAME_BATCH_SIZE} suggestions. You can shortlist up to ${MAX_SHORTLIST_TOTAL} names, regenerate ${MAX_NAME_REGENERATIONS === 1 ? "once" : `${MAX_NAME_REGENERATIONS} times`} for a fresh batch, then pick one favourite. For the family name you can also add ${MAX_CUSTOM_FAMILY_NAMES === 1 ? "one name of your own" : `up to ${MAX_CUSTOM_FAMILY_NAMES} names of your own`} (still within the ${MAX_FAMILY_SHORTLIST_TOTAL}-name shortlist).`,
  },
  {
    question: "Can I add my own family name?",
    answer: `Yes. During family-name curation you may add ${MAX_CUSTOM_FAMILY_NAMES === 1 ? "one custom name" : `${MAX_CUSTOM_FAMILY_NAMES} custom names`} to the shortlist alongside suggestions from the app. Custom names aren’t available for the cat-world or ineffable stages.`,
  },
  {
    question: "What does unlock cost, and when am I charged?",
    answer: `Everything through the everyday family name is free. Finishing the ceremony — cat-world name, ineffable near-name, and certificate — is a one-time ${UNLOCK_PRICE_USD} (USD) per cat. You’re only charged when you unlock, never at sign-up, and payment happens on the ceremony page.`,
  },
  {
    question: "Is the cat-world name really unique?",
    answer:
      "Yes. When you confirm your favourite, it’s claimed globally across Naming Buddy so no other cat can take it. If a name was just claimed by someone else, simply pick another from your shortlist (or regenerate if you still can).",
  },
  {
    question: "Can I edit the personality summary?",
    answer:
      "Absolutely. Edit and save until it sounds like your cat, then submit to lock it in. After submit, changing the profile regenerates a new summary and uses one of your profile submission attempts.",
  },
  {
    question: "How many times can I change the profile or regenerate names?",
    answer: `You can successfully submit a cat’s profile up to ${MAX_CAT_PROFILE_SUBMIT_COUNT} times. Each ceremony also has up to ${MAX_PHOTO_VALIDATION_ATTEMPTS} automated photo checks. Each naming stage (family, cat-world, ineffable) allows ${MAX_FAMILY_NAME_REGENERATIONS === 1 ? "one" : MAX_FAMILY_NAME_REGENERATIONS} regeneration. If a ceremony’s budgets are exhausted, start a new cat ceremony from the dashboard for fresh limits, or contact support.`,
  },
  {
    question: "What if I run out of photo checks?",
    answer: `Each ceremony allows up to ${MAX_PHOTO_VALIDATION_ATTEMPTS} automated photo checks. If you’ve used them all, this ceremony can’t continue with another photo — start a new ceremony from the dashboard, or contact support. You can still save a draft of the profile.`,
  },
  {
    question: "Can I name more than one cat?",
    answer: `Yes — as many as you like. Each cat has its own profile, summary, names, and certificate. Unlock is ${UNLOCK_PRICE_USD} per cat.`,
  },
  {
    question: "Can I stop halfway and come back later?",
    answer:
      "Any time. Progress is saved at every step — a draft profile, a summary in review, a shortlist in progress. When you return from the dashboard, the ceremony resumes where you left off.",
  },
  {
    question: "What’s on the certificate?",
    answer:
      "Your cat’s photo, personality summary, all three names, and the ceremony date. You can adjust the family name one last time before generating, then download a PDF and reopen it from the ceremony whenever you like.",
  },
  {
    question: "I deleted a ceremony by mistake — can I recover it?",
    answer:
      "Deleted ceremonies can’t be restored. If you’re unsure, pause before confirming delete. You can always start a new ceremony for the same cat and begin again.",
  },
] as const

/** Accordion FAQ for the dashboard User Support page. */
export function UserSupportFaq() {
  return (
    <section
      {...dataComponent("UserSupportFaq")}
      aria-labelledby="support-faq-heading"
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2
          id="support-faq-heading"
          className="font-sans text-2xl font-semibold tracking-tight"
        >
          Frequently asked questions
        </h2>
        <p className="max-w-3xl text-base leading-relaxed text-pretty text-muted-foreground">
          Quick answers to the questions owners ask most often while running a
          ceremony.
        </p>
      </div>

      <Accordion type="single" collapsible className="max-w-3xl">
        {FAQ_ITEMS.map(({ question, answer }) => (
          <AccordionItem key={question} value={question}>
            <AccordionTrigger className="py-4 text-left text-base">
              {question}
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-base leading-relaxed text-muted-foreground">
              {answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
