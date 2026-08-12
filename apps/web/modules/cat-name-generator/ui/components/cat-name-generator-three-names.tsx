import { CatWorldMark } from "@/components/marks/cat-world-mark"
import { FamilyMark } from "@/components/marks/family-mark"
import { IneffableMark } from "@/components/marks/ineffable-mark"
import { dataComponent } from "@/lib/data-component"
import { APP_NAME } from "@workspace/shared/constants/app"
import { cn } from "@workspace/ui/lib/utils"

const THREE_NAMES = [
  {
    title: "Family name",
    description:
      "The everyday name you call down the hallway — the one that has to work at breakfast and under the sofa.",
    Mark: FamilyMark,
    accentClassName: "text-amber-600 dark:text-amber-400",
    haloClassName: "bg-amber-500/10",
  },
  {
    title: "Cat-world name",
    description: `The distinctive name among other cats — claimed uniquely across ${APP_NAME} so no other cat can share it.`,
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

/** Explains the three-name outcome for generator-search visitors. */
export function CatNameGeneratorThreeNames() {
  return (
    <section
      {...dataComponent("CatNameGeneratorThreeNames")}
      className="w-full border-b border-border/40"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <p className="text-base/7 font-semibold">What you discover</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            One cat. Three names.
          </h2>
          <p className="text-lg leading-relaxed text-pretty text-muted-foreground">
            A typical generator stops at a single everyday name. The ceremony
            finds the full set — practical, unique, and a little mysterious.
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
                <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
                <p className="text-base leading-relaxed text-pretty text-muted-foreground">
                  {description}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}
