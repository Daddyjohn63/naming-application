"use client"

import Link from "next/link"
import * as React from "react"

import { api } from "@workspace/backend/_generated/api"
import { CreateCeremonyButton } from "@/modules/cats/ui/components/create-ceremony-button"
import { useCreateDraftCeremony } from "@/modules/cats/ui/hooks/use-create-draft-ceremony"
import { CeremonyStepBadge } from "@/modules/ceremony/ui/components/ceremony-step-badge"
import { ceremonyCtaButtonClassName } from "@/modules/ceremony/lib/ceremony-styles"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
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
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"
import { getConvexErrorMessage } from "@workspace/shared/utils/convex-error"
import { useConfirm } from "@/hooks/use-confirm"
import { dataComponent } from "@/lib/data-component"
import { AlertCircleIcon, Cat, PlusCircle, Trash2 } from "lucide-react"
import { useConvexAuth, useMutation, useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"

const DASHBOARD_SKELETON_CARD_KEYS = ["a", "b", "c", "d", "e", "f"] as const

function DashboardCatsSkeletonGrid() {
  return (
    <ul
      {...dataComponent("DashboardCatsSkeletonGrid")}
      className="mx-auto grid w-full max-w-6xl list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-hidden
    >
      {DASHBOARD_SKELETON_CARD_KEYS.map((k) => (
        <li key={k} className="min-w-0">
          <div className="rounded-xl border border-border p-4">
            <Skeleton className="aspect-4/3 w-full rounded-lg" />
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
  //checks if the user is loading and checks if users is signed in or not.
  const { isLoading } = useConvexAuth()

  if (isLoading) {
    return (
      <div
        {...dataComponent("ConvexAuthHydrationGate")}
        className="flex flex-1 flex-col gap-8"
      >
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

type DashboardCat = FunctionReturnType<
  typeof api.cats.listMyCatsForDashboard
>[number]

type CatCeremonyCardProps = {
  cat: DashboardCat
}

function CatCeremonyCard({ cat }: CatCeremonyCardProps) {
  const href = `/cats/${encodeURIComponent(cat._id)}`
  const deleteCeremony = useMutation(api.cats.deleteCeremony)
  const [deleting, setDeleting] = React.useState(false)
  const [ShowConfirm, confirm] = useConfirm(
    `Delete "${cat.title}"?`,
    "This will permanently remove this naming ceremony and all its progress. This cannot be undone."
  )

  async function handleDeleteClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    const confirmed = await confirm()
    if (!confirmed) {
      return
    }

    setDeleting(true)
    try {
      await deleteCeremony({ catId: cat._id })
      toast.success("Ceremony deleted.")
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <li {...dataComponent("CatCeremonyCard")} className="relative min-w-0">
      <ShowConfirm />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={deleting}
        aria-busy={deleting}
        aria-label={`Delete ${cat.title}`}
        className="absolute top-2 right-2 z-10 size-8 bg-background/85 text-muted-foreground shadow-sm backdrop-blur-sm hover:bg-background/85 hover:text-muted-foreground hover:[&_svg]:text-destructive"
        onClick={(event) => {
          void handleDeleteClick(event)
        }}
      >
        <Trash2 className="size-4 transition-colors" aria-hidden />
      </Button>
      <Link
        href={href}
        prefetch
        className="group block h-full rounded-xl hover:border-primary/25 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Card className="h-full border-border/80 transition-[box-shadow,border-color] duration-150 group-hover:shadow-md hover:border-primary/40">
          <CardHeader className="gap-0 pb-3">
            <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-muted">
              {cat.photoUrl !== undefined ? (
                // eslint-disable-next-line @next/next/no-img-element -- Convex-resolved HTTPS storage URL.
                <img
                  src={cat.photoUrl}
                  alt=""
                  className="size-full object-cover transition-transform duration-150 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <Cat className="size-12 opacity-40" aria-hidden />
                </div>
              )}
            </div>
            <CardTitle className="pt-3 font-sans text-base tracking-tight">
              {cat.title}
            </CardTitle>
            <CardDescription className="line-clamp-2 text-xs">
              Open to resume this ceremony where you left off.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <CeremonyStepBadge
              step={cat.ceremonyStep}
              className="text-xs font-normal"
            />
          </CardFooter>
        </Card>
      </Link>
    </li>
  )
}

/** Primary “Add” with inline recovery (KB-002). Shown once the user has ceremonies. */
function DashboardAddCeremonyLead() {
  const { execute, pending, error, clearError } = useCreateDraftCeremony()

  return (
    <div
      {...dataComponent("DashboardAddCeremonyLead")}
      className="flex flex-col gap-6"
    >
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
          <p className="leading-relaxed text-pretty text-muted-foreground">
            Each cat has its own naming ceremony.
          </p>
        </div>
        <div className="shrink-0">
          <Button
            type="button"
            size="lg"
            disabled={pending}
            aria-busy={pending}
            className={cn(ceremonyCtaButtonClassName, "px-6")}
            onClick={() => {
              clearError()
              void execute()
            }}
          >
            <PlusCircle className="size-4" aria-hidden />
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
      <div
        {...dataComponent("DashboardCatsLoaded")}
        className="flex flex-1 flex-col gap-10"
      >
        <DashboardAddCeremonyLead />
        <DashboardCatsSkeletonGrid />
      </div>
    )
  }

  const hasCats = cats.length > 0

  return (
    <div
      {...dataComponent("DashboardCatsLoaded")}
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10"
    >
      {hasCats ? (
        <>
          <DashboardAddCeremonyLead />
          <section aria-labelledby="cat-grid-heading">
            <h2 id="cat-grid-heading" className="sr-only">
              Ceremony cards
            </h2>
            <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cats.map((cat) => (
                <CatCeremonyCard key={cat._id} cat={cat} />
              ))}
            </ul>
          </section>
        </>
      ) : (
        <Empty className="border-solid border-border/70 bg-muted/15">
          <EmptyHeader className="max-w-md">
            <EmptyMedia variant="icon" className="size-[60px]">
              <Cat className="size-[60px]" aria-hidden />
            </EmptyMedia>
            <EmptyTitle className="text-3xl font-bold">
              You haven&apos;t started a naming ceremony yet for your cat
            </EmptyTitle>
            <EmptyDescription>
              Start when you are ready — create a profile with a photo of your
              cat and their story. Our feline-trained AI agent will then create a
              summary of your cat&apos;s personality from which names can be
              generated.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateCeremonyButton
              size="lg"
              className="px-6"
              label="Add your first cat"
            />
          </EmptyContent>
        </Empty>
      )}
    </div>
  )
}

export function DashboardHomeView() {
  return (
    <div {...dataComponent("DashboardHomeView")} className="contents">
      <ConvexAuthHydrationGate>
        <DashboardCatsLoaded />
      </ConvexAuthHydrationGate>
    </div>
  )
}
