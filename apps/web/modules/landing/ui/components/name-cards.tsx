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

const NAME_CARDS = [
  {
    title: "The Everyday Name",
    description:
      "The name that the family gives the cat. Like Ginger, Max, or Oliver.",
    Mark: FamilyMark,
    markClassName: "text-foreground",
  },
  {
    title: "Cat-world name",
    description:
      "The unique name that the cat has in the cat-world, that other cats know it by.",
    Mark: CatWorldMark,
    markClassName: "text-foreground",
  },
  {
    title: "Ineffable name",
    description:
      "The name that only the cat knows and you never will guess. But we can try to imagine what it might be",
    Mark: IneffableMark,
    markClassName: "text-foreground",
  },
] as const

/** Three-column cards introducing the ceremony's family, cat-world, and ineffable names. */
export function NameCards() {
  return (
    <section
      {...dataComponent("NameCards")}
      className="w-full border-b border-border/40"
    >
      <div className="px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 rounded-xl p-6 md:grid-cols-3 md:gap-8">
          {NAME_CARDS.map(({ title, description, Mark, markClassName }) => (
            <Card key={title} className="bg-card">
              <CardHeader className="gap-4">
                <div className="flex justify-center">
                  <Mark
                    aria-hidden={false}
                    role="img"
                    aria-label={`${title} illustration`}
                    className={cn("size-24 shrink-0 sm:size-28", markClassName)}
                  />
                </div>
                <CardTitle className="text-center text-xl">{title}</CardTitle>
                <CardDescription className="text-center text-base leading-relaxed">
                  {description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
