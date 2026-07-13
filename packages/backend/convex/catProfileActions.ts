/**
 * KB-003 public actions for profile submit/draft save (Node for photo buffer checks).
 *
 * `submitCatProfile` is the client entry that eventually kicks off KB-004 via
 * `applyCatProfileSubmit` → scheduler → `catSummaryActions`.
 *
 * Expected photo validation failures return `{ ok: false, code }` so the client
 * can show inline errors without Convex logging a server error.
 */

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
import {
  CAT_PROFILE_SUBMIT_ERROR_CODE,
  type CatProfileSubmitErrorCode,
} from "@workspace/shared/constants/cat-profile-errors"

import { api, internal } from "./_generated/api"
import { action, type ActionCtx } from "./_generated/server"
import {
  parseSaveCatProfileDraftFields,
  parseSubmitCatProfileFields,
} from "./catProfile"
import type { Id } from "./_generated/dataModel"

const profileActionResultValidator = v.union(
  v.object({ ok: v.literal(true) }),
  v.object({
    ok: v.literal(false),
    code: v.string(),
    fieldErrors: v.optional(v.record(v.string(), v.string())),
  }),
)

function isAllowedMime(mime: string): mime is AllowedCatPhotoMimeType {
  return (ALLOWED_CAT_PHOTO_MIME_TYPES as readonly string[]).includes(mime)
}

function profileActionFailure(code: CatProfileSubmitErrorCode) {
  return { ok: false as const, code }
}

/** Technical photo gate: MIME, byte size, and pixel dimensions (not AI validation). */
async function validateCatPhotoBuffer(
  buffer: Buffer,
): Promise<CatProfileSubmitErrorCode | null> {
  if (buffer.byteLength > MAX_CAT_PHOTO_BYTES) {
    return CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_TOO_LARGE
  }

  const detected = await fileTypeFromBuffer(buffer)
  if (detected === undefined || !isAllowedMime(detected.mime)) {
    return CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_INVALID_TYPE
  }

  let width: number | undefined
  let height: number | undefined
  try {
    const dimensions = imageSize(buffer)
    width = dimensions.width
    height = dimensions.height
  } catch {
    return CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_UNREADABLE
  }
  if (width === undefined || height === undefined) {
    return CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_UNREADABLE
  }

  if (
    width < MIN_CAT_PHOTO_DIMENSION_PX ||
    height < MIN_CAT_PHOTO_DIMENSION_PX
  ) {
    return CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_DIMENSIONS_TOO_SMALL
  }

  if (
    width > MAX_CAT_PHOTO_DIMENSION_PX ||
    height > MAX_CAT_PHOTO_DIMENSION_PX
  ) {
    return CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_DIMENSIONS_TOO_LARGE
  }

  return null
}

async function rejectPhotoStorageIfNeeded(
  ctx: ActionCtx,
  photoStorageId: Id<"_storage">,
  existingPhotoStorageId: Id<"_storage"> | undefined,
) {
  if (photoStorageId !== existingPhotoStorageId) {
    try {
      await ctx.storage.delete(photoStorageId)
    } catch {
      // Best-effort cleanup of rejected upload.
    }
  }
}

async function validateStoredCatPhoto(
  ctx: ActionCtx,
  photoStorageId: Id<"_storage">,
  existingPhotoStorageId: Id<"_storage"> | undefined,
): Promise<CatProfileSubmitErrorCode | null> {
  const blob = await ctx.storage.get(photoStorageId)
  if (blob === null) {
    return CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_NOT_FOUND
  }

  const buffer = Buffer.from(await blob.arrayBuffer())
  const code = await validateCatPhotoBuffer(buffer)
  if (code !== null) {
    await rejectPhotoStorageIfNeeded(ctx, photoStorageId, existingPhotoStorageId)
  }
  return code
}

/** Client-callable profile submit — validates fields/photo then starts KB-004 pipeline. */
export const submitCatProfile = action({
  args: {
    catId: v.string(),
    title: v.string(),
    description: v.string(),
    existingName: v.optional(v.string()),
    sex: v.optional(v.union(v.literal("male"), v.literal("female"))),
    age: v.optional(v.string()),
    breed: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
  },
  returns: profileActionResultValidator,
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
      sex: args.sex,
      age: args.age,
      breed: args.breed,
    })

    const photoStorageId =
      (args.photoStorageId as Id<"_storage"> | undefined) ?? cat.photoStorageId
    if (photoStorageId === undefined) {
      return profileActionFailure(CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_REQUIRED)
    }

    // Already-stored photo passed buffer checks when uploaded; only re-check new files.
    if (photoStorageId !== cat.photoStorageId) {
      const photoError = await validateStoredCatPhoto(
        ctx,
        photoStorageId,
        cat.photoStorageId,
      )
      if (photoError !== null) {
        return profileActionFailure(photoError)
      }
    }

    await ctx.runMutation(internal.catProfile.applyCatProfileSubmit, {
      catId: cat._id,
      userId: user._id,
      title: fields.title,
      description: fields.description,
      existingName: fields.existingName,
      sex: fields.sex,
      age: fields.age,
      breed: fields.breed,
      photoStorageId,
    })

    return { ok: true as const }
  },
})

/** Client-callable draft save — no ceremony step change, no AI scheduling. */
export const saveCatProfileDraft = action({
  args: {
    catId: v.string(),
    title: v.string(),
    description: v.string(),
    existingName: v.optional(v.string()),
    sex: v.optional(v.union(v.literal("male"), v.literal("female"))),
    age: v.optional(v.string()),
    breed: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
  },
  returns: profileActionResultValidator,
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
      sex: args.sex,
      age: args.age,
      breed: args.breed,
    })

    const photoStorageId = args.photoStorageId as Id<"_storage"> | undefined
    if (photoStorageId !== undefined) {
      const photoError = await validateStoredCatPhoto(
        ctx,
        photoStorageId,
        cat.photoStorageId,
      )
      if (photoError !== null) {
        return profileActionFailure(photoError)
      }
    }

    await ctx.runMutation(internal.catProfile.applyCatProfileDraftSave, {
      catId: cat._id,
      userId: user._id,
      title: fields.title,
      description: fields.description,
      existingName: fields.existingName,
      sex: fields.sex,
      age: fields.age,
      breed: fields.breed,
      photoStorageId,
    })

    return { ok: true as const }
  },
})
