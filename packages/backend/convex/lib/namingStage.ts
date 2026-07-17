/**
 * Shared helpers for cat-world and ineffable naming stages (KB-009 / KB-010).
 *
 * Family naming (KB-006) keeps its own helpers in `familyNaming.ts` because it
 * has style pickers. Cat-world and ineffable share identical shortlist/regen
 * rules, so logic lives here and both `catWorldNaming.ts` and
 * `ineffableNaming.ts` call into this module.
 *
 * Key concepts:
 * - `curationStepForStage` / `awaitingStepForStage` — the two substeps per stage
 * - `canEditStageCuration` — shortlist add/remove while curating; locks once ineffable favourite is set
 * - Regen counter increments only in `apply*GenerationSuccess` when generationIndex === 1
 */

import { ConvexError } from "convex/values"

import {
  MAX_NAME_REGENERATIONS,
  MAX_SHORTLIST_TOTAL,
  normalizeNameForDedupe,
} from "@workspace/shared/constants/naming-curation"
import { STAGED_NAMING_ERROR_CODE } from "@workspace/shared/constants/staged-naming-errors"
import {
  addShortlistEntrySchema,
  setStageFavouriteSchema,
} from "@workspace/shared/schemas/staged-naming"

import type { Doc, Id } from "../_generated/dataModel"
import type { MutationCtx, QueryCtx } from "../_generated/server"

export type ShortlistEntry = { name: string; rationale: string }
export type NamingStage = "cat_world" | "ineffable"

type StageCatFields = Pick<
  Doc<"cats">,
  | "catWorldNameShortlist"
  | "catWorldNameRegenerationsUsed"
  | "selectedCatWorldName"
  | "selectedCatWorldRationale"
  | "ineffableNameShortlist"
  | "ineffableNameRegenerationsUsed"
  | "selectedIneffableName"
  | "selectedIneffableRationale"
>

export function shortlistForStage(
  cat: StageCatFields,
  stage: NamingStage,
): ShortlistEntry[] {
  if (stage === "cat_world") {
    return cat.catWorldNameShortlist ?? []
  }
  return cat.ineffableNameShortlist ?? []
}

export function regenUsedForStage(cat: StageCatFields, stage: NamingStage): number {
  if (stage === "cat_world") {
    return cat.catWorldNameRegenerationsUsed ?? 0
  }
  return cat.ineffableNameRegenerationsUsed ?? 0
}

export function selectedNameForStage(
  cat: StageCatFields,
  stage: NamingStage,
): { name?: string; rationale?: string } {
  if (stage === "cat_world") {
    return {
      name: cat.selectedCatWorldName,
      rationale: cat.selectedCatWorldRationale,
    }
  }
  return {
    name: cat.selectedIneffableName,
    rationale: cat.selectedIneffableRationale,
  }
}

/** Map stage slug to the step where the user curates (batch visible, shortlist active). */
export function curationStepForStage(stage: NamingStage): Doc<"cats">["ceremonyStep"] {
  return stage === "cat_world" ? "naming_cat_world" : "naming_ineffable"
}

/** Map stage slug to the async substep while the OpenAI action runs. */
export function awaitingStepForStage(stage: NamingStage): Doc<"cats">["ceremonyStep"] {
  return stage === "cat_world" ? "awaiting_cat_world_names" : "awaiting_ineffable_names"
}

export type NameGenerationStage = NamingStage | "family"

type GenerationRow = {
  generationIndex: number
  names: Array<{ name: string; rationale: string }>
}

export async function allGenerationsForCat(
  ctx: QueryCtx | MutationCtx,
  catId: Id<"cats">,
  stage: NameGenerationStage,
): Promise<GenerationRow[]> {
  const generations = await ctx.db
    .query("cat_name_generations")
    .withIndex("by_catId_stage_generationIndex", (q) =>
      q.eq("catId", catId).eq("stage", stage),
    )
    .collect()
  return generations.sort((a, b) => a.generationIndex - b.generationIndex)
}

