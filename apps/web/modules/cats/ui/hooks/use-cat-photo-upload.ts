"use client"

import * as React from "react"
import { useMutation } from "convex/react"

import { api } from "@workspace/backend/_generated/api"
import type { Id } from "@workspace/backend/_generated/dataModel"
import { ALLOWED_CAT_PHOTO_MIME_TYPES } from "@workspace/shared/constants/cat-photo"

type UseCatPhotoUploadResult = {
  upload: (file: File) => Promise<Id<"_storage">>
  pending: boolean
  error: string | null
  clearError: () => void
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
        if (
          !(ALLOWED_CAT_PHOTO_MIME_TYPES as readonly string[]).includes(
            file.type,
          )
        ) {
          throw new Error("Use a JPEG, PNG, or WebP image.")
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
        const message =
          e instanceof Error ? e.message : "Upload failed. Please try again."
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
