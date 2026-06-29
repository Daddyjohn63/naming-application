/**
 * KB-005 / KB-006 — family name style, AI batch generation, shortlist, favourite, unlock entry.
 */

import { ConvexError, v } from "convex/values"

import {
  CUSTOM_FAMILY_NAME_RATIONALE,
  FAMILY_NAME_STYLE_IDS,
  MAX_CUSTOM_FAMILY_NAMES,
  MAX_FAMILY_NAME_REGENERATIONS,
  MAX_FAMILY_SHORTLIST_PER_BATCH,
  MAX_FAMILY_SHORTLIST_TOTAL,
  normalizeFamilyName,
  resolveMixItUpStyles,
  type FamilyNameStyleId,
  type FamilyShortlistSource,
} from "@workspace/shared/constants/family-naming"
import { FAMILY_NAMING_ERROR_CODE } from "@workspace/shared/constants/family-naming-errors"
import {
  addCustomFamilyShortlistEntrySchema,
  addFamilyShortlistEntrySchema,
  regenerateFamilyNamesSchema,
  setFamilyFavouriteSchema,
  submitFamilyNameStylesSchema,
} from "@workspace/shared/schemas/family-naming"

import { internal } from "./_generated/api"
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server"
import { getCurrentUser } from "./users"
import type { Doc, Id } from "./_generated/dataModel"

type ShortlistEntry = {
  name: string
  rationale: string
  source?: FamilyShortlistSource
}

async function getOwnedCatOrThrow(
  ctx: QueryCtx | MutationCtx,
  catId: Id<"cats">,
  userId: Id<"users">,
) {
  const cat = await ctx.db.get(catId)
  if (cat === null) {
    throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NOT_FOUND })
  }
  if (cat.userId !== userId) {
    throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NOT_OWNER })
  }
  return cat
}

function shortlistOf(cat: Doc<"cats">): ShortlistEntry[] {
  return cat.familyNameShortlist ?? []
}

function regenUsed(cat: Doc<"cats">): number {
  return cat.familyNameRegenerationsUsed ?? 0
}

/** Resolve mix-it-up to concrete styles; other ids pass through unchanged. */
function resolveStyleSelection(styleIds: readonly FamilyNameStyleId[]): FamilyNameStyleId[] {
  const resolved: FamilyNameStyleId[] = []
  for (const id of styleIds) {
    if (id === "mix_it_up") {
      resolved.push(...resolveMixItUpStyles())
    } else {
      resolved.push(id)
    }
  }
  return [...new Set(resolved)]
}

async function acceptedSummaryText(
  ctx: QueryCtx | MutationCtx,
  cat: Doc<"cats">,
): Promise<string | null> {
  if (cat.acceptedSummaryVersionId === undefined) {
    return null
  }
  const version = await ctx.db.get(cat.acceptedSummaryVersionId)
  return version?.summaryText ?? null
}

async function latestFamilyGeneration(
  ctx: QueryCtx | MutationCtx,
  catId: Id<"cats">,
) {
  return await ctx.db
    .query("cat_name_generations")
    .withIndex("by_catId_stage_generationIndex", (q) =>
      q.eq("catId", catId).eq("stage", "family"),
    )
    .order("desc")
    .first()
}

async function excludedNamesForGeneration(
  ctx: QueryCtx | MutationCtx,
  catId: Id<"cats">,
  cat: Doc<"cats">,
): Promise<string[]> {
  const excluded = new Set<string>()
  for (const entry of shortlistOf(cat)) {
    excluded.add(entry.name)
  }
  const generations = await ctx.db
    .query("cat_name_generations")
    .withIndex("by_catId_stage_generationIndex", (q) =>
      q.eq("catId", catId).eq("stage", "family"),
    )
    .collect()
  for (const generation of generations) {
    for (const { name } of generation.names) {
      excluded.add(name)
    }
  }
  return [...excluded]
}

