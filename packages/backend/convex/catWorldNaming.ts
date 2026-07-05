/**
 * KB-009 — cat-world name curation, global uniqueness claims, AI batch generation.
 *
 * Public surface mirrors `familyNaming.ts`:
 * - `getCatWorldNamingStateForOwner` — reactive query for curation UI
 * - `startCatWorldNaming` — user clicks Continue; schedules first batch
 * - shortlist add/remove, `setCatWorldFavourite`, `regenerateCatWorldNames`, retry
 * - `confirmCatWorldFavourite` — advances ceremonyStep to naming_ineffable (no AI yet)
 *
 * Global uniqueness: favourite confirm inserts into `cat_world_name_claims` (see
 * `setCatWorldFavourite`). Generation-time filtering lives in catWorldNamingActions.
 */

import { ConvexError, v } from "convex/values"

import { normalizeNameForDedupe } from "@workspace/shared/constants/naming-curation"
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
  allThreeNamesChosen,
  assertRegenAvailable,
  awaitingStepForStage,
  countSavedFromBatch,
  curationStepForStage,
  excludedNamesForStage,
  latestGenerationForStage,
  regenUsedForStage,
  removeFromStageShortlist,
  setStageFavouriteFromShortlist,
  shortlistForStage,
  type ShortlistEntry,
} from "./lib/namingStage"
import { beginCatWorldGenerationIfNeeded } from "./lib/beginCatWorldGeneration"
import { getCurrentUser } from "./users"
import type { Doc, Id } from "./_generated/dataModel"

const STAGE = "cat_world" as const

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

/** Gate: all cat-world mutations require a successful unlock (stub or future Stripe). */
function assertUnlocked(cat: Doc<"cats">): void {
  if (cat.ceremonyPaymentId === undefined) {
    throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_UNLOCKED })
  }
}

async function scheduleCatWorldGeneration(
  ctx: MutationCtx,
  catId: Id<"cats">,
  generationIndex: number,
) {
  await ctx.scheduler.runAfter(0, internal.catWorldNamingActions.generateCatWorldNames, {
    catId,
    generationIndex,
  })
}

/** Remove prior claim rows for this cat when the user picks a different favourite. */
async function releaseCatWorldClaimForCat(
  ctx: MutationCtx,
  catId: Id<"cats">,
): Promise<void> {
  const claims = await ctx.db
    .query("cat_world_name_claims")
    .withIndex("by_catId", (q) => q.eq("catId", catId))
    .collect()
  for (const claim of claims) {
    await ctx.db.delete(claim._id)
  }
}

/** Owner-facing state for cat-world curation UI. */
export const getCatWorldNamingStateForOwner = query({
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
      selectedCatWorldName: v.optional(v.string()),
      selectedCatWorldRationale: v.optional(v.string()),
      catWorldNameRegenerationsUsed: v.number(),
      catWorldNameGenerationError: v.optional(v.string()),
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
      savedFromCurrentBatchCount: v.number(),
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

    const currentBatch = await latestGenerationForStage(ctx, id, STAGE)
    const shortlist = shortlistForStage(cat, STAGE)

    return {
      catId: id,
      ceremonyStep: cat.ceremonyStep,
      shortlist,
      selectedCatWorldName: cat.selectedCatWorldName,
      selectedCatWorldRationale: cat.selectedCatWorldRationale,
      catWorldNameRegenerationsUsed: regenUsedForStage(cat, STAGE),
      catWorldNameGenerationError: cat.catWorldNameGenerationError,
      currentBatch:
        currentBatch === null
          ? null
          : {
              generationIndex: currentBatch.generationIndex,
              names: currentBatch.names,
            },
      savedFromCurrentBatchCount:
        currentBatch === null
          ? 0
          : countSavedFromBatch(
              shortlist,
              currentBatch.names.map((n) => n.name),
            ),
    }
  },
})

export const getCatForCatWorldNamingPipeline = internalQuery({
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
    }
  },
})

export const filterGloballyAvailableCatWorldNames = internalQuery({
  args: {
    names: v.array(
      v.object({
        name: v.string(),
        rationale: v.string(),
      }),
    ),
  },
  returns: v.array(
    v.object({
      name: v.string(),
      rationale: v.string(),
    }),
  ),
  handler: async (ctx, { names }) => {
    const available: ShortlistEntry[] = []
    for (const entry of names) {
      const normalized = normalizeNameForDedupe(entry.name)
      const existing = await ctx.db
        .query("cat_world_name_claims")
        .withIndex("by_normalizedName", (q) => q.eq("normalizedName", normalized))
        .unique()
      if (existing === null) {
        available.push(entry)
      }
    }
    return available
  },
})

