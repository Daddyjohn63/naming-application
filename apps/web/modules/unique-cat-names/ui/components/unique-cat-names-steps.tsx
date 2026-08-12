import Link from "next/link"

import { dataComponent } from "@/lib/data-component"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

const STEPS = [
  {
    title: "Capture what makes them singular",
    description:
      "A clear photo plus a short personality story give the ceremony something real to work with — habits, moods, and the small dramas only you notice.",
    phase: "Free" as const,
  },
  {
    title: "Approve the creative brief",
    description:
      "Edit the personality summary until it sounds like them. That locked voice is what keeps unusual suggestions from feeling arbitrary.",
    phase: "Free" as const,
  },
  {
    title: "Curate rare family names",
    description:
      "Steer styles, review rationales, shortlist up to six, and pick a favourite everyday name — free, with no card required.",
    phase: "Free" as const,
  },
  {
    title: "Claim the unique cat-world name",
    description:
      "Unlock (free in beta) opens ten distinctive suggestions. Confirm one and it is reserved globally, then finish with an ineffable near-name and certificate.",
    phase: "Unlock" as const,
  },
] as const

/** Path from “want unique names” to a claimed cat-world name. */
export function UniqueCatNamesSteps() {
  return (
    <section
      {...dataComponent("UniqueCatNamesSteps")}
      className="w-full border-b border-border/40"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-base/7 font-semibold">How to get there</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            From “something different” to a name that is theirs
          </h2>
          <p className="mt-6 text-lg text-pretty text-muted-foreground">
            The ceremony is paced so you can chase uniqueness without rushing
            the everyday name your household will actually use.
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
            <Link href="/pricing">See what&apos;s free in beta</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
