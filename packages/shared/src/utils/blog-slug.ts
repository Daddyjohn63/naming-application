/** Slug rules for blog posts and categories. Pure: no filesystem access. */

export const MAX_BLOG_SLUG_LENGTH = 80

/** Post URLs cannot use this slug; category pages live at `/blog/category/…`. */
export const RESERVED_BLOG_POST_SLUGS = ["category"] as const

export class BlogSlugError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "BlogSlugError"
  }
}

export type SlugSource = {
  slug: string
  source: string
}

export type CategorySource = {
  label: string
  source: string
}

export type BlogCategory = {
  label: string
  slug: string
}

/**
 * Derive a URL slug.
 *
 * Unicode-normalise, strip diacritics, lowercase, turn `&` into `and`,
 * collapse everything else into hyphens, then cut at 80 characters on a
 * hyphen when there is one. Throws when the result is empty.
 */
export function slugify(value: string): string {
  const withoutMarks = value.normalize("NFKD").replace(/\p{M}/gu, "")
  const hyphenated = withoutMarks
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  const cut = cutSlug(hyphenated)
  if (cut.length === 0) {
    throw new BlogSlugError(
      "Slug is empty. Change the title or set a slug override."
    )
  }

  return cut
}

function cutSlug(slug: string): string {
  if (slug.length <= MAX_BLOG_SLUG_LENGTH) {
    return slug
  }

  const window = slug.slice(0, MAX_BLOG_SLUG_LENGTH)
  const hyphenAt = window.lastIndexOf("-")
  const cut = hyphenAt === -1 ? window : window.slice(0, hyphenAt)
  return cut.replace(/-+$/g, "")
}

/** Fail when two sources share a slug, or a post slug is reserved. */
export function assertUniquePostSlugs(entries: readonly SlugSource[]): void {
  const seen = new Map<string, string>()
  const errors: string[] = []

  for (const entry of entries) {
    if (isReservedPostSlug(entry.slug)) {
      errors.push(
        `Reserved slug "${entry.slug}" in ${entry.source}. Post slugs cannot be "category".`
      )
    }

    const previous = seen.get(entry.slug)
    if (previous !== undefined) {
      errors.push(
        `Duplicate slug "${entry.slug}" in ${previous} and ${entry.source}.`
      )
    } else {
      seen.set(entry.slug, entry.source)
    }
  }

  if (errors.length > 0) {
    throw new BlogSlugError(errors.join("\n"))
  }
}

function isReservedPostSlug(slug: string): boolean {
  return (RESERVED_BLOG_POST_SLUGS as readonly string[]).includes(slug)
}

/** Trim and collapse internal whitespace. This is the label shown on the site. */
export function normalizeCategoryLabel(label: string): string {
  return label.trim().replace(/\s+/g, " ")
}

/**
 * One category per slug. Labels that differ only by case collapse to the
 * first spelling. Labels that share a slug but differ by more than case fail.
 */
export function resolveCategoryLabels(
  entries: readonly CategorySource[]
): BlogCategory[] {
  const groups = new Map<string, BlogCategory & { sources: string[] }>()
  const errors: string[] = []

  for (const entry of entries) {
    const label = normalizeCategoryLabel(entry.label)
    if (label.length === 0) {
      throw new BlogSlugError(
        `${entry.source}: categories must list one or more names.`
      )
    }

    const slug = slugify(label)
    const existing = groups.get(slug)
    if (existing === undefined) {
      groups.set(slug, { label, slug, sources: [entry.source] })
      continue
    }

    if (existing.label.toLowerCase() !== label.toLowerCase()) {
      errors.push(
        `Category labels "${existing.label}" (${existing.sources.join(", ")}) and "${label}" (${entry.source}) share the slug "${slug}".`
      )
    }
  }

  if (errors.length > 0) {
    throw new BlogSlugError(errors.join("\n"))
  }

  return [...groups.values()].map(({ label, slug }) => ({ label, slug }))
}
