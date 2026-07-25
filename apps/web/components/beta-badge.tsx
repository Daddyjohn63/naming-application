import { dataComponent } from "@/lib/data-component"
import { IS_PUBLIC_BETA } from "@/modules/landing/lib/pricing"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

type BetaBadgeProps = {
  className?: string
}

/** Compact Beta label for app chrome. Renders nothing outside public beta. */
export function BetaBadge({ className }: BetaBadgeProps) {
  if (!IS_PUBLIC_BETA) {
    return null
  }

  return (
    <Badge
      {...dataComponent("BetaBadge")}
      variant="secondary"
      className={cn("px-1.5 text-[10px] font-semibold tracking-wide", className)}
    >
      Beta
    </Badge>
  )
}
