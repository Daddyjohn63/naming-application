"use client"

import { useMutation } from "convex/react"

import { api } from "@workspace/backend/_generated/api"
import type { Id } from "@workspace/backend/_generated/dataModel"

import {
  reportUnexpectedClientError,
  type ReportClientErrorArgs,
} from "@/lib/report-client-error"

/**
 * Returns a stable reporter that posts unexpected browser errors to Convex.
 * Safe to call from catch blocks — never throws to the caller.
 * Source is always `web-client` (server paths assign `web-server` internally).
 */
export function useReportClientError() {
  const report = useMutation(api.errorEvents.reportClientError)

  return (options: {
    area: string
    error: unknown
    path?: string
    catId?: Id<"cats"> | string
    meta?: Record<string, string>
    severity?: "error" | "warn"
  }) => {
    reportUnexpectedClientError(
      async (args: ReportClientErrorArgs) => {
        await report({
          severity: args.severity,
          area: args.area,
          message: args.message,
          code: args.code,
          catId: args.catId as Id<"cats"> | undefined,
          path: args.path,
          stack: args.stack,
          meta: args.meta,
          sessionKey: args.sessionKey,
        })
      },
      options,
    )
  }
}
