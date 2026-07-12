import Link from "next/link"

import { dataComponent } from "@/lib/data-component"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

/** Full-bleed intro for the About page — brand-forward, one clear idea. */
export function AboutHero() {
  return (
    <section
      {...dataComponent("AboutHero")}
      className="relative -mt-14 w-full border-b border-border/40 bg-[url('/images/hero-motif-pattern.png')] bg-cover bg-top bg-no-repeat md:-mt-16 dark:bg-[url('/images/hero-motif-pattern-dark.png')]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/70"
      />
      <div className="relative mx-auto flex min-h-[70svh] w-full max-w-3xl flex-col items-center justify-center gap-5 px-4 pt-28 pb-16 text-center md:pt-24 md:pb-20">
        <Badge variant="secondary" className="w-fit rounded-full px-3 py-0.5">
          For cat people, by cat people
        </Badge>
        <h1 className="font-sans text-4xl leading-tight font-semibold tracking-tight text-balance md:text-5xl lg:text-6xl">
          Naming Buddy
        </h1>
        <p className="max-w-2xl font-serif text-xl leading-relaxed text-balance italic text-foreground/90 md:text-2xl">
          A naming ceremony for the cats who already run your house —
          inspired by poetry, sparked by a musical, built out of love.
        </p>
        <p className="max-w-xl text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
          We help cat owners discover the three names every cat deserves:
          the everyday one you call down the hallway, the grander one that
          belongs to them alone, and a playful guess at the secret name
          only they will ever truly know.
        </p>
        <nav
          aria-label="About page actions"
          className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Button variant="default" size="lg" asChild>
            <Link href="/sign-up">Start the naming ceremony</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/#how-it-works">See how it works</Link>
          </Button>
        </nav>
      </div>
    </section>
  )
}
