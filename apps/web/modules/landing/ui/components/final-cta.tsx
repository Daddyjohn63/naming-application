import Link from "next/link"

import { Logo } from "@/components/logo"
import { dataComponent } from "@/lib/data-component"
import { Button } from "@workspace/ui/components/button"

/** Closing call-to-action inviting the visitor to begin the ceremony. */
export function FinalCta() {
  return (
    <section
      {...dataComponent("FinalCta")}
      className="w-full border-b border-border/40"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32 lg:px-8">
        <Logo className="size-24 text-foreground" />
        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Your cat already knows their name. Time to catch up.
        </h2>
        <p className="max-w-xl text-lg text-pretty text-muted-foreground">
          Start free with their profile and family name — the full ceremony is
          ready whenever you are.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button size="lg" asChild>
            <Link href="/sign-up">Start the naming ceremony</Link>
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <Link href="/sign-in">Log in to continue a ceremony</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
