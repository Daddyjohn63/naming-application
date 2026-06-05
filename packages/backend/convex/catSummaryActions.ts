/**
 * KB-004 async AI work — Node internalActions that call OpenAI and persist results.
 *
 * Mutations cannot run network/AI calls, so `catProfile.applyCatProfileSubmit` schedules
 * these actions via `ctx.scheduler.runAfter(0, …)`.
 */

"use node"

import { v } from "convex/values"

import { CAT_PHOTO_CHECK_FAILED_MESSAGE } from "@workspace/shared/constants/cat-photo-validation"
import { classifySummaryPipelineError } from "@workspace/shared/utils/summary-pipeline-error"

import {
  generateCatSummaryWithAi,
  validateCatPhotoWithAi,
} from "./ai/naming"
import { internal } from "./_generated/api"
import { internalAction } from "./_generated/server"
import type { Id } from "./_generated/dataModel"

/** Resolve a signed Convex storage URL so the vision model can fetch the image. */
async function loadPhotoUrl(
  ctx: { storage: { getUrl: (id: Id<"_storage">) => Promise<string | null> } },
  storageId: Id<"_storage">,
): Promise<string> {
  const url = await ctx.storage.getUrl(storageId)
  if (url === null || url === "") {
    throw new Error("Photo URL could not be resolved.")
  }
  return url
}

/**
 * Vision validation job: score the uploaded photo, then block/warn/pass via mutation.
 * On pass, schedules `generateCatSummary` next.
 */
export const validateCatPhoto = internalAction({
  args: { catId: v.id("cats") },
  handler: async (ctx, { catId }) => {
    const cat = await ctx.runQuery(internal.catSummary.getCatForSummaryPipeline, {
      catId,
    })
    // No-op if step changed (stale scheduled job) or cat was deleted.
    if (cat === null || cat.ceremonyStep !== "awaiting_photo_validation") {
      return
    }
    // Edge case: step expects photo but row has none — treat as pass.
    if (cat.photoStorageId === undefined) {
      await ctx.runMutation(internal.catSummary.applyPhotoValidationResult, {
        catId,
        validation: {
          isCat: true,
          isSingleCat: true,
          catLikelihoodScore: 10,
          qualityScore: 10,
          userMessage: "",
          blockReason: "",
        },
        outcome: "pass",
      })
      await ctx.scheduler.runAfter(0, internal.catSummaryActions.generateCatSummary, {
        catId,
      })
      return
    }

    try {
      const imageUrl = await loadPhotoUrl(ctx, cat.photoStorageId)
      const { validation, outcome } = await validateCatPhotoWithAi({ imageUrl })

      await ctx.runMutation(internal.catSummary.applyPhotoValidationResult, {
        catId,
        validation,
        outcome,
      })

      if (outcome === "pass") {
        await ctx.scheduler.runAfter(
          0,
          internal.catSummaryActions.generateCatSummary,
          { catId },
        )
      }
    } catch (error) {
      const failure = classifySummaryPipelineError({ error, hasPhoto: true })
      const userMessage =
        failure.kind === "photo"
          ? failure.userMessage
          : CAT_PHOTO_CHECK_FAILED_MESSAGE

      await ctx.runMutation(internal.catSummary.applyPhotoValidationResult, {
        catId,
        validation: {
          isCat: true,
          isSingleCat: true,
          catLikelihoodScore: 0,
          qualityScore: 0,
          userMessage,
          blockReason:
            error instanceof Error
              ? error.message
              : "Photo validation failed",
        },
        outcome: "block",
      })
    }
  },
})

/**
 * Personality summary job: text-only or multimodal OpenAI call, then insert version row.
 * Only runs while `ceremonyStep === "awaiting_summary"`.
 */
export const generateCatSummary = internalAction({
  args: { catId: v.id("cats") },
  handler: async (ctx, { catId }) => {
    const cat = await ctx.runQuery(internal.catSummary.getCatForSummaryPipeline, {
      catId,
    })
    if (cat === null || cat.ceremonyStep !== "awaiting_summary") {
      return
    }

    try {
      let imageUrl: string | undefined
      if (cat.photoStorageId !== undefined) {
        imageUrl = await loadPhotoUrl(ctx, cat.photoStorageId)
      }

      const summaryText = await generateCatSummaryWithAi({
        profile: {
          title: cat.title,
          description: cat.description,
          existingName: cat.existingName,
          sex: cat.sex,
          age: cat.age,
          breed: cat.breed,
        },
        imageUrl,
      })

      if (summaryText.length === 0) {
        throw new Error("The summary came back empty. Please try again.")
      }

      await ctx.runMutation(internal.catSummary.applySummaryGenerationSuccess, {
        catId,
        summaryText,
        photoStorageId: cat.photoStorageId,
      })
    } catch (error) {
      const hasPhoto = cat.photoStorageId !== undefined
      const failure = classifySummaryPipelineError({ error, hasPhoto })

      if (failure.kind === "photo") {
        const priorValidation = cat.photoValidation
        await ctx.runMutation(internal.catSummary.returnCatToProfileForPhotoIssue, {
          catId,
          validation: {
            isCat: priorValidation?.isCat ?? true,
            isSingleCat: priorValidation?.isSingleCat ?? true,
            catLikelihoodScore: priorValidation?.catLikelihoodScore ?? 8,
            qualityScore: priorValidation?.qualityScore ?? 0,
            userMessage: failure.userMessage,
            blockReason:
              error instanceof Error ? error.message : "Summary photo failure",
          },
        })
        return
      }

      await ctx.runMutation(internal.catSummary.applySummaryPipelineFailure, {
        catId,
        errorMessage: failure.userMessage,
        step: "awaiting_summary",
      })
    }
  },
})
