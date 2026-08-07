"use client"

import * as React from "react"

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Root-layout failure fallback. Replaces the root layout, so Convex/Clerk are
 * unavailable — console only (see ERROR-LOGGING.md). Prefer app/error.tsx for
 * normal segment crashes.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  React.useEffect(() => {
    console.error("Global app error", error)
  }, [error])

  return (
    <html lang="en-GB">
      <body
        style={{
          margin: 0,
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
          background: "#0f1419",
          color: "#f4f1ea",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
            Something went wrong
          </h1>
          <p style={{ opacity: 0.8, marginBottom: "1.25rem" }}>
            Please try again. If this keeps happening, contact support.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              border: "1px solid rgba(244,241,234,0.35)",
              background: "transparent",
              color: "inherit",
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
