import Link from "next/link"

import { formatBlogDate } from "@/modules/blog/lib/format-blog-date"
import { BlogImage } from "@/modules/blog/ui/components/blog-image"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

export type BlogPostCardModel = {
  slug: string
  title: string
  subtitle?: string
  excerpt: string
  publishedAt: string
  categories: readonly { label: string; slug: string }[]
  image?: string
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
}

type BlogPostCardProps = {
  post: BlogPostCardModel
  priorityImage?: boolean
}

export function BlogPostCard({
  post,
  priorityImage = false,
}: BlogPostCardProps) {
  const { image, imageAlt } = post
  if (image && imageAlt) {
    return (
      <FeaturedPostCard
        post={{ ...post, image, imageAlt }}
        priorityImage={priorityImage}
      />
    )
  }

  return <QuietPostCard post={post} />
}

function CategoryLinks({
  categories,
}: {
  categories: BlogPostCardModel["categories"]
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <li key={category.slug}>
          <Badge variant="outline" asChild>
            <Link href={`/blog/category/${category.slug}`}>
              {category.label}
            </Link>
          </Badge>
        </li>
      ))}
    </ul>
  )
}

function FeaturedPostCard({
  post,
  priorityImage,
}: {
  post: BlogPostCardModel & { image: string; imageAlt: string }
  priorityImage: boolean
}) {
  return (
    <Card className="py-0 ring-border">
      <div className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative h-full min-h-72">
          <BlogImage
            src={post.image}
            alt={post.imageAlt}
            fill
            priority={priorityImage}
            className="object-cover"
            sizes="(min-width: 768px) 420px, 100vw"
          />
        </div>
        <CardHeader className="gap-3 py-5 md:py-6">
          <CategoryLinks categories={post.categories} />
          <time dateTime={post.publishedAt} className="text-sm text-primary">
            {formatBlogDate(post.publishedAt)}
          </time>
          <CardTitle>
            <Link
              href={`/blog/${post.slug}`}
              className="font-serif text-3xl leading-tight font-semibold tracking-tight"
            >
              {post.title}
            </Link>
          </CardTitle>
          {post.subtitle ? (
            <p className="font-serif text-base text-primary italic">
              {post.subtitle}
            </p>
          ) : null}
          <CardDescription className="text-base leading-relaxed text-foreground/80">
            {post.excerpt}
          </CardDescription>
        </CardHeader>
      </div>
    </Card>
  )
}

function QuietPostCard({ post }: { post: BlogPostCardModel }) {
  return (
    <Card className="ring-border">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <time dateTime={post.publishedAt} className="text-sm text-primary">
              {formatBlogDate(post.publishedAt)}
            </time>
            <CardTitle>
              <Link
                href={`/blog/${post.slug}`}
                className="font-serif text-2xl leading-tight font-semibold tracking-tight"
              >
                {post.title}
              </Link>
            </CardTitle>
            {post.subtitle ? (
              <p className="font-serif text-base text-primary italic">
                {post.subtitle}
              </p>
            ) : null}
            <CardDescription className="text-base leading-relaxed">
              {post.excerpt}
            </CardDescription>
          </div>
          <CategoryLinks categories={post.categories} />
        </div>
      </CardHeader>
    </Card>
  )
}
