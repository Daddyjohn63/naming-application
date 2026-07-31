import { ConvexError } from "convex/values"
import { CAT_CEREMONY_ERROR_CODE } from "@workspace/shared/constants/cat-ceremony-errors"
import {
  MAX_STANDARD_USER_CAT_CEREMONIES,
  isCatCeremonyLimitEnforced,
} from "@workspace/shared/constants/cat-ceremony-limits"

import type { Doc, Id } from "../_generated/dataModel"
import type { MutationCtx, QueryCtx } from "../_generated/server"
import { isAdminRole } from "./admin"

/** Whether the lifetime create cap is enforced on this Convex deployment. */
export function isCatCeremonyLimitAllowedOnDeployment(): boolean {
  return isCatCeremonyLimitEnforced(process.env.ENFORCE_CAT_CEREMONY_LIMIT)
}

async function countOwnedCats(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<number> {
  const cats = await ctx.db
    .query("cats")
    .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
    .collect()
  return cats.length
}

/**
 * Lifetime creates from the durable counter only.
 * Missing field → `0` until `ensureLifetimeCatCeremonyCreates` (or a successful create) initializes it.
 * Do not derive quota from current `cats` rows — deletes would free slots.
 */
export function resolveLifetimeCatCeremonyCreates(user: Doc<"users">): number {
  return user.catsCreatedTotal ?? 0
}

/**
 * Persist a lifetime baseline for existing users who predate the counter.
 * Uses current owned-cat count only once, then stores it on the user.
 * Call in its own mutation (must commit before a create that may throw).
 */
export async function ensureLifetimeCatCeremonyCreates(
  ctx: MutationCtx,
  user: Doc<"users">,
): Promise<number> {
  if (user.catsCreatedTotal !== undefined) {
    return user.catsCreatedTotal
  }

  const baseline = await countOwnedCats(ctx, user._id)
  await ctx.db.patch(user._id, {
    catsCreatedTotal: baseline,
    updatedAt: Date.now(),
  })
  return baseline
}

/**
 * Assert the lifetime cap (when enforced + non-admin) and increment
 * `users.catsCreatedTotal`. Call in the same mutation as the cat insert.
 * Deleting a ceremony must not reverse this increment.
 *
 * Prefer running `ensureLifetimeCatCeremonyCreates` in a prior committed
 * mutation so existing users get a durable baseline before deletes can
 * undercount. If the field is still missing, bootstrap from owned cats
 * only for this successful create path (same transaction as the insert).
 */
export async function consumeCatCeremonyCreateSlot(
  ctx: MutationCtx,
  user: Doc<"users">,
): Promise<void> {
  const used =
    user.catsCreatedTotal !== undefined
      ? user.catsCreatedTotal
      : await countOwnedCats(ctx, user._id)
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
