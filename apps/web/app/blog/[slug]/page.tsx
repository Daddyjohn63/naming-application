import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  JsonLd,
  buildBlogPostingJsonLd,
  buildBreadcrumbListJsonLd,
} from "@/lib/seo/json-ld"
import { createPageMetadata } from "@/lib/seo/metadata"
import {
  getDraftPostBySlug,
  getPostBySlug,
  listCategories,
  listPublishedPosts,
} from "@/modules/blog/lib/posts"
import { BlogPostView } from "@/modules/blog/ui/views/blog-post-view"

type BlogPostPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return listPublishedPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = resolvePost(slug)
  if (!post) {
    return { title: "Not found" }
  }

  return createPageMetadata({
    title: post.title,
    description: post.description ?? post.excerpt,
    path: `/blog/${post.slug}`,
    openGraphType: "article",
    robots: post.published ? undefined : { index: false, follow: false },
    image:
      post.image && post.imageAlt
        ? {
            url: post.image,
            alt: post.imageAlt,
            width: post.imageWidth,
            height: post.imageHeight,
          }
        : undefined,
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = resolvePost(slug)

  if (!post) {
    notFound()
  }

  const crumbs = buildBreadcrumbListJsonLd([
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ])
  const jsonLd =
    post.published && post.publishedAt
      ? [
          buildBlogPostingJsonLd({
            title: post.title,
            description: post.description ?? post.excerpt,
            path: `/blog/${post.slug}`,
            publishedAt: post.publishedAt,
            image:
              post.image && post.imageAlt
                ? { url: post.image, alt: post.imageAlt }
                : undefined,
          }),
          crumbs,
        ]
      : crumbs

  return (
    <>
      <JsonLd data={jsonLd} />
      <BlogPostView
        post={post}
        categories={listCategories()}
        isDraft={!post.published}
      />
    </>
  )
}

function resolvePost(slug: string) {
  const published = getPostBySlug(slug)
  if (published) return published
  if (!isBlogDraftPreview()) return null
  return getDraftPostBySlug(slug)
}

function isBlogDraftPreview(): boolean {
  // Next sets this. Draft URLs render only while `next dev` is running.
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  return process.env.NODE_ENV === "development"
}
