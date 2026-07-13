import Link from "next/link"

import { dataComponent } from "@/lib/data-component"
import { UNLOCK_PRICE_USD } from "@/modules/landing/lib/pricing"
import { Button } from "@workspace/ui/components/button"

/** Intro for the Pricing page — how the free-to-unlock model works. */
export function PricingHero() {
  return (
    <section
      {...dataComponent("PricingHero")}
      className="relative -mt-14 w-full border-b border-border/40 bg-[url('/images/hero-motif-pattern.png')] bg-cover bg-top bg-no-repeat md:-mt-16 dark:bg-[url('/images/hero-motif-pattern-dark.png')]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/70"
      />
      <div className="relative mx-auto flex min-h-[55svh] w-full max-w-3xl flex-col items-center justify-center gap-5 px-4 pt-28 pb-16 text-center md:pt-24 md:pb-20">
        <p className="text-base/7 font-semibold">Pricing</p>
        <h1 className="font-sans text-4xl leading-tight font-semibold tracking-tight text-balance md:text-5xl">
          Free to begin. {UNLOCK_PRICE_USD} to finish — per cat.
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
          Naming Buddy is not a subscription. You explore the ceremony for free,
          then unlock the rest for one cat at a time when you&apos;re ready —
          never at sign-up, and never automatically.
        </p>
        <nav
          aria-label="Pricing page actions"
          className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Button variant="default" size="lg" asChild>
            <Link href="/sign-up">Start for free</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/#how-it-works">See the ceremony steps</Link>
          </Button>
        </nav>
      </div>
    </section>
  )
}
