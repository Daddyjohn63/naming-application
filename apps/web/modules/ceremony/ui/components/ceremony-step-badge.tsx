import {
  ceremonyStepBadgeClassName,
  ceremonyStepShortLabel,
} from "@/modules/ceremony/lib/ceremony-progress"
import { dataComponent } from "@/lib/data-component"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

type CeremonyStepBadgeProps = {
  step: string
  className?: string
}

/** Stage pill with a distinct colour per ceremony step (profile → certificate). */
export function CeremonyStepBadge({ step, className }: CeremonyStepBadgeProps) {
  return (
    <Badge
      {...dataComponent("CeremonyStepBadge")}
      variant="outline"
      className={cn(
        "rounded-full border font-medium",
        ceremonyStepBadgeClassName(step),
        className,
      )}
    >
      {ceremonyStepShortLabel(step)}
    </Badge>
  )
}
