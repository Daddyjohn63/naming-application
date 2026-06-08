import { dataComponent } from "@/lib/data-component"

type PublicPageShellProps = {
  title: string
  description: string
}

export function PublicPageShell({ title, description }: PublicPageShellProps) {
  return (
    <main
      {...dataComponent("PublicPageShell")}
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-14 md:py-20"
    >
      <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
        {title}
      </h1>
      <p className="text-muted-foreground text-base leading-relaxed text-pretty md:text-lg">
        {description}
      </p>
    </main>
  )
}