/** Start first cat-world name batch after unlock (sidebar Continue). */
export const startCatWorldNaming = mutation({
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
    if (cat.ceremonyStep !== "naming_cat_world") {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.STEP_LOCKED })
    }
    if (cat.selectedFamilyName === undefined) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NO_EVERYDAY_NAME })
    }

    await beginCatWorldGenerationIfNeeded(ctx, id)
    return null
  },
})

export const addToCatWorldShortlist = mutation({
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

export const removeFromCatWorldShortlist = mutation({
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

/** Pick favourite; may change before certificate (releases prior global claim). */
export const setCatWorldFavourite = mutation({
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

    const allowAfterAdvance =
      cat.ceremonyStep === "naming_ineffable" ||
      cat.ceremonyStep === "awaiting_ineffable_names"

    const entry = await setStageFavouriteFromShortlist(
      ctx,
      cat,
      STAGE,
      args.name,
      { allowAfterAdvance },
    )

    const normalized = normalizeNameForDedupe(entry.name)
    const taken = await ctx.db
      .query("cat_world_name_claims")
      .withIndex("by_normalizedName", (q) => q.eq("normalizedName", normalized))
      .unique()
    if (taken !== null && taken.catId !== id) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NAME_GLOBALLY_TAKEN })
    }

    await releaseCatWorldClaimForCat(ctx, id)

    const batch = await latestGenerationForStage(ctx, id, STAGE)
    const now = Date.now()

    await ctx.db.insert("cat_world_name_claims", {
      userId: currentUser._id,
      normalizedName: normalized,
      catId: id,
      sourceGenerationId: batch?._id,
      createdAt: now,
    })

    await ctx.db.patch(id, {
      selectedCatWorldName: entry.name,
      selectedCatWorldRationale: entry.rationale,
      updatedAt: now,
    })

    return null
  },
})

/** Confirm cat-world favourite and advance to ineffable stage. */
export const confirmCatWorldFavourite = mutation({
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
      cat.selectedCatWorldName === undefined ||
      cat.selectedCatWorldRationale === undefined
    ) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NO_FAVOURITE })
    }
    if (shortlistForStage(cat, STAGE).length < 1) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NO_FAVOURITE })
    }

    const now = Date.now()
    await ctx.db.patch(id, {
      ceremonyStep: "naming_ineffable",
      updatedAt: now,
    })

    await ctx.db.insert("funnel_events", {
      userId: currentUser._id,
      catId: id,
      step: "cat_world_name_confirmed",
      occurredAt: now,
    })

    return null
  },
})

export const regenerateCatWorldNames = mutation({
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
    const canRegen =
      cat.ceremonyStep === curationStepForStage(STAGE) ||
      cat.ceremonyStep === "naming_ineffable" ||
      cat.ceremonyStep === "awaiting_ineffable_names"
    if (!canRegen) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.STEP_LOCKED })
    }
    assertRegenAvailable(cat, STAGE)

    const now = Date.now()
    await ctx.db.patch(id, {
      ceremonyStep: awaitingStepForStage(STAGE),
      catWorldNameGenerationError: undefined,
      updatedAt: now,
    })

    await scheduleCatWorldGeneration(ctx, id, 1)
    return null
  },
})

export const retryCatWorldNameGeneration = mutation({
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
    if (cat.catWorldNameGenerationError === undefined) {
      throw new ConvexError({
        code: STAGED_NAMING_ERROR_CODE.GENERATION_IN_PROGRESS,
      })
    }

    const latest = await latestGenerationForStage(ctx, id, STAGE)
    const generationIndex =
      latest === null ? 0 : Math.min(latest.generationIndex + 1, 1)

    await ctx.db.patch(id, {
      catWorldNameGenerationError: undefined,
      updatedAt: Date.now(),
    })

    await scheduleCatWorldGeneration(ctx, id, generationIndex)
    return null
  },
})

export const applyCatWorldNameGenerationSuccess = internalMutation({
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
      catWorldNameGenerationError: undefined,
      updatedAt: now,
    }

    if (args.generationIndex === 1) {
      patch.catWorldNameRegenerationsUsed =
        (cat.catWorldNameRegenerationsUsed ?? 0) + 1
    }

    await ctx.db.patch(args.catId, patch)

    await ctx.db.insert("funnel_events", {
      userId: cat.userId,
      catId: args.catId,
      step: "cat_world_names_generated",
      occurredAt: now,
      meta: { generationIndex: String(args.generationIndex) },
    })

    return null
  },
})

export const applyCatWorldNameGenerationFailure = internalMutation({
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
      catWorldNameGenerationError: args.errorMessage,
      updatedAt: Date.now(),
    })
    return null
  },
})

export { allThreeNamesChosen }
