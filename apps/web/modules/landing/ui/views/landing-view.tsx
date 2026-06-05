import Link from "next/link"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"

import { dataComponent } from "@/lib/data-component"

/** Marketing landing for KB-001 — public funnel entry before Clerk sign-up. */
export function LandingView() {
  return (
    <main {...dataComponent("LandingView")} className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-10 px-4 py-14 md:max-w-2xl md:gap-14 md:py-20 lg:max-w-3xl lg:gap-16">
        <section className="flex flex-col gap-4 md:gap-5">
          <Badge variant="secondary" className="w-fit rounded-full px-3 py-0.5">
            Guided naming ceremony
          </Badge>
          <h1 className="font-sans text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl lg:text-5xl">
            Naming Buddy helps you honour your cat with three deliberate names.
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed text-pretty md:text-lg">
            Walk through profile, summary, style, preview, and unlocking — from
            a practical family name to a bolder cat-world name and finally the
            quiet, ineffable one only your cat knows. Phase 1 is driven by what
            you write; your photo validates in the funnel and anchors the vibe.
          </p>
          <nav
            aria-label="Start naming ceremony"
            className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button variant="default" size="lg" asChild>
              <Link href="/sign-up">Start the naming ceremony</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/sign-in">Already have an account? Log in</Link>
            </Button>
          </nav>
          <p className="text-muted-foreground text-sm">
            Free to explore the early steps; unlocking paid stages stays per cat,
            whenever you&apos;re ready.
          </p>
        </section>

        <Separator />

        <section className="grid gap-4 md:grid-cols-2 md:gap-6">
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base">What you&apos;ll do</CardTitle>
              <CardDescription>
                You bring the story — we scaffold the funnel and AI touches
                where the product allows.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle>After you enter</CardTitle>
              <CardDescription>
                You&apos;ll land in your dashboard to add cats and continue the
                ceremony from the last saved step.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </div>
    </main>
  )
}
