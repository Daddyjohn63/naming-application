import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
  "/about(.*)",
  "/pricing(.*)",
  "/examples(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  // SEO / PWA discovery endpoints must stay crawlable without auth
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
  "/opengraph-image(.*)",
  "/twitter-image(.*)",
  "/icon(.*)",
  "/apple-icon(.*)",
])

/**
 * Convex hosts for CSP (SECURITY.md M4).
 * Hostnames like `*.eu-west-1.convex.cloud` need an explicit entry —
 * a single `*.convex.cloud` wildcard only matches one DNS label.
 */
function convexCspHosts(): string[] {
  const raw = process.env.NEXT_PUBLIC_CONVEX_URL
  if (raw === undefined || raw === "") {
    return ["https://*.convex.cloud", "wss://*.convex.cloud"]
  }
  try {
    const { host } = new URL(raw)
    return [`https://${host}`, `wss://${host}`]
  } catch {
    return ["https://*.convex.cloud", "wss://*.convex.cloud"]
  }
}

const convexHosts = convexCspHosts()

export default clerkMiddleware(
  async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect()
    }
  },
  {
    // Clerk injects FAPI + Cloudflare challenge + protect.clerk.com automatically.
    // Merge Convex (realtime + storage) and blob/data for certificate capture.
    contentSecurityPolicy: {
      directives: {
        "connect-src": convexHosts,
        "img-src": [...convexHosts.filter((h) => h.startsWith("https://")), "blob:", "data:"],
      },
    },
  },
)

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
