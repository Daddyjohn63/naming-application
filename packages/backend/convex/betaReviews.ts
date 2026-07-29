import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"

import { mutation, query } from "./_generated/server"
import { isAdminRole, requireAdmin } from "./lib/admin"
import { enforceRateLimit } from "./lib/rateLimiter"
import { getCurrentUser, getCurrentUserOrThrow } from "./users"

const MAX_BODY_LENGTH = 2000

const betaReviewSource = v.union(
  v.literal("certificate"),
  v.literal("dashboard"),
)

const betaReviewDoc = v.object({
  _id: v.id("beta_reviews"),
  _creationTime: v.number(),
  userId: v.optional(v.id("users")),
  rating: v.number(),
  body: v.string(),
  catId: v.optional(v.id("cats")),
  source: betaReviewSource,
  createdAt: v.number(),
  anonymizedAt: v.optional(v.number()),
})

const adminReviewDto = v.object({
  _id: v.id("beta_reviews"),
  rating: v.number(),
  body: v.string(),
  catId: v.optional(v.id("cats")),
  source: betaReviewSource,
  createdAt: v.number(),
  anonymized: v.boolean(),
  user: v.object({
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  }),
})

function assertValidRating(rating: number): void {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be an integer between 1 and 5")
  }
}

/**
 * Submit or update the caller's single beta review (one active review per user).
 */
export const submitBetaReview = mutation({
  args: {
    rating: v.number(),
    body: v.string(),
    catId: v.optional(v.id("cats")),
    source: betaReviewSource,
  },
  returns: v.id("beta_reviews"),
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx)
    await enforceRateLimit(ctx, "submitBetaReview", currentUser._id)

    assertValidRating(args.rating)

    const body = args.body.trim()
    if (body.length > MAX_BODY_LENGTH) {
      throw new Error(`Review text must be at most ${MAX_BODY_LENGTH} characters`)
    }

    if (args.catId !== undefined) {
      const cat = await ctx.db.get(args.catId)
      if (cat === null) {
        throw new Error("Cat not found")
      }
      if (cat.userId !== currentUser._id) {
        throw new Error("Unauthorized")
      }
    }

    const existing = await ctx.db
      .query("beta_reviews")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
      .unique()

    if (existing !== null) {
      await ctx.db.patch(existing._id, {
        rating: args.rating,
        body,
        catId: args.catId,
        source: args.source,
      })
      return existing._id
    }

    return await ctx.db.insert("beta_reviews", {
      userId: currentUser._id,
      rating: args.rating,
      body,
      catId: args.catId,
      source: args.source,
      createdAt: Date.now(),
    })
  },
})

/**
 * Caller's own review, or null. Powers certificate CTA + dashboard “already reviewed”.
 */
export const getMyBetaReview = query({
  args: {},
  returns: v.union(betaReviewDoc, v.null()),
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      return null
    }

    return await ctx.db
      .query("beta_reviews")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
      .unique()
  },
})

/** True when the mirrored Convex user has `role: "admin"`. */
export const isAdmin = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      return false
    }
    return isAdminRole(currentUser)
  },
})

/**
 * Paginated admin list of all beta reviews with safe user context.
 * Authz: mirrored `users.role === "admin"` only (never trust the client).
 */
export const listBetaReviewsForAdmin = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(adminReviewDto),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const results = await ctx.db
      .query("beta_reviews")
      .withIndex("by_createdAt")
      .order("desc")
      .paginate(args.paginationOpts)

    const page = await Promise.all(
      results.page.map(async (review) => {
        const anonymized =
          review.anonymizedAt !== undefined || review.userId === undefined
        if (anonymized || review.userId === undefined) {
          return {
            _id: review._id,
            rating: review.rating,
            body: review.body,
            catId: review.catId,
            source: review.source,
            createdAt: review.createdAt,
            anonymized: true,
            user: {
              email: "",
            },
          }
        }

        const user = await ctx.db.get(review.userId)
        return {
          _id: review._id,
          rating: review.rating,
          body: review.body,
          catId: review.catId,
          source: review.source,
          createdAt: review.createdAt,
          anonymized: false,
          user: {
            email: user?.email ?? "",
            firstName: user?.firstName,
            lastName: user?.lastName,
          },
        }
      }),
    )

    return {
      page,
      isDone: results.isDone,
      continueCursor: results.continueCursor,
    }
  },
})