function countSavedFromBatch(
  shortlist: ShortlistEntry[],
  batchNames: readonly string[],
): number {
  const batchNormalized = new Set(batchNames.map(normalizeFamilyName))
  return shortlist.filter((entry) =>
    batchNormalized.has(normalizeFamilyName(entry.name)),
  ).length
}

function countCustomShortlistEntries(shortlist: ShortlistEntry[]): number {
  return shortlist.filter((entry) => entry.source === "custom").length
}

async function isNameInFamilyGenerations(
  ctx: QueryCtx | MutationCtx,
  catId: Id<"cats">,
  normalizedName: string,
): Promise<boolean> {
  const generations = await ctx.db
    .query("cat_name_generations")
    .withIndex("by_catId_stage_generationIndex", (q) =>
      q.eq("catId", catId).eq("stage", "family"),
    )
    .collect()
  for (const generation of generations) {
    for (const { name } of generation.names) {
      if (normalizeFamilyName(name) === normalizedName) {
        return true
      }
    }
  }
  return false
}

async function scheduleFamilyGeneration(
  ctx: MutationCtx,
  catId: Id<"cats">,
  generationIndex: number,
) {
  await ctx.scheduler.runAfter(0, internal.familyNamingActions.generateFamilyNames, {
    catId,
    generationIndex,
  })
}

/** Owner-facing state for the family curation UI. */
export const getFamilyNamingStateForOwner = query({
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

    const currentBatch = await latestFamilyGeneration(ctx, id)
    const shortlist = shortlistOf(cat)

    return {
      catId: id,
      ceremonyStep: cat.ceremonyStep,
      familyNameStyles: cat.familyNameStyles ?? [],
      shortlist,
      selectedFamilyName: cat.selectedFamilyName,
      selectedFamilyRationale: cat.selectedFamilyRationale,
      familyNameRegenerationsUsed: regenUsed(cat),
      familyNameGenerationError: cat.familyNameGenerationError,
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
      customShortlistCount: countCustomShortlistEntries(shortlist),
    }
  },
})

export const getCatForFamilyNamingPipeline = internalQuery({
  args: { catId: v.id("cats") },
  handler: async (ctx, { catId }) => {
    const cat = await ctx.db.get(catId)
    if (cat === null) {
      return null
    }
    const summaryText = await acceptedSummaryText(ctx, cat)
    const excludedNames = await excludedNamesForGeneration(ctx, catId, cat)
    return {
      cat,
      summaryText,
      excludedNames,
      styleIds: (cat.familyNameStyles ?? []) as FamilyNameStyleId[],
    }
  },
})

/** KB-005 — lock style selection and start first name batch. */
export const submitFamilyNameStyles = mutation({
  args: { catId: v.string(), styleIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NOT_AUTHENTICATED })
    }
    const id = ctx.db.normalizeId("cats", args.catId)
    if (id === null) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NOT_FOUND })
    }
    const cat = await getOwnedCatOrThrow(ctx, id, currentUser._id)
    if (cat.ceremonyStep !== "family_style") {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.STEP_LOCKED })
    }
    if (cat.acceptedSummaryVersionId === undefined) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NO_ACCEPTED_SUMMARY })
    }

    const parsed = submitFamilyNameStylesSchema.safeParse({
      styleIds: args.styleIds,
    })
    if (!parsed.success) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.INVALID_STYLES })
    }

    const resolvedStyles = resolveStyleSelection(parsed.data.styleIds)
    const now = Date.now()

    await ctx.db.patch(id, {
      familyNameStyles: resolvedStyles,
      ceremonyStep: "awaiting_family_names",
      familyNameGenerationError: undefined,
      updatedAt: now,
    })

    await ctx.db.insert("funnel_events", {
      userId: currentUser._id,
      catId: id,
      step: "family_style_selected",
      occurredAt: now,
      meta: { styles: resolvedStyles.join(",") },
    })

    await scheduleFamilyGeneration(ctx, id, 0)
  },
})

