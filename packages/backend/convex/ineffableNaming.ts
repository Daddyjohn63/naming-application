/**
 * KB-010 — ineffable near-name curation and AI batch generation.
 *
 * Same curation contract as cat-world (10 names, shortlist, one regen, favourite)
 * but **no** global uniqueness table. AI prompt includes everyday + cat-world
 * names already chosen. Uses shared helpers from `lib/namingStage.ts`.
 *
 * After `confirmIneffableFavourite`, all three names are set; KB-011 certificate
 * UI reads that state (step remains `naming_ineffable` until certificate ships).
 */

import { ConvexError, v } from "convex/values"

import { STAGED_NAMING_ERROR_CODE } from "@workspace/shared/constants/staged-naming-errors"

import { internal } from "./_generated/api"
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server"
import {
  acceptedSummaryText,
  addToStageShortlist,
  allGenerationsForCat,
  allThreeNamesChosen,
  assertRegenAvailable,
  awaitingStepForStage,
  curationStepForStage,
  excludedNamesForStage,
  generatedBatchesFromGenerations,
  latestGenerationForStage,
  regenUsedForStage,
  removeFromStageShortlist,
  setStageFavouriteFromShortlist,
  shortlistForStage,
} from "./lib/namingStage"
import { getCurrentUser } from "./users"
import type { Doc, Id } from "./_generated/dataModel"

const STAGE = "ineffable" as const

async function getOwnedCatOrThrow(
  ctx: QueryCtx | MutationCtx,
  catId: Id<"cats">,
  userId: Id<"users">,
) {
  const cat = await ctx.db.get(catId)
  if (cat === null) {
    throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_FOUND })
  }
  if (cat.userId !== userId) {
    throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_OWNER })
  }
  return cat
}

function assertUnlocked(cat: Doc<"cats">): void {
  if (cat.ceremonyPaymentId === undefined) {
    throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_UNLOCKED })
  }
}

async function scheduleIneffableGeneration(
  ctx: MutationCtx,
  catId: Id<"cats">,
  generationIndex: number,
) {
  await ctx.scheduler.runAfter(
    0,
    internal.ineffableNamingActions.generateIneffableNames,
    {
      catId,
      generationIndex,
    },
  )
}

/** Owner-facing state for ineffable curation UI. */
export const getIneffableNamingStateForOwner = query({
  args: { catId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      catId: v.id("cats"),
      ceremonyStep: v.string(),
      shortlist: v.array(
        v.object({
          name: v.string(),
          rationale: v.string(),
        }),
      ),
      selectedIneffableName: v.optional(v.string()),
      selectedIneffableRationale: v.optional(v.string()),
      ineffableNameRegenerationsUsed: v.number(),
      ineffableNameGenerationError: v.optional(v.string()),
      currentBatch: v.union(
        v.null(),
        v.object({
          generationIndex: v.number(),
          names: v.array(
            v.object({
              name: v.string(),
              rationale: v.string(),
            }),
          ),
        }),
      ),
      generatedBatches: v.union(
        v.null(),
        v.array(
          v.object({
            generationIndex: v.number(),
            names: v.array(
              v.object({
                name: v.string(),
                rationale: v.string(),
              }),
            ),
          }),
        ),
      ),
    }),
  ),
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

    const generations = await allGenerationsForCat(ctx, id, STAGE)
    const shortlist = shortlistForStage(cat, STAGE)
    const currentBatch = generations.at(-1) ?? null

    return {
      catId: id,
      ceremonyStep: cat.ceremonyStep,
      shortlist,
      selectedIneffableName: cat.selectedIneffableName,
      selectedIneffableRationale: cat.selectedIneffableRationale,
      ineffableNameRegenerationsUsed: regenUsedForStage(cat, STAGE),
      ineffableNameGenerationError: cat.ineffableNameGenerationError,
      generatedBatches: generatedBatchesFromGenerations(generations),
      currentBatch:
        currentBatch === null
          ? null
          : {
              generationIndex: currentBatch.generationIndex,
              names: currentBatch.names,
            },
    }
  },
})

