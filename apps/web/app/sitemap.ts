import type { MetadataRoute } from "next"

import { SITE_URL } from "@workspace/shared/constants/site"

/** Indexable marketing and legal routes for search engines. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const routes: Array<{
    path: string
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
    priority: number
  }> = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/cat-name-generator", changeFrequency: "monthly", priority: 0.9 },
    { path: "/about", changeFrequency: "monthly", priority: 0.8 },
    { path: "/examples", changeFrequency: "monthly", priority: 0.8 },
    { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  ]

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }))
}
