import { ConvexError, v } from "convex/values"

import {
  DRAFT_CAT_DESCRIPTION_PLACEHOLDER,
  isCatProfileEditableStep,
  MAX_CAT_PROFILE_SUBMIT_COUNT,
} from "@workspace/shared/constants/cat-profile"
import { CAT_PROFILE_SUBMIT_ERROR_CODE } from "@workspace/shared/constants/cat-profile-errors"
import {
  saveCatProfileDraftFieldsSchema,
  submitCatProfileFieldsSchema,
} from "@workspace/shared/schemas/cat"

import { internalMutation } from "./_generated/server"
import type { Id } from "./_generated/dataModel"

export const applyCatProfileSubmit = internalMutation({
  args: {
    catId: v.id("cats"),
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    existingName: v.optional(v.string()),
    age: v.optional(v.string()),
    breed: v.optional(v.string()),
    photoStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const cat = await ctx.db.get(args.catId)
    if (cat === null) {
      throw new ConvexError({
        code: CAT_PROFILE_SUBMIT_ERROR_CODE.NOT_FOUND,
      })
    }
    if (cat.userId !== args.userId) {
      throw new ConvexError({
        code: CAT_PROFILE_SUBMIT_ERROR_CODE.NOT_OWNER,
      })
    }
    if (!isCatProfileEditableStep(cat.ceremonyStep)) {
      throw new ConvexError({
        code: CAT_PROFILE_SUBMIT_ERROR_CODE.PROFILE_STEP_LOCKED,
      })
    }

    const submitsUsed = cat.profileSubmitsUsed ?? 0
    if (submitsUsed >= MAX_CAT_PROFILE_SUBMIT_COUNT) {
      throw new ConvexError({
        code: CAT_PROFILE_SUBMIT_ERROR_CODE.SUBMIT_LIMIT_REACHED,
      })
    }

    if (args.description === DRAFT_CAT_DESCRIPTION_PLACEHOLDER) {
      throw new ConvexError({
        code: CAT_PROFILE_SUBMIT_ERROR_CODE.PLACEHOLDER_DESCRIPTION,
      })
    }

    const previousPhotoId = cat.photoStorageId

    const now = Date.now()
    const hadSummaryProgress =
      cat.ceremonyStep === "summary_review" ||
      cat.acceptedSummaryVersionId !== undefined

    await ctx.db.patch(args.catId, {
      title: args.title,
      description: args.description,
      existingName: args.existingName,
      age: args.age,
      breed: args.breed,
      photoStorageId: args.photoStorageId,
      ceremonyStep: "awaiting_summary",
      profileSubmitsUsed: submitsUsed + 1,
      updatedAt: now,
      ...(hadSummaryProgress
        ? {
            acceptedSummaryVersionId: undefined,
            summaryRegenerationsUsed: 0,
          }
        : {}),
    })

    if (
      previousPhotoId !== undefined &&
      previousPhotoId !== args.photoStorageId
    ) {
      try {
        await ctx.storage.delete(previousPhotoId)
      } catch {
        // Best-effort orphan cleanup; submit still succeeds.
      }
    }
  },
})

export const applyCatProfileDraftSave = internalMutation({
  args: {
    catId: v.id("cats"),
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    existingName: v.optional(v.string()),
    age: v.optional(v.string()),
    breed: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const cat = await ctx.db.get(args.catId)
    if (cat === null) {
      throw new ConvexError({
        code: CAT_PROFILE_SUBMIT_ERROR_CODE.NOT_FOUND,
      })
    }
    if (cat.userId !== args.userId) {
      throw new ConvexError({
        code: CAT_PROFILE_SUBMIT_ERROR_CODE.NOT_OWNER,
      })
    }
    if (!isCatProfileEditableStep(cat.ceremonyStep)) {
      throw new ConvexError({
        code: CAT_PROFILE_SUBMIT_ERROR_CODE.PROFILE_STEP_LOCKED,
      })
    }

    const previousPhotoId = cat.photoStorageId

    const now = Date.now()
    await ctx.db.patch(args.catId, {
      title: args.title,
      description: args.description,
      existingName: args.existingName,
      age: args.age,
      breed: args.breed,
      ...(args.photoStorageId !== undefined
        ? { photoStorageId: args.photoStorageId }
        : {}),
      updatedAt: now,
    })

    if (
      args.photoStorageId !== undefined &&
      previousPhotoId !== undefined &&
      previousPhotoId !== args.photoStorageId
    ) {
      try {
        await ctx.storage.delete(previousPhotoId)
      } catch {
        // Best-effort orphan cleanup; draft save still succeeds.
      }
    }
  },
})

/** Parse and validate profile text fields; throws `ConvexError` on failure. */
export function parseSubmitCatProfileFields(args: {
  title: string
  description: string
  existingName?: string
  age?: string
  breed?: string
}) {
  const parsed = submitCatProfileFieldsSchema.safeParse(args)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === "string" && fieldErrors[key] === undefined) {
        fieldErrors[key] = issue.message
      }
    }
    throw new ConvexError({
      code: CAT_PROFILE_SUBMIT_ERROR_CODE.INVALID_FIELDS,
      fieldErrors,
    })
  }
  return parsed.data
}

/** Parse draft-save fields; empty description stores the draft placeholder. */
export function parseSaveCatProfileDraftFields(args: {
  title: string
  description: string
  existingName?: string
  age?: string
  breed?: string
}) {
  const parsed = saveCatProfileDraftFieldsSchema.safeParse(args)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === "string" && fieldErrors[key] === undefined) {
        fieldErrors[key] = issue.message
      }
    }
    throw new ConvexError({
      code: CAT_PROFILE_SUBMIT_ERROR_CODE.INVALID_FIELDS,
      fieldErrors,
    })
  }
  const description =
    parsed.data.description === ""
      ? DRAFT_CAT_DESCRIPTION_PLACEHOLDER
      : parsed.data.description
  return { ...parsed.data, description }
}

export type CatProfilePhotoStorageId = Id<"_storage">
