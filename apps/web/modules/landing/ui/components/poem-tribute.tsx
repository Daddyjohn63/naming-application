import { dataComponent } from "@/lib/data-component"

/**
 * Original-words tribute to the poem that inspires the ceremony.
 * Deliberately quotes nothing: the poem is in copyright, so this
 * summarises its idea without reproducing any of its lines.
 */
export function PoemTribute() {
  return (
    <section
      {...dataComponent("PoemTribute")}
      className="w-full border-b border-border/40 bg-muted/30"
    >
      <div className="px-6 py-20 sm:py-24 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            <span aria-hidden className="h-px w-8 bg-border" />
            Where the idea comes from
            <span aria-hidden className="h-px w-8 bg-border" />
          </p>
          <p className="font-serif text-2xl leading-relaxed text-balance italic sm:text-3xl">
            In 1939, T. S. Eliot published a poem insisting that naming a cat
            is no small task — that every cat, in fact, needs three: a
            sensible one for the household, a grander one that belongs to no
            other cat alive, and a third so private that only the cat will
            ever know it.
          </p>
          <p className="max-w-xl text-base text-pretty text-muted-foreground">
            He was right, of course. Naming Buddy is the ceremony he never got
            around to building — a loving nod to{" "}
            <cite className="not-italic font-medium">The Naming of Cats</cite>,
            in our own words and with a little help from AI.
          </p>
        </div>
      </div>
    </section>
  )
}
