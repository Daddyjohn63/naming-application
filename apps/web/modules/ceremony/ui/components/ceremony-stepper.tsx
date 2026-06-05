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
 * Horizontal guided-tunnel stepper — warm cream bar, coral current step, sage completes.
 */
export function CeremonyStepper({
  currentStep,
  className,
}: CeremonyStepperProps) {
  const steps = ceremonyStepsForUi()
  const activeIndex = ceremonyStepIndex(currentStep)
  const unknownStep = activeIndex < 0
  const progressPercent =
    !unknownStep && steps.length > 1
      ? (activeIndex / (steps.length - 1)) * 100
      : 0

  return (
    <div
      className={cn(
        "border-border/70 bg-muted/40 w-full overflow-x-auto border-y py-3",
        className,
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

      <div className="relative flex w-max min-w-full justify-start px-3 md:justify-center">
        <div
          className="pointer-events-none absolute inset-x-3 top-4 hidden md:block"
          aria-hidden
        >
          <div className="bg-border/80 h-0.5 w-full" />
          <div
            className="bg-primary absolute inset-y-0 left-0 h-0.5 transition-[width] duration-300"
            style={{
              width: `calc((100% - 1.5rem) * ${progressPercent / 100} + 0.75rem)`,
            }}
          />
        </div>

        <ol
          className="relative z-10 flex w-max shrink-0 items-stretch gap-2 text-xs font-medium text-muted-foreground md:gap-3 md:text-sm"
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
                  "bg-card flex min-w-30 shrink-0 flex-col gap-1 rounded-xl border px-2 py-2 shadow-sm md:min-w-33 md:px-3",
                  isCurrent &&
                    "border-primary/45 text-foreground ring-primary/30 bg-card ring-2",
                  isComplete &&
                    "border-ceremony-complete/25 bg-card shadow-none",
                  !isComplete && !isCurrent && "border-border/80",
                )}
              >
              <span className="flex items-center gap-1.5">
                {isComplete ? (
                  <CheckCircle2
                    className="text-ceremony-complete size-4 shrink-0"
                    aria-hidden
                  />
                ) : isCurrent ? (
                  <CircleDot
                    className="text-primary size-4 shrink-0"
                    aria-hidden
                  />
                ) : (
                  <Lock className="size-3.5 shrink-0 opacity-70" aria-hidden />
                )}
                <span className="truncate">{step.label}</span>
              </span>
            </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
