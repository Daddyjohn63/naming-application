import { APP_NAME } from "@workspace/shared/constants/app"

/** Unique-names hub FAQ — shared by the Accordion UI and FAQPage JSON-LD. */
export const UNIQUE_CAT_NAMES_FAQ_ITEMS = [
  {
    question: "What makes a cat name unique?",
    answer:
      "Everyday uniqueness is about taste: uncommon sounds, literary flair, or a name that fits only your cat. In our ceremony, the cat-world name goes further — once you confirm it, that name is claimed globally so no other cat on the platform can share it.",
  },
  {
    question: "How do I find unusual or fancy cat names?",
    answer: `${APP_NAME} suggests names from your cat's personality summary and the styles you choose — Elegant, Silly, Classic, Nature-inspired, or Non-human. Each suggestion comes with a short rationale, so you can shortlist names that feel rare without scrolling endless lists.`,
  },
  {
    question: "Are the cat-world names really one of a kind?",
    answer:
      "Yes. When you confirm a cat-world name, it is reserved across every ceremony on the app. Another owner cannot claim the same one for their cat.",
  },
  {
    question: "Can I get literary or poetic cat names?",
    answer:
      "That is the heart of the product. The ceremony is inspired by T. S. Eliot's The Naming of Cats — an everyday family name, a distinctive cat-world name, and a poetic near-guess at the secret ineffable name.",
  },
  {
    question: "What if I already have a common family name?",
    answer:
      "Keep the everyday name your cat already answers to, or curate a new one. The ceremony still finds a unique cat-world name and an ineffable near-name so their full identity feels complete.",
  },
  {
    question: "Is finding unique cat names free?",
    answer:
      "Yes to begin. Profile, summary, and family-name curation are free. During beta, unlocking the cat-world name, ineffable near-name, and certificate is free too.",
  },
] as const
