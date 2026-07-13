"use client"

/**
 * KB-004 summary review panel — edit, save draft, and submit the personality summary.
 *
 * Loads the latest `cat_summary_versions` row reactively. No AI regenerate button
 * (product rule: manual edit only after first generation).
 */

import * as React from "react"
import { useMutation, useQuery } from "convex/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { api } from "@workspace/backend/_generated/api"
import type { Doc } from "@workspace/backend/_generated/dataModel"
import { MAX_CAT_PROFILE_SUBMIT_COUNT } from "@workspace/shared/constants/cat-profile"
import {
  MAX_CAT_SUMMARY_TEXT_LENGTH,
  MIN_CAT_SUMMARY_TEXT_LENGTH,
} from "@workspace/shared/constants/cat-summary"
import {
  submitCatSummarySchema,
  type SubmitCatSummaryFields,
} from "@workspace/shared/schemas/cat-summary"
import {
  getConvexErrorData,
  getConvexErrorMessage,
} from "@workspace/shared/utils/convex-error"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Textarea } from "@workspace/ui/components/textarea"
import { toast } from "@workspace/ui/components/sonner"

import { useConfirm } from "@/hooks/use-confirm"
import { dataComponent } from "@/lib/data-component"

type CatSummaryReviewProps = {
  cat: Doc<"cats">
  /** Parent switches back to profile form (summary_review → edit profile overlay). */
  onEditProfile: () => void
}

/** Characters left before hitting MAX_CAT_SUMMARY_TEXT_LENGTH. */
function remainingChars(value: string, max: number): number {
  return Math.max(0, max - value.length)
}

export function CatSummaryReview({
  cat,
  onEditProfile,
}: CatSummaryReviewProps) {
  const latestSummary = useQuery(api.catSummary.getLatestSummaryForOwner, {
    catId: cat._id,
  })
  const saveDraft = useMutation(api.catSummary.saveSummaryDraft)
  const submitSummary = useMutation(api.catSummary.submitSummary)
  const [ShowConfirm, confirm] = useConfirm(
    "Go back to profile?",
    `Going back to edit your profile may result in losing this generated summary. But remember you have ${MAX_CAT_PROFILE_SUBMIT_COUNT} attempts.`
  )

  /** Non-field errors from save/submit mutations (auth, step locked, etc.). */
  const [serverError, setServerError] = React.useState<string | null>(null)
  /** True while saveSummaryDraft is in flight. */
  const [saving, setSaving] = React.useState(false)
  /** True while submitSummary is in flight. */
  const [submitting, setSubmitting] = React.useState(false)

  const form = useForm<SubmitCatSummaryFields>({
    resolver: zodResolver(submitCatSummarySchema),
    defaultValues: { summaryText: "" },
    mode: "onSubmit",
  })

  const summaryValue = form.watch("summaryText") ?? ""

  // Seed textarea when the reactive query returns the latest version row.
  React.useEffect(() => {
    if (latestSummary !== undefined && latestSummary !== null) {
      form.reset({ summaryText: latestSummary.summaryText })
    }
  }, [latestSummary, form])

  /** Append user_edit version; stay on summary_review. */
  const onSave = form.handleSubmit(async (values) => {
    setServerError(null)
    setSaving(true)
    try {
      await saveDraft({ catId: cat._id, summaryText: values.summaryText })
      toast.success("Summary saved.")
    } catch (error) {
      const data = getConvexErrorData(error)
      const message = getConvexErrorMessage(error)
      if (data?.fieldErrors?.summaryText !== undefined) {
        form.setError("summaryText", {
          message: String(data.fieldErrors.summaryText),
        })
      } else {
        setServerError(message)
      }
    } finally {
      setSaving(false)
    }
  })

  /** Lock summary and advance ceremony to family_style (KB-005). */
  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null)
    setSubmitting(true)
    try {
      await submitSummary({ catId: cat._id, summaryText: values.summaryText })
      toast.success("Summary submitted — choose a family name style next.")
    } catch (error) {
      const data = getConvexErrorData(error)
      const message = getConvexErrorMessage(error)
      if (data?.fieldErrors?.summaryText !== undefined) {
        form.setError("summaryText", {
          message: String(data.fieldErrors.summaryText),
        })
      } else {
        setServerError(message)
      }
    } finally {
      setSubmitting(false)
    }
  })

  /** Disable all buttons while either mutation runs. */
  const busy = saving || submitting

  async function handleEditProfile() {
    const confirmed = await confirm()
    if (confirmed) {
      onEditProfile()
    }
  }

  if (latestSummary === undefined) {
    return (
      <Card {...dataComponent("CatSummaryReview")}>
        <CardHeader className="border-b">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-full max-w-md" />
        </CardHeader>
        <div className="px-4 py-6">
          <Skeleton className="min-h-48 w-full rounded-md" />
        </div>
      </Card>
    )
  }

  if (latestSummary === null) {
    return (
      <Card {...dataComponent("CatSummaryReview")}>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Summary not ready</CardTitle>
          <CardDescription>
            Your summary is still being prepared. Refresh in a moment or return
            from the dashboard.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card {...dataComponent("CatSummaryReview")} className="ceremony-panel">
      <ShowConfirm />
      <CardHeader className="border-b">
        <CardTitle className="text-base">Personality summary</CardTitle>
        <CardDescription>
          Read through your cat&apos;s profile. Edit anything that doesn&apos;t
          sound right, save your draft, then submit when you&apos;re happy. You
          will then move onto the next step where you can choose a family name
          style and generate a list of suggested family names for you to choose
          from. Or, you can add your own name.
        </CardDescription>
      </CardHeader>

      <form className="flex flex-col gap-6 px-4 pt-4 pb-6">
        <Field data-invalid={!!form.formState.errors.summaryText}>
          <FieldLabel htmlFor="cat-summary">Summary</FieldLabel>
          <Textarea
            id="cat-summary"
            disabled={busy}
            rows={12}
            maxLength={MAX_CAT_SUMMARY_TEXT_LENGTH}
            className="min-h-56 resize-y leading-relaxed font-normal"
            {...form.register("summaryText")}
          />
          <FieldDescription>
            At least {MIN_CAT_SUMMARY_TEXT_LENGTH} characters ·{" "}
            {remainingChars(summaryValue, MAX_CAT_SUMMARY_TEXT_LENGTH)}{" "}
            remaining
          </FieldDescription>
          <FieldError>{form.formState.errors.summaryText?.message}</FieldError>
        </Field>

        {serverError !== null ? (
          <p className="text-sm text-destructive" role="alert">
            {serverError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="button" disabled={busy} onClick={() => void onSave()}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button type="button" disabled={busy} onClick={() => void onSubmit()}>
            {submitting ? "Submitting…" : "Submit summary"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => void handleEditProfile()}
          >
            Go back to profile
          </Button>
        </div>
      </form>
    </Card>
  )
}