export function findNameInGenerations(
  generations: readonly GenerationRow[],
  rawName: string,
  normalize: (name: string) => string,
): { generation: GenerationRow; entry: { name: string; rationale: string } } | null {
  const normalized = normalize(rawName)
  for (const generation of generations) {
    const entry = generation.names.find(
      (candidate) => normalize(candidate.name) === normalized,
    )
    if (entry !== undefined) {
      return { generation, entry }
    }
  }
  return null
}

export async function latestGenerationForStage(
  ctx: QueryCtx | MutationCtx,
  catId: Id<"cats">,
  stage: NamingStage,
) {
  return await ctx.db
    .query("cat_name_generations")
    .withIndex("by_catId_stage_generationIndex", (q) =>
      q.eq("catId", catId).eq("stage", stage),
    )
    .order("desc")
    .first()
}

export async function excludedNamesForStage(
  ctx: QueryCtx | MutationCtx,
  catId: Id<"cats">,
  cat: StageCatFields,
  stage: NamingStage,
): Promise<string[]> {
  const excluded = new Set<string>()
  for (const entry of shortlistForStage(cat, stage)) {
    excluded.add(entry.name)
  }
  const generations = await ctx.db
    .query("cat_name_generations")
    .withIndex("by_catId_stage_generationIndex", (q) =>
      q.eq("catId", catId).eq("stage", stage),
    )
    .collect()
  for (const generation of generations) {
    for (const { name } of generation.names) {
      excluded.add(name)
    }
  }
  return [...excluded]
}

export function generatedBatchesFromGenerations(
  generations: readonly GenerationRow[],
): Array<{
  generationIndex: number
  names: Array<{ name: string; rationale: string }>
}> | null {
  if (generations.length === 0) {
    return null
  }
  return generations.map((batch) => ({
    generationIndex: batch.generationIndex,
    names: batch.names,
  }))
}

export async function acceptedSummaryText(
  ctx: QueryCtx | MutationCtx,
  cat: Doc<"cats">,
): Promise<string | null> {
  if (cat.acceptedSummaryVersionId === undefined) {
    return null
  }
  const version = await ctx.db.get(cat.acceptedSummaryVersionId)
  return version?.summaryText ?? null
}

/**
 * Whether the owner may add/remove shortlist entries for this stage.
 * Favourite switching among an existing shortlist is handled separately via
 * `setStageFavouriteFromShortlist` / `set*Favourite` mutations.
 *
 * Once an ineffable favourite is chosen, shortlists lock until certificate —
 * users may still change favourites from shortlist chips, not rebuild lists.
 */
export function canEditStageCuration(
  cat: Doc<"cats">,
  stage: NamingStage,
): boolean {
  if (cat.ceremonyStep === "ceremony_complete") {
    return false
  }
  if (cat.selectedIneffableName !== undefined) {
    return false
  }
  const curationStep = curationStepForStage(stage)
  const awaitingStep = awaitingStepForStage(stage)
  if (cat.ceremonyStep === curationStep || cat.ceremonyStep === awaitingStep) {
    return true
  }
  if (stage === "cat_world") {
    return (
      cat.ceremonyStep === "naming_ineffable" ||
      cat.ceremonyStep === "awaiting_ineffable_names"
    )
  }
  return false
}

export function assertCanCurateStage(
  cat: Doc<"cats">,
  stage: NamingStage,
): void {
  if (!canEditStageCuration(cat, stage)) {
    throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.STEP_LOCKED })
  }
}

export async function addToStageShortlist(
  ctx: MutationCtx,
  cat: Doc<"cats">,
  stage: NamingStage,
  rawName: string,
): Promise<void> {
  assertCanCurateStage(cat, stage)

  const parsed = addShortlistEntrySchema.safeParse({ name: rawName })
  if (!parsed.success) {
    throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NAME_NOT_IN_BATCH })
  }

  const generations = await allGenerationsForCat(ctx, cat._id, stage)
  if (generations.length === 0) {
    throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.BATCH_NOT_READY })
  }

  const match = findNameInGenerations(
    generations,
    parsed.data.name,
    normalizeNameForDedupe,
  )
  if (match === null) {
    throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NAME_NOT_IN_BATCH })
  }

  const { entry: batchEntry } = match

  const shortlist = shortlistForStage(cat, stage)
  if (shortlist.length >= MAX_SHORTLIST_TOTAL) {
    throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.SHORTLIST_FULL })
  }

  const normalized = normalizeNameForDedupe(batchEntry.name)
  if (shortlist.some((entry) => normalizeNameForDedupe(entry.name) === normalized)) {
    throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.DUPLICATE_NAME })
  }

  const field =
    stage === "cat_world" ? "catWorldNameShortlist" : "ineffableNameShortlist"

  await ctx.db.patch(cat._id, {
    [field]: [
      ...shortlist,
      { name: batchEntry.name, rationale: batchEntry.rationale },
    ],
    updatedAt: Date.now(),
  })
}

