"use client"

import * as React from "react"
import { useAction } from "convex/react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { api } from "@workspace/backend/_generated/api"
import type { Doc, Id } from "@workspace/backend/_generated/dataModel"
import {
  MAX_CAT_PROFILE_SUBMIT_COUNT,
} from "@workspace/shared/constants/cat-profile"
import { CAT_PROFILE_SUBMIT_ERROR_CODE } from "@workspace/shared/constants/cat-profile-errors"
import { catPhotoConstraintsLabel } from "@workspace/shared/constants/cat-photo"
import {
  MAX_CAT_DESCRIPTION_LENGTH,
  MAX_CAT_OPTIONAL_FIELD_LENGTH,
  MAX_CAT_TITLE_LENGTH,
  MIN_CAT_DESCRIPTION_LENGTH,
} from "@workspace/shared/constants/limits"
import {
  saveCatProfileDraftFieldsSchema,
  submitCatProfileFieldsSchema,
  type SubmitCatProfileFieldsInput,
} from "@workspace/shared/schemas/cat"
import {
  getConvexErrorData,
  getConvexErrorMessage,
} from "@workspace/shared/utils/convex-error"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
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
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { toast } from "@workspace/ui/components/sonner"

import { defaultProfileFormValues } from "../../lib/cat-profile-form-values"
import { useCatPhotoUpload } from "../hooks/use-cat-photo-upload"

type CatProfileFormProps = {
  cat: Doc<"cats"> & { photoUrl?: string }
}

type FieldName = keyof SubmitCatProfileFieldsInput | "photo"

function remainingChars(value: string, max: number): number {
  return Math.max(0, max - value.length)
}

