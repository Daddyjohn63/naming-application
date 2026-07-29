import { UserJSON } from "@clerk/backend"
import { v, Validator } from "convex/values"

import { internal } from "./_generated/api"
import { internalMutation, query, QueryCtx } from "./_generated/server"
import { deleteCeremonyData } from "./lib/deleteCeremony"

/** Cats purged per batch — each ceremony deletes many related rows + blobs. */
const CATS_PER_PURGE_BATCH = 3
/** Funnel events purged per batch after ceremonies are gone. */
const FUNNEL_EVENTS_PER_PURGE_BATCH = 100

//get all users
// export const getUsers = query({
//   args: {},
//   handler: async (ctx) => {
//     return await ctx.db.query("users").collect()
//   },
// })

//get recent users
// export const getRecentUsers = query({
//   args: {},
//   handler: async (ctx) => {
//     return await ctx.db.query("users").order("desc").take(5)
//   },
// })

//get current user
export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx)
  },
})

//upsert user from Clerk
export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> },
  async handler(ctx, { data }) {
    const now = Date.now()
    const primaryEmail =
      data.email_addresses?.find((e) => e.id === data.primary_email_address_id)
        ?.email_address ??
      data.email_addresses?.[0]?.email_address ??
      ""

    const publicMetadata = data.public_metadata as
      | { role?: unknown }
      | null
      | undefined
    const privateMetadata = data.private_metadata as
      | { role?: unknown }
      | null
      | undefined
    // Prefer public (canonical for this feature); accept private if ops set it there by mistake.
    const role =
      publicMetadata?.role === "admin" || privateMetadata?.role === "admin"
        ? ("admin" as const)
        : ("user" as const)

    const userAttributes = {
      email: primaryEmail,
      clerkUserId: data.id,
      firstName: data.first_name ?? undefined,
      lastName: data.last_name ?? undefined,
      imageUrl: data.image_url ?? undefined,
      /** Mirrored from Clerk metadata; source of truth for Convex admin checks. */
      role,
    }

    const user = await userByClerkUserId(ctx, data.id)

    if (user === null) {
      await ctx.db.insert("users", {
        ...userAttributes,
        createdAt: now,
        updatedAt: now,
      })
    } else {
      await ctx.db.patch(user._id, {
        ...userAttributes,
        updatedAt: now,
      })
    }
  },
})

/**
 * Clerk `user.deleted` entry point (SECURITY.md M2).
 * Schedules batched cascade so the webhook stays within mutation limits.
 */
export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  returns: v.null(),
  async handler(ctx, { clerkUserId }) {
    const user = await userByClerkUserId(ctx, clerkUserId)

    if (user === null) {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
      )
      return null
    }

    await ctx.scheduler.runAfter(0, internal.users.purgeUserDataBatch, {
      userId: user._id,
    })
    return null
  },
})

/** Apply a role mirrored from Clerk (webhook or syncMyRoleFromClerk action). */
export const patchMyRole = internalMutation({
  args: {
    clerkUserId: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  returns: v.null(),
  async handler(ctx, { clerkUserId, role }) {
    const user = await userByClerkUserId(ctx, clerkUserId)
    if (user === null) {
      throw new Error("User not found")
    }
    if (user.role !== role) {
      await ctx.db.patch(user._id, {
        role,
        updatedAt: Date.now(),
      })
    }
    return null
  },
})

/**
 * Deletes the user's ceremonies (related tables + storage), leftover user-scoped
 * rows, then the `users` document. Re-schedules itself until finished.
 */
export const purgeUserDataBatch = internalMutation({
  args: { userId: v.id("users") },
  returns: v.null(),
  async handler(ctx, { userId }) {
    const user = await ctx.db.get(userId)
    if (user === null) {
      return null
    }

    const cats = await ctx.db
      .query("cats")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .take(CATS_PER_PURGE_BATCH)

    for (const cat of cats) {
      await deleteCeremonyData(ctx, cat)
    }

    if (cats.length === CATS_PER_PURGE_BATCH) {
      await ctx.scheduler.runAfter(0, internal.users.purgeUserDataBatch, {
        userId,
      })
      return null
    }

    // Orphan payments not tied to a remaining cat (should be rare after cat purge).
    const payments = await ctx.db
      .query("cat_payments")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .collect()
    for (const payment of payments) {
      await ctx.db.delete(payment._id)
    }

    const funnelEvents = await ctx.db
      .query("funnel_events")
      .withIndex("by_userId_occurredAt", (q) => q.eq("userId", userId))
      .take(FUNNEL_EVENTS_PER_PURGE_BATCH)
    for (const event of funnelEvents) {
      await ctx.db.delete(event._id)
    }

    if (funnelEvents.length === FUNNEL_EVENTS_PER_PURGE_BATCH) {
      await ctx.scheduler.runAfter(0, internal.users.purgeUserDataBatch, {
        userId,
      })
      return null
    }

    // Beta reviews: anonymize — keep rating/source/createdAt; strip identity + free text.
    const reviews = await ctx.db
      .query("beta_reviews")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect()
    const anonymizedAt = Date.now()
    for (const review of reviews) {
      await ctx.db.replace(review._id, {
        rating: review.rating,
        body: "",
        source: review.source,
        createdAt: review.createdAt,
        anonymizedAt,
      })
    }

    await ctx.db.delete(userId)
    return null
  },
})

//get current user or throw error
export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx)
  if (!userRecord) throw new Error("Can't get current user")
  return userRecord
}

//get current user
export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (identity === null) {
    return null
  }
  return await userByClerkUserId(ctx, identity.subject)
}

//get user by Clerk user ID
async function userByClerkUserId(ctx: QueryCtx, clerkUserId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
    .unique()
}