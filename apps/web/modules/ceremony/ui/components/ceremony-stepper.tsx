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
  // as per what server is telling us is current step
  currentStep,
  className,
}: CeremonyStepperProps) {
  const steps = ceremonyStepsForUi()
  // active index is the index of the current step in the ceremony steps sequence. source of truth is currentStep prop from server.
  const activeIndex = ceremonyStepIndex(currentStep)
  // if the active index is less than 0, that means the current step is not in the ceremony steps sequence and something has gone wrong.
  // TODO: we should probably handle this case more gracefully and do checks on the db to re-align the current step with the ceremony steps sequence.
  const unknownStep = activeIndex < 0

  return (
    <div
      className={cn(
        "w-full overflow-x-auto border-y border-border/60 bg-muted/20 py-3",
        className
      )}
    >
      {unknownStep ? (
        <p
          className="px-3 pb-2 text-xs leading-snug font-medium text-destructive/90"
          role="note"
        >
          Ceremony step from the server couldn&apos;t be mapped to this progress
          tracker. Refresh or continue if the rest of the page looks fine.
        </p>
      ) : null}
      <ol
        className="flex min-w-0 items-stretch justify-center gap-2 px-1 text-xs font-medium text-muted-foreground md:gap-3 md:text-sm"
        aria-label="Naming ceremony progress"
      >
        {steps.map((step, index) => {
          const isComplete = !unknownStep && index < activeIndex
          const isCurrent = !unknownStep && index === activeIndex

          return (
            <li
              key={step.id}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex min-w-30 shrink-0 flex-col gap-1 rounded-lg border border-border/80 bg-background/80 px-2 py-2 md:min-w-33 md:px-3",
                isCurrent &&
                  "border-primary/50 text-foreground ring-2 ring-primary/25",
                isComplete && "border-transparent bg-transparent opacity-80",
                index > activeIndex && "opacity-60"
              )}
            >
              <span className="flex items-center gap-1.5">
                {isComplete ? (
                  <CheckCircle2
                    className="size-4 shrink-0 text-primary"
                    aria-hidden
                  />
                ) : isCurrent ? (
                  <CircleDot
                    className="size-4 shrink-0 text-primary"
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
