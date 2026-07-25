/**
 * KB-004 summary pipeline — Convex queries/mutations that persist ceremony state
 * after AI photo validation and personality summary generation.
 *
 * Public mutations: user actions (save/submit summary, acknowledge photo quality, retry).
 * Internal mutations: called from `catSummaryActions` to apply AI results or failures.
 * See also: `catSummaryActions.ts`, `ai/naming.ts`, `catProfile.applyCatProfileSubmit`.
 */

import { ConvexError, v } from "convex/values"

import {
  CAT_PHOTO_CHECK_FAILED_MESSAGE,
  resolvePhotoIssueUserMessage,
} from "@workspace/shared/constants/cat-photo-validation"
import { canReturnToProfileForPhotoReplace } from "@workspace/shared/utils/summary-pipeline-error"
import { CAT_SUMMARY_ERROR_CODE } from "@workspace/shared/constants/cat-summary-errors"
import {
  saveCatSummaryDraftSchema,
  submitCatSummarySchema,
} from "@workspace/shared/schemas/cat-summary"

import { internal } from "./_generated/api"
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server"
import { enforceRateLimit } from "./lib/rateLimiter"
import { getCurrentUser } from "./users"
import type { Id } from "./_generated/dataModel"

const photoValidationInput = v.object({
  isCat: v.boolean(),
  isSingleCat: v.boolean(),
  catLikelihoodScore: v.number(),
  qualityScore: v.number(),
  userMessage: v.string(),
  blockReason: v.string(),
})

type PhotoValidationInput = {
  isCat: boolean
  isSingleCat: boolean
  catLikelihoodScore: number
  qualityScore: number
  userMessage: string
  blockReason: string
}

/** Send owner back to profile with a specific photo issue message. */
async function returnCatToProfileForPhotoIssueDoc(
  ctx: MutationCtx,
  catId: Id<"cats">,
  validation: PhotoValidationInput,
) {
  const cat = await ctx.db.get(catId)
  if (cat === null) {
    return
  }

  const now = Date.now()
  const userMessage = resolvePhotoIssueUserMessage(validation)

  await ctx.db.patch(catId, {
    ceremonyStep: "draft",
    photoValidation: {
      ...validation,
      userMessage,
      validatedAt: now,
    },
    photoQualityAcknowledged: undefined,
    summaryGenerationError: undefined,
    updatedAt: now,
  })
}

/** Load a cat and verify it belongs to the signed-in user; throws on missing/forbidden. */
async function getOwnedCatOrThrow(
  ctx: QueryCtx | MutationCtx,
  catId: Id<"cats">,
  userId: Id<"users">,
) {
  const cat = await ctx.db.get(catId)
  if (cat === null) {
    throw new ConvexError({ code: CAT_SUMMARY_ERROR_CODE.NOT_FOUND })
  }
  if (cat.userId !== userId) {
    throw new ConvexError({ code: CAT_SUMMARY_ERROR_CODE.NOT_OWNER })
  }
  return cat
}

/** Most recent row in `cat_summary_versions` for a cat (highest versionNumber). */
async function latestSummaryVersion(ctx: QueryCtx | MutationCtx, catId: Id<"cats">) {
  return await ctx.db
    .query("cat_summary_versions")
    .withIndex("by_catId_versionNumber", (q) => q.eq("catId", catId))
    .order("desc")
    .first()
}

/** Owner-facing query: latest summary text for the summary review textarea. */
export const getLatestSummaryForOwner = query({
  args: { catId: v.string() },
  handler: async (ctx, { catId }) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      return null
    }
    const id = ctx.db.normalizeId("cats", catId)
    if (id === null) {
      return null
    }
    const cat = await ctx.db.get(id)
    if (cat === null || cat.userId !== currentUser._id) {
      return null
    }
    return await latestSummaryVersion(ctx, id)
  },
})

/** Internal read used by Node actions before calling OpenAI (avoids stale client args). */
export const getCatForSummaryPipeline = internalQuery({
  args: { catId: v.id("cats") },
  handler: async (ctx, { catId }) => {
    return await ctx.db.get(catId)
  },
})

