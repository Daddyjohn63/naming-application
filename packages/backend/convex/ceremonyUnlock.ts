/**
 * KB-007 — stub ceremony unlock (no charge; writes cat_payments + advances to cat-world).
 *
 * Production will add Stripe (KB-007A) writing the same cat_payments row shape.
 * Unlock is required before any catWorldNaming / ineffableNaming mutation runs.
 */

import { ConvexError, v } from "convex/values"

import { CEREMONY_UNLOCK_AMOUNT_MINOR_USD } from "@workspace/shared/constants/naming-curation"
import { STAGED_NAMING_ERROR_CODE } from "@workspace/shared/constants/staged-naming-errors"

import { beginCatWorldGenerationIfNeeded } from "./lib/beginCatWorldGeneration"
import { enforceRateLimit } from "./lib/rateLimiter"
import { isStubUnlockAllowedOnDeployment } from "./lib/stubUnlock"
import { mutation } from "./_generated/server"
import { getCurrentUser } from "./users"

export const completeStubUnlock = mutation({
  args: { catId: v.string() },
  returns: v.null(),
  handler: async (ctx, { catId }) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      throw new ConvexError({
        code: STAGED_NAMING_ERROR_CODE.NOT_AUTHENTICATED,
      })
    }
    await enforceRateLimit(ctx, "completeStubUnlock", currentUser._id)

    const id = ctx.db.normalizeId("cats", catId)
    if (id === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_FOUND })
    }

    const cat = await ctx.db.get(id)
    if (cat === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_FOUND })
    }
    if (cat.userId !== currentUser._id) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_OWNER })
    }
    if (cat.ceremonyStep !== "awaiting_payment") {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.STEP_LOCKED })
    }
    if (
      cat.selectedFamilyName === undefined ||
      cat.selectedFamilyRationale === undefined
    ) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NO_FAVOURITE })
    }
    if (cat.ceremonyPaymentId !== undefined) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.STEP_LOCKED })
    }
    if (!isStubUnlockAllowedOnDeployment()) {
      throw new ConvexError({
        code: STAGED_NAMING_ERROR_CODE.STUB_UNLOCK_DISABLED,
      })
    }

    const now = Date.now()
    const paymentId = await ctx.db.insert("cat_payments", {
      userId: currentUser._id,
      catId: id,
      provider: "stub",
      amountMinorUnits: CEREMONY_UNLOCK_AMOUNT_MINOR_USD,
      currency: "usd",
      status: "succeeded",
      createdAt: now,
      updatedAt: now,
    })

    await ctx.db.patch(id, {
      ceremonyPaymentId: paymentId,
      updatedAt: now,
    })

    await beginCatWorldGenerationIfNeeded(ctx, id)

    await ctx.db.insert("funnel_events", {
      userId: currentUser._id,
      catId: id,
      step: "payment_succeeded",
      occurredAt: now,
      meta: { provider: "stub" },
    })

    return null
  },
})
