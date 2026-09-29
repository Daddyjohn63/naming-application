import { readBlogSearchQuery } from "@/modules/blog/lib/filter-posts"
import {
  listCategories,
  listPublishedPosts,
  toBlogSearchPost,
} from "@/modules/blog/lib/posts"
import { BlogIndexView } from "@/modules/blog/ui/views/blog-index-view"
import { createPageMetadata } from "@/lib/seo/metadata"

const title = "Blog"
const description =
  "A public notebook on family names, cat-world names, and the one you never quite catch."

export const metadata = createPageMetadata({
  title,
  description,
  path: "/blog",
})

type BlogPageProps = {
  searchParams: Promise<{ q?: string | string[] }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const query = readBlogSearchQuery((await searchParams).q)

  return (
    <BlogIndexView
      posts={listPublishedPosts().map(toBlogSearchPost)}
      categories={listCategories()}
      query={query}
    />
  )
}