/** Append a user-edited summary version without advancing the ceremony step. */
export const saveSummaryDraft = mutation({
  args: {
    catId: v.string(),
    summaryText: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({
        code: CAT_SUMMARY_ERROR_CODE.NOT_AUTHENTICATED,
      })
    }
    const id = ctx.db.normalizeId("cats", args.catId)
    if (id === null) {
      throw new ConvexError({ code: CAT_SUMMARY_ERROR_CODE.NOT_FOUND })
    }
    const cat = await getOwnedCatOrThrow(ctx, id, currentUser._id)
    if (cat.ceremonyStep !== "summary_review") {
      throw new ConvexError({ code: CAT_SUMMARY_ERROR_CODE.STEP_LOCKED })
    }

    const parsed = saveCatSummaryDraftSchema.safeParse({
      summaryText: args.summaryText,
    })
    if (!parsed.success) {
      throw new ConvexError({
        code: CAT_SUMMARY_ERROR_CODE.INVALID_SUMMARY,
        fieldErrors: { summaryText: parsed.error.issues[0]?.message },
      })
    }

    const previous = await latestSummaryVersion(ctx, id)
    const versionNumber = (previous?.versionNumber ?? 0) + 1
    const now = Date.now()

    await ctx.db.insert("cat_summary_versions", {
      catId: id,
      summaryText: parsed.data.summaryText,
      ...(cat.photoStorageId !== undefined
        ? { summaryImageStorageId: cat.photoStorageId }
        : {}),
      versionNumber,
      source: "user_edit",
      createdAt: now,
    })
    await ctx.db.patch(id, { updatedAt: now })
  },
})

/** Lock the accepted summary and advance to `family_style` (KB-005 entry). */
export const submitSummary = mutation({
  args: {
    catId: v.string(),
    summaryText: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({
        code: CAT_SUMMARY_ERROR_CODE.NOT_AUTHENTICATED,
      })
    }
    const id = ctx.db.normalizeId("cats", args.catId)
    if (id === null) {
      throw new ConvexError({ code: CAT_SUMMARY_ERROR_CODE.NOT_FOUND })
    }
    const cat = await getOwnedCatOrThrow(ctx, id, currentUser._id)
    if (cat.ceremonyStep !== "summary_review") {
      throw new ConvexError({ code: CAT_SUMMARY_ERROR_CODE.STEP_LOCKED })
    }

    const parsed = submitCatSummarySchema.safeParse({
      summaryText: args.summaryText,
    })
    if (!parsed.success) {
      throw new ConvexError({
        code: CAT_SUMMARY_ERROR_CODE.INVALID_SUMMARY,
        fieldErrors: { summaryText: parsed.error.issues[0]?.message },
      })
    }

    const previous = await latestSummaryVersion(ctx, id)
    const submittedText = parsed.data.summaryText.trim()
    const now = Date.now()

    let versionId: Id<"cat_summary_versions">
    if (previous !== null && previous.summaryText.trim() === submittedText) {
      versionId = previous._id
    } else {
      const versionNumber = (previous?.versionNumber ?? 0) + 1
      versionId = await ctx.db.insert("cat_summary_versions", {
        catId: id,
        summaryText: submittedText,
        ...(cat.photoStorageId !== undefined
          ? { summaryImageStorageId: cat.photoStorageId }
          : {}),
        versionNumber,
        source: "user_edit",
        createdAt: now,
      })
    }

    await ctx.db.patch(id, {
      acceptedSummaryVersionId: versionId,
      ceremonyStep: "family_style",
      updatedAt: now,
    })

    await ctx.db.insert("funnel_events", {
      userId: currentUser._id,
      catId: id,
      step: "summary_accepted",
      occurredAt: now,
    })
  },
})

