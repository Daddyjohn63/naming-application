/**
 * Decide whether an AI provider error should trigger Gemini failover.
 * Dependency-free so Node tests and Convex can both import it.
 * See ai-docs/production/AI-FAILOVER.md.
 */

/** HTTP statuses that indicate infra / availability problems worth a Gemini retry. */
const FAILOVER_HTTP_STATUS_CODES = new Set([401, 403, 429, 500, 502, 503, 529])

/**
 * Message patterns for network / overload failures when status is missing.
 * Keep schema / content-policy wording out — those are handled by NON_FAILOVER.
 */
const FAILOVER_MESSAGE_PATTERN =
  /\b(429|500|502|503|529|overloaded|service unavailable|temporarily unavailable|timeout|timed out|econnreset|enotfound|econnrefused|network|fetch failed|api.?connection|rate limit|too many requests|internal server error|bad gateway|gateway timeout|connection reset|socket hang up|unauthorized|invalid.?api.?key|incorrect.?api.?key)\b/i

/** Business / content failures — do not burn a second provider call. */
const NON_FAILOVER_MESSAGE_PATTERN =
  /\b(no object generated|type validation|did not match|schema validation|content.?policy|safety|blocked|invalid.?image|unsupported.?format)\b/i

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return ""
}

function readStatusCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("statusCode" in error)) {
    return undefined
  }
  const statusCode = (error as { statusCode: unknown }).statusCode
  return typeof statusCode === "number" ? statusCode : undefined
}

function readLastError(error: unknown): unknown {
  if (typeof error !== "object" || error === null || !("lastError" in error)) {
    return undefined
  }
  return (error as { lastError: unknown }).lastError
}

/**
 * True when the primary provider failure is availability/infra related
 * and a Gemini retry is appropriate.
 */
export function isFailoverEligibleAiError(error: unknown): boolean {
  const nested = readLastError(error)
  if (nested !== undefined) {
    return isFailoverEligibleAiError(nested)
  }

  const statusCode = readStatusCode(error)
  if (
    statusCode !== undefined &&
    FAILOVER_HTTP_STATUS_CODES.has(statusCode)
  ) {
    return true
  }

  const message = errorMessage(error)
  if (message.length === 0) {
    return false
  }

  if (NON_FAILOVER_MESSAGE_PATTERN.test(message)) {
    return false
  }

  return FAILOVER_MESSAGE_PATTERN.test(message)
}
