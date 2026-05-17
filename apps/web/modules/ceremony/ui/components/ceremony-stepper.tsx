"use client"

import { CheckCircle2, CircleDot, Lock } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import {
  ceremonyStepsForUi,
  ceremonyStepIndex,
} from "../../lib/ceremony-progress"

type CeremonyStepperProps = {
  currentStep: string
  className?: string
}

/**
 * Horizontal “guided tunnel” stepper (DESIGN-GUIDES.md Recommendation 1).
 * Completed steps read as subdued checks; current is dominant; future uses lock metaphor.
 */
export function CeremonyStepper({
  currentStep,
  className,
}: CeremonyStepperProps) {
  const steps = ceremonyStepsForUi()
  const activeIndex = ceremonyStepIndex(currentStep)

  return (
    <div
      className={cn(
        "border-border/60 bg-muted/20 w-full overflow-x-auto border-y py-3",
        className,
      )}
    >
      <ol
        className="text-muted-foreground flex min-w-0 items-stretch gap-2 px-1 text-xs font-medium md:gap-3 md:text-sm"
        aria-label="Naming ceremony progress"
      >
        {steps.map((step, index) => {
          const isComplete = index < activeIndex
          const isCurrent = index === activeIndex

          return (
            <li
              key={step.id}
              className={cn(
                "border-border/80 flex min-w-[7.5rem] shrink-0 flex-col gap-1 rounded-lg border bg-background/80 px-2 py-2 md:min-w-[8.25rem] md:px-3",
                isCurrent &&
                  "border-primary/50 text-foreground ring-primary/25 ring-2",
                isComplete && "border-transparent bg-transparent opacity-80",
                index > activeIndex && "opacity-60",
              )}
            >
              <span className="flex items-center gap-1.5">
                {isComplete ? (
                  <CheckCircle2
                    className="text-primary size-4 shrink-0"
                    aria-hidden
                  />
                ) : isCurrent ? (
                  <CircleDot
                    className="text-primary size-4 shrink-0"
                    aria-hidden
                  />
                ) : (
                  <Lock className="size-3.5 shrink-0" aria-hidden />
                )}
                <span className="truncate">{step.label}</span>
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
