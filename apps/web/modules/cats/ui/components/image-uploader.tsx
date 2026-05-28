"use client"

import * as React from "react"
import { CloudUpload } from "lucide-react"

import {
  ALLOWED_CAT_PHOTO_MIME_TYPES,
  MAX_CAT_PHOTO_BYTES,
} from "@workspace/shared/constants/cat-photo"

import { validateCatPhotoFile } from "../hooks/use-cat-photo-upload"

type CatPhotoUploaderProps = {
  id?: string
  previewUrl: string | null
  disabled?: boolean
  onFileSelect: (file: File) => void
  onValidationError: (message: string) => void
  onInteraction?: () => void
}

async function handleSelectedFile(
  file: File,
  onFileSelect: (file: File) => void,
  onValidationError: (message: string) => void,
) {
  const validationMessage = await validateCatPhotoFile(file)
  if (validationMessage !== null) {
    onValidationError(validationMessage)
    return
  }

  onFileSelect(file)
}

export function CatPhotoUploader({
  id = "cat-photo",
  previewUrl,
  disabled = false,
  onFileSelect,
  onValidationError,
  onInteraction,
}: CatPhotoUploaderProps) {
  const [dragActive, setDragActive] = React.useState(false)
  const maxMb = MAX_CAT_PHOTO_BYTES / (1024 * 1024)
  const accept = ALLOWED_CAT_PHOTO_MIME_TYPES.join(",")

  const onChangePicture = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onInteraction?.()
      const file = event.currentTarget.files?.[0]
      if (file === undefined) {
        return
      }
      void handleSelectedFile(file, onFileSelect, onValidationError)
      event.currentTarget.value = ""
    },
    [onFileSelect, onInteraction, onValidationError],
  )

  const onDropFile = React.useCallback(
    (file: File) => {
      onInteraction?.()
      void handleSelectedFile(file, onFileSelect, onValidationError)
    },
    [onFileSelect, onInteraction, onValidationError],
  )

  return (
    <div>
      <label
        htmlFor={id}
        aria-disabled={disabled}
        className={`group relative mt-1 flex aspect-square w-full max-w-xs cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-border/80 shadow-sm transition-all ${
          previewUrl === null ? "border-dashed bg-muted/20" : "bg-card"
        } ${disabled ? "pointer-events-none opacity-60" : ""}`}
      >
        <div
          className="absolute inset-0 z-[5]"
          onDragOver={(event) => {
            if (disabled) {
              return
            }
            event.preventDefault()
            event.stopPropagation()
            setDragActive(true)
          }}
          onDragEnter={(event) => {
            if (disabled) {
              return
            }
            event.preventDefault()
            event.stopPropagation()
            setDragActive(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setDragActive(false)
          }}
          onDrop={(event) => {
            if (disabled) {
              return
            }
            event.preventDefault()
            event.stopPropagation()
            setDragActive(false)

            const file = event.dataTransfer.files?.[0]
            if (file !== undefined) {
              onDropFile(file)
            }
          }}
        />
        <div
          className={`absolute inset-0 z-[3] flex flex-col items-center justify-center px-6 text-center transition-all ${
            dragActive ? "border-2 border-primary/40 ring-2 ring-primary/15" : ""
          } ${
            previewUrl !== null
              ? "bg-background/80 opacity-0 hover:opacity-100 hover:backdrop-blur-md"
              : "bg-muted/30 opacity-100 hover:bg-muted/50"
          }`}
        >
          <CloudUpload
            className={`size-8 text-muted-foreground transition-transform ${
              dragActive ? "scale-110" : "scale-100 group-hover:scale-110"
            }`}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Drag and drop or click to upload
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Max file size: {maxMb}MB
          </p>
          <span className="sr-only">Cat photo upload</span>
        </div>
        {previewUrl !== null ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Uploaded cat photo preview"
            className="size-full object-cover"
          />
        ) : null}
      </label>
      <input
        id={id}
        name="photo"
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={onChangePicture}
        onFocus={() => onInteraction?.()}
      />
    </div>
  )
}
