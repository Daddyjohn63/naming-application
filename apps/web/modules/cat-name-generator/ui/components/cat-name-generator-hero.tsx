import Link from "next/link"

import { dataComponent } from "@/lib/data-component"
import { APP_NAME } from "@workspace/shared/constants/app"
import { Button } from "@workspace/ui/components/button"

/** SEO hub hero — meets “cat name generator” intent, then pitches the ceremony. */
export function CatNameGeneratorHero() {
  return (
    <section
      {...dataComponent("CatNameGeneratorHero")}
      className="relative -mt-14 w-full border-b border-border/40 bg-[url('/images/hero-motif-pattern.png')] bg-cover bg-top bg-no-repeat md:-mt-16 dark:bg-[url('/images/hero-motif-pattern-dark.png')]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/70"
      />
      <div className="relative mx-auto flex min-h-[55svh] w-full max-w-3xl flex-col items-center justify-center gap-5 px-4 pt-28 pb-16 text-center md:pt-24 md:pb-20">
        <p className="text-base/7 font-semibold">Cat name generator</p>
        <h1 className="font-sans text-4xl leading-tight font-semibold tracking-tight text-balance md:text-5xl">
          A cat name generator that starts with your cat
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
          Skip the endless random lists. {APP_NAME} turns a photo and a short
          personality story into tailored name suggestions — then finishes with
          three names and a keepsake certificate.
        </p>
        <nav
          aria-label="Cat name generator actions"
          className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Button variant="default" size="lg" asChild>
            <Link href="/sign-up">Start naming free</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/examples">See example certificates</Link>
          </Button>
        </nav>
      </div>
    </section>
  )
}
