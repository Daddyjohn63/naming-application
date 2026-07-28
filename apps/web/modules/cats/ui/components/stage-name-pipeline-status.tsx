"use client"

/**
 * KB-009 / KB-010 — shared loading and error UI for cat-world and ineffable name generation.
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
import {
  CAT_WORLD_NAMES_LOADING,
  INEFFABLE_NAMES_LOADING,
  type PipelineStatusCopy,
} from "@/modules/cats/lib/pipeline-status-copy"

export type NamingStageKind = "cat_world" | "ineffable"

type StageNamePipelineStatusProps = {
  stage: NamingStageKind
  cat: Doc<"cats">
  onRetry: () => void
  retrying: boolean
}

const STAGE_COPY: Record<NamingStageKind, PipelineStatusCopy> = {
  cat_world: CAT_WORLD_NAMES_LOADING,
  ineffable: INEFFABLE_NAMES_LOADING,
}

export function StageNamePipelineStatus({
  stage,
  cat,
  onRetry,
  retrying,
}: StageNamePipelineStatusProps) {
  const errorMessage =
    stage === "cat_world"
      ? cat.catWorldNameGenerationError
      : cat.ineffableNameGenerationError

  const copy = STAGE_COPY[stage]

  if (errorMessage !== undefined) {
    return (
      <Card {...dataComponent("StageNamePipelineStatus")} className="ceremony-panel">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Couldn&apos;t generate names</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
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
      {...dataComponent("StageNamePipelineStatus")}
      className="ceremony-highlight-panel border-primary/25"
    >
      <CardHeader className="flex flex-row items-center gap-3 border-0 pb-0">
        <Spinner className="size-5 shrink-0 text-primary" />
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base">{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
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
