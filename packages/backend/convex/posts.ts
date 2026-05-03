import { v } from "convex/values"
import { query, mutation } from "./_generated/server"
import { getCurrentUserOrThrow } from "./users"

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx): Promise<string> => {
    return await ctx.storage.generateUploadUrl()
  },
})

export const getPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").collect()
    return Promise.all(
      posts.map(async (post) => {
        const user = await ctx.db.get(post.userId)
        return {
          ...post,
          user: user,
          ...(post.catImageId
            ? { catImageUrl: (await ctx.storage.getUrl(post.catImageId)) ?? "" }
            : {}),
        }
      })
    )
  },
})

export const getRecentPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").order("desc").take(5)
    return Promise.all(
      posts.map(async (post) => {
        const user = await ctx.db.get(post.userId)
        return {
          ...post,
          user: user,
          ...(post.catImageId
            ? { catImageUrl: (await ctx.storage.getUrl(post.catImageId)) ?? "" }
            : {}),
        }
      })
    )
  },
})

export const getPostsByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const currentUser = await getCurrentUserOrThrow(ctx)
    if (currentUser._id !== userId) {
      throw new Error("Forbidden")
    }

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .collect()
    return Promise.all(
      posts.map(async (post) => ({
        ...post,
        ...(post.catImageId
          ? { catImageUrl: (await ctx.storage.getUrl(post.catImageId)) ?? "" }
          : {}),
      }))
    )
  },
})

export const getPostSlugsByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const currentUser = await getCurrentUserOrThrow(ctx)
    if (currentUser._id !== userId) {
      throw new Error("Forbidden")
    }

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .collect()
    return posts.map((post) => post.slug)
  },
})

export const getPostBySlug = query({
  args: { userId: v.id("users"), slug: v.string() },
  handler: async (ctx, { userId, slug }) => {
    const currentUser = await getCurrentUserOrThrow(ctx)
    if (currentUser._id !== userId) {
      throw new Error("Forbidden")
    }

    const post = await ctx.db
      .query("posts")
      .withIndex("by_userId_slug", (q) =>
        q.eq("userId", userId).eq("slug", slug)
      )
      .unique()

    if (!post) {
      return null
    }

    const user = await ctx.db.get(post.userId)

    return {
      ...post,
      user,
      ...(post.catImageId
        ? { catImageUrl: (await ctx.storage.getUrl(post.catImageId)) ?? "" }
        : {}),
    }
  },
})

// NOT SURE ABOUT THIS. WILL I CREATE ONE POST PER CAT OR ONE PER NAMING EVENT? I COULD CREATE ONE POST, BUT UPDATE IT AS MORE NAMING EVENTS ARE ADDED.
export const createPost = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    catDescription: v.string(),
    familyName: v.string(),
    uniqueName: v.string(),
    effableName: v.string(),
    familyContext: v.string(),
    uniqueContext: v.string(),
    effableContext: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx)
    const now = Date.now()
    return await ctx.db.insert("posts", {
      userId: currentUser._id,
      ...args,
      createdAt: now,
      updatedAt: now,
    })
  },
})
