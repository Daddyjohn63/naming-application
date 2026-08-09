import { RateLimiter, HOUR, MINUTE } from "@convex-dev/rate-limiter"
import { ConvexError } from "convex/values"

import { RATE_LIMIT_ERROR_CODE } from "@workspace/shared/constants/rate-limit-errors"

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
  /** Beta review submit / upsert — keep spam low; one review per user anyway. */
  submitBetaReview: { kind: "fixed window" as const, rate: 5, period: HOUR },
  /** Client error reports into error_events (keyed by user id or session key). */
  reportClientError: { kind: "fixed window" as const, rate: 30, period: HOUR },
  /** Clerk webhook Svix verify failures — avoid log flooding from probes. */
  clerkWebhookVerifyFailed: {
    kind: "fixed window" as const,
    rate: 20,
    period: HOUR,
  },
}

export const rateLimiter = new RateLimiter(components.rateLimiter, rateLimits)

export type RateLimitName = keyof typeof rateLimits

type RateLimitCtx = MutationCtx | ActionCtx

type RateLimitStatus =
  | { ok: true; retryAfter?: number }
  | { ok: false; retryAfter: number }

function limitNamed(
  ctx: RateLimitCtx,
  name: RateLimitName,
  key: string,
): Promise<RateLimitStatus> {
  // RateLimiter's option tuple types don't distribute over a name union.
  const limit = rateLimiter.limit.bind(rateLimiter) as (
    ctx: RateLimitCtx,
    name: RateLimitName,
    options: { key: string },
  ) => Promise<RateLimitStatus>

  return limit(ctx, name, { key })
}

/**
 * Consume one token for `name`, keyed by a string (usually `users._id`).
 * Throws `ConvexError({ code: too_many_attempts })` when exceeded.
 */
export async function enforceRateLimit(
  ctx: RateLimitCtx,
  name: RateLimitName,
  key: string,
): Promise<void> {
  const status = await limitNamed(ctx, name, key)

  if (!status.ok) {
    throw new ConvexError({ code: RATE_LIMIT_ERROR_CODE.TOO_MANY_ATTEMPTS })
  }
}

/**
 * Consume one token for `name`. Returns false when exceeded (does not throw).
 */
export async function tryRateLimit(
  ctx: RateLimitCtx,
  name: RateLimitName,
  key: string,
): Promise<boolean> {
  const status = await limitNamed(ctx, name, key)
  return status.ok
}
