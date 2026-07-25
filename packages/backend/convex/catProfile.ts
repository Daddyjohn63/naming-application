/**
 * KB-003 profile persistence + KB-004 pipeline entry.
 *
 * Internal mutations write cat profile fields. `applyCatProfileSubmit` also sets the
 * first summary substate and schedules photo validation (photo required on submit).
 * Parse helpers validate Zod field rules before mutations run (from actions).
 * Internal mutations for profile submit/draft; field parsing helpers.
 */

import { ConvexError, v } from "convex/values"

import {
  DRAFT_CAT_DESCRIPTION_PLACEHOLDER,
  isCatProfileEditableStep,
  MAX_CAT_PROFILE_SUBMIT_COUNT,
} from "@workspace/shared/constants/cat-profile"
import {
  CAT_PHOTO_CHECK_FAILED_MESSAGE,
  MAX_PHOTO_VALIDATION_ATTEMPTS,
} from "@workspace/shared/constants/cat-photo-validation"
import { CAT_PROFILE_SUBMIT_ERROR_CODE } from "@workspace/shared/constants/cat-profile-errors"
import {
  normalizeCatSex,
  saveCatProfileDraftFieldsSchema,
  submitCatProfileFieldsSchema,
} from "@workspace/shared/schemas/cat"

import { internal } from "./_generated/api"
import { internalMutation } from "./_generated/server"
import type { Id } from "./_generated/dataModel"

/**
 * KB-004 entry: persist profile, advance ceremony step, schedule AI pipeline.
 * Called from `catProfileActions.submitCatProfile` after field + photo checks.
 */
export const applyCatProfileSubmit = internalMutation({
  args: {
    catId: v.id("cats"),
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    existingName: v.optional(v.string()),
    sex: v.optional(v.union(v.literal("male"), v.literal("female"))),
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

    const isSummaryReviewResubmit = cat.ceremonyStep === "summary_review"
    const submitsUsed = cat.profileSubmitsUsed ?? 0
    if (
      isSummaryReviewResubmit &&
      submitsUsed >= MAX_CAT_PROFILE_SUBMIT_COUNT
    ) {
      throw new ConvexError({
        code: CAT_PROFILE_SUBMIT_ERROR_CODE.SUBMIT_LIMIT_REACHED,
      })
    }

    const previousPhotoId = cat.photoStorageId
    const photoChanged = previousPhotoId !== args.photoStorageId
    // Summary-review resubmit with the same photo already passed vision — skip a
    // fresh AI check (and do not burn another attempt). Draft submits always
    // validate, including after a draft-save with the same storage id or a block.
    const skipPhotoRevalidation = !photoChanged && isSummaryReviewResubmit

    // Older outage handling blamed the photo and burned an attempt; refund once
    // when the owner re-submits after that generic "couldn't check" message.
    const priorPhotoMessage = cat.photoValidation?.userMessage?.trim() ?? ""
    const refundFalsePhotoCheck =
      !skipPhotoRevalidation &&
      priorPhotoMessage === CAT_PHOTO_CHECK_FAILED_MESSAGE

    const photoAttemptsUsed = Math.max(
      0,
      (cat.photoValidationAttemptsUsed ?? 0) - (refundFalsePhotoCheck ? 1 : 0),
    )
    if (
      !skipPhotoRevalidation &&
      photoAttemptsUsed >= MAX_PHOTO_VALIDATION_ATTEMPTS
    ) {
      throw new ConvexError({
        code: CAT_PROFILE_SUBMIT_ERROR_CODE.PHOTO_VALIDATION_LIMIT_REACHED,
      })
    }

    if (args.description === DRAFT_CAT_DESCRIPTION_PLACEHOLDER) {
      throw new ConvexError({
        code: CAT_PROFILE_SUBMIT_ERROR_CODE.PLACEHOLDER_DESCRIPTION,
      })
    }

    const now = Date.now()
    // Whether user already had an accepted/edited summary — re-submit clears it.
    const hadSummaryProgress =
      cat.ceremonyStep === "summary_review" ||
      cat.acceptedSummaryVersionId !== undefined

    await ctx.db.patch(args.catId, {
      title: args.title,
      description: args.description,
      existingName: args.existingName,
      sex: args.sex,
      age: args.age,
      breed: args.breed,
      photoStorageId: args.photoStorageId,
      ceremonyStep: skipPhotoRevalidation
        ? "awaiting_summary"
        : "awaiting_photo_validation",
      ...(isSummaryReviewResubmit
        ? { profileSubmitsUsed: submitsUsed + 1 }
        : {}),
      // photoValidationAttemptsUsed increments only when vision returns a result
      // (see applyPhotoValidationResult) so OpenAI outages do not burn attempts.
      ...(refundFalsePhotoCheck
        ? { photoValidationAttemptsUsed: photoAttemptsUsed }
        : {}),
      ...(skipPhotoRevalidation
        ? {}
        : {
            photoValidation: undefined,
            photoQualityAcknowledged: undefined,
          }),
      summaryGenerationError: undefined,
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

    if (skipPhotoRevalidation) {
      await ctx.scheduler.runAfter(
        0,
        internal.catSummaryActions.generateCatSummary,
        { catId: args.catId },
      )
    } else {
      await ctx.scheduler.runAfter(
        0,
        internal.catSummaryActions.validateCatPhoto,
        {
          catId: args.catId,
        },
      )
    }
  },
})

/** KB-003 only: save profile fields without triggering the summary pipeline. */
export const applyCatProfileDraftSave = internalMutation({
  args: {
    catId: v.id("cats"),
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    existingName: v.optional(v.string()),
    sex: v.optional(v.union(v.literal("male"), v.literal("female"))),
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
      sex: args.sex,
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
  sex?: "male" | "female"
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
  return {
    ...parsed.data,
    sex: normalizeCatSex(parsed.data.sex),
  }
}

/** Parse draft-save fields; empty description stores the draft placeholder. */
export function parseSaveCatProfileDraftFields(args: {
  title: string
  description: string
  existingName?: string
  sex?: "male" | "female"
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
  return {
    ...parsed.data,
    description,
    sex: normalizeCatSex(parsed.data.sex),
  }
}

export type CatProfilePhotoStorageId = Id<"_storage">
