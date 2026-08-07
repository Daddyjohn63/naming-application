/**
 * Append-only beta error log writers + client/admin API.
 *
 * Mutations should call `insertErrorEvent` in-process (same transaction).
 * Actions / HTTP should call `logError` via `ctx.runMutation(internal.errorEvents.logError, …)`.
 */

import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"

import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import {
  internalMutation,
  mutation,
  query,
  type ActionCtx,
  type MutationCtx,
} from "./_generated/server"
import { requireAdmin } from "./lib/admin"
import { enforceRateLimit } from "./lib/rateLimiter"
import { getCurrentUser } from "./users"

const MAX_MESSAGE_LENGTH = 2000
const MAX_STACK_LENGTH = 4000
const MAX_AREA_LENGTH = 100
const MAX_PATH_LENGTH = 300
const MAX_CODE_LENGTH = 120
const MAX_META_ENTRIES = 20
const MAX_META_VALUE_LENGTH = 500

const sourceValidator = v.union(
  v.literal("convex"),
  v.literal("web-client"),
  v.literal("web-server"),
)

const severityValidator = v.union(v.literal("error"), v.literal("warn"))

export const errorEventWriteArgs = {
  source: sourceValidator,
  severity: severityValidator,
  area: v.string(),
  message: v.string(),
  code: v.optional(v.string()),
  userId: v.optional(v.id("users")),
  catId: v.optional(v.id("cats")),
  path: v.optional(v.string()),
  stack: v.optional(v.string()),
  meta: v.optional(v.record(v.string(), v.string())),
}

export type ErrorEventWriteArgs = {
  source: "convex" | "web-client" | "web-server"
  severity: "error" | "warn"
  area: string
  message: string
  code?: string
  userId?: Id<"users">
  catId?: Id<"cats">
  path?: string
  stack?: string
  meta?: Record<string, string>
}

function truncate(value: string, max: number): string {
  if (value.length <= max) {
    return value
  }
  return `${value.slice(0, max - 1)}…`
}

function sanitizeMeta(
  meta: Record<string, string> | undefined,
): Record<string, string> | undefined {
  if (meta === undefined) {
    return undefined
  }
  const entries = Object.entries(meta).slice(0, MAX_META_ENTRIES)
  if (entries.length === 0) {
    return undefined
  }
  const out: Record<string, string> = {}
  for (const [key, value] of entries) {
    out[truncate(key, 64)] = truncate(value, MAX_META_VALUE_LENGTH)
  }
  return out
}

/** Normalize an unknown catch value into message + optional stack. */
export function describeUnknownError(error: unknown): {
  message: string
  stack?: string
} {
  if (error instanceof Error) {
    return {
      message: error.message.length > 0 ? error.message : error.name,
      stack: error.stack,
    }
  }
  if (typeof error === "string" && error.length > 0) {
    return { message: error }
  }
  try {
    return { message: JSON.stringify(error) }
  } catch {
    return { message: "Unknown error" }
  }
}

/**
 * Insert a capped error_events row. Safe to call from any mutation handler.
 */
export async function insertErrorEvent(
  ctx: MutationCtx,
  args: ErrorEventWriteArgs,
): Promise<Id<"error_events">> {
  const area = truncate(args.area.trim(), MAX_AREA_LENGTH)
  const message = truncate(args.message.trim(), MAX_MESSAGE_LENGTH)
  if (area.length === 0 || message.length === 0) {
    throw new Error("error_events require non-empty area and message")
  }

  return await ctx.db.insert("error_events", {
    createdAt: Date.now(),
    source: args.source,
    severity: args.severity,
    area,
    message,
    code:
      args.code !== undefined
        ? truncate(args.code, MAX_CODE_LENGTH)
        : undefined,
    userId: args.userId,
    catId: args.catId,
    path:
      args.path !== undefined
        ? truncate(args.path, MAX_PATH_LENGTH)
        : undefined,
    stack:
      args.stack !== undefined
        ? truncate(args.stack, MAX_STACK_LENGTH)
        : undefined,
    meta: sanitizeMeta(args.meta),
  })
}

/** Action/HTTP entry point — prefer `insertErrorEvent` inside mutations. */
export const logError = internalMutation({
  args: errorEventWriteArgs,
  returns: v.id("error_events"),
  handler: async (ctx, args) => {
    return await insertErrorEvent(ctx, args)
  },
})

/**
 * Best-effort persist from actions/HTTP. Never throws — logging must not
 * mask the original failure the caller is handling.
 */
export async function persistErrorEvent(
  ctx: Pick<ActionCtx, "runMutation">,
  args: ErrorEventWriteArgs,
): Promise<void> {
  try {
    await ctx.runMutation(internal.errorEvents.logError, args)
  } catch (error) {
    console.error(
      "Failed to persist error_events row:",
      error instanceof Error ? error.message : error,
    )
  }
}

const clientSourceValidator = v.union(
  v.literal("web-client"),
  v.literal("web-server"),
)

const errorEventAdminDto = v.object({
  _id: v.id("error_events"),
  createdAt: v.number(),
  source: sourceValidator,
  severity: severityValidator,
  area: v.string(),
  message: v.string(),
  code: v.optional(v.string()),
  userId: v.optional(v.id("users")),
  catId: v.optional(v.id("cats")),
  path: v.optional(v.string()),
  stack: v.optional(v.string()),
  meta: v.optional(v.record(v.string(), v.string())),
})

/**
 * Public reporter for web client/server unexpected errors.
 * Auth optional — anonymous reports use a shared rate-limit key.
 * Never trusts client-supplied userId.
 */
export const reportClientError = mutation({
  args: {
    source: clientSourceValidator,
    severity: v.optional(severityValidator),
    area: v.string(),
    message: v.string(),
    code: v.optional(v.string()),
    catId: v.optional(v.id("cats")),
    path: v.optional(v.string()),
    stack: v.optional(v.string()),
    meta: v.optional(v.record(v.string(), v.string())),
  },
  returns: v.id("error_events"),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    await enforceRateLimit(
      ctx,
      "reportClientError",
      user?._id ?? "anonymous",
    )

    return await insertErrorEvent(ctx, {
      source: args.source,
      severity: args.severity ?? "error",
      area: args.area,
      message: args.message,
      code: args.code,
      userId: user?._id,
      catId: args.catId,
      path: args.path,
      stack: args.stack,
      meta: args.meta,
    })
  },
})

/**
 * Paginated admin list of error_events (newest first).
 * Authz: mirrored `users.role === "admin"` only.
 */
export const listErrorEventsForAdmin = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(errorEventAdminDto),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const results = await ctx.db
      .query("error_events")
      .withIndex("by_createdAt")
      .order("desc")
      .paginate(args.paginationOpts)

    return {
      page: results.page.map((row) => ({
        _id: row._id,
        createdAt: row.createdAt,
        source: row.source,
        severity: row.severity,
        area: row.area,
        message: row.message,
        code: row.code,
        userId: row.userId,
        catId: row.catId,
        path: row.path,
        stack: row.stack,
        meta: row.meta,
      })),
      isDone: results.isDone,
      continueCursor: results.continueCursor,
    }
  },
})
