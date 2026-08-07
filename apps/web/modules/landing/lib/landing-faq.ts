import { APP_NAME } from "@workspace/shared/constants/app"

/** Landing-page FAQ — shared by the Accordion UI and FAQPage JSON-LD. */
export const LANDING_FAQ_ITEMS = [
  {
    question: "Do I need a photo of my cat?",
    answer:
      "Yes — a clear photo of your cat is required to generate their personality summary and appears on the certificate. We quickly check it really is a single cat before the ceremony continues. You can still save a draft profile without a photo and come back to upload one later.",
  },
  {
    question: "What does it cost during beta?",
    answer:
      "During beta, the full ceremony is free — including unlock. Everything up to your cat's everyday family name has always been free, and while we're in beta there's no charge to finish with the cat-world name, ineffable near-name, and certificate. You're never charged at sign-up.",
  },
  {
    question: "Is the cat-world name really unique?",
    answer: `Yes. In Eliot's telling, a cat's second name is theirs and theirs alone — so ours are too. When you confirm your favourite, it's claimed globally across every cat named with ${APP_NAME}, and no other cat can ever take it.`,
  },
  {
    question: "What if I don't like the names the app suggests?",
    answer:
      "Each naming stage gives you the ability to create 20 suggestions with a short rationale for each. You can shortlist up to six names from those suggestions, and for the family name you can even add one of your own. You can change your mind on your favourite names right up to the point of generating your certificate.",
  },
  {
    question: "Can I edit the personality summary of my cat?",
    answer:
      "Absolutely — the summary is yours to shape. Edit and save it as many times as you like until it sounds exactly like your cat. Once you submit it, it locks in as the creative truth behind every name that follows.",
  },
  {
    question: "Can I name more than one cat?",
    answer:
      "Yes — your dashboard supports as many cats as live with you (or visit regularly). Each cat gets their own profile, summary, names, and certificate. Each ceremony is unlocked separately, and during beta unlock is free for every cat.",
  },
  {
    question: "Can I stop halfway and come back later?",
    answer:
      "Any time. Your progress is saved at every step — a half-written profile, a saved-but-not-submitted summary, a shortlist in progress. When you return, the ceremony resumes exactly where you left off.",
  },
  {
    question: "What's on the certificate?",
    answer:
      "Your cat's photo, their personality summary, all three names — family, cat-world, and ineffable — and the ceremony date. You can adjust the family name one last time before it's generated, then download it as a PDF or PNG, optionally share a private link with friends, and reopen it from your dashboard whenever you like.",
  },
  {
    question: "What is an “ineffable” name, anyway?",
    answer:
      "It's our nod to the third name in T. S. Eliot's poem — the secret name a cat keeps entirely to itself, which no owner can ever truly learn. Since it can't be discovered, the ceremony offers its best poetic approximation instead: a near-name that feels like it might be close.",
  },
] as const
