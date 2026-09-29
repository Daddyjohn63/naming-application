import type { BlogCategory } from "@workspace/shared/utils/blog-slug"

/** Serializable post fields for the client search list. No Markdown body. */
export type BlogSearchPost = {
  slug: string
  title: string
  subtitle?: string
  excerpt: string
  publishedAt: string
  categories: BlogCategory[]
  image?: string
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
  plainText: string
}
