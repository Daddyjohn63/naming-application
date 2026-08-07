/**
 * Client-side helpers for persisting unexpected errors into Convex error_events.
 * Expected ConvexError codes are skipped so validation/auth noise stays out of the log.
 */

import { getConvexErrorData } from "@workspace/shared/utils/convex-error"

export type ReportClientErrorArgs = {
  source: "web-client" | "web-server"
  severity?: "error" | "warn"
  area: string
  message: string
  code?: string
  catId?: string
  path?: string
  stack?: string
  meta?: Record<string, string>
}

type ReportClientErrorFn = (args: ReportClientErrorArgs) => Promise<unknown>

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
    return { message: JSON.stringify(error) }
  } catch {
    return { message: "Unknown error" }
  }
}

/**
 * Fire-and-forget report. Never throws. Skips expected ConvexError codes.
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
    source?: "web-client" | "web-server"
  },
): void {
  if (isExpectedConvexError(options.error)) {
    return
  }

  const described = describeError(options.error)
  const code = getConvexErrorData(options.error)?.code

  void report({
    source: options.source ?? "web-client",
    severity: options.severity ?? "error",
    area: options.area,
    message: described.message,
    code,
    catId: options.catId,
    path: options.path,
    stack: described.stack,
    meta: options.meta,
  }).catch((reportError: unknown) => {
    console.error("Failed to report client error", reportError)
  })
}
