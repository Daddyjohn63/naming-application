"use client"

/**
 * KB-004 photo quality warn panel — shown when validation outcome is "warn".
 *
 * User must explicitly continue (schedules summary generation) or replace the photo
 * (returns to profile form at draft step).
 */

import * as React from "react"
import Image from "next/image"
import { useMutation } from "convex/react"

import { api } from "@workspace/backend/_generated/api"
import type { Doc } from "@workspace/backend/_generated/dataModel"
import { getConvexErrorMessage } from "@workspace/shared/utils/convex-error"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"

type CatPhotoQualityReviewProps = {
  cat: Doc<"cats"> & { photoUrl?: string }
  /** Parent calls returnToProfileForPhotoReplace — opens profile form for new upload. */
  onReplacePhoto: () => void
}

export function CatPhotoQualityReview({
  cat,
  onReplacePhoto,
}: CatPhotoQualityReviewProps) {
  const acknowledge = useMutation(api.catSummary.acknowledgePhotoQuality)
  const [continuing, setContinuing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  /** From AI validation or a friendly default when userMessage is empty. */
  const message =
    cat.photoValidation?.userMessage.trim() ||
    "We can see your cat, but the photo quality could be better. You can continue with this photo or upload a clearer one."

  /** Sets photoQualityAcknowledged and schedules generateCatSummary. */
  const onContinue = async () => {
    setError(null)
    setContinuing(true)
    try {
      await acknowledge({ catId: cat._id })
    } catch (err) {
      const message = getConvexErrorMessage(err)
      setError(message)
      toast.error(message)
    } finally {
      setContinuing(false)
    }
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-base">Photo quality check</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <div className="flex flex-col gap-6 px-4 pt-4 pb-6">
        {cat.photoUrl !== undefined ? (
          <div className="bg-muted relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-xl border">
            <Image
              src={cat.photoUrl}
              alt="Your cat"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 320px"
              unoptimized
            />
          </div>
        ) : null}
        {error !== null ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button type="button" disabled={continuing} onClick={() => void onContinue()}>
            {continuing ? "Continuing…" : "Continue with this photo"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={continuing}
            onClick={onReplacePhoto}
          >
            Replace photo
          </Button>
        </div>
      </div>
    </Card>
  )
}
