import Link from "next/link"

import { dataComponent } from "@/lib/data-component"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

const STEPS = [
  {
    title: "Share a photo and a short story",
    description:
      "Upload a clear photo of your cat and describe their personality — the greeting at the door, the chaos at 3 a.m., who they think they are. Basics like age or breed are optional.",
    phase: "Free" as const,
  },
  {
    title: "Shape their personality summary",
    description:
      "We draft a summary from the photo and your words. Edit it until it sounds exactly like them — that locked-in voice guides every name that follows.",
    phase: "Free" as const,
  },
  {
    title: "Curate names with reasons",
    description:
      "Pick styles, review suggestions with short rationales, shortlist favourites, and choose an everyday family name. Unlock (free in beta) opens the cat-world and ineffable stages.",
    phase: "Free" as const,
  },
  {
    title: "Download the certificate",
    description:
      "Finish with a Completed Cat Profile you can save as PDF, PNG, or an Instagram card, reopen anytime, and optionally share with a private link.",
    phase: "Unlock" as const,
  },
] as const

/** Condensed ceremony walkthrough for the generator landing page. */
export function CatNameGeneratorSteps() {
  return (
    <section
      {...dataComponent("CatNameGeneratorSteps")}
      className="w-full border-b border-border/40 bg-muted/30"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-base/7 font-semibold">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            From “what should I name my cat?” to a finished ceremony
          </h2>
          <p className="mt-6 text-lg text-pretty text-muted-foreground">
            Progress saves at every step, so you can pause mid-ceremony and pick
            up later — for as many cats as you have.
          </p>
        </div>

        <ol className="mx-auto mt-14 flex max-w-3xl flex-col gap-8">
          {STEPS.map(({ title, description, phase }, index) => (
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
                    {phase === "Unlock" ? "Free during beta" : phase}
                  </Badge>
                </div>
                <p className="leading-relaxed text-pretty text-muted-foreground">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex justify-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/#how-it-works">See the full ceremony steps</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
