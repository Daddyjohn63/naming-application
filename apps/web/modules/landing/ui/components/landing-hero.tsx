import Link from "next/link"
import Image from "next/image"

import { dataComponent } from "@/lib/data-component"
import { UNLOCK_PRICE_USD } from "@/modules/landing/lib/pricing"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

/** Two-column hero: ceremony pitch and CTAs on the left, certificate keepsake on the right. */
export function LandingHero() {
  return (
    <section
      {...dataComponent("LandingHero")}
      // Parchment motif pattern in light mode; matching night-parchment variant in dark mode.
      className="relative -mt-14 w-full border-b border-border/40 bg-[url('/images/hero-motif-pattern.png')] bg-cover bg-top bg-no-repeat md:-mt-16 dark:bg-[url('/images/hero-motif-pattern-dark.png')]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/60"
      />
      {/* Mobile: pt-28 = 56px header offset + 56px breathing room (stacked layout can't rely on items-center). Desktop: pt-16 only offsets the header — vertical centering handles the rest. */}
      <div className="relative mx-auto grid min-h-svh w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 pt-28 pb-14 md:grid-cols-2 md:gap-12 md:pt-16 md:pb-16 lg:gap-16 lg:pb-20">
        <div className="flex flex-col gap-4 md:gap-5">
          <Badge variant="secondary" className="w-fit rounded-full px-3 py-0.5">
            Inspired by T. S. Eliot&apos;s <em>The Naming of Cats</em>
          </Badge>
          <h1 className="font-sans text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl lg:text-5xl">
            Every cat has three names. Discover all of them.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
            Tell us about your cat and upload a photo, and our guided naming
            ceremony finds their everyday family name, a one-of-a-kind cat-world
            name, and a playful guess at the secret name only they know. It all
            ends with a keepsake certificate to download and treasure.
          </p>
          <nav
            aria-label="Start naming ceremony"
            className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-4"
          >
            <Button variant="default" size="lg" asChild>
              <Link href="/sign-up">Start the naming ceremony</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/sign-in">Already have an account? Log in</Link>
            </Button>
          </nav>
          <p className="text-sm text-muted-foreground">
            Free to begin — profile, AI summary, and family names cost nothing.
            Unlock the full ceremony for a one-time {UNLOCK_PRICE_USD} per cat.
          </p>
        </div>

        <div className="flex items-center justify-center px-4 md:px-6 lg:px-8">
          <div className="relative aspect-4/5 w-full max-w-sm overflow-hidden rounded-2xl border-4 border-white bg-white shadow-2xl rotate-2 transition-transform hover:rotate-0 duration-300 sm:max-w-md">
            <Image
              src="/images/certifcate.png"
              alt="Example completed naming certificate for a cat called Marmalade, showing all three names"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 448px"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
