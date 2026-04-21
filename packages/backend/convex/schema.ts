import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerkUserId", ["clerkUserId"]),

  posts: defineTable({
    userId: v.id("users"),
    title: v.string(),
    slug: v.string(),
    catDescription: v.string(),
    familyName: v.string(),
    uniqueName: v.string(),
    effableName: v.string(),
    familyContext: v.string(),
    uniqueContext: v.string(),
    effableContext: v.string(),
    catImageUrl: v.optional(v.id("_storage")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId_createdAt", ["userId", "createdAt"]),
})
