import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { isFailoverEligibleAiError } from "./is-failover-eligible-ai-error.ts"

describe("isFailoverEligibleAiError", () => {
  it("returns true for HTTP 503 status on error-like objects", () => {
    assert.equal(
      isFailoverEligibleAiError(
        Object.assign(new Error("Service Unavailable"), { statusCode: 503 })
      ),
      true
    )
  })

  it("returns true for HTTP 429 rate limit", () => {
    assert.equal(
      isFailoverEligibleAiError(
        Object.assign(new Error("Too Many Requests"), { statusCode: 429 })
      ),
      true
    )
  })

  it("returns true for network-ish message without status", () => {
    assert.equal(
      isFailoverEligibleAiError(new Error("fetch failed: ECONNRESET")),
      true
    )
  })

  it("returns true when lastError wraps a failover-eligible error", () => {
    const inner = Object.assign(new Error("Overloaded"), { statusCode: 529 })
    assert.equal(
      isFailoverEligibleAiError(
        Object.assign(new Error("Failed after retries"), { lastError: inner })
      ),
      true
    )
  })

  it("returns false for structured-output / schema validation errors", () => {
    assert.equal(
      isFailoverEligibleAiError(
        new Error("No object generated: type validation failed")
      ),
      false
    )
  })

  it("returns false for content-policy style photo errors", () => {
    assert.equal(
      isFailoverEligibleAiError(
        new Error("Request rejected due to content policy on image")
      ),
      false
    )
  })

  it("returns false for empty / unknown errors", () => {
    assert.equal(isFailoverEligibleAiError(undefined), false)
    assert.equal(isFailoverEligibleAiError({}), false)
  })
})
