import fs from "node:fs"
import path from "node:path"

import matter from "gray-matter"
import { JSON_SCHEMA, load as loadYaml } from "js-yaml"
import {
  type BlogCategory,
  BlogSlugError,
  assertUniquePostSlugs,
  normalizeCategoryLabel,
  resolveCategoryLabels,
  slugify,
} from "@workspace/shared/utils/blog-slug"

import type { BlogSearchPost } from "@/modules/blog/lib/blog-search-post"
import { markdownToPlainText } from "@/modules/blog/lib/markdown-plain-text"

/**
 * The only reader of `content/blog` Markdown. Pages call these functions.
 * Do not import this module from a client component.
 */

const BLOG_DIRECTORY = path.join(process.cwd(), "content", "blog")
const PUBLIC_DIRECTORY = path.resolve(process.cwd(), "public")

export type BlogPost = {
  slug: string
  title: string
  subtitle?: string
  excerpt: string
  description?: string
  published: boolean
  publishedAt?: string
  categories: BlogCategory[]
  image?: string
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
  body: string
  plainText: string
  sourcePath: string
}

export type PublishedBlogPost = BlogPost & {
  published: true
  publishedAt: string
}

type ParsedFile = {
  sourcePath: string
  title: string
  subtitle?: string
  excerpt: string
  description?: string
  published: boolean
  publishedAt?: string
  categoryLabels: string[]
  image?: string
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
  slug: string
  body: string
  plainText: string
}

let cachedPosts: BlogPost[] | undefined
let cachedError: Error | undefined

export function listPublishedPosts(): PublishedBlogPost[] {
  return loadPosts().filter(isPublishedPost).sort(comparePublishedPosts)
}

export function getPostBySlug(slug: string): PublishedBlogPost | null {
  return listPublishedPosts().find((post) => post.slug === slug) ?? null
}

/** Drafts only. Call this from `next dev` previews, not from public listings. */
export function getDraftPostBySlug(slug: string): BlogPost | null {
  return (
    loadPosts().find((post) => post.slug === slug && !post.published) ?? null
  )
}

/** Card and search fields. Omits the Markdown body so the client filter stays small. */
export function toBlogSearchPost(post: PublishedBlogPost): BlogSearchPost {
  return {
    slug: post.slug,
    title: post.title,
    subtitle: post.subtitle,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
    categories: post.categories,
    image: post.image,
    imageAlt: post.imageAlt,
    imageWidth: post.imageWidth,
    imageHeight: post.imageHeight,
    plainText: post.plainText,
  }
}

/** Categories that appear on at least one published post, first-seen order. */
export function listCategories(): BlogCategory[] {
  const seen = new Set<string>()
  const categories: BlogCategory[] = []

  for (const post of listPublishedPosts()) {
    for (const category of post.categories) {
      if (seen.has(category.slug)) continue
      seen.add(category.slug)
      categories.push(category)
    }
  }

  return categories
}

export function getCategoryBySlug(slug: string): BlogCategory | null {
  return listCategories().find((category) => category.slug === slug) ?? null
}

/** Published posts in one category, newest `publishedAt` first. */
export function listPublishedPostsInCategory(
  slug: string
): PublishedBlogPost[] {
  return listPublishedPosts().filter((post) =>
    post.categories.some((category) => category.slug === slug)
  )
}

function loadPosts(): BlogPost[] {
  if (!isProductionBuild()) {
    return readPosts()
  }

  if (cachedError) throw cachedError
  if (cachedPosts) return cachedPosts

  try {
    cachedPosts = readPosts()
    return cachedPosts
  } catch (error) {
    cachedError =
      error instanceof Error ? error : new Error("Could not load blog posts.")
    throw cachedError
  }
}

function isProductionBuild(): boolean {
  // Draft previews and file edits re-read Markdown while `next dev` is running.
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  return process.env.NODE_ENV === "production"
}

function readPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIRECTORY)) {
    throw new Error(`Blog directory not found: ${BLOG_DIRECTORY}`)
  }

  const fileNames = fs
    .readdirSync(BLOG_DIRECTORY)
    .filter((name) => name.endsWith(".md"))
    .sort()

  const errors: string[] = []
  const parsed: ParsedFile[] = []

  for (const fileName of fileNames) {
    const sourcePath = path.posix.join("content/blog", fileName)
    try {
      parsed.push(parsePostFile(fileName, sourcePath))
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error))
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"))
  }

  try {
    assertUniquePostSlugs(
      parsed.map((post) => ({ slug: post.slug, source: post.sourcePath }))
    )
  } catch (error) {
    if (error instanceof BlogSlugError) {
      throw new Error(error.message)
    }
    throw error
  }

  const canonical = new Map(
    resolveCategoryLabels(
      parsed.flatMap((post) =>
        post.categoryLabels.map((label) => ({
          label,
          source: post.sourcePath,
        }))
      )
    ).map((category) => [category.slug, category])
  )

  return parsed.map((post) => ({
    slug: post.slug,
    title: post.title,
    subtitle: post.subtitle,
    excerpt: post.excerpt,
    description: post.description,
    published: post.published,
    publishedAt: post.publishedAt,
    categories: categoriesForPost(post, canonical),
    image: post.image,
    imageAlt: post.imageAlt,
    imageWidth: post.imageWidth,
    imageHeight: post.imageHeight,
    body: post.body,
    plainText: post.plainText,
    sourcePath: post.sourcePath,
  }))
}

function parsePostFile(fileName: string, sourcePath: string): ParsedFile {
  const absolutePath = path.join(BLOG_DIRECTORY, fileName)
  const raw = fs.readFileSync(absolutePath, "utf8")
  const document = matter(raw, {
    engines: {
      yaml: {
        // Keep `publishedAt` as the authored YYYY-MM-DD string.
        parse: (source: string) =>
          loadYaml(source, { schema: JSON_SCHEMA }) as object,
      },
    },
  })
  const data = asRecord(document.data, sourcePath)

  const title = requireText(data.title, "title", sourcePath)
  const excerpt = requireText(data.excerpt, "excerpt", sourcePath)
  const published = requireBoolean(data.published, sourcePath)
  const categoryLabels = requireCategories(data.categories, sourcePath)
  const subtitle = optionalText(data.subtitle)
  const description = optionalText(data.description)
  const image = optionalImage(data.image, data.imageAlt, sourcePath)
  const publishedAt = optionalPublishedAt(
    data.publishedAt,
    published,
    sourcePath
  )
  const slug = deriveSlug(title, data.slug, sourcePath)
  const body = document.content.replace(/^\n+/, "").replace(/\s+$/, "")

  return {
    sourcePath,
    title,
    subtitle,
    excerpt,
    description,
    published,
    publishedAt,
    categoryLabels,
    image: image?.src,
    imageAlt: image?.alt,
    imageWidth: image?.width,
    imageHeight: image?.height,
    slug,
    body,
    plainText: markdownToPlainText(body),
  }
}

function deriveSlug(
  title: string,
  override: unknown,
  sourcePath: string
): string {
  if (override !== undefined && typeof override !== "string") {
    throw new Error(`${sourcePath}: slug must be a string.`)
  }

  const source = override === undefined ? title : override

  try {
    return slugify(source)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid slug."
    throw new Error(`${sourcePath}: ${message}`)
  }
}

function categoriesForPost(
  post: ParsedFile,
  canonical: Map<string, BlogCategory>
): BlogCategory[] {
  const seen = new Set<string>()
  const categories: BlogCategory[] = []

  for (const label of post.categoryLabels) {
    const slug = slugify(normalizeCategoryLabel(label))
    if (seen.has(slug)) continue
    seen.add(slug)
    const category = canonical.get(slug)
    if (category === undefined) {
      throw new Error(`${post.sourcePath}: missing category "${label}".`)
    }
    categories.push(category)
  }

  return categories
}

function asRecord(value: unknown, sourcePath: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${sourcePath}: front matter must be a mapping.`)
  }

  return value as Record<string, unknown>
}

function requireText(
  value: unknown,
  field: string,
  sourcePath: string
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${sourcePath}: ${field} must be a non-empty string.`)
  }

  return value.trim()
}

function optionalText(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function requireBoolean(value: unknown, sourcePath: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`${sourcePath}: published must be true or false.`)
  }

  return value
}

