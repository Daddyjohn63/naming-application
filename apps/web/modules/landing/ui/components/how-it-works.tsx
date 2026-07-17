import Image from "next/image"

import { dataComponent } from "@/lib/data-component"
import { UNLOCK_PRICE_USD } from "@/modules/landing/lib/pricing"
import { Badge } from "@workspace/ui/components/badge"

type CeremonyStep = {
  title: string
  description: string
  phase: "Free" | "Paid"
}

const CEREMONY_STEPS: readonly CeremonyStep[] = [
  {
    title: "Create your cat's profile",
    description:
      "Upload a clear photo of your cat and write a short description of their personality — the greeting at the door, the most annoying habit, who they think they are. Basics like age or breed are optional. Save and come back whenever you like.",
    phase: "Free",
  },
  {
    title: "Meet their personality summary",
    description:
      "Naming Buddy checks your photo really is a single cat, then studies it alongside your words to write a personality summary. Edit it until it sounds exactly like your cat, then submit — it becomes the creative truth behind every name.",
    phase: "Free",
  },
  {
    title: "Curate family names",
    description:
      "Choose one or more styles — Elegant, Silly, Classic, Nature-inspired, or Non-human. The app suggests 10 names, each with a reason. Shortlist up to six, regenerate once for 10 fresh ideas you can mix with the first batch, add one of your own, and crown a favourite family name.",
    phase: "Free",
  },
  {
    title: "Unlock the full ceremony",
    description: `A single payment of ${UNLOCK_PRICE_USD} for this cat opens the remaining stages — cat-world name, ineffable near-name, and the certificate. You never leave the ceremony page, and nothing is charged before this moment.`,
    phase: "Paid",
  },
  {
    title: "Claim their cat-world name",
    description:
      "The grander, more mysterious name your cat goes by among other cats. Ten suggestions, the same shortlist-and-favourite flow — and the name you confirm is globally unique. No other cat, anywhere, can ever share it.",
    phase: "Paid",
  },
  {
    title: "Approximate the ineffable",
    description:
      "One name will always stay just out of reach — the secret one your cat keeps entirely to themselves. So we guess, wonderfully: ten strange and lovely near-names with short poetic rationales. Pick the one that feels closest to the truth.",
    phase: "Paid",
  },
  {
    title: "Download the certificate",
    description:
      "All three names on a storybook keepsake certificate, with their photo and the ceremony date. Download it as a PDF and reopen it from your dashboard any time.",
    phase: "Paid",
  },
] as const

/** Numbered walkthrough of the naming ceremony from profile to certificate. */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      {...dataComponent("HowItWorks")}
      className="w-full scroll-mt-16 border-b border-border/40"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[2fr_3fr] lg:gap-16">
          <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <p className="text-base/7 font-semibold">How it works</p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              A guided ceremony, not a name generator
            </h2>
            <p className="text-lg text-pretty text-muted-foreground">
              You bring the story; Naming Buddy walks you through the rest —
              summary, shortlists, and a keepsake certificate. Your progress is
              saved at every step, so you can pause mid-ceremony and pick up
              exactly where you left off — for as many cats as you have.
            </p>
            <div className="relative aspect-3/2 w-full overflow-hidden rounded-2xl border border-border/60 shadow-lg">
              <Image
                src="/images/hero-cat-frame.png"
                alt="A ginger cat's photo displayed in a wooden frame on a cosy shelf"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 480px"
              />
            </div>
          </div>

          <ol className="flex flex-col gap-8">
            {CEREMONY_STEPS.map(({ title, description, phase }, index) => (
              <li key={title} className="flex gap-5">
                <div
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card font-mono text-sm font-semibold"
                >
                  {index + 1}
                </div>
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <Badge
                      variant={phase === "Free" ? "secondary" : "default"}
                      className="rounded-full px-2.5 py-0.5 text-xs"
                    >
                      {phase}
                    </Badge>
                  </div>
                  <p className="leading-relaxed text-pretty text-muted-foreground">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
