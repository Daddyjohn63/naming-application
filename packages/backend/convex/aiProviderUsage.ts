/**
 * Persist OpenAI vs Gemini call totals for ops visibility (AI failover).
 */

import { v } from "convex/values"

import { internalMutation, internalQuery } from "./_generated/server"

const GLOBAL_SCOPE = "global" as const

const providerValidator = v.union(v.literal("openai"), v.literal("gemini"))

/** Increment the singleton counter after an AI provider HTTP attempt. */
export const recordCall = internalMutation({
  args: {
    provider: providerValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("ai_provider_usage")
      .withIndex("by_scope", (q) => q.eq("scope", GLOBAL_SCOPE))
      .unique()

    const now = Date.now()
    if (existing === null) {
      await ctx.db.insert("ai_provider_usage", {
        scope: GLOBAL_SCOPE,
        openaiCalls: args.provider === "openai" ? 1 : 0,
        geminiCalls: args.provider === "gemini" ? 1 : 0,
        updatedAt: now,
      })
      return null
    }

    await ctx.db.patch(existing._id, {
      openaiCalls:
        existing.openaiCalls + (args.provider === "openai" ? 1 : 0),
      geminiCalls:
        existing.geminiCalls + (args.provider === "gemini" ? 1 : 0),
      updatedAt: now,
    })
    return null
  },
})

/** Read the global totals (Convex dashboard / future admin UI). */
export const getGlobal = internalQuery({
  args: {},
  returns: v.union(
    v.object({
      openaiCalls: v.number(),
      geminiCalls: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const row = await ctx.db
      .query("ai_provider_usage")
      .withIndex("by_scope", (q) => q.eq("scope", GLOBAL_SCOPE))
      .unique()
    if (row === null) {
      return null
    }
    return {
      openaiCalls: row.openaiCalls,
      geminiCalls: row.geminiCalls,
      updatedAt: row.updatedAt,
    }
  },
})