/** Save a name from the current batch to the shortlist (max 3 per batch, 6 total). */
export const addToFamilyShortlist = mutation({
  args: { catId: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NOT_AUTHENTICATED })
    }
    const id = ctx.db.normalizeId("cats", args.catId)
    if (id === null) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NOT_FOUND })
    }
    const cat = await getOwnedCatOrThrow(ctx, id, currentUser._id)
    if (cat.ceremonyStep !== "family_curation") {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.STEP_LOCKED })
    }

    const parsed = addFamilyShortlistEntrySchema.safeParse({ name: args.name })
    if (!parsed.success) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NAME_NOT_IN_BATCH })
    }

    const batch = await latestFamilyGeneration(ctx, id)
    if (batch === null) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.BATCH_NOT_READY })
    }

    const batchEntry = batch.names.find(
      (entry) =>
        normalizeFamilyName(entry.name) === normalizeFamilyName(parsed.data.name),
    )
    if (batchEntry === undefined) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NAME_NOT_IN_BATCH })
    }

    const shortlist = shortlistOf(cat)
    if (shortlist.length >= MAX_FAMILY_SHORTLIST_TOTAL) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.SHORTLIST_FULL })
    }

    const normalized = normalizeFamilyName(batchEntry.name)
    if (shortlist.some((entry) => normalizeFamilyName(entry.name) === normalized)) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.DUPLICATE_NAME })
    }

    const savedFromBatch = countSavedFromBatch(
      shortlist,
      batch.names.map((n) => n.name),
    )
    if (savedFromBatch >= MAX_FAMILY_SHORTLIST_PER_BATCH) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.BATCH_SAVE_LIMIT })
    }

    const now = Date.now()
    await ctx.db.patch(id, {
      familyNameShortlist: [
        ...shortlist,
        {
          name: batchEntry.name,
          rationale: batchEntry.rationale,
          source: "ai",
        },
      ],
      updatedAt: now,
    })
  },
})

/** Save a user-provided family name to the shortlist (max 1 custom per ceremony). */
export const addCustomFamilyNameToShortlist = mutation({
  args: { catId: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NOT_AUTHENTICATED })
    }
    const id = ctx.db.normalizeId("cats", args.catId)
    if (id === null) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NOT_FOUND })
    }
    const cat = await getOwnedCatOrThrow(ctx, id, currentUser._id)
    if (cat.ceremonyStep !== "family_curation") {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.STEP_LOCKED })
    }

    const parsed = addCustomFamilyShortlistEntrySchema.safeParse({ name: args.name })
    if (!parsed.success) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.INVALID_NAME })
    }

    const shortlist = shortlistOf(cat)
    if (shortlist.length >= MAX_FAMILY_SHORTLIST_TOTAL) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.SHORTLIST_FULL })
    }

    if (countCustomShortlistEntries(shortlist) >= MAX_CUSTOM_FAMILY_NAMES) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.CUSTOM_NAME_LIMIT })
    }

    const normalized = normalizeFamilyName(parsed.data.name)
    if (shortlist.some((entry) => normalizeFamilyName(entry.name) === normalized)) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.DUPLICATE_NAME })
    }

    if (await isNameInFamilyGenerations(ctx, id, normalized)) {
      throw new ConvexError({
        code: FAMILY_NAMING_ERROR_CODE.NAME_ALREADY_SUGGESTED,
      })
    }

    const now = Date.now()
    await ctx.db.patch(id, {
      familyNameShortlist: [
        ...shortlist,
        {
          name: parsed.data.name,
          rationale: CUSTOM_FAMILY_NAME_RATIONALE,
          source: "custom",
        },
      ],
      updatedAt: now,
    })
  },
})

