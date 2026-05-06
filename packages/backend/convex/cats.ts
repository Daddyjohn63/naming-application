import { v } from "convex/values"
import { query, mutation, type QueryCtx } from "./_generated/server"
import { getCurrentUser, getCurrentUserOrThrow } from "./users"
import type { Doc } from "./_generated/dataModel"

async function catWithStorageUrls(ctx: QueryCtx, cat: Doc<"cats">) {
  const photoUrl =
    cat.photoStorageId !== undefined
      ? ((await ctx.storage.getUrl(cat.photoStorageId)) ?? "")
      : undefined
  const characterImageUrl =
    cat.characterImageStorageId !== undefined
      ? ((await ctx.storage.getUrl(cat.characterImageStorageId)) ?? "")
      : undefined
  const certificateUrl =
    cat.certificateStorageId !== undefined
      ? ((await ctx.storage.getUrl(cat.certificateStorageId)) ?? "")
      : undefined

  return {
    ...cat,
    ...(photoUrl !== undefined ? { photoUrl } : {}),
    ...(characterImageUrl !== undefined ? { characterImageUrl } : {}),
    ...(certificateUrl !== undefined ? { certificateUrl } : {}),
  }
}

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx): Promise<string> => {
    return await ctx.storage.generateUploadUrl()
  },
})

export const getCats = query({
  args: {},
  handler: async (ctx) => {
    const cats = await ctx.db.query("cats").collect()
    return Promise.all(
      cats.map(async (cat) => {
        const user = await ctx.db.get(cat.userId)
        const withUrls = await catWithStorageUrls(ctx, cat)
        return { ...withUrls, user }
      }),
    )
  },
})

/** Current user's cats for dashboard sidebar (lightweight; optional resolved photo URL). */
export const getCatsForSidebar = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      return []
    }

    const cats = await ctx.db
      .query("cats")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", currentUser._id))
      .collect()

    return Promise.all(
      cats.map(async (cat) => {
        const rawPhotoUrl =
          cat.photoStorageId !== undefined
            ? await ctx.storage.getUrl(cat.photoStorageId)
            : undefined
        const photoUrl =
          rawPhotoUrl !== undefined && rawPhotoUrl !== ""
            ? rawPhotoUrl
            : undefined

        return {
          _id: cat._id,
          name: cat.title,
          slug: cat.slug,
          ...(photoUrl !== undefined ? { photoUrl } : {}),
        }
      }),
    )
  },
})

export const getRecentCats = query({
  args: {},
  handler: async (ctx) => {
    const cats = await ctx.db.query("cats").order("desc").take(5)
    return Promise.all(
      cats.map(async (cat) => {
        const user = await ctx.db.get(cat.userId)
        const withUrls = await catWithStorageUrls(ctx, cat)
        return { ...withUrls, user }
      }),
    )
  },
})

export const getCatsByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const currentUser = await getCurrentUserOrThrow(ctx)
    if (currentUser._id !== userId) {
      throw new Error("Forbidden")
    }

    const cats = await ctx.db
      .query("cats")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .collect()
    return Promise.all(cats.map((cat) => catWithStorageUrls(ctx, cat)))
  },
})

export const getCatSlugsByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const currentUser = await getCurrentUserOrThrow(ctx)
    if (currentUser._id !== userId) {
      throw new Error("Forbidden")
    }

    const cats = await ctx.db
      .query("cats")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .collect()
    return cats
      .map((cat) => cat.slug)
      .filter((slug): slug is string => slug !== undefined)
  },
})

export const getCatBySlug = query({
  args: { userId: v.id("users"), slug: v.string() },
  handler: async (ctx, { userId, slug }) => {
    const currentUser = await getCurrentUserOrThrow(ctx)
    if (currentUser._id !== userId) {
      throw new Error("Forbidden")
    }

    const cat = await ctx.db
      .query("cats")
      .withIndex("by_userId_slug", (q) =>
        q.eq("userId", userId).eq("slug", slug),
      )
      .unique()

    if (!cat) {
      return null
    }

    const user = await ctx.db.get(cat.userId)
    const withUrls = await catWithStorageUrls(ctx, cat)
    return { ...withUrls, user }
  },
})

/** Starts a draft cat profile; naming ceremony fields are filled in later mutations. */
export const createCat = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    slug: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx)
    const now = Date.now()
    return await ctx.db.insert("cats", {
      userId: currentUser._id,
      title: args.title,
      description: args.description,
      slug: args.slug,
      photoStorageId: args.photoStorageId,
      ceremonyStep: "draft",
      portraitRegenerationsUsed: 0,
      createdAt: now,
      updatedAt: now,
    })
  },
})
