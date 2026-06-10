/**
 * Empty and error states for `/cats/[catId]` before a ceremony can render.
 *
 * Shown when the URL is missing a cat id or when the cat is not on the user's shelf.
 */

import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import { dataComponent } from "@/lib/data-component"

/** URL has no usable `catId` dynamic segment. */
export function CatCeremonyMissingIdState() {
  return (
    <main
      {...dataComponent("CatCeremonyMissingIdState")}
      className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-12"
    >
      <p className="text-sm text-muted-foreground">Missing ceremony id.</p>
      <Button variant="outline" asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </main>
  )
}

/** Cat query resolved to null — wrong id, deleted, or not owned by this user. */
export function CatCeremonyNotFoundState() {
  return (
    <main
      {...dataComponent("CatCeremonyNotFoundState")}
      className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-12"
    >
      <p className="text-sm leading-relaxed text-muted-foreground">
        This ceremony isn&apos;t on your shelf, or it was removed from your
        account.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild>
          <Link href="/dashboard">Return to dashboard</Link>
        </Button>
      </div>
    </main>
  )
}