/** User chose "Continue with this photo" after a quality warn — starts summary generation. */
export const acknowledgePhotoQuality = mutation({
  args: { catId: v.string() },
  handler: async (ctx, { catId }) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({
        code: CAT_SUMMARY_ERROR_CODE.NOT_AUTHENTICATED,
      })
    }
    const id = ctx.db.normalizeId("cats", catId)
    if (id === null) {
      throw new ConvexError({ code: CAT_SUMMARY_ERROR_CODE.NOT_FOUND })
    }
    const cat = await getOwnedCatOrThrow(ctx, id, currentUser._id)
    if (cat.ceremonyStep !== "photo_quality_review") {
      throw new ConvexError({ code: CAT_SUMMARY_ERROR_CODE.STEP_LOCKED })
    }

    const now = Date.now()
    await ctx.db.patch(id, {
      photoQualityAcknowledged: true,
      ceremonyStep: "awaiting_summary",
      summaryGenerationError: undefined,
      updatedAt: now,
    })

    await ctx.scheduler.runAfter(0, internal.catSummaryActions.generateCatSummary, {
      catId: id,
    })
  },
})

/** Re-run photo validation or summary generation after `summaryGenerationError` is set. */
export const retrySummaryPipeline = mutation({
  args: { catId: v.string() },
  handler: async (ctx, { catId }) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({
        code: CAT_SUMMARY_ERROR_CODE.NOT_AUTHENTICATED,
      })
    }
    await enforceRateLimit(ctx, "retrySummaryPipeline", currentUser._id)
    const id = ctx.db.normalizeId("cats", catId)
    if (id === null) {
      throw new ConvexError({ code: CAT_SUMMARY_ERROR_CODE.NOT_FOUND })
    }
    const cat = await getOwnedCatOrThrow(ctx, id, currentUser._id)

    // Only retry transient summary failures — photo issues return to profile.
    if (cat.ceremonyStep !== "awaiting_summary") {
      throw new ConvexError({ code: CAT_SUMMARY_ERROR_CODE.STEP_LOCKED })
    }
    if (cat.summaryGenerationError === undefined) {
      throw new ConvexError({
        code: CAT_SUMMARY_ERROR_CODE.GENERATION_IN_PROGRESS,
      })
    }

    const now = Date.now()
    await ctx.db.patch(id, {
      ceremonyStep: "awaiting_summary",
      summaryGenerationError: undefined,
      updatedAt: now,
    })
    await ctx.scheduler.runAfter(0, internal.catSummaryActions.generateCatSummary, {
      catId: id,
    })
  },
})

/** Send user back to profile form to upload a different photo after quality warn. */
export const returnToProfileForPhotoReplace = mutation({
  args: { catId: v.string() },
  handler: async (ctx, { catId }) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({
        code: CAT_SUMMARY_ERROR_CODE.NOT_AUTHENTICATED,
      })
    }
    const id = ctx.db.normalizeId("cats", catId)
    if (id === null) {
      throw new ConvexError({ code: CAT_SUMMARY_ERROR_CODE.NOT_FOUND })
    }
    const cat = await getOwnedCatOrThrow(ctx, id, currentUser._id)

    if (
      !canReturnToProfileForPhotoReplace({
        ceremonyStep: cat.ceremonyStep,
        summaryGenerationError: cat.summaryGenerationError,
        hasPhotoValidation: cat.photoValidation !== undefined,
      })
    ) {
      throw new ConvexError({ code: CAT_SUMMARY_ERROR_CODE.STEP_LOCKED })
    }

    const now = Date.now()

    // Already on profile (e.g. validation returned here before the button click).
    if (cat.ceremonyStep === "draft") {
      if (
        cat.photoValidation !== undefined &&
        cat.summaryGenerationError === undefined
      ) {
        return
      }
      const pipelineMessage = cat.summaryGenerationError?.trim() ?? ""
      if (pipelineMessage.length === 0 && cat.photoValidation !== undefined) {
        return
      }
    }

    const pipelineMessage = cat.summaryGenerationError?.trim() ?? ""
    const photoValidation =
      cat.photoValidation !== undefined
        ? cat.photoValidation
        : pipelineMessage.length > 0
          ? {
              isCat: true,
              isSingleCat: true,
              catLikelihoodScore: 0,
              qualityScore: 0,
              userMessage: pipelineMessage,
              blockReason: "",
              validatedAt: now,
            }
          : {
              isCat: true,
              isSingleCat: true,
              catLikelihoodScore: 0,
              qualityScore: 0,
              userMessage: CAT_PHOTO_CHECK_FAILED_MESSAGE,
              blockReason: "",
              validatedAt: now,
            }

    const resolvedUserMessage = resolvePhotoIssueUserMessage(photoValidation)

    await ctx.db.patch(id, {
      ceremonyStep: "draft",
      photoQualityAcknowledged: undefined,
      summaryGenerationError: undefined,
      photoValidation: {
        ...photoValidation,
        userMessage: resolvedUserMessage,
        validatedAt: now,
      },
      updatedAt: now,
    })
  },
})

