import { CheckIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

type FeatureListProps = {
  features: readonly string[]
  /** Extra classes for each feature's text (e.g. "text-sm"). */
  itemClassName?: string
}

/** Checkmark bullet list shared by the pricing and certificate sections. */
export function FeatureList({ features, itemClassName }: FeatureListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-3">
          <CheckIcon
            aria-hidden
            className="mt-1 size-4 shrink-0 text-primary"
          />
          <span
            className={cn("text-pretty text-muted-foreground", itemClassName)}
          >
            {feature}
          </span>
        </li>
      ))}
    </ul>
  )
}
