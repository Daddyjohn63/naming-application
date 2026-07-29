"use client"

import { Star } from "lucide-react"
import { useEffect, useState, type FormEvent } from "react"
import { useMutation, useQuery } from "convex/react"

import { dataComponent } from "@/lib/data-component"
import { api } from "@workspace/backend/_generated/api"
import type { Id } from "@workspace/backend/_generated/dataModel"
import { getConvexErrorMessage } from "@workspace/shared/utils/convex-error"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { toast } from "@workspace/ui/components/sonner"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"

const MAX_BODY_LENGTH = 2000

type FeedbackSource = "certificate" | "dashboard"

type FeedbackFormProps = {
  source: FeedbackSource
  catId?: Id<"cats">
  /** Called after a successful submit (e.g. close a dialog). */
  onSuccess?: () => void
  className?: string
}

export function FeedbackForm({
  source,
  catId,
  onSuccess,
  className,
}: FeedbackFormProps) {
  const existing = useQuery(api.betaReviews.getMyBetaReview)
  const submit = useMutation(api.betaReviews.submitBetaReview)

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [body, setBody] = useState("")
  const [pending, setPending] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (existing === undefined || hydrated) {
      return
    }
    if (existing !== null) {
      setRating(existing.rating)
      setBody(existing.body)
    }
    setHydrated(true)
  }, [existing, hydrated])

  const alreadyReviewed = existing !== null && existing !== undefined
  const canSubmit = rating >= 1 && rating <= 5 && !pending

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) {
      return
    }

    setPending(true)
    try {
      await submit({
        rating,
        body,
        source,
        ...(catId !== undefined ? { catId } : {}),
      })
      toast.success(
        alreadyReviewed
          ? "Thanks — your feedback was updated."
          : "Thanks for the beta feedback!",
      )
      onSuccess?.()
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setPending(false)
    }
  }

  if (existing === undefined) {
    return (
      <div
        {...dataComponent("FeedbackForm")}
        className={cn("text-sm text-muted-foreground", className)}
      >
        Loading…
      </div>
    )
  }

  return (
    <form
      {...dataComponent("FeedbackForm")}
      onSubmit={(event) => {
        void handleSubmit(event)
      }}
      className={cn("flex flex-col gap-5", className)}
    >
      {alreadyReviewed ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Thanks — you already left feedback. You can update it below if you
          like.
        </p>
      ) : null}

      <div className="space-y-2">
        <Label id="feedback-rating-label">Rating</Label>
        <div
          role="radiogroup"
          aria-labelledby="feedback-rating-label"
          className="flex gap-1"
        >
          {[1, 2, 3, 4, 5].map((value) => {
            const active = (hoverRating || rating) >= value
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={rating === value}
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
                className={cn(
                  "rounded-md p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "text-amber-500"
                    : "text-muted-foreground/40 hover:text-muted-foreground",
                )}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(value)}
              >
                <Star
                  className="size-7"
                  fill={active ? "currentColor" : "none"}
                  aria-hidden
                />
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedback-body">
          Comments <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="feedback-body"
          value={body}
          maxLength={MAX_BODY_LENGTH}
          placeholder="What worked well? What felt confusing?"
          className="min-h-28"
          onChange={(event) => setBody(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {body.length}/{MAX_BODY_LENGTH}
        </p>
      </div>

      <Button type="submit" disabled={!canSubmit} className="w-fit">
        {pending
          ? "Sending…"
          : alreadyReviewed
            ? "Update feedback"
            : "Send feedback"}
      </Button>
    </form>
  )
}
