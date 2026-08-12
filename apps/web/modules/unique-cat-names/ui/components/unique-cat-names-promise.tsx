import Link from "next/link"

import { dataComponent } from "@/lib/data-component"

const ANGLES = [
  {
    title: "Unusual without being random",
    body: "Odd-for-odd's-sake lists rarely stick. Here, every suggestion is tied to a personality summary you approve — so rarity still has to sound like your cat.",
  },
  {
    title: "Styles you can steer",
    body: "Choose Elegant, Silly, Classic, Nature-inspired, or Non-human for family names. Mix shortlists, regenerate once, and even add one name of your own before you crown a favourite.",
  },
  {
    title: "Truly one of a kind where it counts",
    body: "The cat-world name you confirm is claimed globally across the app. That is uniqueness you can prove — not just a hope that nobody else picked the same word on a blog.",
  },
] as const

/** Explains how uniqueness works in the ceremony vs generic lists. */
export function UniqueCatNamesPromise() {
  return (
    <section
      {...dataComponent("UniqueCatNamesPromise")}
      className="w-full border-b border-border/40"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-base/7 font-semibold">Beyond common lists</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Unique means fitting — and sometimes claimed
          </h2>
          <p className="mt-6 text-lg text-pretty text-muted-foreground">
            Plenty of sites offer “unique cat names.” Few help you find ones
            that belong to your cat, then lock a distinctive second name so it
            stays theirs.{" "}
            <Link
              href="/about"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Why three names at all?
            </Link>
          </p>
        </div>

        <ul className="mx-auto mt-14 grid max-w-5xl list-none gap-10 md:grid-cols-3 md:gap-8">
          {ANGLES.map(({ title, body }) => (
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
