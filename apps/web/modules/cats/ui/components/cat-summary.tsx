import { api } from "@workspace/backend/_generated/api"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useQuery } from "convex/react"

export const CatSummary = ({ catId }: { catId: string }) => {
  const latestSummary = useQuery(api.catSummary.getLatestSummaryForOwner, {
    catId,
  })

  if (latestSummary === undefined) {
    return <Skeleton className="h-24 w-full rounded-md" />
  }

  // Parent only mounts this past summary submit; null is unexpected.
  if (latestSummary === null) return null

  return <p className="text-sm leading-relaxed">{latestSummary.summaryText}</p>
}
