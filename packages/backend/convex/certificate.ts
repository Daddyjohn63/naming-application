/**
 * KB-011 — certificate completion (pre-certificate everyday-name edit + ceremony_complete).
 *
 * The certificate itself is rendered client-side (HTML → PNG → PDF). The client
 * uploads the final PDF to Convex storage, then calls `completeCeremony` with the
 * storage id. Completion is final: name mutations across all stages already refuse
 * `ceremony_complete`.
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
import { mutation } from "./_generated/server"
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
 * Marks the ceremony complete after the client generated + downloaded the PDF
 * and uploaded it to storage. Idempotent: a repeat call on a completed ceremony
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
