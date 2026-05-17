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

/** Skeleton description for drafts until KB‑003 collects the real story client-side. */
const DRAFT_DESCRIPTION_PLACEHOLDER =
  "Add your cat portrait and story in the next steps. You can replace this anytime before the summary is approved."

/** Current user's cats for dashboard cards — ordered newest first with optional photo URL. */
export const listMyCatsForDashboard = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      return []
    }

    const cats = await ctx.db
      .query("cats")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", currentUser._id),
      )
      .collect()

    cats.sort((a, b) => b.createdAt - a.createdAt)

    return Promise.all(
      cats.map(async (cat) => {
        const withUrls = await catWithStorageUrls(ctx, cat)
        return {
          _id: withUrls._id,
          title: withUrls.title,
          ceremonyStep: withUrls.ceremonyStep,
          createdAt: withUrls.createdAt,
          updatedAt: withUrls.updatedAt,
          ...(withUrls.photoUrl !== undefined ? { photoUrl: withUrls.photoUrl } : {}),
        }
      }),
    )
  },
})

/** Full cat doc for `/cats/[catId]` when the signed-in user owns it. Otherwise `null`. */
export const getCatByIdForOwner = query({
  args: { catId: v.id("cats") },
  handler: async (ctx, { catId }) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      return null
    }
    const cat = await ctx.db.get(catId)
    if (cat === null || cat.userId !== currentUser._id) {
      return null
    }
    return await catWithStorageUrls(ctx, cat)
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

/**
 * One-shot draft row for KB-002 (“Add a cat” without KB-003 form). Navigates to `/cats/[id]`.
 */
export const createDraftCat = mutation({
  args: {},
  handler: async (ctx): Promise<Doc<"cats">["_id"]> => {
    const currentUser = await getCurrentUserOrThrow(ctx)
    const now = Date.now()
    const siblings = await ctx.db
      .query("cats")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", currentUser._id),
      )
      .collect()
    const n = siblings.length + 1
    const title =
      n === 1 ? "Your first naming ceremony" : `Naming ceremony ${n}`
    return await ctx.db.insert("cats", {
      userId: currentUser._id,
      title,
      description: DRAFT_DESCRIPTION_PLACEHOLDER,
      ceremonyStep: "draft",
      portraitRegenerationsUsed: 0,
      createdAt: now,
      updatedAt: now,
    })
  },
})
