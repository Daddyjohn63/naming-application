import Image from "next/image"

import { dataComponent } from "@/lib/data-component"

/**
 * Origin story: Cats the musical → Eliot's poems → Naming Buddy.
 * Deliberately quotes nothing from the poem (still in copyright).
 */
export function AboutInspiration() {
  return (
    <section
      {...dataComponent("AboutInspiration")}
      className="w-full border-b border-border/40 bg-muted/30"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-24 sm:py-32 md:grid-cols-2 md:gap-16 lg:px-8">
        <div className="order-2 flex flex-col gap-6 md:order-1">
          <p className="text-base/7 font-semibold">Where it began</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            From a night at the musical to a poem we couldn&apos;t shake
          </h2>
          <div className="flex flex-col gap-4 text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
            <p>
              Our path to Naming Buddy did not start in a library. It started
              in a theatre — watching Andrew Lloyd Webber&apos;s{" "}
              <cite className="not-italic font-medium text-foreground">
                Cats
              </cite>
              , and then wanting to understand what the show was really built
              on.
            </p>
            <p>
              That curiosity led us to T. S. Eliot&apos;s{" "}
              <cite className="not-italic font-medium text-foreground">
                Old Possum&apos;s Book of Practical Cats
              </cite>
              , and in particular to{" "}
              <cite className="not-italic font-medium text-foreground">
                The Naming of Cats
              </cite>
              : the playful insistence that naming a cat is serious business,
              and that one name was never going to be enough.
            </p>
            <p>
              Eliot&apos;s idea — a sensible name for the household, a grander
              name that belongs to no other cat, and a private name only the
              cat will ever know — felt instantly true. The musical had
              brought us to the poems; the poems gave us a ceremony worth
              building.
            </p>
            <p className="font-serif text-lg italic text-foreground/90 md:text-xl">
              Naming Buddy is our loving, modern answer to that idea: a
              guided ritual, in our own words, with a little help from AI —
              and with deep respect for the work that inspired it.
            </p>
          </div>
        </div>

        <div className="relative order-1 aspect-4/3 w-full overflow-hidden rounded-2xl border border-border/50 shadow-lg md:order-2">
          <Image
            src="/images/about-inspiration.png"
            alt="An open poetry book and opera glasses on a warmly lit desk, hinting at literature and the stage"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 560px"
          />
        </div>
      </div>
    </section>
  )
}
