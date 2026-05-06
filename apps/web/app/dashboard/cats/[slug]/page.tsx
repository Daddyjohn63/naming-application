"use client"

import { api } from "@workspace/backend/_generated/api"
import { Button } from "@workspace/ui/components/button"
import { useQuery } from "convex/react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function CatBySlugPage() {
  const params = useParams()
  const slug =
    typeof params.slug === "string"
      ? params.slug
      : Array.isArray(params.slug)
        ? params.slug[0]
        : undefined

  const user = useQuery(api.users.current)
  const cat = useQuery(
    api.cats.getCatBySlug,
    user && slug ? { userId: user._id, slug } : "skip",
  )

  if (user === undefined) {
    return (
      <p className="text-muted-foreground text-sm">Loading profile…</p>
    )
  }

  if (user === null) {
    return (
      <p className="text-muted-foreground text-sm">
        Sign in to view this cat profile.
      </p>
    )
  }

  if (!slug) {
    return (
      <p className="text-muted-foreground text-sm">Missing cat link.</p>
    )
  }

  if (cat === undefined) {
    return (
      <p className="text-muted-foreground text-sm">Loading cat…</p>
    )
  }

  if (cat === null) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          No cat found for this address.
        </p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/cats">Back to cats</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{cat.title}</h1>
        {cat.slug ? (
          <p className="text-muted-foreground font-mono text-xs">{cat.slug}</p>
        ) : null}
      </div>

      {cat.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Convex storage URL
        <img
          src={cat.photoUrl}
          alt=""
          className="aspect-video w-full max-h-64 rounded-lg border object-cover"
        />
      ) : null}

      <section>
        <h2 className="mb-1 text-sm font-medium text-muted-foreground">
          About
        </h2>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {cat.description}
        </p>
      </section>

      <section className="grid gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Ceremony step</span>
          <p className="font-medium capitalize">
            {cat.ceremonyStep.replaceAll("_", " ")}
          </p>
        </div>
        {(cat.selectedFamilyName ||
          cat.selectedCatWorldName ||
          cat.selectedIneffableName) && (
          <div>
            <span className="text-muted-foreground">Chosen names</span>
            <ul className="mt-1 list-inside list-disc">
              {cat.selectedFamilyName ? (
                <li>Family: {cat.selectedFamilyName}</li>
              ) : null}
              {cat.selectedCatWorldName ? (
                <li>Cat world: {cat.selectedCatWorldName}</li>
              ) : null}
              {cat.selectedIneffableName ? (
                <li>Ineffable: {cat.selectedIneffableName}</li>
              ) : null}
            </ul>
          </div>
        )}
      </section>

      <Button variant="outline" asChild className="w-fit">
        <Link href="/dashboard/cats">Back to cats</Link>
      </Button>
    </div>
  )
}
