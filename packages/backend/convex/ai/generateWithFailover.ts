/**
 * Shared generateText wrapper: try OpenAI, then Gemini on availability failures.
 *
 * Flow (happy path):
 *   1. Call the Vercel AI SDK with OpenAI (primary).
 *   2. If that works → return the result; caller never knows about providers.
 *
 * Flow (outage):
 *   1. OpenAI throws.
 *   2. Ask `isFailoverEligibleAiError` — only infra/availability errors retry
 *      (429/5xx, network, overloaded). Schema / content-policy errors do NOT.
 *   3. If a Gemini key is configured → retry the *same* args with Gemini once.
 *   4. If Gemini works → return that result (still transparent to the UI).
 *   5. If Gemini also fails (or no key) → rethrow so existing Retry UX runs.
 *
 * Each HTTP attempt increments `ai_provider_usage` (openaiCalls / geminiCalls).
 *
 * See ai-docs/production/AI-FAILOVER.md.
 */

import { generateText } from "ai"
import { isFailoverEligibleAiError } from "@workspace/shared/utils/is-failover-eligible-ai-error"

import { internal } from "../_generated/api"
import type { ActionCtx } from "../_generated/server"
import {
  FALLBACK_MODEL_ID,
  PRIMARY_MODEL_ID,
  getFallbackModel,
  getPrimaryModel,
  hasFallbackApiKey,
} from "./provider"

// Re-export so call sites can import eligibility from this module if useful.
export { isFailoverEligibleAiError }

/** Full `generateText` argument bag, including `model`. */
type GenerateTextParams = Parameters<typeof generateText>[0]

/**
 * What callers pass in: everything `generateText` accepts except `model`.
 * We pick the model ourselves (OpenAI first, Gemini on failover).
 *
 * Note: TypeScript's `Omit` flattens the prompt vs messages union, so we cast
 * back to `GenerateTextParams` inside `callGenerateText` when we add `model`.
 */
export type GenerateWithFailoverArgs = Omit<GenerateTextParams, "model">

type AiProvider = "openai" | "gemini"

/**
 * Thin adapter: take caller args + a concrete model, then call the SDK.
 * Keeps the cast in one place so the main function stays readable.
 */
function callGenerateText(
  args: GenerateWithFailoverArgs,
  model: GenerateTextParams["model"]
) {
  return generateText({ ...args, model } as GenerateTextParams)
}

/** Best-effort counter bump — never fail the AI step because of usage logging. */
async function recordProviderCall(ctx: ActionCtx, provider: AiProvider) {
  try {
    await ctx.runMutation(internal.aiProviderUsage.recordCall, { provider })
  } catch (error) {
    console.warn(
      `AI usage counter failed for provider=${provider}:`,
      error instanceof Error ? error.message : error
    )
  }
}

/**
 * Drop-in replacement for `generateText({ model, ... })` used by all five
 * naming AI helpers. Pass the action `ctx` so we can persist call counts.
 * Do not pass `model`.
 */
export async function generateWithFailover(
  ctx: ActionCtx,
  args: GenerateWithFailoverArgs
) {
  try {
    // --- Attempt 1: OpenAI (primary) ---
    const result = await callGenerateText(args, getPrimaryModel())
    await recordProviderCall(ctx, "openai")
    // Convex dashboard log: healthy path, no failover.
    console.log(
      `AI step ok provider=openai model=${PRIMARY_MODEL_ID} failover=false`
    )
    return result
  } catch (primaryError) {
    // Count the OpenAI attempt even when it failed (quota / outage still billed).
    await recordProviderCall(ctx, "openai")

    // Bad prompt / schema / photo policy → bubble up immediately (no Gemini).
    if (!isFailoverEligibleAiError(primaryError)) {
      throw primaryError
    }

    // Eligible outage, but no Gemini key on this Convex deployment → behave
    // like today (OpenAI-only failure). Do not crash at import time.
    if (!hasFallbackApiKey()) {
      console.warn(
        "AI primary failed; Gemini failover skipped (GOOGLE_GENERATIVE_AI_API_KEY unset):",
        primaryError instanceof Error ? primaryError.message : primaryError
      )
      throw primaryError
    }

    // Eligible outage + key present → one silent retry with Gemini.
    console.warn(
      `AI primary failed; retrying with Gemini model=${FALLBACK_MODEL_ID}:`,
      primaryError instanceof Error ? primaryError.message : primaryError
    )

    try {
      // --- Attempt 2: Gemini (fallback) — same prompts/args as attempt 1 ---
      const result = await callGenerateText(args, getFallbackModel())
      await recordProviderCall(ctx, "gemini")
      // Convex dashboard log: failover succeeded (mixed providers in one
      // ceremony are OK for v1 availability).
      console.log(
        `AI step ok provider=gemini model=${FALLBACK_MODEL_ID} failover=true`
      )
      return result
    } catch (fallbackError) {
      await recordProviderCall(ctx, "gemini")
      // Both providers failed → existing normalizeAiError / Retry paths handle UX.
      console.error(
        "AI failover (Gemini) also failed:",
        fallbackError instanceof Error ? fallbackError.message : fallbackError
      )
      throw fallbackError
    }
  }
}
