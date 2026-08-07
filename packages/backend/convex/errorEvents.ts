/**
 * Append-only beta error log writers + client/admin API.
 *
 * Mutations should call `insertErrorEvent` in-process (same transaction).
 * Actions / HTTP should call `logError` via `ctx.runMutation(internal.errorEvents.logError, …)`.
 *
 * Retention: `purgeExpiredErrorEvents` (cron) deletes rows older than 30 days.
 * Client reports are size-capped and never trust client-supplied userId/source.
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
import { tryRateLimit } from "./lib/rateLimiter"
import { getCurrentUser } from "./users"

const MAX_MESSAGE_LENGTH = 2000
const MAX_STACK_LENGTH = 4000
const MAX_AREA_LENGTH = 100
const MAX_PATH_LENGTH = 300
const MAX_CODE_LENGTH = 120
const MAX_META_ENTRIES = 20
const MAX_META_VALUE_LENGTH = 500
const MAX_SESSION_KEY_LENGTH = 64
const MIN_SESSION_KEY_LENGTH = 8
/** Client-reported stacks are capped tighter than internal rows. */
const MAX_CLIENT_STACK_LENGTH = 2000
const ERROR_EVENT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000
const PURGE_BATCH_SIZE = 100

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

function normalizeSessionKey(sessionKey: string | undefined): string | null {
  if (sessionKey === undefined) {
    return null
  }
  const trimmed = sessionKey.trim()
  if (
    trimmed.length < MIN_SESSION_KEY_LENGTH ||
    trimmed.length > MAX_SESSION_KEY_LENGTH
  ) {
    return null
  }
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    return null
  }
  return trimmed
}

/**
 * Extra redaction for untrusted client payloads before insertErrorEvent.
 * Caps stack tighter; drops blank path; normalizes empty message fallback.
 */
function sanitizeClientReport(args: {
  message: string
  path?: string
  stack?: string
  meta?: Record<string, string>
  code?: string
}): {
  message: string
  path?: string
  stack?: string
  meta?: Record<string, string>
  code?: string
} {
  const message = args.message.trim() || "Unknown client error"
  const path =
    args.path !== undefined && args.path.trim().length > 0
      ? truncate(args.path.trim(), MAX_PATH_LENGTH)
      : undefined
  const stack =
    args.stack !== undefined && args.stack.trim().length > 0
      ? truncate(args.stack, MAX_CLIENT_STACK_LENGTH)
      : undefined
  const code =
    args.code !== undefined && args.code.trim().length > 0
      ? truncate(args.code.trim(), MAX_CODE_LENGTH)
      : undefined
  return {
    message,
    path,
    stack,
    code,
    meta: sanitizeMeta(args.meta),
  }
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
    const serialized = JSON.stringify(error)
    if (typeof serialized === "string") {
      return { message: serialized }
    }
    return { message: "Unknown error" }
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
 * Public reporter for browser unexpected errors.
 * Always stores `source: "web-client"` (never trusts client-supplied source).
 * Auth optional — unauthenticated callers must send a sessionKey for rate limiting.
 * Rate-limit rejects return null (do not throw ConvexError to the client).
 */
export const reportClientError = mutation({
  args: {
    severity: v.optional(severityValidator),
    area: v.string(),
    message: v.string(),
    code: v.optional(v.string()),
    catId: v.optional(v.id("cats")),
    path: v.optional(v.string()),
    stack: v.optional(v.string()),
    meta: v.optional(v.record(v.string(), v.string())),
    sessionKey: v.optional(v.string()),
  },
  returns: v.union(v.id("error_events"), v.null()),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const sessionKey = normalizeSessionKey(args.sessionKey)
    const rateLimitKey = user?._id ?? sessionKey
    if (rateLimitKey === null || rateLimitKey === undefined) {
      return null
    }

    const allowed = await tryRateLimit(ctx, "reportClientError", rateLimitKey)
    if (!allowed) {
      return null
    }

    const sanitized = sanitizeClientReport({
      message: args.message,
      path: args.path,
      stack: args.stack,
      meta: args.meta,
      code: args.code,
    })

    return await insertErrorEvent(ctx, {
      source: "web-client",
      severity: args.severity ?? "error",
      area: args.area,
      message: sanitized.message,
      code: sanitized.code,
      userId: user?._id,
      catId: args.catId,
      path: sanitized.path,
      stack: sanitized.stack,
      meta: sanitized.meta,
    })
  },
})

/**
 * Delete error_events older than retention. Batched; reschedules when full.
 */
export const purgeExpiredErrorEvents = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const cutoff = Date.now() - ERROR_EVENT_RETENTION_MS
    const expired = await ctx.db
      .query("error_events")
      .withIndex("by_createdAt", (q) => q.lt("createdAt", cutoff))
      .take(PURGE_BATCH_SIZE)

    for (const row of expired) {
      await ctx.db.delete(row._id)
    }

    if (expired.length >= PURGE_BATCH_SIZE) {
      await ctx.scheduler.runAfter(
        0,
        internal.errorEvents.purgeExpiredErrorEvents,
        {},
      )
    }

    return null
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
