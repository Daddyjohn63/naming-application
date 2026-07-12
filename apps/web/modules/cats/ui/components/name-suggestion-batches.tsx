"use client"

/**
 * Suggestion list layout for naming curation: each generation is a
 * collapsible section. Newest generation opens by default; when a second
 * generation arrives, the first collapses and the new one opens.
 */

import * as React from "react"
import { ChevronDown } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { cn } from "@workspace/ui/lib/utils"

import { dataComponent } from "@/lib/data-component"

export type NameSuggestionEntry = {
  name: string
  rationale: string
}

export type NameSuggestionBatch = {
  generationIndex: number
  names: NameSuggestionEntry[]
}

type NameSuggestionBatchesProps = {
  batches: NameSuggestionBatch[]
  renderEntry: (
    entry: NameSuggestionEntry,
    batch: NameSuggestionBatch,
  ) => React.ReactNode
}

function generationLabel(generationIndex: number): string {
  if (generationIndex === 0) {
    return "First generation of names to choose from"
  }
  if (generationIndex === 1) {
    return "Second generation of names to choose from"
  }
  return `Generation ${generationIndex + 1} of names to choose from`
}

/** Open only the newest generation; earlier ones start collapsed. */
function openStateForBatches(
  batches: NameSuggestionBatch[],
): Record<number, boolean> {
  let latestIndex = Number.NEGATIVE_INFINITY
  for (const batch of batches) {
    if (batch.generationIndex > latestIndex) {
      latestIndex = batch.generationIndex
    }
  }

  const next: Record<number, boolean> = {}
  for (const batch of batches) {
    next[batch.generationIndex] = batch.generationIndex === latestIndex
  }
  return next
}

function BatchNameList({
  batch,
  renderEntry,
}: {
  batch: NameSuggestionBatch
  renderEntry: NameSuggestionBatchesProps["renderEntry"]
}) {
  return (
    <>
      {batch.names.map((entry) => (
        <React.Fragment key={`${batch.generationIndex}-${entry.name}`}>
          {renderEntry(entry, batch)}
        </React.Fragment>
      ))}
    </>
  )
}

function SuggestionCollapsibleSection({
  label,
  count,
  open,
  onOpenChange,
  children,
}: {
  label: string
  count: number
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className="group/section"
    >
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-between gap-3 bg-muted/10 px-4 py-3 text-left",
          "text-sm font-medium text-foreground transition-colors hover:bg-muted/20",
          "focus-visible:ring-ring outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        )}
      >
        <span>
          {label}
          <span className="ml-1.5 font-normal text-muted-foreground">
            ({count})
          </span>
        </span>
        <ChevronDown
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/section:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="flex flex-col divide-y border-t">{children}</ul>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function NameSuggestionBatches({
  batches,
  renderEntry,
}: NameSuggestionBatchesProps) {
  const orderedBatches = React.useMemo(
    () => [...batches].sort((a, b) => a.generationIndex - b.generationIndex),
    [batches],
  )

  const batchKey = orderedBatches
    .map((batch) => batch.generationIndex)
    .join(",")

  const [openByIndex, setOpenByIndex] = React.useState<Record<number, boolean>>(
    () => openStateForBatches(orderedBatches),
  )

  React.useEffect(() => {
    setOpenByIndex(openStateForBatches(orderedBatches))
    // Only re-sync when the set of generations changes (e.g. second batch arrives).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- batchKey is the intentional trigger
  }, [batchKey])

  if (orderedBatches.length === 0) {
    return null
  }

  return (
    <div
      {...dataComponent("NameSuggestionBatches")}
      className="flex flex-col divide-y"
    >
      {orderedBatches.map((batch) => (
        <SuggestionCollapsibleSection
          key={batch.generationIndex}
          label={generationLabel(batch.generationIndex)}
          count={batch.names.length}
          open={openByIndex[batch.generationIndex] === true}
          onOpenChange={(open) => {
            setOpenByIndex((current) => ({
              ...current,
              [batch.generationIndex]: open,
            }))
          }}
        >
          <BatchNameList batch={batch} renderEntry={renderEntry} />
        </SuggestionCollapsibleSection>
      ))}
    </div>
  )
}
