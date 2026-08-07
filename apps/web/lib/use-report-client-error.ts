"use client"

import { useMutation } from "convex/react"

import { api } from "@workspace/backend/_generated/api"
import type { Id } from "@workspace/backend/_generated/dataModel"

import {
  reportUnexpectedClientError,
  type ReportClientErrorArgs,
} from "@/lib/report-client-error"

/**
 * Returns a stable reporter that posts unexpected errors to Convex.
 * Safe to call from catch blocks — never throws to the caller.
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
    source?: "web-client" | "web-server"
  }) => {
    reportUnexpectedClientError(
      (args: ReportClientErrorArgs) =>
        report({
          ...args,
          catId: args.catId as Id<"cats"> | undefined,
        }),
      options,
    )
  }
}
