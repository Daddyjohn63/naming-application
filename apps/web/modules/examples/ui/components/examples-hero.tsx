import Link from "next/link"

import { dataComponent } from "@/lib/data-component"
import { Button } from "@workspace/ui/components/button"

/** Intro for the Examples page — sample certificates as proof of the ceremony. */
export function ExamplesHero() {
  return (
    <section
      {...dataComponent("ExamplesHero")}
      className="relative -mt-14 w-full border-b border-border/40 bg-[url('/images/hero-motif-pattern.png')] bg-cover bg-top bg-no-repeat md:-mt-16 dark:bg-[url('/images/hero-motif-pattern-dark.png')]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/70"
      />
      <div className="relative mx-auto flex min-h-[55svh] w-full max-w-3xl flex-col items-center justify-center gap-5 px-4 pt-28 pb-16 text-center md:pt-24 md:pb-20">
        <p className="text-base/7 font-semibold">Examples</p>
        <h1 className="font-sans text-4xl leading-tight font-semibold tracking-tight text-balance md:text-5xl">
          Finished certificates, ready to admire
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
          Each keepsake gathers a cat&apos;s photo, personality profile, and
          three names in one place. Tap any certificate to read it full-size,
          then step through the gallery.
        </p>
        <nav
          aria-label="Examples page actions"
          className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Button variant="default" size="lg" asChild>
            <Link href="/sign-up">Start your own ceremony</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/#how-it-works">See how it works</Link>
          </Button>
        </nav>
      </div>
    </section>
  )
}
