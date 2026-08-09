/**
 * Client-side helpers for persisting unexpected errors into Convex error_events.
 * Expected ConvexError codes are skipped so validation/auth noise stays out of the log.
 */

import { getConvexErrorData } from "@workspace/shared/utils/convex-error"

export type ReportClientErrorArgs = {
  /** Browser reports are always web-client; server assigns web-server internally. */
  source: "web-client"
  severity?: "error" | "warn"
  area: string
  message: string
  code?: string
  catId?: string
  path?: string
  stack?: string
  meta?: Record<string, string>
  /** Opaque per-browser session key for unauthenticated rate limiting. */
  sessionKey?: string
}

type ReportClientErrorFn = (args: ReportClientErrorArgs) => Promise<unknown>

const SESSION_STORAGE_KEY = "nb_error_report_session"

/** Stable browser session id for anonymous rate limiting (sessionStorage). */
export function getErrorReportSessionKey(): string {
  if (typeof window === "undefined") {
    return "ssr"
  }
  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (existing !== null && existing.length >= 8) {
      return existing
    }
    const created =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, created)
    return created
  } catch {
    return `mem_${Date.now().toString(36)}`
  }
}

/** True when the error already carries a structured ConvexError code (expected UX path). */
export function isExpectedConvexError(error: unknown): boolean {
  const data = getConvexErrorData(error)
  return typeof data?.code === "string" && data.code.length > 0
}

function describeError(error: unknown): { message: string; stack?: string } {
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
 * Fire-and-forget report. Never throws. Skips expected ConvexError codes.
 * Always reports as `web-client`.
 */
export function reportUnexpectedClientError(
  report: ReportClientErrorFn,
  options: {
    area: string
    error: unknown
    path?: string
    catId?: string
    meta?: Record<string, string>
    severity?: "error" | "warn"
  },
): void {
  if (isExpectedConvexError(options.error)) {
    return
  }

  const described = describeError(options.error)
  const code = getConvexErrorData(options.error)?.code

  void report({
    source: "web-client",
    severity: options.severity ?? "error",
    area: options.area,
    message: described.message,
    code,
    catId: options.catId,
    path: options.path,
    stack: described.stack,
    meta: options.meta,
    sessionKey: getErrorReportSessionKey(),
  }).catch((reportError: unknown) => {
    console.error("Failed to report client error", reportError)
  })
}
