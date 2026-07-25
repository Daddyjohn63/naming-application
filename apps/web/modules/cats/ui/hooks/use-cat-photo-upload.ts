"use client"

import * as React from "react"
import { useMutation } from "convex/react"

import { api } from "@workspace/backend/_generated/api"
import type { Id } from "@workspace/backend/_generated/dataModel"
import {
  ALLOWED_CAT_PHOTO_MIME_TYPES,
  MAX_CAT_PHOTO_BYTES,
  MAX_CAT_PHOTO_DIMENSION_PX,
  MIN_CAT_PHOTO_DIMENSION_PX,
} from "@workspace/shared/constants/cat-photo"
import {
  CAT_PROFILE_SUBMIT_ERROR_CODE,
  catProfileSubmitErrorMessage,
} from "@workspace/shared/constants/cat-profile-errors"
import { getConvexErrorMessage } from "@workspace/shared/utils/convex-error"

type UseCatPhotoUploadResult = {
  upload: (file: File) => Promise<Id<"_storage">>
  pending: boolean
  error: string | null
  clearError: () => void
}

function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_UNREADABLE))
    }
    image.src = url
  })
}

export async function validateCatPhotoFile(file: File): Promise<string | null> {
  if (
    !(ALLOWED_CAT_PHOTO_MIME_TYPES as readonly string[]).includes(file.type)
  ) {
    return catProfileSubmitErrorMessage(
      CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_INVALID_TYPE,
    )
  }

  if (file.size > MAX_CAT_PHOTO_BYTES) {
    return catProfileSubmitErrorMessage(
      CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_TOO_LARGE,
    )
  }

  try {
    const { width, height } = await readImageDimensions(file)
    if (
      width < MIN_CAT_PHOTO_DIMENSION_PX ||
      height < MIN_CAT_PHOTO_DIMENSION_PX
    ) {
      return catProfileSubmitErrorMessage(
        CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_DIMENSIONS_TOO_SMALL,
      )
    }
    if (
      width > MAX_CAT_PHOTO_DIMENSION_PX ||
      height > MAX_CAT_PHOTO_DIMENSION_PX
    ) {
      return catProfileSubmitErrorMessage(
        CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_DIMENSIONS_TOO_LARGE,
      )
    }
  } catch {
    return catProfileSubmitErrorMessage(
      CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_UNREADABLE,
    )
  }

  return null
}

export function useCatPhotoUpload(): UseCatPhotoUploadResult {
  const generateUploadUrl = useMutation(api.cats.generateUploadUrl)
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const upload = React.useCallback(
    async (file: File): Promise<Id<"_storage">> => {
      setPending(true)
      setError(null)
      try {
        const validationMessage = await validateCatPhotoFile(file)
        if (validationMessage !== null) {
          throw new Error(validationMessage)
        }

        // TODO(KB-003+): Client-side resize/compress before upload to save bandwidth
        // (e.g. canvas / pica). Server validation remains authoritative.

        const uploadUrl = await generateUploadUrl()
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        })
        if (!response.ok) {
          throw new Error("Upload failed. Please try again.")
        }
        const json = (await response.json()) as { storageId?: string }
        if (json.storageId === undefined || json.storageId === "") {
          throw new Error("Upload did not return a storage id.")
        }
        return json.storageId as Id<"_storage">
      } catch (e) {
        const message = getConvexErrorMessage(e)
        setError(message)
        throw e
      } finally {
        setPending(false)
      }
    },
    [generateUploadUrl],
  )

  return {
    upload,
    pending,
    error,
    clearError: () => setError(null),
  }
}
