import type { BlogSearchPost } from "@/modules/blog/lib/blog-search-post"
import { BlogPostList } from "@/modules/blog/ui/components/blog-post-list"
import { BlogShell } from "@/modules/blog/ui/components/blog-shell"
import type { BlogCategory } from "@workspace/shared/utils/blog-slug"

type BlogIndexViewProps = {
  posts: readonly BlogSearchPost[]
  categories: readonly BlogCategory[]
  query: string
}

export function BlogIndexView({
  posts,
  categories,
  query,
}: BlogIndexViewProps) {
  return (
    <BlogShell
      componentName="BlogIndexView"
      categories={categories}
      selection={{ kind: "all" }}
      search={{ query }}
    >
      <header className="mb-8 flex max-w-2xl flex-col gap-3">
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
          The journal
        </p>
        <h1 className="font-sans text-4xl font-semibold tracking-tight text-balance md:text-5xl">
          Notes on naming
        </h1>
        <p className="text-base text-primary md:text-lg">
          A public notebook on family names, cat-world names, and the one you
          never quite catch.
        </p>
      </header>
      <BlogPostList posts={posts} />
    </BlogShell>
  )
}
