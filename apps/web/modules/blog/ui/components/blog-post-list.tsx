"use client"

import { filterBlogPosts } from "@/modules/blog/lib/filter-posts"
import type { BlogSearchPost } from "@/modules/blog/lib/blog-search-post"
import { BlogPostCard } from "@/modules/blog/ui/components/blog-post-card"
import { useBlogSearch } from "@/modules/blog/ui/components/blog-search"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workspace/ui/components/empty"

export function BlogPostList({ posts }: { posts: readonly BlogSearchPost[] }) {
  const { query, clear } = useBlogSearch()
  const filtered = filterBlogPosts(posts, query)

  if (posts.length === 0) {
    return (
      <Empty className="min-h-48 border border-border">
        <EmptyHeader>
          <EmptyTitle>No notes yet</EmptyTitle>
          <EmptyDescription>
            Published posts will appear here. Drafts stay off this page until
            they are ready.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (filtered.length === 0) {
    return (
      <Empty className="min-h-48 border border-border">
        <EmptyHeader>
          <EmptyTitle>No posts</EmptyTitle>
          <EmptyDescription>
            Nothing in this list matches that search.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button type="button" variant="outline" onClick={clear}>
            Clear search
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <ul className="flex flex-col gap-6">
      {filtered.map((post, index) => (
        <li key={post.slug}>
          <BlogPostCard
            post={post}
            priorityImage={index === 0 && Boolean(post.image)}
          />
        </li>
      ))}
    </ul>
  )
}
