"use client"

import {
  catPhotoUploadGuidanceLines,
  MAX_PHOTO_VALIDATION_ATTEMPTS,
  photoValidationAttemptsRemaining,
  photoValidationAttemptsUsed,
} from "@workspace/shared/constants/cat-photo-validation"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { dataComponent } from "@/lib/data-component"

type CatPhotoGuidanceProps = {
  cat: { photoValidationAttemptsUsed?: number }
  photoChecksExhausted: boolean
}

export function CatPhotoGuidance({
  cat,
  photoChecksExhausted,
}: CatPhotoGuidanceProps) {
  const attemptsUsed = photoValidationAttemptsUsed(cat)
  const attemptsRemaining = photoValidationAttemptsRemaining(attemptsUsed)

  return (
    <div {...dataComponent("CatPhotoGuidance")} className="flex flex-col gap-3">
      <Alert className="border-primary/15 bg-accent/30">
        <AlertTitle>Photo tips</AlertTitle>
        <AlertDescription>
          <ul className="mt-2 list-disc space-y-1.5 pl-4">
            {catPhotoUploadGuidanceLines().map((line) => (
              <li key={line}>{line}</li>
            ))}
            <li>
              <span className="font-medium text-foreground">
                {attemptsRemaining} of {MAX_PHOTO_VALIDATION_ATTEMPTS} automated
                photo checks remaining
              </span>{" "}
              for this ceremony.
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      {photoChecksExhausted ? (
        <Alert variant="destructive">
          <AlertTitle>All photo checks used</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <p>
              You&apos;ve used all {MAX_PHOTO_VALIDATION_ATTEMPTS} automated
              photo checks for this ceremony. We can&apos;t run another photo
              review, so uploading a different photo won&apos;t help.
            </p>
            <p>
              Start a new ceremony from your dashboard, or contact support for
              help. You can still save a draft of this profile.
            </p>
          </AlertDescription>
        </Alert>
      ) : attemptsRemaining <= 2 ? (
        <p className="text-sm text-muted-foreground" role="status">
          Only {attemptsRemaining}{" "}
          {attemptsRemaining === 1 ? "check" : "checks"} left — use a clear photo
          of one cat before submitting again.
        </p>
      ) : null}
    </div>
  )
}
