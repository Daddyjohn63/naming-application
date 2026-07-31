import { ConvexError } from "convex/values"
import { CAT_CEREMONY_ERROR_CODE } from "@workspace/shared/constants/cat-ceremony-errors"
import {
  MAX_STANDARD_USER_CAT_CEREMONIES,
  isCatCeremonyLimitEnforced,
} from "@workspace/shared/constants/cat-ceremony-limits"

import type { Doc } from "../_generated/dataModel"
import type { MutationCtx, QueryCtx } from "../_generated/server"
import { isAdminRole } from "./admin"

/** Whether the lifetime create cap is enforced on this Convex deployment. */
export function isCatCeremonyLimitAllowedOnDeployment(): boolean {
  return isCatCeremonyLimitEnforced(process.env.ENFORCE_CAT_CEREMONY_LIMIT)
}

/**
 * Lifetime creates for entitlement / guards.
 * Prefers `users.catsCreatedTotal`; falls back to current cat count when unset.
 */
export async function resolveLifetimeCatCeremonyCreates(
  ctx: QueryCtx | MutationCtx,
  user: Doc<"users">,
): Promise<number> {
  if (user.catsCreatedTotal !== undefined) {
    return user.catsCreatedTotal
  }

  const cats = await ctx.db
    .query("cats")
    .withIndex("by_userId_createdAt", (q) => q.eq("userId", user._id))
    .collect()
  return cats.length
}

/**
 * Assert the lifetime cap (when enforced + non-admin) and increment
 * `users.catsCreatedTotal`. Call in the same mutation as the cat insert.
 * Deleting a ceremony must not reverse this increment.
 */
export async function consumeCatCeremonyCreateSlot(
  ctx: MutationCtx,
  user: Doc<"users">,
): Promise<void> {
  const used = await resolveLifetimeCatCeremonyCreates(ctx, user)
  const enforced = isCatCeremonyLimitAllowedOnDeployment()

  if (
    enforced &&
    !isAdminRole(user) &&
    used >= MAX_STANDARD_USER_CAT_CEREMONIES
  ) {
    throw new ConvexError({ code: CAT_CEREMONY_ERROR_CODE.LIMIT_REACHED })
  }

  await ctx.db.patch(user._id, {
    catsCreatedTotal: used + 1,
    updatedAt: Date.now(),
  })
}
