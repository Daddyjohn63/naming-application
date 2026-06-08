import Link from "next/link"

import { Logo } from "@/components/logo"
import { dataComponent } from "@/lib/data-component"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

/** Two-column hero: copy and CTAs on the left, large logo mark on the right. */
export function LandingHero() {
  return (
    <section
      {...dataComponent("LandingHero")}
      className="w-full border-b border-border/40"
    >
      <div className="mx-auto grid h-screen w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 py-14 md:grid-cols-2 md:gap-12 md:py-16 lg:gap-16 lg:py-20">
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
          <Logo
            aria-hidden={false}
            role="img"
            aria-label="Naming Buddy logo"
            className="size-56 max-w-full sm:size-64 md:size-72 lg:size-80 xl:size-96"
          />
        </div>
      </div>
    </section>
  )
}