function requireCategories(value: unknown, sourcePath: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${sourcePath}: categories must list one or more names.`)
  }

  return value.map((item, index) => {
    if (typeof item !== "string" || normalizeCategoryLabel(item).length === 0) {
      throw new Error(
        `${sourcePath}: categories[${index}] must be a non-empty name.`
      )
    }
    return item
  })
}

function optionalPublishedAt(
  value: unknown,
  published: boolean,
  sourcePath: string
): string | undefined {
  if (value === undefined || value === null || value === "") {
    if (published) {
      throw new Error(
        `${sourcePath}: publishedAt is required when published is true.`
      )
    }
    return undefined
  }

  if (typeof value !== "string" || !isIsoDate(value)) {
    throw new Error(`${sourcePath}: publishedAt must be a YYYY-MM-DD date.`)
  }

  return value
}

function optionalImage(
  image: unknown,
  imageAlt: unknown,
  sourcePath: string
): { src: string; alt: string; width?: number; height?: number } | undefined {
  if (image === undefined || image === null || image === "") {
    return undefined
  }

  if (typeof image !== "string" || !isBlogImage(image)) {
    throw new Error(
      `${sourcePath}: image must be a /blog/… path or an https:// URL.`
    )
  }

  if (typeof imageAlt !== "string" || imageAlt.trim().length === 0) {
    throw new Error(`${sourcePath}: imageAlt is required when image is set.`)
  }

  const size = image.startsWith("/blog/")
    ? readLocalImageSize(image)
    : undefined

  return {
    src: image,
    alt: imageAlt.trim(),
    width: size?.width,
    height: size?.height,
  }
}

function isBlogImage(value: string): boolean {
  if (value.startsWith("/blog/")) {
    const rest = value.slice("/blog/".length)
    return (
      rest.length > 0 &&
      !rest.split("/").includes("..") &&
      !value.includes("\\")
    )
  }

  if (!value.startsWith("https://")) return false

  try {
    const url = new URL(value)
    return url.protocol === "https:" && url.hostname.length > 0
  } catch {
    return false
  }
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const year = Number(value.slice(0, 4))
  const month = Number(value.slice(5, 7))
  const day = Number(value.slice(8, 10))
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

function readLocalImageSize(
  imagePath: string
): { width: number; height: number } | undefined {
  const relative = imagePath.replace(/^\//, "")
  const file = path.resolve(PUBLIC_DIRECTORY, relative)
  const rootWithSep = PUBLIC_DIRECTORY.endsWith(path.sep)
    ? PUBLIC_DIRECTORY
    : `${PUBLIC_DIRECTORY}${path.sep}`

  if (!file.startsWith(rootWithSep) || !fs.existsSync(file)) {
    return undefined
  }

  const buffer = fs.readFileSync(file)
  return readJpegSize(buffer) ?? readPngSize(buffer)
}

function readJpegSize(
  buffer: Buffer
): { width: number; height: number } | undefined {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return undefined
  }

  let offset = 2
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) return undefined
    const marker = buffer[offset + 1]
    if (marker === undefined) return undefined
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2
      continue
    }

    const length = buffer.readUInt16BE(offset + 2)
    if (length < 2) return undefined

    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      const height = buffer.readUInt16BE(offset + 5)
      const width = buffer.readUInt16BE(offset + 7)
      if (width > 0 && height > 0) return { width, height }
      return undefined
    }

    offset += 2 + length
  }

  return undefined
}

function readPngSize(
  buffer: Buffer
): { width: number; height: number } | undefined {
  if (
    buffer.length < 24 ||
    buffer[0] !== 0x89 ||
    buffer[1] !== 0x50 ||
    buffer[2] !== 0x4e ||
    buffer[3] !== 0x47
  ) {
    return undefined
  }

  const width = buffer.readUInt32BE(16)
  const height = buffer.readUInt32BE(20)
  if (width === 0 || height === 0) return undefined
  return { width, height }
}

function isPublishedPost(post: BlogPost): post is PublishedBlogPost {
  return post.published && typeof post.publishedAt === "string"
}

function comparePublishedPosts(
  left: PublishedBlogPost,
  right: PublishedBlogPost
): number {
  const byDate = right.publishedAt.localeCompare(left.publishedAt)
  if (byDate !== 0) return byDate
  return left.title.localeCompare(right.title, "en-GB")
}