export const getCatForIneffableNamingPipeline = internalQuery({
  args: { catId: v.id("cats") },
  handler: async (ctx, { catId }) => {
    const cat = await ctx.db.get(catId)
    if (cat === null) {
      return null
    }
    const summaryText = await acceptedSummaryText(ctx, cat)
    const excludedNames = await excludedNamesForStage(ctx, catId, cat, STAGE)
    return {
      cat,
      summaryText,
      excludedNames,
      everydayName: cat.selectedFamilyName ?? "",
      catWorldName: cat.selectedCatWorldName ?? "",
    }
  },
})

/** Start first ineffable name batch (sidebar Continue). */
export const startIneffableNaming = mutation({
  args: { catId: v.string() },
  returns: v.null(),
  handler: async (ctx, { catId }) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_AUTHENTICATED })
    }
    const id = ctx.db.normalizeId("cats", catId)
    if (id === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_FOUND })
    }
    const cat = await getOwnedCatOrThrow(ctx, id, currentUser._id)
    assertUnlocked(cat)
    if (cat.ceremonyStep !== "naming_ineffable") {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.STEP_LOCKED })
    }
    if (cat.selectedCatWorldName === undefined) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NO_CAT_WORLD_NAME })
    }

    const existingBatch = await latestGenerationForStage(ctx, id, STAGE)
    if (existingBatch !== null) {
      return null
    }

    const now = Date.now()
    await ctx.db.patch(id, {
      ceremonyStep: "awaiting_ineffable_names",
      ineffableNameGenerationError: undefined,
      updatedAt: now,
    })

    await scheduleIneffableGeneration(ctx, id, 0)
    return null
  },
})

export const addToIneffableShortlist = mutation({
  args: { catId: v.string(), name: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_AUTHENTICATED })
    }
    const id = ctx.db.normalizeId("cats", args.catId)
    if (id === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_FOUND })
    }
    const cat = await getOwnedCatOrThrow(ctx, id, currentUser._id)
    assertUnlocked(cat)
    await addToStageShortlist(ctx, cat, STAGE, args.name)
    return null
  },
})

export const removeFromIneffableShortlist = mutation({
  args: { catId: v.string(), name: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_AUTHENTICATED })
    }
    const id = ctx.db.normalizeId("cats", args.catId)
    if (id === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_FOUND })
    }
    const cat = await getOwnedCatOrThrow(ctx, id, currentUser._id)
    assertUnlocked(cat)
    await removeFromStageShortlist(ctx, cat, STAGE, args.name)
    return null
  },
})

export const setIneffableFavourite = mutation({
  args: { catId: v.string(), name: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_AUTHENTICATED })
    }
    const id = ctx.db.normalizeId("cats", args.catId)
    if (id === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_FOUND })
    }
    const cat = await getOwnedCatOrThrow(ctx, id, currentUser._id)
    assertUnlocked(cat)
    if (cat.ceremonyStep === "ceremony_complete") {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.STEP_LOCKED })
    }

    const entry = await setStageFavouriteFromShortlist(ctx, cat, STAGE, args.name)

    await ctx.db.patch(id, {
      selectedIneffableName: entry.name,
      selectedIneffableRationale: entry.rationale,
      updatedAt: Date.now(),
    })

    return null
  },
})

/** Confirm ineffable favourite — all three names ready for certificate prep. */
export const confirmIneffableFavourite = mutation({
  args: { catId: v.string() },
  returns: v.null(),
  handler: async (ctx, { catId }) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_AUTHENTICATED })
    }
    const id = ctx.db.normalizeId("cats", catId)
    if (id === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_FOUND })
    }
    const cat = await getOwnedCatOrThrow(ctx, id, currentUser._id)
    assertUnlocked(cat)
    if (cat.ceremonyStep !== curationStepForStage(STAGE)) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.STEP_LOCKED })
    }
    if (
      cat.selectedIneffableName === undefined ||
      cat.selectedIneffableRationale === undefined
    ) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NO_FAVOURITE })
    }
    if (shortlistForStage(cat, STAGE).length < 1) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NO_FAVOURITE })
    }

    const now = Date.now()
    await ctx.db.patch(id, {
      updatedAt: now,
    })

    await ctx.db.insert("funnel_events", {
      userId: currentUser._id,
      catId: id,
      step: "ineffable_name_confirmed",
      occurredAt: now,
    })

    return null
  },
})