/** Remove a name from the shortlist; clears favourite if it matched. */
export const removeFromFamilyShortlist = mutation({
  args: { catId: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NOT_AUTHENTICATED })
    }
    const id = ctx.db.normalizeId("cats", args.catId)
    if (id === null) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NOT_FOUND })
    }
    const cat = await getOwnedCatOrThrow(ctx, id, currentUser._id)
    if (cat.ceremonyStep !== "family_curation") {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.STEP_LOCKED })
    }

    const normalized = normalizeFamilyName(args.name)
    const shortlist = shortlistOf(cat).filter(
      (entry) => normalizeFamilyName(entry.name) !== normalized,
    )

    const clearFavourite =
      cat.selectedFamilyName !== undefined &&
      normalizeFamilyName(cat.selectedFamilyName) === normalized

    await ctx.db.patch(id, {
      familyNameShortlist: shortlist,
      ...(clearFavourite
        ? {
            selectedFamilyName: undefined,
            selectedFamilyRationale: undefined,
          }
        : {}),
      updatedAt: Date.now(),
    })
  },
})

const FAMILY_FAVOURITE_PRE_UNLOCK_STEPS = [
  "family_curation",
  "family_preview",
  "awaiting_payment",
] as const

const FAMILY_FAVOURITE_POST_UNLOCK_STEPS = [
  "naming_cat_world",
  "awaiting_cat_world_names",
  "naming_ineffable",
  "awaiting_ineffable_names",
] as const

function assertCanSetFamilyFavourite(cat: Doc<"cats">): void {
  if (cat.ceremonyStep === "ceremony_complete") {
    throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.STEP_LOCKED })
  }

  const preUnlock = (
    FAMILY_FAVOURITE_PRE_UNLOCK_STEPS as readonly string[]
  ).includes(cat.ceremonyStep)
  const postUnlock = (
    FAMILY_FAVOURITE_POST_UNLOCK_STEPS as readonly string[]
  ).includes(cat.ceremonyStep)

  if (preUnlock) {
    if (cat.ceremonyPaymentId !== undefined) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.STEP_LOCKED })
    }
    return
  }

  if (!postUnlock) {
    throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.STEP_LOCKED })
  }
}

/** Pick favourite from shortlist (changeable until ceremony complete). */
export const setFamilyFavourite = mutation({
  args: { catId: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NOT_AUTHENTICATED })
    }
    const id = ctx.db.normalizeId("cats", args.catId)
    if (id === null) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NOT_FOUND })
    }
    const cat = await getOwnedCatOrThrow(ctx, id, currentUser._id)
    assertCanSetFamilyFavourite(cat)

    const parsed = setFamilyFavouriteSchema.safeParse({ name: args.name })
    if (!parsed.success) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NAME_NOT_IN_SHORTLIST })
    }

    const entry = shortlistOf(cat).find(
      (item) =>
        normalizeFamilyName(item.name) === normalizeFamilyName(parsed.data.name),
    )
    if (entry === undefined) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NAME_NOT_IN_SHORTLIST })
    }

    await ctx.db.patch(id, {
      selectedFamilyName: entry.name,
      selectedFamilyRationale: entry.rationale,
      updatedAt: Date.now(),
    })
  },
})

/** Optional style update + one regeneration (KB-013: counter only on success). */
export const regenerateFamilyNames = mutation({
  args: { catId: v.string(), styleIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NOT_AUTHENTICATED })
    }
    const id = ctx.db.normalizeId("cats", args.catId)
    if (id === null) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NOT_FOUND })
    }
    const cat = await getOwnedCatOrThrow(ctx, id, currentUser._id)
    if (cat.ceremonyStep !== "family_curation") {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.STEP_LOCKED })
    }
    if (regenUsed(cat) >= MAX_FAMILY_NAME_REGENERATIONS) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.REGEN_EXHAUSTED })
    }

    const parsed = regenerateFamilyNamesSchema.safeParse({
      styleIds: args.styleIds,
    })
    if (!parsed.success) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.INVALID_STYLES })
    }

    const resolvedStyles = resolveStyleSelection(parsed.data.styleIds)
    const now = Date.now()

    await ctx.db.patch(id, {
      familyNameStyles: resolvedStyles,
      ceremonyStep: "awaiting_family_names",
      familyNameGenerationError: undefined,
      updatedAt: now,
    })

    await scheduleFamilyGeneration(ctx, id, 1)
  },
})

