/** @type {import('next').NextConfig} */

/**
 * Baseline hardening headers (SECURITY.md M4).
 * Content-Security-Policy is set by Clerk `clerkMiddleware` in `proxy.ts`
 * so FAPI / bot-protection hosts stay correct across environments.
 */
async function securityHeaders() {
  /** @type {{ key: string, value: string }[]} */
  const headers = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    { key: "X-Frame-Options", value: "DENY" },
    {
      key: "Permissions-Policy",
      value:
        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
    },
  ]

  // Local http://localhost — skip HSTS. Vercel HTTPS production gets it here
  // (and may also set HSTS at the edge; duplicate HSTS is fine if values align).
  if (process.env.NODE_ENV === "production") {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    })
  }

  return [
    {
      source: "/:path*",
      headers,
    },
  ]
}

const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/shared"],
  headers: securityHeaders,
}

export default nextConfig
