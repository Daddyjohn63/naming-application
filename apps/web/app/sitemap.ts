import type { MetadataRoute } from "next"

import { SITE_URL } from "@workspace/shared/constants/site"

import { listCategories, listPublishedPosts } from "@/modules/blog/lib/posts"

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
    { path: "/unique-cat-names", changeFrequency: "monthly", priority: 0.9 },
    { path: "/about", changeFrequency: "monthly", priority: 0.8 },
    { path: "/examples", changeFrequency: "monthly", priority: 0.8 },
    { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  ]

  const staticRoutes = routes.map(({ path, changeFrequency, priority }) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }))

  const posts = listPublishedPosts()
  const categories = listCategories()

  return [
    ...staticRoutes,
    {
      url: `${SITE_URL}/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(`${post.publishedAt}T00:00:00.000Z`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...categories.map((category) => ({
      url: `${SITE_URL}/blog/category/${category.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ]
}
