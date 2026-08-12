import Link from "next/link"

import { dataComponent } from "@/lib/data-component"
import { APP_NAME } from "@workspace/shared/constants/app"

const COMPARISONS = [
  {
    title: "Personality first, not roulette",
    body: `Most “generators” dump hundreds of names with no context. ${APP_NAME} studies your photo and story, writes a summary you can edit, then suggests names that fit who they are.`,
  },
  {
    title: "Three names, not one throwaway pick",
    body: "Inspired by T. S. Eliot's The Naming of Cats, you discover an everyday family name, a globally unique cat-world name, and a playful guess at the secret name only they know.",
  },
  {
    title: "A keepsake, not a forgotten tab",
    body: "When the ceremony ends, you download a Completed Cat Profile: photo, personality summary, all three names, and the ceremony date — ready to print or share.",
  },
] as const

/** Positions the product against commodity name-list tools. */
export function CatNameGeneratorDifference() {
  return (
    <section
      {...dataComponent("CatNameGeneratorDifference")}
      className="w-full border-b border-border/40"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-base/7 font-semibold">Why it feels different</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            More than a cat name list
          </h2>
          <p className="mt-6 text-lg text-pretty text-muted-foreground">
            If you searched for a cat name generator, you&apos;re in the right
            place — just with a ceremony behind it.{" "}
            <Link
              href="/about"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Read the story behind {APP_NAME}
            </Link>
            .
          </p>
        </div>

        <ul className="mx-auto mt-14 grid max-w-5xl list-none gap-10 md:grid-cols-3 md:gap-8">
          {COMPARISONS.map(({ title, body }) => (
            <li key={title} className="flex flex-col gap-3">
              <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
              <p className="text-base leading-relaxed text-pretty text-muted-foreground">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
