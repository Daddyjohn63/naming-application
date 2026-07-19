import Image from "next/image"
import Link from "next/link"

import { CatWorldMark } from "@/components/marks/cat-world-mark"
import { FamilyMark } from "@/components/marks/family-mark"
import { IneffableMark } from "@/components/marks/ineffable-mark"
import { dataComponent } from "@/lib/data-component"
import { APP_NAME } from "@workspace/shared/constants/app"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

const THREE_NAMES = [
  {
    title: "Family name",
    description:
      "The practical name you use every day — the one that works when dinner is late and someone is under the sofa.",
    Mark: FamilyMark,
    accentClassName: "text-amber-600 dark:text-amber-400",
    haloClassName: "bg-amber-500/10",
  },
  {
    title: "Cat-world name",
    description: `The distinctive name your cat goes by among other cats — claimed uniquely across ${APP_NAME} so no other cat can share it.`,
    Mark: CatWorldMark,
    accentClassName: "text-emerald-700 dark:text-emerald-400",
    haloClassName: "bg-emerald-500/10",
  },
  {
    title: "Ineffable name",
    description:
      "The secret name that stays just out of reach. We offer a wonderfully close poetic guess — because the real one belongs only to them.",
    Mark: IneffableMark,
    accentClassName: "text-violet-600 dark:text-violet-400",
    haloClassName: "bg-violet-500/10",
  },
] as const

/** What the product does, for readers who land on About first. */
export function AboutWhatWeDo() {
  return (
    <section
      {...dataComponent("AboutWhatWeDo")}
      className="w-full border-b border-border/40"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <p className="text-base/7 font-semibold">What we built</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            A guided ceremony, not a name generator
          </h2>
          <p className="text-lg leading-relaxed text-pretty text-muted-foreground">
            You tell us about your cat — a short story of their personality,
            and a photo. We write a summary you can edit until it
            sounds like them, then walk you through discovering all three
            names, ending with a keepsake certificate you can download and
            treasure.
          </p>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {THREE_NAMES.map(
            ({ title, description, Mark, accentClassName, haloClassName }) => (
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
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="max-w-xs text-base leading-relaxed text-pretty text-muted-foreground">
                  {description}
                </p>
              </div>
            )
          )}
        </div>

        <div className="mt-16 grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14">
          <div className="flex flex-col gap-5">
            <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Progress saved. Pause whenever you like. Name every cat you love.
            </h3>
            <p className="text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
              The early steps — profile, personality summary, and family name —
              are free. When you&apos;re ready, a one-time unlock per cat opens
              the cat-world name, the ineffable near-name, and the
              certificate. Come back mid-ceremony any time; we pick up exactly
              where you left off.
            </p>
            <div>
              <Button variant="outline" size="lg" asChild>
                <Link href="/">Explore the full experience</Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto aspect-3/4 w-full max-w-sm overflow-hidden rounded-2xl border border-border/50 shadow-lg">
            <Image
              src="/images/about-companions.png"
              alt="Two cats sharing an armchair — a grey companion and a ginger tabby"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 384px"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
