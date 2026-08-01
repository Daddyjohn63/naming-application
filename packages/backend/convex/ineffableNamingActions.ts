/**
 * KB-010 async AI work — generate ineffable near-name batches via the AI provider.
 *
 * Simpler than cat-world: no global collision filter. On success, patches step
 * to `naming_ineffable` via applyIneffableNameGenerationSuccess.
 */

"use node"

import { v } from "convex/values"

import {
  STAGED_NAMING_ERROR_CODE,
  stagedNamingErrorMessage,
} from "@workspace/shared/constants/staged-naming-errors"

import {
  generateIneffableNamesWithAi,
  normalizeAiError,
} from "./ai/naming"
import { internal } from "./_generated/api"
import { internalAction } from "./_generated/server"

export const generateIneffableNames = internalAction({
  args: {
    catId: v.id("cats"),
    generationIndex: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, { catId, generationIndex }) => {
    const pipeline = await ctx.runQuery(
      internal.ineffableNaming.getCatForIneffableNamingPipeline,
      { catId },
    )

    if (pipeline === null) {
      return null
    }

    if (pipeline.cat.ceremonyStep !== "awaiting_ineffable_names") {
      return null
    }

    if (pipeline.summaryText === null || pipeline.summaryText.trim() === "") {
      await ctx.runMutation(
        internal.ineffableNaming.applyIneffableNameGenerationFailure,
        {
          catId,
          errorMessage:
            "Personality summary is missing. Go back and complete the summary step.",
        },
      )
      return null
    }

    if (pipeline.everydayName.trim() === "") {
      await ctx.runMutation(
        internal.ineffableNaming.applyIneffableNameGenerationFailure,
        {
          catId,
          errorMessage: stagedNamingErrorMessage(
            STAGED_NAMING_ERROR_CODE.NO_EVERYDAY_NAME,
          ),
        },
      )
      return null
    }

    if (pipeline.catWorldName.trim() === "") {
      await ctx.runMutation(
        internal.ineffableNaming.applyIneffableNameGenerationFailure,
        {
          catId,
          errorMessage: stagedNamingErrorMessage(
            STAGED_NAMING_ERROR_CODE.NO_CAT_WORLD_NAME,
          ),
        },
      )
      return null
    }

    try {
      const batch = await generateIneffableNamesWithAi({
        summaryText: pipeline.summaryText,
        everydayName: pipeline.everydayName,
        catWorldName: pipeline.catWorldName,
        excludedNames: pipeline.excludedNames,
        generationIndex,
      })

      await ctx.runMutation(
        internal.ineffableNaming.applyIneffableNameGenerationSuccess,
        {
          catId,
          generationIndex,
          names: batch.names,
        },
      )
    } catch (error) {
      await ctx.runMutation(
        internal.ineffableNaming.applyIneffableNameGenerationFailure,
        {
          catId,
          errorMessage: normalizeAiError(error),
        },
      )
    }

    return null
  },
})
