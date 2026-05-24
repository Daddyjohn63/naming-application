"use node"

import { ConvexError, v } from "convex/values"
import { fileTypeFromBuffer } from "file-type"
import { imageSize } from "image-size"

import {
  ALLOWED_CAT_PHOTO_MIME_TYPES,
  type AllowedCatPhotoMimeType,
  MAX_CAT_PHOTO_BYTES,
  MAX_CAT_PHOTO_DIMENSION_PX,
  MIN_CAT_PHOTO_DIMENSION_PX,
} from "@workspace/shared/constants/cat-photo"
import { CAT_PROFILE_SUBMIT_ERROR_CODE } from "@workspace/shared/constants/cat-profile-errors"

import { api, internal } from "./_generated/api"
import { action } from "./_generated/server"
import {
  parseSaveCatProfileDraftFields,
  parseSubmitCatProfileFields,
} from "./catProfile"
import type { Id } from "./_generated/dataModel"

function isAllowedMime(mime: string): mime is AllowedCatPhotoMimeType {
  return (ALLOWED_CAT_PHOTO_MIME_TYPES as readonly string[]).includes(mime)
}

async function validateCatPhotoBuffer(buffer: Buffer): Promise<void> {
  if (buffer.byteLength > MAX_CAT_PHOTO_BYTES) {
    throw new ConvexError({
      code: CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_TOO_LARGE,
    })
  }

  const detected = await fileTypeFromBuffer(buffer)
  if (detected === undefined || !isAllowedMime(detected.mime)) {
    throw new ConvexError({
      code: CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_INVALID_TYPE,
    })
  }

  let width: number | undefined
  let height: number | undefined
  try {
    const dimensions = imageSize(buffer)
    width = dimensions.width
    height = dimensions.height
  } catch {
    throw new ConvexError({
      code: CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_UNREADABLE,
    })
  }
  if (width === undefined || height === undefined) {
    throw new ConvexError({
      code: CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_UNREADABLE,
    })
  }

  if (
    width < MIN_CAT_PHOTO_DIMENSION_PX ||
    height < MIN_CAT_PHOTO_DIMENSION_PX
  ) {
    throw new ConvexError({
      code: CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_DIMENSIONS_TOO_SMALL,
    })
  }

  if (
    width > MAX_CAT_PHOTO_DIMENSION_PX ||
    height > MAX_CAT_PHOTO_DIMENSION_PX
  ) {
    throw new ConvexError({
      code: CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_DIMENSIONS_TOO_LARGE,
    })
  }
}

export const submitCatProfile = action({
  args: {
    catId: v.string(),
    title: v.string(),
    description: v.string(),
    existingName: v.optional(v.string()),
    age: v.optional(v.string()),
    breed: v.optional(v.string()),
    photoStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (identity === null) {
      throw new ConvexError({
        code: CAT_PROFILE_SUBMIT_ERROR_CODE.NOT_AUTHENTICATED,
      })
    }

    const user = await ctx.runQuery(api.users.current, {})
    if (user === null) {
      throw new ConvexError({
        code: CAT_PROFILE_SUBMIT_ERROR_CODE.NOT_AUTHENTICATED,
      })
    }

    const cat = await ctx.runQuery(api.cats.getCatByIdForOwner, {
      catId: args.catId,
    })
    if (cat === null) {
      throw new ConvexError({
        code: CAT_PROFILE_SUBMIT_ERROR_CODE.NOT_FOUND,
      })
    }

    const fields = parseSubmitCatProfileFields({
      title: args.title,
      description: args.description,
      existingName: args.existingName,
      age: args.age,
      breed: args.breed,
    })

    const photoStorageId = args.photoStorageId as Id<"_storage">
    const blob = await ctx.storage.get(photoStorageId)
    if (blob === null) {
      throw new ConvexError({
        code: CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_NOT_FOUND,
      })
    }

    const buffer = Buffer.from(await blob.arrayBuffer())
    try {
      await validateCatPhotoBuffer(buffer)
    } catch (error) {
      try {
        await ctx.storage.delete(photoStorageId)
      } catch {
        // Best-effort cleanup of rejected upload.
      }
      throw error
    }

    await ctx.runMutation(internal.catProfile.applyCatProfileSubmit, {
      catId: cat._id,
      userId: user._id,
      title: fields.title,
      description: fields.description,
      existingName: fields.existingName,
      age: fields.age,
      breed: fields.breed,
      photoStorageId,
      previousPhotoStorageId: cat.photoStorageId,
    })
  },
})

export const saveCatProfileDraft = action({
  args: {
    catId: v.string(),
    title: v.string(),
    description: v.string(),
    existingName: v.optional(v.string()),
    age: v.optional(v.string()),
    breed: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (identity === null) {
      throw new ConvexError({
        code: CAT_PROFILE_SUBMIT_ERROR_CODE.NOT_AUTHENTICATED,
      })
    }

    const user = await ctx.runQuery(api.users.current, {})
    if (user === null) {
      throw new ConvexError({
        code: CAT_PROFILE_SUBMIT_ERROR_CODE.NOT_AUTHENTICATED,
      })
    }

    const cat = await ctx.runQuery(api.cats.getCatByIdForOwner, {
      catId: args.catId,
    })
    if (cat === null) {
      throw new ConvexError({
        code: CAT_PROFILE_SUBMIT_ERROR_CODE.NOT_FOUND,
      })
    }

    const fields = parseSaveCatProfileDraftFields({
      title: args.title,
      description: args.description,
      existingName: args.existingName,
      age: args.age,
      breed: args.breed,
    })

    let photoStorageId = args.photoStorageId as Id<"_storage"> | undefined
    if (photoStorageId !== undefined) {
      const blob = await ctx.storage.get(photoStorageId)
      if (blob === null) {
        throw new ConvexError({
          code: CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_NOT_FOUND,
        })
      }

      const buffer = Buffer.from(await blob.arrayBuffer())
      try {
        await validateCatPhotoBuffer(buffer)
      } catch (error) {
        try {
          await ctx.storage.delete(photoStorageId)
        } catch {
          // Best-effort cleanup of rejected upload.
        }
        throw error
      }
    }

    await ctx.runMutation(internal.catProfile.applyCatProfileDraftSave, {
      catId: cat._id,
      userId: user._id,
      title: fields.title,
      description: fields.description,
      existingName: fields.existingName,
      age: fields.age,
      breed: fields.breed,
      photoStorageId,
      previousPhotoStorageId: cat.photoStorageId,
    })
  },
})