/** Send owner back to profile with a persisted photo issue message. */
export const returnCatToProfileForPhotoIssue = internalMutation({
  args: {
    catId: v.id("cats"),
    validation: photoValidationInput,
  },
  handler: async (ctx, args) => {
    await returnCatToProfileForPhotoIssueDoc(ctx, args.catId, args.validation)
  },
})

/**
 * Persist vision-model scores and move `ceremonyStep` based on block/warn/pass.
 * Called from `catSummaryActions.validateCatPhoto` after OpenAI returns.
 */
export const applyPhotoValidationResult = internalMutation({
  args: {
    catId: v.id("cats"),
    validation: photoValidationInput,
    outcome: v.union(
      v.literal("pass"),
      v.literal("warn"),
      v.literal("block"),
    ),
  },
  handler: async (ctx, args) => {
    const cat = await ctx.db.get(args.catId)
    if (cat === null) {
      return
    }

    if (args.outcome === "block" || args.outcome === "warn") {
      // MVP: any photo issue sends the owner back to the profile form to re-upload.
      await returnCatToProfileForPhotoIssueDoc(ctx, args.catId, args.validation)
      return
    }

    const now = Date.now()
    const userMessage = resolvePhotoIssueUserMessage(args.validation)
    const validationRecord = {
      ...args.validation,
      userMessage,
      validatedAt: now,
    }

    // Pass — advance to awaiting_summary; action layer schedules generateCatSummary.
    await ctx.db.patch(args.catId, {
      ceremonyStep: "awaiting_summary",
      photoValidation: validationRecord,
      summaryGenerationError: undefined,
      updatedAt: now,
    })
  },
})

/** Insert AI summary row and move cat to `summary_review` for user editing. */
export const applySummaryGenerationSuccess = internalMutation({
  args: {
    catId: v.id("cats"),
    summaryText: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const cat = await ctx.db.get(args.catId)
    if (cat === null || cat.ceremonyStep !== "awaiting_summary") {
      return
    }

    const previous = await latestSummaryVersion(ctx, args.catId)
    const versionNumber = (previous?.versionNumber ?? 0) + 1
    const now = Date.now()

    await ctx.db.insert("cat_summary_versions", {
      catId: args.catId,
      summaryText: args.summaryText,
      ...(args.photoStorageId !== undefined
        ? { summaryImageStorageId: args.photoStorageId }
        : {}),
      versionNumber,
      source: "ai",
      createdAt: now,
    })

    await ctx.db.patch(args.catId, {
      ceremonyStep: "summary_review",
      summaryGenerationError: undefined,
      updatedAt: now,
    })

    await ctx.db.insert("funnel_events", {
      userId: cat.userId,
      catId: args.catId,
      step: "summary_generated",
      occurredAt: now,
    })
  },
})

/** Record a user-visible error on the cat while keeping the current pipeline step. */
export const applySummaryPipelineFailure = internalMutation({
  args: {
    catId: v.id("cats"),
    errorMessage: v.string(),
    step: v.union(
      v.literal("awaiting_photo_validation"),
      v.literal("awaiting_summary"),
    ),
  },
  handler: async (ctx, args) => {
    const cat = await ctx.db.get(args.catId)
    if (cat === null || cat.ceremonyStep !== args.step) {
      return
    }
    await ctx.db.patch(args.catId, {
      summaryGenerationError: args.errorMessage,
      updatedAt: Date.now(),
    })
  },
})
