import type { Doc, Id } from "../_generated/dataModel"
import type { MutationCtx } from "../_generated/server"

/** Best-effort storage cleanup; deletion still succeeds if the blob is already gone. */
export async function deleteStorageIfPresent(
  ctx: MutationCtx,
  storageId: Id<"_storage">,
): Promise<void> {
  try {
    await ctx.storage.delete(storageId)
  } catch {
    // Orphaned or missing file references should not block ceremony removal.
  }
}

/**
 * Deletes one ceremony and all related rows + storage blobs.
 * Caller must already have verified ownership / authorization.
 */
export async function deleteCeremonyData(
  ctx: MutationCtx,
  cat: Doc<"cats">,
): Promise<void> {
  const catId = cat._id

  const summaryVersions = await ctx.db
    .query("cat_summary_versions")
    .withIndex("by_catId_versionNumber", (q) => q.eq("catId", catId))
    .collect()
  for (const version of summaryVersions) {
    if (version.summaryImageStorageId !== undefined) {
      await deleteStorageIfPresent(ctx, version.summaryImageStorageId)
    }
    await ctx.db.delete(version._id)
  }

  const nameGenerations = await ctx.db
    .query("cat_name_generations")
    .withIndex("by_catId_stage_generationIndex", (q) => q.eq("catId", catId))
    .collect()
  for (const generation of nameGenerations) {
    await ctx.db.delete(generation._id)
  }

  const worldNameClaims = await ctx.db
    .query("cat_world_name_claims")
    .withIndex("by_catId", (q) => q.eq("catId", catId))
    .collect()
  for (const claim of worldNameClaims) {
    await ctx.db.delete(claim._id)
  }

  const payments = await ctx.db
    .query("cat_payments")
    .withIndex("by_catId", (q) => q.eq("catId", catId))
    .collect()
  for (const payment of payments) {
    await ctx.db.delete(payment._id)
  }

  const certificates = await ctx.db
    .query("certificates")
    .withIndex("by_catId", (q) => q.eq("catId", catId))
    .collect()
  for (const certificate of certificates) {
    await deleteStorageIfPresent(ctx, certificate.certificateStorageId)
    await ctx.db.delete(certificate._id)
  }

  const funnelEvents = await ctx.db
    .query("funnel_events")
    .withIndex("by_catId_occurredAt", (q) => q.eq("catId", catId))
    .collect()
  for (const event of funnelEvents) {
    await ctx.db.delete(event._id)
  }

  const uploads = await ctx.db
    .query("user_uploads")
    .withIndex("by_catId_purpose", (q) => q.eq("catId", catId))
    .collect()
  for (const upload of uploads) {
    await ctx.db.delete(upload._id)
  }

  if (cat.photoStorageId !== undefined) {
    await deleteStorageIfPresent(ctx, cat.photoStorageId)
  }
  if (cat.certificateStorageId !== undefined) {
    await deleteStorageIfPresent(ctx, cat.certificateStorageId)
  }

  await ctx.db.delete(catId)
}
