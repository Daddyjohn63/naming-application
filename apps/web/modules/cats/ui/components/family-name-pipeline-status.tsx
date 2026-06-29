"use client"

/**
 * KB-006 loading and error UI while family name batches generate.
 */

import type { Doc } from "@workspace/backend/_generated/dataModel"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Spinner } from "@workspace/ui/components/spinner"

import { dataComponent } from "@/lib/data-component"

type FamilyNamePipelineStatusProps = {
  cat: Doc<"cats">
  onRetry: () => void
  retrying: boolean
}

export function FamilyNamePipelineStatus({
  cat,
  onRetry,
  retrying,
}: FamilyNamePipelineStatusProps) {
  if (cat.familyNameGenerationError !== undefined) {
    return (
      <Card {...dataComponent("FamilyNamePipelineStatus")} className="ceremony-panel">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Couldn&apos;t generate names</CardTitle>
          <CardDescription>{cat.familyNameGenerationError}</CardDescription>
        </CardHeader>
        <div className="px-4 py-4">
          <Button type="button" disabled={retrying} onClick={onRetry}>
            {retrying ? "Retrying…" : "Retry"}
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card
      {...dataComponent("FamilyNamePipelineStatus")}
      className="ceremony-highlight-panel border-primary/25"
    >
      <CardHeader className="flex flex-row items-center gap-3 border-0 pb-0">
        <Spinner className="size-5 shrink-0 text-primary" />
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base">Generating family names…</CardTitle>
          <CardDescription>
            We&apos;re crafting ten family names from your summary and style.
            You can leave and come back — your progress is saved.
          </CardDescription>
        </div>
      </CardHeader>
      <div className="flex flex-col gap-3 px-4 pt-4 pb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </Card>
  )
}