/** Retry first-batch or regen generation after failure. */
export const retryFamilyNameGeneration = mutation({
  args: { catId: v.string() },
  handler: async (ctx, { catId }) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NOT_AUTHENTICATED })
    }
    const id = ctx.db.normalizeId("cats", catId)
    if (id === null) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NOT_FOUND })
    }
    const cat = await getOwnedCatOrThrow(ctx, id, currentUser._id)
    if (cat.ceremonyStep !== "awaiting_family_names") {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.STEP_LOCKED })
    }
    if (cat.familyNameGenerationError === undefined) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.GENERATION_IN_PROGRESS })
    }

    const latest = await latestFamilyGeneration(ctx, id)
    const generationIndex =
      latest === null ? 0 : Math.min(latest.generationIndex + 1, 1)

    await ctx.db.patch(id, {
      familyNameGenerationError: undefined,
      updatedAt: Date.now(),
    })

    await scheduleFamilyGeneration(ctx, id, generationIndex)
  },
})

/** Advance to unlock step when favourite is chosen (KB-007 entry). */
export const beginUnlock = mutation({
  args: { catId: v.string() },
  handler: async (ctx, { catId }) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NOT_AUTHENTICATED })
    }
    const id = ctx.db.normalizeId("cats", catId)
    if (id === null) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NOT_FOUND })
    }
    const cat = await getOwnedCatOrThrow(ctx, id, currentUser._id)
    if (
      cat.ceremonyStep !== "family_curation" &&
      cat.ceremonyStep !== "family_preview"
    ) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.STEP_LOCKED })
    }
    if (
      cat.selectedFamilyName === undefined ||
      cat.selectedFamilyRationale === undefined
    ) {
      throw new ConvexError({ code: FAMILY_NAMING_ERROR_CODE.NO_FAVOURITE })
    }

    const now = Date.now()
    await ctx.db.patch(id, {
      ceremonyStep: "awaiting_payment",
      updatedAt: now,
    })

    await ctx.db.insert("funnel_events", {
      userId: currentUser._id,
      catId: id,
      step: "unlock_started",
      occurredAt: now,
    })
  },
})

export const applyFamilyNameGenerationSuccess = internalMutation({
  args: {
    catId: v.id("cats"),
    generationIndex: v.number(),
    styleHints: v.array(v.string()),
    names: v.array(
      v.object({
        name: v.string(),
        rationale: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const cat = await ctx.db.get(args.catId)
    if (cat === null || cat.ceremonyStep !== "awaiting_family_names") {
      return
    }

    const now = Date.now()
    await ctx.db.insert("cat_name_generations", {
      catId: args.catId,
      stage: "family",
      generationIndex: args.generationIndex,
      styleHints: args.styleHints,
      names: args.names,
      createdAt: now,
    })

    const patch: Partial<Doc<"cats">> = {
      ceremonyStep: "family_curation",
      familyNameGenerationError: undefined,
      updatedAt: now,
    }

    if (args.generationIndex === 1) {
      patch.familyNameRegenerationsUsed = (cat.familyNameRegenerationsUsed ?? 0) + 1
    }

    await ctx.db.patch(args.catId, patch)

    await ctx.db.insert("funnel_events", {
      userId: cat.userId,
      catId: args.catId,
      step: "family_names_generated",
      occurredAt: now,
      meta: { generationIndex: String(args.generationIndex) },
    })
  },
})

export const applyFamilyNameGenerationFailure = internalMutation({
  args: {
    catId: v.id("cats"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const cat = await ctx.db.get(args.catId)
    if (cat === null || cat.ceremonyStep !== "awaiting_family_names") {
      return
    }
    await ctx.db.patch(args.catId, {
      familyNameGenerationError: args.errorMessage,
      updatedAt: Date.now(),
    })
  },
})

/** Validate style ids at runtime for internal pipeline reads. */
export function assertFamilyNameStyleIds(
  styleIds: readonly string[],
): FamilyNameStyleId[] {
  const valid = new Set<string>(FAMILY_NAME_STYLE_IDS)
  return styleIds.filter((id): id is FamilyNameStyleId => valid.has(id))
}
