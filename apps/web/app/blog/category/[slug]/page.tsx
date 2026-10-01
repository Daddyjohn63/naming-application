import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { categoryPageDescription } from "@/modules/blog/lib/category-copy"
import { readBlogSearchQuery } from "@/modules/blog/lib/filter-posts"
import {
  getCategoryBySlug,
  listCategories,
  listPublishedPostsInCategory,
  toBlogSearchPost,
} from "@/modules/blog/lib/posts"
import { BlogCategoryView } from "@/modules/blog/ui/views/blog-category-view"
import { JsonLd, buildBreadcrumbListJsonLd } from "@/lib/seo/json-ld"
import { createPageMetadata } from "@/lib/seo/metadata"

type BlogCategoryPageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ q?: string | string[] }>
}

export function generateStaticParams() {
  return listCategories().map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({
  params,
}: BlogCategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) return { title: "Not found" }

  return createPageMetadata({
    title: category.label,
    description: categoryPageDescription(category.label),
    path: `/blog/category/${category.slug}`,
  })
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: BlogCategoryPageProps) {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) notFound()

  const query = readBlogSearchQuery((await searchParams).q)

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd([
          { name: "Blog", path: "/blog" },
          {
            name: category.label,
            path: `/blog/category/${category.slug}`,
          },
        ])}
      />
      <BlogCategoryView
        category={category}
        posts={listPublishedPostsInCategory(category.slug).map(
          toBlogSearchPost
        )}
        categories={listCategories()}
        query={query}
      />
    </>
  )
}
