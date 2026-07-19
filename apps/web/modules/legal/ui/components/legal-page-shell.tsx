import { dataComponent } from "@/lib/data-component"

type LegalSection = {
  title: string
  paragraphs: readonly string[]
  bullets?: readonly string[]
}

type LegalPageShellProps = {
  title: string
  intro: string
  lastUpdated: string
  sections: readonly LegalSection[]
}

export function LegalPageShell({
  title,
  intro,
  lastUpdated,
  sections,
}: LegalPageShellProps) {
  return (
    <main
      {...dataComponent("LegalPageShell")}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-14 md:py-20"
    >
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          {title}
        </h1>
        <p className="text-muted-foreground text-sm">
          Last updated: {lastUpdated}
        </p>
        <p className="text-muted-foreground text-base leading-relaxed text-pretty md:text-lg">
          {intro}
        </p>
      </header>

      <div className="flex flex-col gap-10">
        {sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold tracking-tight">
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph, index) => (
              <p
                key={`${section.title}-p-${index}`}
                className="text-muted-foreground text-base leading-relaxed text-pretty"
              >
                {paragraph}
              </p>
            ))}
            {section.bullets && section.bullets.length > 0 ? (
              <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-base leading-relaxed">
                {section.bullets.map((bullet, index) => (
                  <li key={`${section.title}-b-${index}`}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </main>
  )
}
