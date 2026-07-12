"use client"

import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

type ShortlistSavedBadgeProps = {
  className?: string
}

/** Prominent sage badge shown when a batch name has been saved to the shortlist. */
export function ShortlistSavedBadge({ className }: ShortlistSavedBadgeProps) {
  return (
    <Badge
      className={cn(
        "rounded-full border border-ceremony-complete/30 bg-ceremony-complete px-2.5 font-semibold text-white shadow-sm dark:border-ceremony-complete/40 dark:text-emerald-950",
        className,
      )}
    >
      Saved
    </Badge>
  )
}
