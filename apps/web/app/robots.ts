import type { MetadataRoute } from "next"

import { SITE_URL } from "@workspace/shared/constants/site"

/** Crawl rules — allow public marketing; block auth, app, and legacy pages. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/cats",
          "/cats/",
          "/c/",
          "/sign-in",
          "/sign-in/",
          "/sign-up",
          "/sign-up/",
          "/home-legacy",
          "/home-legacy/",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