export function CatProfileForm({ cat }: CatProfileFormProps) {
  const router = useRouter()
  const submitProfile = useAction(api.catProfileActions.submitCatProfile)
  const saveDraft = useAction(api.catProfileActions.saveCatProfileDraft)
  const {
    upload,
    pending: uploadPending,
    error: uploadHookError,
    clearError: clearUploadHookError,
  } = useCatPhotoUpload()

  const [photoFile, setPhotoFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [storedPhotoId, setStoredPhotoId] = React.useState<
    Id<"_storage"> | undefined
  >(cat.photoStorageId)
  const [serverFieldErrors, setServerFieldErrors] = React.useState<
    Partial<Record<FieldName, string>>
  >({})
  const [formError, setFormError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [savingDraft, setSavingDraft] = React.useState(false)

  const submitsUsed = cat.profileSubmitsUsed ?? 0
  const submitsRemaining = Math.max(
    0,
    MAX_CAT_PROFILE_SUBMIT_COUNT - submitsUsed,
  )

  const form = useForm<SubmitCatProfileFieldsInput>({
    resolver: zodResolver(submitCatProfileFieldsSchema),
    defaultValues: defaultProfileFormValues(cat),
    mode: "onSubmit",
  })

  const titleValue = form.watch("title") ?? ""
  const descriptionValue = form.watch("description") ?? ""

  React.useEffect(() => {
    form.reset(defaultProfileFormValues(cat))
    setStoredPhotoId(cat.photoStorageId)
    setPhotoFile(null)
    setPreviewUrl((prev) => {
      if (prev !== null && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev)
      }
      return null
    })
    // Re-sync when server row updates (e.g. after submit or another tab).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset from latest cat snapshot
  }, [cat._id, cat.updatedAt])

  React.useEffect(() => {
    return () => {
      if (previewUrl !== null && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const displayPreviewUrl =
    previewUrl ?? (photoFile === null ? cat.photoUrl : null)

  const clearFieldError = (field: FieldName) => {
    setServerFieldErrors((prev) => {
      if (prev[field] === undefined) {
        return prev
      }
      const next = { ...prev }
      delete next[field]
      return next
    })
    if (field === "photo") {
      clearUploadHookError()
    }
    setFormError(null)
  }

  const onPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    clearFieldError("photo")
    const file = event.target.files?.[0]
    if (file === undefined) {
      return
    }
    setPhotoFile(file)
    setStoredPhotoId(undefined)
    setPreviewUrl((prev) => {
      if (prev !== null && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev)
      }
      return URL.createObjectURL(file)
    })
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)
    setServerFieldErrors({})

    let photoStorageId = storedPhotoId
    try {
      if (photoFile !== null) {
        photoStorageId = await upload(photoFile)
        setStoredPhotoId(photoStorageId)
      }
      if (photoStorageId === undefined) {
        setServerFieldErrors((prev) => ({
          ...prev,
          photo: "Please upload a photo of your cat.",
        }))
        return
      }

      setSubmitting(true)
      await submitProfile({
        catId: cat._id,
        title: values.title,
        description: values.description,
        existingName: values.existingName,
        age: values.age,
        breed: values.breed,
        photoStorageId,
      })
      setPhotoFile(null)
      toast.success(
        cat.ceremonyStep === "draft"
          ? "Profile saved — generating your summary."
          : "Profile updated — we'll refresh your summary next.",
      )
    } catch (error) {
      const data = getConvexErrorData(error)
      if (data?.fieldErrors !== undefined) {
        setServerFieldErrors(
          data.fieldErrors as Partial<Record<FieldName, string>>,
        )
      }
      const message = getConvexErrorMessage(error)
      if (
        data?.code === CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_REQUIRED ||
        (typeof data?.code === "string" && data.code.startsWith("photo_"))
      ) {
        setServerFieldErrors((prev) => ({ ...prev, photo: message }))
      } else if (data?.fieldErrors === undefined) {
        setFormError(message)
      }
    } finally {
      setSubmitting(false)
    }
  })

  const onSaveAndExit = async () => {
    setFormError(null)
    setServerFieldErrors({})

    const values = form.getValues()
    const parsed = saveCatProfileDraftFieldsSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: Partial<Record<FieldName, string>> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (typeof key === "string" && fieldErrors[key as FieldName] === undefined) {
          fieldErrors[key as FieldName] = issue.message
        }
      }
      setServerFieldErrors(fieldErrors)
      return
    }

    let photoStorageId = storedPhotoId
    try {
      if (photoFile !== null) {
        photoStorageId = await upload(photoFile)
        setStoredPhotoId(photoStorageId)
      }

      setSavingDraft(true)
      await saveDraft({
        catId: cat._id,
        title: parsed.data.title,
        description: parsed.data.description,
        existingName: parsed.data.existingName,
        age: parsed.data.age,
        breed: parsed.data.breed,
        ...(photoStorageId !== undefined ? { photoStorageId } : {}),
      })
      setPhotoFile(null)
      toast.success("Profile saved.")
      router.push("/dashboard")
    } catch (error) {
      const data = getConvexErrorData(error)
      if (data?.fieldErrors !== undefined) {
        setServerFieldErrors(
          data.fieldErrors as Partial<Record<FieldName, string>>,
        )
      }
      const message = getConvexErrorMessage(error)
      if (typeof data?.code === "string" && data.code.startsWith("photo_")) {
        setServerFieldErrors((prev) => ({ ...prev, photo: message }))
      } else if (data?.fieldErrors === undefined) {
        setFormError(message)
      }
    } finally {
      setSavingDraft(false)
    }
  }

  const photoError =
    serverFieldErrors.photo ?? uploadHookError ?? undefined

  const busy = submitting || uploadPending || savingDraft

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-base">Cat profile</CardTitle>
        <CardDescription>
          Upload a photo and tell us about your cat. You can update your profile
          here until the summary is approved.
          {submitsRemaining < MAX_CAT_PROFILE_SUBMIT_COUNT ? (
            <>
              {" "}
              ({submitsRemaining}{" "}
              {submitsRemaining === 1 ? "submission" : "submissions"} remaining)
            </>
          ) : null}
        </CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit} className="flex flex-col gap-6 px-4 pt-4 pb-6">
        {cat.ceremonyStep === "awaiting_summary" ? (
          <Alert className="border-primary/20 bg-primary/5">
            <Spinner className="text-primary size-4" />
            <AlertTitle>Generating your summary</AlertTitle>
            <AlertDescription>
              You can still edit your photo and story below while we work. Submit
              again when you&apos;re ready.
            </AlertDescription>
          </Alert>
        ) : null}
        {cat.ceremonyStep === "summary_review" ? (
          <Alert>
            <AlertTitle>Editing will restart summary generation</AlertTitle>
            <AlertDescription>
              Saving changes here clears your current summary progress so we can
              generate a new one from your updated profile.
            </AlertDescription>
          </Alert>
        ) : null}
        <FieldGroup>
          <Field data-invalid={photoError !== undefined}>
            <FieldLabel htmlFor="cat-photo">Cat photo</FieldLabel>
            <FieldDescription>{catPhotoConstraintsLabel()}</FieldDescription>
            <Input
              id="cat-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              onChange={onPhotoChange}
              onFocus={() => clearFieldError("photo")}
            />
            {displayPreviewUrl !== null && displayPreviewUrl !== undefined ? (
              <div className="bg-muted relative mt-2 aspect-square w-full max-w-xs overflow-hidden rounded-xl border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayPreviewUrl}
                  alt="Uploaded cat photo preview"
                  className="size-full object-cover"
                />
              </div>
            ) : null}
            <FieldError>{photoError}</FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.title || !!serverFieldErrors.title}>
            <FieldLabel htmlFor="cat-title">Ceremony title</FieldLabel>
            <Input
              id="cat-title"
              disabled={busy}
              maxLength={MAX_CAT_TITLE_LENGTH}
              {...form.register("title", {
                onChange: () => clearFieldError("title"),
              })}
              onFocus={() => clearFieldError("title")}
            />
            <FieldDescription>
              {remainingChars(titleValue, MAX_CAT_TITLE_LENGTH)} characters
              remaining
            </FieldDescription>
            <FieldError>
              {serverFieldErrors.title ?? form.formState.errors.title?.message}
            </FieldError>
          </Field>

          <Field
            data-invalid={
              !!form.formState.errors.description ||
              !!serverFieldErrors.description
            }
          >
            <FieldLabel htmlFor="cat-description">Your cat&apos;s story</FieldLabel>
            <Textarea
              id="cat-description"
              disabled={busy}
              rows={6}
              maxLength={MAX_CAT_DESCRIPTION_LENGTH}
              className="min-h-[8rem] resize-y"
              {...form.register("description", {
                onChange: () => clearFieldError("description"),
              })}
              onFocus={() => clearFieldError("description")}
            />
            <FieldDescription>
              At least {MIN_CAT_DESCRIPTION_LENGTH} characters ·{" "}
              {remainingChars(descriptionValue, MAX_CAT_DESCRIPTION_LENGTH)}{" "}
              remaining
            </FieldDescription>
            <FieldError>
              {serverFieldErrors.description ??
                form.formState.errors.description?.message}
            </FieldError>
          </Field>

          <Field data-invalid={!!serverFieldErrors.existingName}>
            <FieldLabel htmlFor="cat-existing-name">Current name</FieldLabel>
            <FieldDescription>Optional</FieldDescription>
            <Input
              id="cat-existing-name"
              disabled={busy}
              maxLength={MAX_CAT_OPTIONAL_FIELD_LENGTH}
              {...form.register("existingName", {
                onChange: () => clearFieldError("existingName"),
              })}
              onFocus={() => clearFieldError("existingName")}
            />
            <FieldError>{serverFieldErrors.existingName}</FieldError>
          </Field>

          <Field data-invalid={!!serverFieldErrors.age}>
            <FieldLabel htmlFor="cat-age">Age</FieldLabel>
            <FieldDescription>Optional — e.g. &quot;3 years&quot;</FieldDescription>
            <Input
              id="cat-age"
              disabled={busy}
              maxLength={MAX_CAT_OPTIONAL_FIELD_LENGTH}
              {...form.register("age", {
                onChange: () => clearFieldError("age"),
              })}
              onFocus={() => clearFieldError("age")}
            />
            <FieldError>{serverFieldErrors.age}</FieldError>
          </Field>

          <Field data-invalid={!!serverFieldErrors.breed}>
            <FieldLabel htmlFor="cat-breed">Breed</FieldLabel>
            <FieldDescription>Optional</FieldDescription>
            <Input
              id="cat-breed"
              disabled={busy}
              maxLength={MAX_CAT_OPTIONAL_FIELD_LENGTH}
              {...form.register("breed", {
                onChange: () => clearFieldError("breed"),
              })}
              onFocus={() => clearFieldError("breed")}
            />
            <FieldError>{serverFieldErrors.breed}</FieldError>
          </Field>
        </FieldGroup>

        {formError !== null ? (
          <p className="text-destructive text-sm" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={busy || submitsRemaining === 0}>
            {submitting
              ? "Submitting…"
              : "Submit profile and generate summary"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => void onSaveAndExit()}
          >
            {savingDraft ? "Saving…" : "Save & exit to dashboard"}
          </Button>
        </div>
      </form>
    </Card>
  )
}
