import Image from "next/image"

import { dataComponent } from "@/lib/data-component"

/** Why Naming Buddy exists: the team's love of cats. */
export function AboutLoveOfCats() {
  return (
    <section
      {...dataComponent("AboutLoveOfCats")}
      className="w-full border-b border-border/40"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-24 sm:py-32 md:grid-cols-2 md:gap-16 lg:px-8">
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-border/50 shadow-lg">
          <Image
            src="/images/about-love-of-cats.png"
            alt="A soft cream tabby cat resting on a sunlit windowsill"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 560px"
            priority
          />
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-base/7 font-semibold">Who we are</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            We are, first and foremost,{" "}
            <span className="font-serif italic">cat people</span>
          </h2>
          <div className="flex flex-col gap-4 text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
            <p>
              Naming Buddy grew out of a simple truth: cats are not pets you
              merely label. They are housemates with opinions, rituals, and a
              dignity that somehow survives knocking a mug off the table for
              science.
            </p>
            <p>
              We built this for the people who talk to their cats in full
              sentences, who already know the difference between a polite
              chirp and a formal complaint, and who believe a name should
              feel like it belongs — not like it was chosen from a list while
              the kettle boiled.
            </p>
            <p>
              Our love of cats is not a marketing angle. It is the whole
              reason this exists. Every step of the ceremony — the profile,
              the summary, the shortlists, the certificate — is designed to
              take your cat as seriously as they take themselves.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
