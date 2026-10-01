import { formatBlogDate } from "@/modules/blog/lib/format-blog-date"
import type { BlogPost } from "@/modules/blog/lib/posts"
import { SocialLinks } from "@/components/social-links"
import { BlogBreadcrumb } from "@/modules/blog/ui/components/blog-breadcrumb"
import { BlogPostShare } from "@/modules/blog/ui/components/blog-post-share"
import { BlogImage } from "@/modules/blog/ui/components/blog-image"
import { BlogMarkdown } from "@/modules/blog/ui/components/blog-markdown"
import { BlogShell } from "@/modules/blog/ui/components/blog-shell"
import type { BlogCategory } from "@workspace/shared/utils/blog-slug"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

type BlogPostViewProps = {
  post: BlogPost
  categories: readonly BlogCategory[]
  isDraft?: boolean
}

export function BlogPostView({
  post,
  categories,
  isDraft = false,
}: BlogPostViewProps) {
  return (
    <BlogShell
      componentName="BlogPostView"
      categories={categories}
      selection={{
        kind: "post",
        slugs: post.categories.map((category) => category.slug),
      }}
    >
      <BlogBreadcrumb current={post.title} />
      <article className="mx-auto mt-6 flex max-w-3xl flex-col gap-5">
        <div className="flex flex-wrap items-center gap-1">
          <p className="text-muted-foreground pr-1 text-sm font-medium">
            Follow
          </p>
          <SocialLinks />
          {isDraft ? null : (
            <>
              <div className="bg-border/70 mx-1 h-5 w-px" aria-hidden />
              <BlogPostShare
                title={post.title}
                path={`/blog/${post.slug}`}
                text={post.excerpt}
              />
            </>
          )}
        </div>
        {isDraft ? (
          <p
            role="status"
            className="rounded-lg border border-primary bg-primary/15 px-4 py-3 text-sm font-medium text-foreground"
          >
            Draft — not published
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <ul className="flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <li key={category.slug}>
                <Badge asChild>
                  <Link href={`/blog/category/${category.slug}`}>
                    {category.label}
                  </Link>
                </Badge>
              </li>
            ))}
          </ul>
          {post.publishedAt ? (
            <time
              dateTime={post.publishedAt}
              className="text-sm text-muted-foreground"
            >
              {formatBlogDate(post.publishedAt)}
            </time>
          ) : null}
        </div>
        <h1 className="font-sans text-4xl font-semibold tracking-tight text-balance md:text-5xl">
          {post.title}
        </h1>
        {post.subtitle ? (
          <p className="font-serif text-xl text-primary italic md:text-2xl">
            {post.subtitle}
          </p>
        ) : null}
        {post.image && post.imageAlt ? (
          <BlogImage
            src={post.image}
            alt={post.imageAlt}
            width={post.imageWidth}
            height={post.imageHeight}
            priority
            className="h-auto w-full rounded-lg"
            sizes="(min-width: 768px) 720px, 100vw"
          />
        ) : null}
        <BlogMarkdown source={post.body} />
        <div className="mt-4 border-t border-border/60 pt-8">
          <p className="mb-4 font-serif text-xl text-primary italic">
            Your cat already knows their name.
          </p>
          <Button size="lg" asChild>
            <Link href="/sign-up">Start the naming ceremony</Link>
          </Button>
        </div>
      </article>
    </BlogShell>
  )
}
