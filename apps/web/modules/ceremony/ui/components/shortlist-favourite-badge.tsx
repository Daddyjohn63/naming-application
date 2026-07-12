"use client"

import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

type ShortlistFavouriteBadgeProps = {
  className?: string
}

/** Prominent coral badge shown when a shortlist name is the chosen favourite. */
export function ShortlistFavouriteBadge({
  className,
}: ShortlistFavouriteBadgeProps) {
  return (
    <Badge
      className={cn(
        "rounded-full border border-primary/40 bg-primary px-2.5 font-semibold text-primary-foreground shadow-sm",
        className,
      )}
    >
      Favourite
    </Badge>
  )
}

/** Shared classes for the “Set favourite” action so it reads as a clear CTA. */
export const setFavouriteButtonClassName =
  "border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
