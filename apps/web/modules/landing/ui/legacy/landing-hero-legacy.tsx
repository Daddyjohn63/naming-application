import Link from "next/link"
import Image from "next/image"

import { dataComponent } from "@/lib/data-component"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

/**
 * Snapshot of the original landing hero, preserved before the home page
 * redesign. Rendered on /home-legacy only.
 */
export function LandingHeroLegacy() {
  return (
    <section
      {...dataComponent("LandingHeroLegacy")}
      className="relative -mt-14 w-full border-b border-border/40 bg-[url('/images/hero-bg.jpg')] bg-cover bg-top bg-no-repeat md:-mt-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-background/10 to-background/70"
      />
      <div className="relative mx-auto grid min-h-svh w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 pt-14 pb-14 md:grid-cols-2 md:gap-12 md:pt-16 md:pb-16 lg:gap-16 lg:pb-20">
        <div className="flex flex-col gap-4 md:gap-5">
          <Badge variant="secondary" className="w-fit rounded-full px-3 py-0.5">
            Gmoss wall doomscroll
          </Badge>
          <h1 className="font-sans text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl lg:text-5xl">
            I'm baby vibe check pickled JOMO
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
            Solarpunk nervous system thrifted conservas, blue bottle trust fund
            celiac phoebe bridgers photo booth the bear. Coloring book yes plz
            moss wall doomscroll.
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
            Moss wall in this economy bone broth chillwave car seat headrest
            beard crucifix yuzu oat milk cronut biohack.
          </p>
        </div>

        <div className="flex items-center justify-center px-4 md:px-6 lg:px-8">
          <div className="relative aspect-4/5 w-full max-w-sm overflow-hidden rounded-2xl border-4 border-white bg-white shadow-2xl rotate-2 transition-transform hover:rotate-0 duration-300 sm:max-w-md">
            <Image
              src="/images/certifcate.png"
              alt="Completed Cat Portrait Certificate"
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
