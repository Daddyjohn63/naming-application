/**
 * KB-009 async AI work — generate cat-world name batches via the AI provider.
 *
 * Runs in `"use node"` (AI SDK). Never writes DB directly — always calls
 * internal mutations on success/failure so regen counters and ceremonyStep
 * stay authoritative on the mutation path.
 *
 * Uniqueness: post-AI filter via filterGloballyAvailableCatWorldNames; retry
 * up to MAX_GENERATION_ATTEMPTS if too many names are already claimed globally.
 */

"use node"

import { v } from "convex/values"

import { NAME_BATCH_SIZE } from "@workspace/shared/constants/naming-curation"
import {
  STAGED_NAMING_ERROR_CODE,
  stagedNamingErrorMessage,
} from "@workspace/shared/constants/staged-naming-errors"

import {
  generateCatWorldNamesWithAi,
  normalizeAiError,
} from "./ai/naming"
import { internal } from "./_generated/api"
import { internalAction } from "./_generated/server"

const MAX_GENERATION_ATTEMPTS = 3

export const generateCatWorldNames = internalAction({
  args: {
    catId: v.id("cats"),
    generationIndex: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, { catId, generationIndex }) => {
    const pipeline = await ctx.runQuery(
      internal.catWorldNaming.getCatForCatWorldNamingPipeline,
      { catId },
    )

    if (pipeline === null) {
      return null
    }

    if (pipeline.cat.ceremonyStep !== "awaiting_cat_world_names") {
      return null
    }

    if (pipeline.summaryText === null || pipeline.summaryText.trim() === "") {
      await ctx.runMutation(
        internal.catWorldNaming.applyCatWorldNameGenerationFailure,
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
        internal.catWorldNaming.applyCatWorldNameGenerationFailure,
        {
          catId,
          errorMessage: stagedNamingErrorMessage(
            STAGED_NAMING_ERROR_CODE.NO_EVERYDAY_NAME,
          ),
        },
      )
      return null
    }

    let lastError: unknown = null

    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
      try {
        const batch = await generateCatWorldNamesWithAi(ctx, {
          summaryText: pipeline.summaryText,
          everydayName: pipeline.everydayName,
          excludedNames: pipeline.excludedNames,
          generationIndex,
        })

        const available = await ctx.runQuery(
          internal.catWorldNaming.filterGloballyAvailableCatWorldNames,
          { names: batch.names },
        )

        if (available.length < NAME_BATCH_SIZE) {
          if (attempt < MAX_GENERATION_ATTEMPTS - 1) {
            continue
          }
          await ctx.runMutation(
            internal.catWorldNaming.applyCatWorldNameGenerationFailure,
            {
              catId,
              errorMessage:
                "We couldn't find enough unique cat-world names right now. Please try again.",
            },
          )
          return null
        }

        await ctx.runMutation(
          internal.catWorldNaming.applyCatWorldNameGenerationSuccess,
          {
            catId,
            generationIndex,
            names: available.slice(0, NAME_BATCH_SIZE),
          },
        )
        return null
      } catch (error) {
        lastError = error
      }
    }

    await ctx.runMutation(internal.catWorldNaming.applyCatWorldNameGenerationFailure, {
      catId,
      errorMessage: normalizeAiError(lastError),
    })
    return null
  },
})
