import { CatWorldMark } from "@/components/marks/cat-world-mark"
import { FamilyMark } from "@/components/marks/family-mark"
import { IneffableMark } from "@/components/marks/ineffable-mark"
import { dataComponent } from "@/lib/data-component"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

// Accent tints echo the three name seals on the certificate: gold, green, violet.
const THREE_NAMES = [
  {
    label: "The first name",
    title: "Family name",
    description:
      "The sensible, family name you call down the hallway — an Oliver, a Poppy, a Max. The one your cat answers to. Occasionally.",
    Mark: FamilyMark,
    accentClassName: "text-amber-600 dark:text-amber-400",
    haloClassName: "bg-amber-500/10",
  },
  {
    label: "The second name",
    title: "Cat-world name",
    description:
      "The grander, more mysterious name your cat goes by among other cats — and it belongs to your cat alone. No other cat, anywhere, will ever share it.",
    Mark: CatWorldMark,
    accentClassName: "text-emerald-700 dark:text-emerald-400",
    haloClassName: "bg-emerald-500/10",
  },
  {
    label: "The third name",
    title: "Ineffable name",
    description:
      "The secret name your cat keeps entirely to themselves — impossible for anyone else to learn. But together we can make a wonderfully close guess.",
    Mark: IneffableMark,
    accentClassName: "text-violet-600 dark:text-violet-400",
    haloClassName: "bg-violet-500/10",
  },
] as const

/** Intro to the three names: poem-inspired header and the three name cards in one section. */
export function ThreeNamesSection() {
  return (
    <section
      {...dataComponent("ThreeNamesSection")}
      className="w-full border-b border-border/40"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            <span aria-hidden className="h-px w-8 bg-border" />
            Inspired by T.&nbsp;S.&nbsp;Eliot&apos;s{" "}
            <em className="font-serif normal-case">The Naming of Cats</em>
            <span aria-hidden className="h-px w-8 bg-border" />
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            One cat. <span className="font-serif italic">Three names.</span>
          </h2>
          <p className="text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl">
            Naming a cat is serious business — and one name was never going to
            be enough. There&apos;s the name you use around the house, the name
            the cat-world grants to your cat alone, and a secret one they keep
            entirely to themselves. Our guided ceremony discovers all three.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
          {THREE_NAMES.map(
            ({
              label,
              title,
              description,
              Mark,
              accentClassName,
              haloClassName,
            }) => (
              <Card
                key={title}
                className="bg-card transition-shadow duration-300 hover:shadow-lg"
              >
                <CardHeader className="gap-4">
                  <div className="flex justify-center">
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
                          "size-20 shrink-0 sm:size-24",
                          accentClassName
                        )}
                      />
                    </div>
                  </div>
                  <p
                    className={cn(
                      "text-center text-xs font-semibold tracking-[0.2em] uppercase",
                      accentClassName
                    )}
                  >
                    {label}
                  </p>
                  <CardTitle className="text-center text-xl">{title}</CardTitle>
                  <CardDescription className="text-center text-base leading-relaxed">
                    {description}
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          )}
        </div>
      </div>
    </section>
  )
}
