//Cats: Cat profiles / naming ceremonies (Phase 1 “one or more cat profiles”).
//Holds funnel step, regeneration budgets, pointers to assets, and final choices.
//Original upload stays in photoStorageId; accepted portrait text/image live on
//cat_portrait_versions with optional acceptedPortraitVersionId here.
//Cat CRUD, upload URLs, dashboard/sidebar queries, etc.
import { ConvexError, v } from "convex/values"
import { catCreateFieldsSchema } from "@workspace/shared/schemas/cat"
import { DRAFT_CAT_DESCRIPTION_PLACEHOLDER } from "@workspace/shared/constants/cat-profile"

import { query, mutation, type QueryCtx } from "./_generated/server"
import { getCurrentUser, getCurrentUserOrThrow } from "./users"
import type { Doc, Id } from "./_generated/dataModel"

//resolve storage public URL
async function resolveStoragePublicUrl(
  ctx: QueryCtx,
  storageId: Id<"_storage"> | undefined
): Promise<string | undefined> {
  if (storageId === undefined) {
    return undefined
  }
  const url = (await ctx.storage.getUrl(storageId)) ?? ""
  return url === "" ? undefined : url
}

//cat with storage URLs
async function catWithStorageUrls(ctx: QueryCtx, cat: Doc<"cats">) {
  const photoUrl = await resolveStoragePublicUrl(ctx, cat.photoStorageId)
  const certificateUrl = await resolveStoragePublicUrl(
    ctx,
    cat.certificateStorageId
  )

  return {
    ...cat,
    ...(photoUrl !== undefined ? { photoUrl } : {}),
    ...(certificateUrl !== undefined ? { certificateUrl } : {}),
  }
}

//generate upload URL
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx): Promise<string> => {
    return await ctx.storage.generateUploadUrl()
  },
})

//get all cats
export const getCats = query({
  args: {},
  handler: async (ctx) => {
    const cats = await ctx.db.query("cats").collect()
    return Promise.all(
      cats.map(async (cat) => {
        const user = await ctx.db.get(cat.userId)
        const withUrls = await catWithStorageUrls(ctx, cat)
        return { ...withUrls, user }
      })
    )
  },
})

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
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", currentUser._id))
      .collect()

    cats.sort((a, b) => b.createdAt - a.createdAt)

    return Promise.all(
      cats.map(async (cat) => {
        const photoRaw = await resolveStoragePublicUrl(ctx, cat.photoStorageId)
        return {
          _id: cat._id,
          title: cat.title,
          ceremonyStep: cat.ceremonyStep,
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt,
          ...(typeof photoRaw === "string" && photoRaw.trim().length > 0
            ? { photoUrl: photoRaw.trim() }
            : {}),
        }
      })
    )
  },
})

/** Full cat doc for `/cats/[catId]` when the signed-in user owns it. Otherwise `null`. */
export const getCatByIdForOwner = query({
  args: { catId: v.string() },
  handler: async (ctx, { catId }) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser === null) {
      return null
    }
    const id = ctx.db.normalizeId("cats", catId)
    if (id === null) {
      return null
    }
    const cat = await ctx.db.get(id)
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
      })
    )
  },
})

//get recent cats
export const getRecentCats = query({
  args: {},
  handler: async (ctx) => {
    const cats = await ctx.db.query("cats").order("desc").take(5)
    return Promise.all(
      cats.map(async (cat) => {
        const user = await ctx.db.get(cat.userId)
        const withUrls = await catWithStorageUrls(ctx, cat)
        return { ...withUrls, user }
      })
    )
  },
})
//get cats by user ID
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

//get cat slugs by user ID
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

//get cat by slug
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
        q.eq("userId", userId).eq("slug", slug)
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
    const parsed = catCreateFieldsSchema.safeParse({
      title: args.title,
      description: args.description,
      slug: args.slug ?? "",
    })
    if (!parsed.success) {
      throw new ConvexError(parsed.error.flatten())
    }
    const now = Date.now()
    return await ctx.db.insert("cats", {
      userId: currentUser._id,
      title: parsed.data.title,
      description: parsed.data.description,
      slug: parsed.data.slug,
      photoStorageId: args.photoStorageId,
      ceremonyStep: "draft",
      summaryRegenerationsUsed: 0,
      profileSubmitsUsed: 0,
      photoValidationAttemptsUsed: 0,
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
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", currentUser._id))
      .collect()
    const n = siblings.length + 1
    const title =
      n === 1 ? "Your first naming ceremony" : `Naming ceremony ${n}`
    return await ctx.db.insert("cats", {
      userId: currentUser._id,
      title,
      description: DRAFT_CAT_DESCRIPTION_PLACEHOLDER,
      ceremonyStep: "draft",
      summaryRegenerationsUsed: 0,
      profileSubmitsUsed: 0,
      photoValidationAttemptsUsed: 0,
      createdAt: now,
      updatedAt: now,
    })
  },
})
