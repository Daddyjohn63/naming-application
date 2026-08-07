"use client"

/**
 * KB-005 — multi-select family name style picker before curation.
 */

import * as React from "react"
import { useMutation } from "convex/react"

import { api } from "@workspace/backend/_generated/api"
import type { Doc } from "@workspace/backend/_generated/dataModel"
import {
  FAMILY_NAME_STYLE_IDS,
  FAMILY_NAME_STYLE_LABELS,
  type FamilyNameStyleId,
} from "@workspace/shared/constants/family-naming"
import { getConvexErrorMessage } from "@workspace/shared/utils/convex-error"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"

import { dataComponent } from "@/lib/data-component"

type FamilyNameStylePickerProps = {
  cat: Doc<"cats">
}

export function FamilyNameStylePicker({ cat }: FamilyNameStylePickerProps) {
  const submitStyles = useMutation(api.familyNaming.submitFamilyNameStyles)
  const [selected, setSelected] = React.useState<FamilyNameStyleId[]>([])
  const [submitting, setSubmitting] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const toggleStyle = (id: FamilyNameStyleId) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    )
  }

  const onContinue = async () => {
    if (selected.length === 0) {
      setServerError("Choose at least one style to continue.")
      return
    }
    setServerError(null)
    setSubmitting(true)
    try {
      await submitStyles({ catId: cat._id, styleIds: selected })
      toast.success("Style saved — generating family names…")
    } catch (error) {
      setServerError(getConvexErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card
      {...dataComponent("FamilyNameStylePicker")}
      className="ceremony-panel"
    >
      <CardHeader className="border-b">
        <CardTitle className="text-base">Family name style</CardTitle>
        <CardDescription>
          Pick the flavour for your cat&apos;s family name — the one you call
          across the room. You can choose more than one style. Click
          &quot;Continue&quot; to receive your list of family names.
        </CardDescription>
      </CardHeader>

      <div className="flex flex-col gap-6 px-4 py-6">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Family name styles"
        >
          {FAMILY_NAME_STYLE_IDS.map((id) => {
            const isSelected = selected.includes(id)
            return (
              <button
                key={id}
                type="button"
                disabled={submitting}
                aria-pressed={isSelected}
                onClick={() => toggleStyle(id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-primary/35 hover:text-foreground"
                )}
              >
                {FAMILY_NAME_STYLE_LABELS[id]}
              </button>
            )
          })}
        </div>

        {selected.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            Selected:{" "}
            {selected.map((id) => (
              <Badge key={id} variant="secondary" className="mr-1 rounded-full">
                {FAMILY_NAME_STYLE_LABELS[id]}
              </Badge>
            ))}
          </p>
        ) : null}

        {serverError !== null ? (
          <p className="text-sm text-destructive" role="alert">
            {serverError}
          </p>
        ) : null}

        <div>
          <Button
            type="button"
            disabled={submitting}
            onClick={() => void onContinue()}
          >
            {submitting ? "Continuing…" : "Continue"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
