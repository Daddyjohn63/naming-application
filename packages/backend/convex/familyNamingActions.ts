/**
 * KB-006 async AI work — generate family name batches via OpenAI.
 */

"use node"

import { v } from "convex/values"

import { generateFamilyNamesWithAi, normalizeAiError } from "./ai/naming"
import { internal } from "./_generated/api"
import { internalAction } from "./_generated/server"
import { assertFamilyNameStyleIds } from "./familyNaming"

export const generateFamilyNames = internalAction({
  args: {
    catId: v.id("cats"),
    generationIndex: v.number(),
  },
  handler: async (ctx, { catId, generationIndex }) => {
    const pipeline = await ctx.runQuery(
      internal.familyNaming.getCatForFamilyNamingPipeline,
      { catId },
    )

    if (
      pipeline === null ||
      pipeline.cat.ceremonyStep !== "awaiting_family_names" ||
      pipeline.summaryText === null ||
      pipeline.summaryText.trim() === ""
    ) {
      return
    }

    const styleIds = assertFamilyNameStyleIds(pipeline.styleIds)
    if (styleIds.length === 0) {
      await ctx.runMutation(internal.familyNaming.applyFamilyNameGenerationFailure, {
        catId,
        errorMessage: "Family name styles are missing. Go back and choose a style.",
      })
      return
    }

    try {
      const batch = await generateFamilyNamesWithAi({
        summaryText: pipeline.summaryText,
        styleIds,
        excludedNames: pipeline.excludedNames,
        generationIndex,
      })

      await ctx.runMutation(internal.familyNaming.applyFamilyNameGenerationSuccess, {
        catId,
        generationIndex,
        styleHints: styleIds,
        names: batch.names,
      })
    } catch (error) {
      await ctx.runMutation(internal.familyNaming.applyFamilyNameGenerationFailure, {
        catId,
        errorMessage: normalizeAiError(error),
      })
    }
  },
})
