"use client"

/**
 * Compact accepted personality summary for the naming-tunnel sidebar.
 * Shows a short preview by default; owners expand to read the full text.
 */

import * as React from "react"
import { useQuery } from "convex/react"

import { api } from "@workspace/backend/_generated/api"
import type { Id } from "@workspace/backend/_generated/dataModel"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"

import { dataComponent } from "@/lib/data-component"

const PREVIEW_WORD_COUNT = 20

function summaryPreview(
  text: string,
  maxWords: number,
): { preview: string; isTruncated: boolean } {
  const trimmed = text.trim()
  if (trimmed.length === 0) {
    return { preview: "", isTruncated: false }
  }
  const words = trimmed.split(/\s+/).filter((word) => word.length > 0)
  if (words.length <= maxWords) {
    return { preview: trimmed, isTruncated: false }
  }
  return {
    preview: `${words.slice(0, maxWords).join(" ")}…`,
    isTruncated: true,
  }
}

export function CatSummary({ catId }: { catId: Id<"cats"> }) {
  const latestSummary = useQuery(api.catSummary.getLatestSummaryForOwner, {
    catId,
  })
  const [expanded, setExpanded] = React.useState(false)

  React.useEffect(() => {
    setExpanded(false)
  }, [catId])

  if (latestSummary === undefined) {
    return <Skeleton className="h-24 w-full rounded-md" />
  }

  // Parent only mounts this past summary submit; null is unexpected.
  if (latestSummary === null) {
    return null
  }

  const summaryText = latestSummary.summaryText ?? ""
  const { preview, isTruncated } = summaryPreview(
    summaryText,
    PREVIEW_WORD_COUNT,
  )
  const displayText = expanded || !isTruncated ? summaryText : preview

  return (
    <Card
      {...dataComponent("CatSummary")}
      className="ceremony-sidebar-panel mt-2 border-primary/20"
    >
      <CardHeader className="border-b">
        <CardTitle>Your cat&apos;s personality summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm leading-relaxed">{displayText}</p>
        {isTruncated ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto self-start px-0"
            aria-expanded={expanded}
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? "Show less" : "Read full profile"}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
