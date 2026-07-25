import { RateLimiter, HOUR, MINUTE } from "@convex-dev/rate-limiter"
import { ConvexError } from "convex/values"

import { RATE_LIMIT_ERROR_CODE } from "@workspace/shared/constants/rate-limit-errors"

import type { Id } from "../_generated/dataModel"
import { components } from "../_generated/api"
import type { ActionCtx, MutationCtx } from "../_generated/server"

/**
 * Named limits for M6 abuse surfaces (SECURITY.md).
 * Conservative starters — tune after watching real usage.
 */
const rateLimits = {
  /** Upload URL minting — allow short bursts, cap sustained spam. */
  generateUploadUrl: {
    kind: "token bucket" as const,
    rate: 20,
    period: MINUTE,
    capacity: 10,
  },
  /** Draft + full cat create share one per-user budget. */
  createCat: { kind: "fixed window" as const, rate: 10, period: HOUR },
  /** Profile submit (and photo replace path via this action). */
  submitCatProfile: { kind: "fixed window" as const, rate: 20, period: HOUR },
  /** Summary pipeline retry. */
  retrySummaryPipeline: {
    kind: "fixed window" as const,
    rate: 10,
    period: HOUR,
  },
  /** Family / cat-world / ineffable name regenerations + retries. */
  regenerateNames: { kind: "fixed window" as const, rate: 30, period: HOUR },
  /** Stub unlock while the payment bypass exists. */
  completeStubUnlock: { kind: "fixed window" as const, rate: 10, period: HOUR },
}

export const rateLimiter = new RateLimiter(components.rateLimiter, rateLimits)

export type RateLimitName = keyof typeof rateLimits

type RateLimitCtx = MutationCtx | ActionCtx

type RateLimitStatus =
  | { ok: true; retryAfter?: number }
  | { ok: false; retryAfter: number }

/**
 * Consume one token for `name`, keyed by Convex `users._id`.
 * Throws `ConvexError({ code: too_many_attempts })` when exceeded.
 */
export async function enforceRateLimit(
  ctx: RateLimitCtx,
  name: RateLimitName,
  userId: Id<"users">,
): Promise<void> {
  // RateLimiter's option tuple types don't distribute over a name union.
  const limit = rateLimiter.limit.bind(rateLimiter) as (
    ctx: RateLimitCtx,
    name: RateLimitName,
    options: { key: string },
  ) => Promise<RateLimitStatus>

  const status = await limit(ctx, name, { key: userId })

  if (!status.ok) {
    throw new ConvexError({ code: RATE_LIMIT_ERROR_CODE.TOO_MANY_ATTEMPTS })
  }
}
