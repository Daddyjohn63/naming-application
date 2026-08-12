import Link from "next/link"

import { CatWorldMark } from "@/components/marks/cat-world-mark"
import { FamilyMark } from "@/components/marks/family-mark"
import { IneffableMark } from "@/components/marks/ineffable-mark"
import { dataComponent } from "@/lib/data-component"
import { APP_NAME } from "@workspace/shared/constants/app"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

const NAME_LAYERS = [
  {
    title: "Family name",
    uniqueness:
      "Personal uniqueness — uncommon, stylish, or classic with a twist, curated from styles you choose.",
    Mark: FamilyMark,
    accentClassName: "text-amber-600 dark:text-amber-400",
    haloClassName: "bg-amber-500/10",
  },
  {
    title: "Cat-world name",
    uniqueness: `Guaranteed uniqueness across ${APP_NAME} — the name you confirm cannot be claimed by another cat.`,
    Mark: CatWorldMark,
    accentClassName: "text-emerald-700 dark:text-emerald-400",
    haloClassName: "bg-emerald-500/10",
  },
  {
    title: "Ineffable name",
    uniqueness:
      "Poetic uniqueness — a near-guess at the secret name only they know, offered as strange and lovely near-names.",
    Mark: IneffableMark,
    accentClassName: "text-violet-600 dark:text-violet-400",
    haloClassName: "bg-violet-500/10",
  },
] as const

/** Maps “unique” intent onto the three name layers. */
export function UniqueCatNamesLayers() {
  return (
    <section
      {...dataComponent("UniqueCatNamesLayers")}
      className="w-full border-b border-border/40 bg-muted/30"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <p className="text-base/7 font-semibold">Three kinds of unique</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Not every unique name works the same way
          </h2>
          <p className="text-lg leading-relaxed text-pretty text-muted-foreground">
            Everyday names can feel rare. Cat-world names are reserved. The
            ineffable layer stays playful and mysterious — because the real
            secret name is theirs alone.
          </p>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {NAME_LAYERS.map(
            ({
              title,
              uniqueness,
              Mark,
              accentClassName,
              haloClassName,
            }) => (
              <div
                key={title}
                className="flex flex-col items-center gap-4 text-center"
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full p-5",
                    haloClassName
                  )}
                >
                  <Mark
                    aria-hidden={false}
                    role="img"
                    aria-label={`${title} illustration`}
                    className={cn(
                      "size-16 shrink-0 sm:size-20",
                      accentClassName
                    )}
                  />
                </div>
                <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
                <p className="text-base leading-relaxed text-pretty text-muted-foreground">
                  {uniqueness}
                </p>
              </div>
            )
          )}
        </div>

        <div className="mt-12 flex justify-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/examples">Browse finished certificates</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
