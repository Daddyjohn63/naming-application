import { APP_NAME } from "@workspace/shared/constants/app"

/** Pricing-page FAQ — shared by the Accordion UI and FAQPage JSON-LD. */
export const PRICING_FAQ_ITEMS = [
  {
    question: "Is unlock free during beta?",
    answer:
      "Yes. Sign-up is free, creating a cat is free, finishing the family-name stage is free, and during beta unlocking the rest of the ceremony is free too — no charge when you tap Unlock.",
  },
  {
    question: "Is unlock per cat or per account?",
    answer:
      "Per cat. Each naming ceremony is unlocked separately. If you have three cats and unlock all three, that’s three unlocks — one for each certificate-ready ceremony. During beta each of those unlocks is free.",
  },
  {
    question: "Is there a subscription?",
    answer: `No. ${APP_NAME} does not use monthly or annual plans. You unlock once per cat when you choose to finish that ceremony — free during beta. As our app is currently in Beta phase you can unlock the cat-world and ineffable names for free, then receive your certificate for free.`,
  },
  {
    question: "Can I try the product before unlocking?",
    answer:
      "Yes — that’s the point of free-to-begin. You can complete a full profile, personality summary, and family-name curation before deciding whether to unlock.",
  },
  {
    question: "What if I stop halfway?",
    answer:
      "Progress is saved. You can leave a ceremony mid-way and return later. You’re never charged for pausing, and unlock is always optional until you choose it.",
  },
  {
    question: "Where does unlock happen?",
    answer:
      "On the ceremony page itself. You stay in the naming flow — no separate checkout redirect away from your cat’s ceremony.",
  },
] as const
