import { APP_NAME } from "@workspace/shared/constants/app"

/** Generator-hub FAQ — shared by the Accordion UI and FAQPage JSON-LD. */
export const CAT_NAME_GENERATOR_FAQ_ITEMS = [
  {
    question: "How does this cat name generator work?",
    answer: `${APP_NAME} is a guided naming ceremony. You upload a photo and describe your cat's personality. We write a summary you can edit, then suggest names rooted in that story — an everyday family name, a unique cat-world name, and a poetic guess at the secret name only they know.`,
  },
  {
    question: "Is the cat name generator free?",
    answer:
      "Yes to start. Creating a profile, personality summary, and everyday family name is free. During beta, unlocking the cat-world name, ineffable near-name, and keepsake certificate is free too. You're never charged at sign-up.",
  },
  {
    question: "Is this better than a random cat name list?",
    answer:
      "Random lists ignore who your cat actually is. Here, every suggestion comes with a short rationale tied to their personality summary, so you can shortlist names that feel right — not just scroll endless options.",
  },
  {
    question: "Can I find unique or unusual cat names?",
    answer:
      "Yes. Family names can lean elegant, silly, classic, nature-inspired, or non-human. The cat-world name you confirm is claimed globally across the app, so no other cat can share it.",
  },
  {
    question: "Does it work for boy and girl cat names?",
    answer:
      "Yes. Style preferences and your cat's story guide the suggestions — whether you're naming a kitten, a rescue, or a cat who already answers to something temporary.",
  },
  {
    question: "Do I need a photo of my cat?",
    answer:
      "A clear photo of a single cat is required to generate the personality summary and appears on the finished certificate. You can save a draft profile and upload the photo when you're ready.",
  },
] as const
