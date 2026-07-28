/**
 * KB-011 — certificate completion (pre-certificate everyday-name edit + ceremony_complete).
 *
 * The certificate itself is rendered client-side (HTML → PNG → PDF). The client
 * mints a purpose-bound upload URL, uploads the PDF, registers it on the upload
 * ledger (with PDF validation), then calls `completeCeremony`.
 */

import { ConvexError, v } from "convex/values"

import {
  CUSTOM_FAMILY_NAME_RATIONALE,
  normalizeFamilyName,
} from "@workspace/shared/constants/family-naming"
import { STAGED_NAMING_ERROR_CODE } from "@workspace/shared/constants/staged-naming-errors"
import { setFamilyFavouriteSchema } from "@workspace/shared/schemas/family-naming"

import type { Doc, Id } from "./_generated/dataModel"
import type { MutationCtx } from "./_generated/server"
import { internalMutation, mutation } from "./_generated/server"
import { enforceRateLimit } from "./lib/rateLimiter"
import { allThreeNamesChosen } from "./lib/namingStage"
import { getCurrentUser } from "./users"

async function getOwnedCatOrThrow(
  ctx: MutationCtx,
  catId: Id<"cats">,
  userId: Id<"users">,
): Promise<Doc<"cats">> {
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

async function assertReadyForCertificate(
  ctx: MutationCtx,
  catIdArg: string,
  userId: Id<"users">,
): Promise<{ cat: Doc<"cats">; catId: Id<"cats"> }> {
  const catId = ctx.db.normalizeId("cats", catIdArg)
  if (catId === null) {
    throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_FOUND })
  }
  const cat = await getOwnedCatOrThrow(ctx, catId, userId)
  assertUnlocked(cat)
  if (cat.ceremonyStep === "ceremony_complete") {
    throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.STEP_LOCKED })
  }
  if (!allThreeNamesChosen(cat)) {
    throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NO_FAVOURITE })
  }
  return { cat, catId }
}

/**
 * Free-text rename of the everyday (family) name before certificate generation.
 * If the new name matches a shortlist entry we keep that entry's AI rationale;
 * otherwise the custom-name rationale is stored.
 */
export const updateEverydayName = mutation({
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
    if (!allThreeNamesChosen(cat)) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NO_FAVOURITE })
    }

    const parsed = setFamilyFavouriteSchema.safeParse({ name: args.name })
    if (!parsed.success) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NAME_NOT_IN_SHORTLIST })
    }
    const name = parsed.data.name

    const shortlistEntry = (cat.familyNameShortlist ?? []).find(
      (entry) => normalizeFamilyName(entry.name) === normalizeFamilyName(name),
    )

    await ctx.db.patch(id, {
      selectedFamilyName: name,
      selectedFamilyRationale:
        shortlistEntry?.rationale ?? CUSTOM_FAMILY_NAME_RATIONALE,
      updatedAt: Date.now(),
    })
    return null
  },
})

/**
 * Mint a storage upload URL for this ceremony's certificate PDF (SECURITY.md M3).
 * Prefer this over the generic `cats.generateUploadUrl` for certificate uploads.
 */
export const generateCertificateUploadUrl = mutation({
  args: { catId: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_AUTHENTICATED })
    }
    await assertReadyForCertificate(ctx, args.catId, currentUser._id)
    await enforceRateLimit(ctx, "generateUploadUrl", currentUser._id)
    return await ctx.storage.generateUploadUrl()
  },
})

/**
 * Records a validated certificate PDF on the upload ledger (called from the
 * register action after magic-byte / size checks).
 */
export const recordCertificateUpload = internalMutation({
  args: {
    userId: v.id("users"),
    catId: v.id("cats"),
    storageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const cat = await getOwnedCatOrThrow(ctx, args.catId, args.userId)
    assertUnlocked(cat)
    if (cat.ceremonyStep === "ceremony_complete") {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.STEP_LOCKED })
    }
    if (!allThreeNamesChosen(cat)) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NO_FAVOURITE })
    }

    const existingForStorage = await ctx.db
      .query("user_uploads")
      .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
      .unique()

    if (existingForStorage !== null) {
      if (
        existingForStorage.userId !== args.userId ||
        existingForStorage.catId !== args.catId ||
        existingForStorage.purpose !== "certificate"
      ) {
        throw new ConvexError({
          code: STAGED_NAMING_ERROR_CODE.CERTIFICATE_STORAGE_IN_USE,
        })
      }
      return null
    }

    const previousForCat = await ctx.db
      .query("user_uploads")
      .withIndex("by_catId_purpose", (q) =>
        q.eq("catId", args.catId).eq("purpose", "certificate"),
      )
      .collect()
    for (const previous of previousForCat) {
      await ctx.db.delete(previous._id)
    }

    await ctx.db.insert("user_uploads", {
      userId: args.userId,
      storageId: args.storageId,
      purpose: "certificate",
      catId: args.catId,
      createdAt: Date.now(),
    })
    return null
  },
})

/**
 * Marks the ceremony complete after the client generated + downloaded the PDF
 * and registered the upload. Idempotent: a repeat call on a completed ceremony
 * is a no-op so retries never create duplicate snapshots.
 */
export const completeCeremony = mutation({
  args: {
    catId: v.string(),
    certificateStorageId: v.id("_storage"),
  },
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
      return null
    }
    if (!allThreeNamesChosen(cat)) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NO_FAVOURITE })
    }

    const ledger = await ctx.db
      .query("user_uploads")
      .withIndex("by_storageId", (q) =>
        q.eq("storageId", args.certificateStorageId),
      )
      .unique()

    if (
      ledger === null ||
      ledger.userId !== currentUser._id ||
      ledger.catId !== id ||
      ledger.purpose !== "certificate"
    ) {
      throw new ConvexError({
        code: STAGED_NAMING_ERROR_CODE.CERTIFICATE_STORAGE_UNBOUND,
      })
    }

    const now = Date.now()

    await ctx.db.patch(id, {
      ceremonyStep: "ceremony_complete",
      ceremonyCompletedAt: now,
      certificateStorageId: args.certificateStorageId,
      updatedAt: now,
    })

    await ctx.db.insert("certificates", {
      catId: id,
      userId: currentUser._id,
      certificateStorageId: args.certificateStorageId,
      snapshot: {
        familyName: cat.selectedFamilyName ?? "",
        familyRationale: cat.selectedFamilyRationale ?? "",
        catWorldName: cat.selectedCatWorldName ?? "",
        catWorldRationale: cat.selectedCatWorldRationale ?? "",
        ineffableName: cat.selectedIneffableName ?? "",
        ineffableRationale: cat.selectedIneffableRationale ?? "",
      },
      createdAt: now,
    })

    await ctx.db.insert("funnel_events", {
      userId: currentUser._id,
      catId: id,
      step: "certificate_generated",
      occurredAt: now,
    })

    return null
  },
})
