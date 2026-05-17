"use client"

import { useQuery } from "convex/react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { api } from "@workspace/backend/_generated/api"
import type { Id } from "@workspace/backend/_generated/dataModel"
import { CeremonyStepper } from "@/modules/ceremony/ui/components/ceremony-stepper"
import { ceremonyStepShortLabel } from "@/modules/ceremony/lib/ceremony-progress"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"

function CatCeremonySkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 lg:max-w-4xl">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-20 w-full rounded-lg" />
    </div>
  )
}

export default function CatCeremonyPage() {
  const params = useParams()
  const raw = params.catId
  const catIdParam =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined

  const cat = useQuery(
    api.cats.getCatByIdForOwner,
    catIdParam !== undefined
      ? { catId: catIdParam as Id<"cats"> }
      : "skip",
  )

  if (catIdParam === undefined) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-12">
        <p className="text-muted-foreground text-sm">Missing ceremony id.</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </main>
    )
  }

  if (cat === undefined) {
    return <CatCeremonySkeleton />
  }

  if (cat === null) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-12">
        <p className="text-muted-foreground text-sm leading-relaxed">
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

  return (
    <>
      <CeremonyStepper currentStep={cat.ceremonyStep} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 lg:max-w-4xl">
        <nav
          className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm"
          aria-label="Breadcrumb"
        >
          <Link
            href="/dashboard"
            className="hover:text-foreground font-medium underline-offset-4 hover:underline"
          >
            Dashboard
          </Link>
          <span aria-hidden className="text-muted-foreground/70">
            /
          </span>
          <span className="text-foreground line-clamp-1 font-semibold tracking-tight">
            {cat.title}
          </span>
        </nav>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3">
              {ceremonyStepShortLabel(cat.ceremonyStep)}
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-prose leading-relaxed text-pretty">
            You&apos;re inside the guided tunnel: one dominant column carries
            the next story beat (photo, summary, style, preview, unlock, then
            paid naming stages). This shell already tracks your server step so
            refresh or return visits land in the right place.
          </p>
        </div>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Portrait &amp; profile</CardTitle>
            <CardDescription>
              Photo upload, validation, and summary generation are the next
              layers on this page. For now you can read the draft story below and
              return from the dashboard whenever you need a break.
            </CardDescription>
          </CardHeader>
          <div className="px-4 pb-4">
            <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
              {cat.description}
            </p>
          </div>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Save &amp; exit to dashboard</Link>
          </Button>
        </div>
      </main>
    </>
  )
}