export async function removeFromStageShortlist(
  ctx: MutationCtx,
  cat: Doc<"cats">,
  stage: NamingStage,
  rawName: string,
): Promise<void> {
  assertCanCurateStage(cat, stage)
  if (cat.ceremonyStep !== curationStepForStage(stage)) {
    const batch = await latestGenerationForStage(ctx, cat._id, stage)
    if (batch === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.STEP_LOCKED })
    }
  }

  const normalized = normalizeNameForDedupe(rawName)
  const shortlist = shortlistForStage(cat, stage).filter(
    (entry) => normalizeNameForDedupe(entry.name) !== normalized,
  )

  const selected = selectedNameForStage(cat, stage)
  const clearFavourite =
    selected.name !== undefined &&
    normalizeNameForDedupe(selected.name) === normalized

  const patch: Partial<Doc<"cats">> = {
    updatedAt: Date.now(),
  }

  if (stage === "cat_world") {
    patch.catWorldNameShortlist = shortlist
    if (clearFavourite) {
      patch.selectedCatWorldName = undefined
      patch.selectedCatWorldRationale = undefined
    }
  } else {
    patch.ineffableNameShortlist = shortlist
    if (clearFavourite) {
      patch.selectedIneffableName = undefined
      patch.selectedIneffableRationale = undefined
    }
  }

  await ctx.db.patch(cat._id, patch)
}

export async function setStageFavouriteFromShortlist(
  ctx: MutationCtx,
  cat: Doc<"cats">,
  stage: NamingStage,
  rawName: string,
  options?: { allowAfterAdvance?: boolean },
): Promise<ShortlistEntry> {
  const curationStep = curationStepForStage(stage)
  const awaitingStep = awaitingStepForStage(stage)
  const allowRevisit = options?.allowAfterAdvance ?? false

  const allowedSteps: Doc<"cats">["ceremonyStep"][] = allowRevisit
    ? [
        curationStep,
        awaitingStep,
        "naming_ineffable",
        "awaiting_ineffable_names",
      ]
    : [curationStep, awaitingStep, "awaiting_ineffable_names"]

  if (!allowedSteps.includes(cat.ceremonyStep)) {
    throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.STEP_LOCKED })
  }

  const parsed = setStageFavouriteSchema.safeParse({ name: rawName })
  if (!parsed.success) {
    throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NAME_NOT_IN_SHORTLIST })
  }

  const entry = shortlistForStage(cat, stage).find(
    (item) =>
      normalizeNameForDedupe(item.name) ===
      normalizeNameForDedupe(parsed.data.name),
  )
  if (entry === undefined) {
    throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NAME_NOT_IN_SHORTLIST })
  }

  return entry
}

export function assertRegenAvailable(cat: Doc<"cats">, stage: NamingStage): void {
  if (regenUsedForStage(cat, stage) >= MAX_NAME_REGENERATIONS) {
    throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.REGEN_EXHAUSTED })
  }
}

export function allThreeNamesChosen(cat: Doc<"cats">): boolean {
  return (
    cat.selectedFamilyName !== undefined &&
    cat.selectedFamilyRationale !== undefined &&
    cat.selectedCatWorldName !== undefined &&
    cat.selectedCatWorldRationale !== undefined &&
    cat.selectedIneffableName !== undefined &&
    cat.selectedIneffableRationale !== undefined
  )
}
