export type BlogSearchFields = {
  title: string
  subtitle?: string
  excerpt: string
  plainText: string
  categories: readonly { label: string }[]
}

export function readBlogSearchQuery(
  value: string | string[] | undefined
): string {
  return typeof value === "string" ? value : ""
}

export function blogSearchTerms(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0)
}

/** Every term must appear in the title, subtitle, excerpt, plain body, or a category label. */
export function filterBlogPosts<T extends BlogSearchFields>(
  posts: readonly T[],
  query: string
): T[] {
  const terms = blogSearchTerms(query)
  if (terms.length === 0) return [...posts]

  return posts.filter((post) => {
    const haystack = [
      post.title,
      post.subtitle ?? "",
      post.excerpt,
      post.plainText,
      post.categories.map((category) => category.label).join(" "),
    ]
      .join("\n")
      .toLowerCase()

    return terms.every((term) => haystack.includes(term))
  })
}
