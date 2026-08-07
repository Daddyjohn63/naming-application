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
 * Each HTTP attempt schedules an `ai_provider_usage` counter bump
 * (openaiCalls / geminiCalls) — fire-and-forget so usage logging never
 * delays the ceremony step.
 *
 * See ai-docs/production/AI-FAILOVER.md.
 */

import {
  generateText,
  type GenerateTextResult,
  type ToolSet,
} from "ai"
import { isFailoverEligibleAiError } from "@workspace/shared/utils/is-failover-eligible-ai-error"

import { internal } from "../_generated/api"
import type { ActionCtx } from "../_generated/server"
import {
  describeUnknownError,
  persistErrorEvent,
} from "../errorEvents"
import {
  FALLBACK_MODEL_ID,
  PRIMARY_MODEL_ID,
  getFallbackModel,
  getPrimaryModel,
  hasFallbackApiKey,
} from "./provider"

// Re-export so call sites can import eligibility from this module if useful.
export { isFailoverEligibleAiError }

type AiProvider = "openai" | "gemini"

/** AI SDK `output:` option type (the `Output` interface is not a public export). */
type StructuredOutputSpec = NonNullable<
  Parameters<typeof generateText>[0]["output"]
>

type GenerateTextParams<OUTPUT extends StructuredOutputSpec> = Omit<
  Parameters<typeof generateText>[0],
  "model" | "output"
> & {
  model: Parameters<typeof generateText>[0]["model"]
  output?: OUTPUT
}

/**
 * What callers pass in: everything `generateText` accepts except `model`.
 * `OUTPUT` is inferred from `args.output` so structured results stay typed.
 */
export type GenerateWithFailoverArgs<
  OUTPUT extends StructuredOutputSpec = StructuredOutputSpec,
> = Omit<GenerateTextParams<OUTPUT>, "model">

/**
 * Thin adapter: take caller args + a concrete model, then call the SDK.
 * Cast restores the prompt union after omitting `model`; return stays generic.
 */
function callGenerateText<OUTPUT extends StructuredOutputSpec>(
  args: GenerateWithFailoverArgs<OUTPUT>,
  model: GenerateTextParams<OUTPUT>["model"]
): Promise<GenerateTextResult<ToolSet, OUTPUT>> {
  return generateText({
    ...args,
    model,
  } as Parameters<typeof generateText>[0]) as Promise<
    GenerateTextResult<ToolSet, OUTPUT>
  >
}

/**
 * Best-effort counter bump via scheduler (does not block the AI path).
 * Schedule failures are logged; the mutation itself runs asynchronously.
 */
function recordProviderCall(ctx: ActionCtx, provider: AiProvider): void {
  try {
    void ctx.scheduler
      .runAfter(0, internal.aiProviderUsage.recordCall, { provider })
      .catch((error: unknown) => {
        console.warn(
          `AI usage counter schedule failed for provider=${provider}:`,
          error instanceof Error ? error.message : error
        )
      })
  } catch (error) {
    console.warn(
      `AI usage counter schedule failed for provider=${provider}:`,
      error instanceof Error ? error.message : error
    )
  }
}

/**
 * Structured-output overload — `result.output` matches the schema behind
 * `Output.object({ schema })` (not `any`).
 */
export async function generateWithFailover<
  OUTPUT extends StructuredOutputSpec,
>(
  ctx: ActionCtx,
  args: Omit<GenerateWithFailoverArgs<OUTPUT>, "output"> & { output: OUTPUT }
): Promise<GenerateTextResult<ToolSet, OUTPUT>>

/**
 * Plain-text overload — `result.text` is `string` (summary path).
 */
export async function generateWithFailover(
  ctx: ActionCtx,
  args: Omit<GenerateWithFailoverArgs, "output"> & { output?: undefined }
): Promise<GenerateTextResult<ToolSet, StructuredOutputSpec>>

export async function generateWithFailover<
  OUTPUT extends StructuredOutputSpec,
>(
  ctx: ActionCtx,
  args: GenerateWithFailoverArgs<OUTPUT>
): Promise<GenerateTextResult<ToolSet, OUTPUT>> {
  try {
    // --- Attempt 1: OpenAI (primary) ---
    const result = await callGenerateText(args, getPrimaryModel())
    recordProviderCall(ctx, "openai")
    // Convex dashboard log: healthy path, no failover.
    console.log(
      `AI step ok provider=openai model=${PRIMARY_MODEL_ID} failover=false`
    )
    return result
  } catch (primaryError) {
    // Count the OpenAI attempt even when it failed (quota / outage still billed).
    recordProviderCall(ctx, "openai")

    // Bad prompt / schema / photo policy → bubble up immediately (no Gemini).
    if (!isFailoverEligibleAiError(primaryError)) {
      throw primaryError
    }

    // Eligible outage, but no Gemini key on this Convex deployment → behave
    // like today (OpenAI-only failure). Do not crash at import time.
    if (!hasFallbackApiKey()) {
      const described = describeUnknownError(primaryError)
      console.warn(
        "AI primary failed; Gemini failover skipped (GOOGLE_GENERATIVE_AI_API_KEY unset):",
        described.message
      )
      await persistErrorEvent(ctx, {
        source: "convex",
        severity: "warn",
        area: "ai.failover",
        message: described.message,
        stack: described.stack,
        path: "generateWithFailover",
        meta: {
          stage: "primary_failed_no_fallback_key",
          primaryModel: PRIMARY_MODEL_ID,
        },
      })
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
      recordProviderCall(ctx, "gemini")
      // Convex dashboard log: failover succeeded (mixed providers in one
      // ceremony are OK for v1 availability).
      console.log(
        `AI step ok provider=gemini model=${FALLBACK_MODEL_ID} failover=true`
      )
      const primaryDescribed = describeUnknownError(primaryError)
      await persistErrorEvent(ctx, {
        source: "convex",
        severity: "warn",
        area: "ai.failover",
        message: `Primary failed; Gemini succeeded: ${primaryDescribed.message}`,
        stack: primaryDescribed.stack,
        path: "generateWithFailover",
        meta: {
          stage: "failover_succeeded",
          primaryModel: PRIMARY_MODEL_ID,
          fallbackModel: FALLBACK_MODEL_ID,
        },
      })
      return result
    } catch (fallbackError) {
      recordProviderCall(ctx, "gemini")
      // Both providers failed → existing normalizeAiError / Retry paths handle UX.
      const described = describeUnknownError(fallbackError)
      console.error("AI failover (Gemini) also failed:", described.message)
      await persistErrorEvent(ctx, {
        source: "convex",
        severity: "error",
        area: "ai.failover",
        message: described.message,
        stack: described.stack,
        path: "generateWithFailover",
        meta: {
          stage: "both_providers_failed",
          primaryModel: PRIMARY_MODEL_ID,
          fallbackModel: FALLBACK_MODEL_ID,
          primaryError: describeUnknownError(primaryError).message,
        },
      })
      throw fallbackError
    }
  }
}
