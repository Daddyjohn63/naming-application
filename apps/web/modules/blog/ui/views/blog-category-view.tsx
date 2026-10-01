import { categoryPageDescription } from "@/modules/blog/lib/category-copy"
import type { BlogSearchPost } from "@/modules/blog/lib/blog-search-post"
import { BlogBreadcrumb } from "@/modules/blog/ui/components/blog-breadcrumb"
import { BlogPostList } from "@/modules/blog/ui/components/blog-post-list"
import { BlogShell } from "@/modules/blog/ui/components/blog-shell"
import type { BlogCategory } from "@workspace/shared/utils/blog-slug"

type BlogCategoryViewProps = {
  category: BlogCategory
  posts: readonly BlogSearchPost[]
  categories: readonly BlogCategory[]
  query: string
}

export function BlogCategoryView({
  category,
  posts,
  categories,
  query,
}: BlogCategoryViewProps) {
  return (
    <BlogShell
      componentName="BlogCategoryView"
      categories={categories}
      selection={{ kind: "category", slug: category.slug }}
      search={{ query }}
    >
      <header className="mb-8 flex max-w-2xl flex-col gap-3">
        <BlogBreadcrumb current={category.label} />
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
          Category
        </p>
        <h1 className="font-sans text-4xl font-semibold tracking-tight text-balance md:text-5xl">
          {category.label}
        </h1>
        <p className="text-base text-primary md:text-lg">
          {categoryPageDescription(category.label)}
        </p>
      </header>
      <BlogPostList posts={posts} />
    </BlogShell>
  )
}
