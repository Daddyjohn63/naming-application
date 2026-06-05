"use client"

import { Lock, Sparkles } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

import { dataComponent } from "@/lib/data-component"

export type CeremonyNameSlotState = "filled" | "locked" | "placeholder"

type CeremonyNameSlotProps = {
  label: string
  name?: string
  rationale?: string
  state: CeremonyNameSlotState
  badge?: string
  placeholderHint?: string
  className?: string
}

/**
 * One of the three ceremony name cards (everyday, cat-world, ineffable).
 */
export function CeremonyNameSlot({
  label,
  name,
  rationale,
  state,
  badge,
  placeholderHint = "Unlock to discover",
  className,
}: CeremonyNameSlotProps) {
  const isFilled = state === "filled" || state === "locked"
  const isLockedSlot = state === "placeholder"

  return (
    <article
      {...dataComponent("CeremonyNameSlot")}
      className={cn(
        "box-border flex w-full flex-col gap-3 rounded-xl border p-4",
        isLockedSlot && "min-h-52",
        isFilled &&
          state === "filled" &&
          "ceremony-highlight-panel border-primary/35 shadow-sm",
        state === "locked" &&
          "bg-card border-ceremony-complete/30 border-solid opacity-95",
        isLockedSlot &&
          "border-border/80 border-dashed bg-muted/20 text-muted-foreground",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-muted-foreground text-[0.65rem] font-semibold tracking-[0.14em] uppercase">
          {label}
        </p>
        {state === "locked" ? (
          <Lock
            className="text-ceremony-complete size-4 shrink-0"
            aria-hidden
          />
        ) : isLockedSlot ? (
          <Lock className="size-4 shrink-0 opacity-60" aria-hidden />
        ) : null}
      </div>

      {isFilled ? (
        <>
          <div className="flex min-w-0 flex-col gap-2">
            <p
              className="min-w-0 overflow-hidden text-lg leading-tight font-semibold tracking-tight text-ellipsis whitespace-nowrap sm:text-xl"
              title={name}
            >
              {name}
            </p>
            {badge !== undefined ? (
              <Badge className="bg-primary w-fit rounded-full">{badge}</Badge>
            ) : null}
          </div>
          {rationale !== undefined && rationale.length > 0 ? (
            <p className="min-w-0 text-sm leading-relaxed wrap-break-word text-muted-foreground">
              {rationale}
            </p>
          ) : null}
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-2 text-center">
          <Sparkles
            className="text-muted-foreground/50 size-10 stroke-[1.25]"
            aria-hidden
          />
          <p className="text-sm font-medium">{placeholderHint}</p>
        </div>
      )}
    </article>
  )
}