export const regenerateIneffableNames = mutation({
  args: { catId: v.string() },
  returns: v.null(),
  handler: async (ctx, { catId }) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_AUTHENTICATED })
    }
    const id = ctx.db.normalizeId("cats", catId)
    if (id === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_FOUND })
    }
    const cat = await getOwnedCatOrThrow(ctx, id, currentUser._id)
    assertUnlocked(cat)
    if (cat.ceremonyStep !== curationStepForStage(STAGE)) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.STEP_LOCKED })
    }
    assertRegenAvailable(cat, STAGE)

    const now = Date.now()
    await ctx.db.patch(id, {
      ceremonyStep: awaitingStepForStage(STAGE),
      ineffableNameGenerationError: undefined,
      updatedAt: now,
    })

    await scheduleIneffableGeneration(ctx, id, 1)
    return null
  },
})

export const retryIneffableNameGeneration = mutation({
  args: { catId: v.string() },
  returns: v.null(),
  handler: async (ctx, { catId }) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_AUTHENTICATED })
    }
    const id = ctx.db.normalizeId("cats", catId)
    if (id === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_FOUND })
    }
    const cat = await getOwnedCatOrThrow(ctx, id, currentUser._id)
    assertUnlocked(cat)
    if (cat.ceremonyStep !== awaitingStepForStage(STAGE)) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.STEP_LOCKED })
    }
    if (cat.ineffableNameGenerationError === undefined) {
      throw new ConvexError({
        code: STAGED_NAMING_ERROR_CODE.GENERATION_IN_PROGRESS,
      })
    }

    const latest = await latestGenerationForStage(ctx, id, STAGE)
    const generationIndex =
      latest === null ? 0 : Math.min(latest.generationIndex + 1, 1)

    await ctx.db.patch(id, {
      ineffableNameGenerationError: undefined,
      updatedAt: Date.now(),
    })

    await scheduleIneffableGeneration(ctx, id, generationIndex)
    return null
  },
})

export const applyIneffableNameGenerationSuccess = internalMutation({
  args: {
    catId: v.id("cats"),
    generationIndex: v.number(),
    names: v.array(
      v.object({
        name: v.string(),
        rationale: v.string(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const cat = await ctx.db.get(args.catId)
    if (cat === null || cat.ceremonyStep !== awaitingStepForStage(STAGE)) {
      return null
    }

    const now = Date.now()
    await ctx.db.insert("cat_name_generations", {
      catId: args.catId,
      stage: STAGE,
      generationIndex: args.generationIndex,
      names: args.names,
      createdAt: now,
    })

    const patch: Partial<Doc<"cats">> = {
      ceremonyStep: curationStepForStage(STAGE),
      ineffableNameGenerationError: undefined,
      updatedAt: now,
    }

    if (args.generationIndex === 1) {
      patch.ineffableNameRegenerationsUsed =
        (cat.ineffableNameRegenerationsUsed ?? 0) + 1
    }

    await ctx.db.patch(args.catId, patch)

    await ctx.db.insert("funnel_events", {
      userId: cat.userId,
      catId: args.catId,
      step: "ineffable_names_generated",
      occurredAt: now,
      meta: { generationIndex: String(args.generationIndex) },
    })

    return null
  },
})

export const applyIneffableNameGenerationFailure = internalMutation({
  args: {
    catId: v.id("cats"),
    errorMessage: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const cat = await ctx.db.get(args.catId)
    if (cat === null || cat.ceremonyStep !== awaitingStepForStage(STAGE)) {
      return null
    }
    await ctx.db.patch(args.catId, {
      ineffableNameGenerationError: args.errorMessage,
      updatedAt: Date.now(),
    })
    return null
  },
})

export { allThreeNamesChosen }
