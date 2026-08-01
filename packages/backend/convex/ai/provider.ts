/**
 * AI provider wiring for the naming ceremony pipeline.
 * OpenAI is primary; Google Gemini is silent failover (see AI-FAILOVER.md).
 */

import { google } from "@ai-sdk/google"
import { openai } from "@ai-sdk/openai"

/** Primary model — vision + structured output (existing production choice). */
export const PRIMARY_MODEL_ID = "gpt-4o-mini"

/**
 * Fallback model — Flash-class multimodal peer via @ai-sdk/google.
 * Env: GOOGLE_GENERATIVE_AI_API_KEY (read automatically by the provider).
 */
export const FALLBACK_MODEL_ID = "gemini-2.5-flash"

export const GOOGLE_API_KEY_ENV = "GOOGLE_GENERATIVE_AI_API_KEY"

export function getPrimaryModel() {
  return openai(PRIMARY_MODEL_ID)
}

export function getFallbackModel() {
  return google(FALLBACK_MODEL_ID)
}

/** True when Convex has a Gemini key configured for failover. */
export function hasFallbackApiKey(): boolean {
  const value = process.env[GOOGLE_API_KEY_ENV]
  return typeof value === "string" && value.trim().length > 0
}
