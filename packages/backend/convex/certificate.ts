/**
 * KB-011 — certificate completion (pre-certificate everyday-name edit + ceremony_complete).
 *
 * The certificate itself is rendered client-side (HTML → PNG → PDF). The client
 * uploads the final PDF to Convex storage, then calls `completeCeremony` with the
 * storage id. Completion is final: name mutations across all stages already refuse
 * `ceremony_complete`.
 *
 * Opt-in public sharing uses an unguessable `certificateShareId` (never the catId).
 */

import { ConvexError, v } from "convex/values"

import {
  CUSTOM_FAMILY_NAME_RATIONALE,
  normalizeFamilyName,
} from "@workspace/shared/constants/family-naming"
import { STAGED_NAMING_ERROR_CODE } from "@workspace/shared/constants/staged-naming-errors"
import { setFamilyFavouriteSchema } from "@workspace/shared/schemas/family-naming"

import type { Doc, Id } from "./_generated/dataModel"
import type { MutationCtx, QueryCtx } from "./_generated/server"
import { mutation, query } from "./_generated/server"
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

/** ~24-char unguessable share token (base64url alphabet). */
function generateCertificateShareId(): string {
  const bytes = new Uint8Array(18)
  crypto.getRandomValues(bytes)
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
  let out = ""
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i]
    if (byte === undefined) {
      continue
    }
    out += alphabet[byte & 63]
  }
  return out
}

const publicCertificateValidator = v.object({
  everydayName: v.string(),
  catWorldName: v.string(),
  ineffableName: v.string(),
  everydayNameRationale: v.string(),
  catWorldNameRationale: v.string(),
  ineffableNameRationale: v.string(),
  summaryText: v.union(v.string(), v.null()),
  photoUrl: v.union(v.string(), v.null()),
  ceremonyCompletedAt: v.union(v.number(), v.null()),
})

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
 * Marks the ceremony complete after the client generated the PDF and uploaded
 * it to storage. Idempotent: a repeat call on a completed ceremony is a no-op
 * so retries never create duplicate snapshots.
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

/**
 * Owner toggle for the public share page. Generates a stable share id on first
 * enable; disabling only clears the flag so the same link works again later.
 */
export const setCertificateSharing = mutation({
  args: {
    catId: v.string(),
    enabled: v.boolean(),
  },
  returns: v.object({
    shareId: v.string(),
    enabled: v.boolean(),
  }),
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
    if (cat.ceremonyStep !== "ceremony_complete") {
      throw new ConvexError({
        code: STAGED_NAMING_ERROR_CODE.CEREMONY_NOT_COMPLETE,
      })
    }

    const shareId = cat.certificateShareId ?? generateCertificateShareId()
    const now = Date.now()
    await ctx.db.patch(id, {
      certificateShareId: shareId,
      certificateShareEnabled: args.enabled,
      updatedAt: now,
    })

    return { shareId, enabled: args.enabled }
  },
})

async function resolvePhotoUrl(
  ctx: QueryCtx,
  storageId: Id<"_storage"> | undefined,
): Promise<string | null> {
  if (storageId === undefined) {
    return null
  }
  const url = (await ctx.storage.getUrl(storageId)) ?? ""
  return url === "" ? null : url
}

/**
 * Public (unauthenticated) certificate payload for `/c/[shareId]`.
 * Returns null when the token is unknown or sharing is off — same empty result
 * either way so callers cannot probe which tokens exist.
 */
export const getPublicCertificate = query({
  args: { shareId: v.string() },
  returns: v.union(publicCertificateValidator, v.null()),
  handler: async (ctx, args) => {
    const trimmed = args.shareId.trim()
    if (trimmed.length === 0) {
      return null
    }

    const cat = await ctx.db
      .query("cats")
      .withIndex("by_certificateShareId", (q) =>
        q.eq("certificateShareId", trimmed),
      )
      .unique()

    if (cat === null || cat.certificateShareEnabled !== true) {
      return null
    }

    const certificate = await ctx.db
      .query("certificates")
      .withIndex("by_catId", (q) => q.eq("catId", cat._id))
      .first()

    const snapshot = certificate?.snapshot
    const everydayName =
      snapshot?.familyName ?? cat.selectedFamilyName ?? ""
    const catWorldName =
      snapshot?.catWorldName ?? cat.selectedCatWorldName ?? ""
    const ineffableName =
      snapshot?.ineffableName ?? cat.selectedIneffableName ?? ""

    if (
      everydayName.length === 0 ||
      catWorldName.length === 0 ||
      ineffableName.length === 0
    ) {
      return null
    }

    let summaryText: string | null = null
    if (cat.acceptedSummaryVersionId !== undefined) {
      const version = await ctx.db.get(cat.acceptedSummaryVersionId)
      if (version !== null) {
        summaryText = version.summaryText
      }
    }

    const photoUrl = await resolvePhotoUrl(ctx, cat.photoStorageId)

    return {
      everydayName,
      catWorldName,
      ineffableName,
      everydayNameRationale:
        snapshot?.familyRationale ?? cat.selectedFamilyRationale ?? "",
      catWorldNameRationale:
        snapshot?.catWorldRationale ?? cat.selectedCatWorldRationale ?? "",
      ineffableNameRationale:
        snapshot?.ineffableRationale ?? cat.selectedIneffableRationale ?? "",
      summaryText,
      photoUrl,
      ceremonyCompletedAt: cat.ceremonyCompletedAt ?? null,
    }
  },
})
