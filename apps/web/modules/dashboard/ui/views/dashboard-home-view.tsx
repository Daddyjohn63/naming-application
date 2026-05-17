"use client"

import Link from "next/link"
import * as React from "react"

import { api } from "@workspace/backend/_generated/api"
import { CreateCeremonyButton } from "@/modules/cats/ui/components/create-ceremony-button"
import { useCreateDraftCeremony } from "@/modules/cats/ui/hooks/use-create-draft-ceremony"
import { ceremonyStepShortLabel } from "@/modules/ceremony/lib/ceremony-progress"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { AlertCircleIcon, Cat } from "lucide-react"
import { useConvexAuth, useQuery } from "convex/react"

const DASHBOARD_SKELETON_CARD_KEYS = ["a", "b", "c", "d", "e", "f"] as const

function DashboardCatsSkeletonGrid() {
  return (
    <ul
      className="mx-auto grid w-full max-w-6xl list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-hidden
    >
      {DASHBOARD_SKELETON_CARD_KEYS.map((k) => (
        <li key={k} className="min-w-0">
          <div className="border-border rounded-xl border p-4">
            <Skeleton className="aspect-[4/3] w-full rounded-lg" />
            <Skeleton className="mt-4 h-4 w-2/3" />
            <Skeleton className="mt-2 h-3 w-full" />
            <Skeleton className="mt-4 h-6 w-20 rounded-full" />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** KB-002: avoid layout-shift empty flash while Convex + Clerk hydrate. */
function ConvexAuthHydrationGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useConvexAuth()

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-8">
        <div className="space-y-3">
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-6 w-full max-w-md" />
        </div>
        <DashboardCatsSkeletonGrid />
      </div>
    )
  }

  return children
}

type CatCeremonyCardProps = {
  cat: {
    _id: string
    title: string
    ceremonyStep: string
    photoUrl?: string
  }
}

function CatCeremonyCard({ cat }: CatCeremonyCardProps) {
  const href = `/cats/${encodeURIComponent(cat._id)}`

  return (
    <li className="min-w-0">
      <Link
        href={href}
        prefetch
        className="group hover:border-primary/25 focus-visible:ring-ring block h-full rounded-xl focus-visible:ring-2 focus-visible:outline-none"
      >
        <Card className="border-border/80 hover:border-primary/40 h-full transition-[box-shadow,border-color] duration-150 group-hover:shadow-md">
          <CardHeader className="gap-0 pb-3">
            <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-lg">
              {cat.photoUrl !== undefined ? (
                // eslint-disable-next-line @next/next/no-img-element -- Convex-resolved HTTPS storage URL.
                <img
                  src={cat.photoUrl}
                  alt=""
                  className="size-full object-cover transition-transform duration-150 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              ) : (
                <div className="text-muted-foreground flex size-full items-center justify-center">
                  <Cat className="size-12 opacity-40" aria-hidden />
                </div>
              )}
            </div>
            <CardTitle className="font-sans text-base tracking-tight">
              {cat.title}
            </CardTitle>
            <CardDescription className="line-clamp-2 text-xs">
              Open to resume this ceremony where you left off.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-0">
            <Badge variant="outline" className="text-xs font-normal">
              {ceremonyStepShortLabel(cat.ceremonyStep)}
            </Badge>
          </CardFooter>
        </Card>
      </Link>
    </li>
  )
}

/** Primary “Add” with inline recovery (KB-002). */
function DashboardAddCeremonyLead() {
  const { execute, pending, error, clearError } = useCreateDraftCeremony()

  return (
    <div className="flex flex-col gap-6">
      {error !== null ? (
        <Alert variant="destructive" className="max-w-xl">
          <AlertCircleIcon className="-mt-0.5 inline" aria-hidden />
          <AlertTitle>Could not start a ceremony</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="min-w-0 flex-1 text-pretty">{error}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 self-start border-current/40 sm:self-center"
              disabled={pending}
              onClick={() => {
                clearError()
                void execute()
              }}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl space-y-2">
          <h1 className="font-sans text-3xl font-semibold tracking-tight">
            Your naming ceremonies
          </h1>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            Each cat owns its own funnel and unlock record. Naming Buddy keeps a
            single ceremony column per dashboard card so jumping between cats
            stays calm.
          </p>
        </div>
        <div className="shrink-0">
          <Button
            type="button"
            size="lg"
            disabled={pending}
            aria-busy={pending}
            onClick={() => {
              clearError()
              void execute()
            }}
          >
            {pending ? "Starting ceremony…" : "Add a cat"}
          </Button>
        </div>
      </div>
    </div>
  )
}

function DashboardCatsLoaded() {
  const cats = useQuery(api.cats.listMyCatsForDashboard)

  if (cats === undefined) {
    return (
      <div className="flex flex-1 flex-col gap-10">
        <DashboardAddCeremonyLead />
        <DashboardCatsSkeletonGrid />
      </div>
    )
  }

  const hasCats = cats.length > 0

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10">
      <DashboardAddCeremonyLead />

      {hasCats ? (
        <section aria-labelledby="cat-grid-heading">
          <h2 id="cat-grid-heading" className="sr-only">
            Ceremony cards
          </h2>
          <ul className="grid grid-cols-1 list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cats.map((cat) => (
              <CatCeremonyCard key={cat._id} cat={cat} />
            ))}
          </ul>
        </section>
      ) : (
        <Empty className="border-border/70 bg-muted/15 border-solid">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Cat aria-hidden />
            </EmptyMedia>
            <EmptyTitle>You haven&apos;t opened a ceremony yet.</EmptyTitle>
            <EmptyDescription>
              Start when you are ready — portraits, summaries, previews, unlock,
              and certificates land in dedicated steps guided by Naming Buddy.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateCeremonyButton
              variant="secondary"
              size="lg"
              label="Start your first ceremony"
            />
          </EmptyContent>
        </Empty>
      )}
    </div>
  )
}

export function DashboardHomeView() {
  return (
    <ConvexAuthHydrationGate>
      <DashboardCatsLoaded />
    </ConvexAuthHydrationGate>
  )
}
