"use client"

import { ArrowRight } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { dataComponent } from "@/lib/data-component"

type CeremonyStageContinuePromptProps = {
  title: string
  description: string
  buttonLabel: string
  onContinue: () => void
  continuing?: boolean
  highlightName?: string
}

/**
 * Prominent next-step CTA between naming stages (e.g. cat-world → ineffable).
 */
export function CeremonyStageContinuePrompt({
  title,
  description,
  buttonLabel,
  onContinue,
  continuing = false,
  highlightName,
}: CeremonyStageContinuePromptProps) {
  return (
    <Card
      {...dataComponent("CeremonyStageContinuePrompt")}
      className="ceremony-highlight-panel border-primary/35 shadow-sm"
    >
      <CardHeader className="gap-3 border-b pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {highlightName !== undefined ? (
            <>
              You chose{" "}
              <span className="text-foreground font-semibold">{highlightName}</span>
              {" — "}
              {description}
            </>
          ) : (
            description
          )}
        </CardDescription>
      </CardHeader>
      <div className="px-4 py-4">
        <Button
          type="button"
          size="lg"
          className="w-full sm:w-auto"
          disabled={continuing}
          onClick={onContinue}
        >
          {continuing ? "Continuing…" : buttonLabel}
          {!continuing ? (
            <ArrowRight className="ml-2 size-4" aria-hidden />
          ) : null}
        </Button>
      </div>
    </Card>
  )
}
