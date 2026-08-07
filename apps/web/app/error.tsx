"use client"

import * as React from "react"
import Link from "next/link"
import { useMutation } from "convex/react"

import { api } from "@workspace/backend/_generated/api"
import type { Id } from "@workspace/backend/_generated/dataModel"
import { Button } from "@workspace/ui/components/button"

import {
  getErrorReportSessionKey,
  reportUnexpectedClientError,
  type ReportClientErrorArgs,
} from "@/lib/report-client-error"

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Segment error UI — reports once to error_events, then offers retry / home.
 * Lives under root Providers, so Convex is available.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const report = useMutation(api.errorEvents.reportClientError)
  const lastReportedErrorRef = React.useRef<Error | null>(null)

  React.useEffect(() => {
    console.error("App route error", error)
    if (lastReportedErrorRef.current === error) {
      return
    }
    lastReportedErrorRef.current = error
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
          sessionKey: args.sessionKey ?? getErrorReportSessionKey(),
        })
      },
      {
        area: "react",
        error,
        path:
          typeof window !== "undefined" ? window.location.pathname : undefined,
        meta:
          error.digest !== undefined ? { digest: error.digest } : undefined,
      },
    )
  }, [error, report])

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-muted-foreground text-sm">
        We&apos;ve logged the issue. You can try again, or head back home.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </main>
  )
}
