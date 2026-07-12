import { dataComponent } from "@/lib/data-component"

const AUDIENCES = [
  {
    title: "New cat parents",
    description:
      "You've just brought someone home and want the naming to feel like an occasion — not a rushed decision before the next food shop.",
  },
  {
    title: "Long-time companions",
    description:
      "Your cat already has a family name, but you've always sensed there was more to them. The ceremony finds the rest with affection and a little theatre.",
  },
  {
    title: "Multi-cat households",
    description:
      "Each cat gets their own profile, summary, names, and certificate. Because treating them as interchangeable is, frankly, beneath them.",
  },
] as const

/** Who Naming Buddy is for — target audience without sounding like a persona matrix. */
export function AboutWhoFor() {
  return (
    <section
      {...dataComponent("AboutWhoFor")}
      className="w-full border-b border-border/40 bg-muted/30"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-base/7 font-semibold">Who it&apos;s for</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Built for people who already take their cats seriously
          </h2>
          <p className="mt-6 text-lg text-pretty text-muted-foreground">
            If you&apos;ve ever watched your cat stare into the middle distance
            and thought,{" "}
            <span className="font-serif italic text-foreground/90">
              they know something I don&apos;t
            </span>
            — you&apos;re in the right place.
          </p>
        </div>

        <ul className="mx-auto mt-14 grid max-w-5xl gap-10 md:grid-cols-3 md:gap-8">
          {AUDIENCES.map(({ title, description }) => (
            <li key={title} className="flex flex-col gap-3 text-center md:text-left">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-base leading-relaxed text-pretty text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
