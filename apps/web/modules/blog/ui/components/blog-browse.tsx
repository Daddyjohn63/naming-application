import type { ReactNode } from "react"
import Link from "next/link"

import type { BlogCategory } from "@workspace/shared/utils/blog-slug"
import { cn } from "@workspace/ui/lib/utils"

export type BlogBrowseSelection =
  | { kind: "all" }
  | { kind: "category"; slug: string }
  | { kind: "post"; slugs: readonly string[] }

type BlogBrowseListProps = {
  categories: readonly BlogCategory[]
  selection: BlogBrowseSelection
  showHeading?: boolean
  onNavigate?: () => void
  children?: ReactNode
}

export function BlogBrowseList({
  categories,
  selection,
  showHeading = true,
  onNavigate,
  children,
}: BlogBrowseListProps) {
  return (
    <nav aria-label="Browse" className="flex flex-col gap-6">
      {showHeading ? (
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
          Browse
        </p>
      ) : null}
      {children}
      <ul className="flex flex-col gap-1">
        <li>
          <BrowseLink
            href="/blog"
            marked={isMarked(selection, "all")}
            current={isCurrentPage(selection, "all")}
            onNavigate={onNavigate}
          >
            All
          </BrowseLink>
        </li>
        {categories.map((category) => (
          <li key={category.slug}>
            <BrowseLink
              href={`/blog/category/${category.slug}`}
              marked={isMarked(selection, category.slug)}
              current={isCurrentPage(selection, category.slug)}
              onNavigate={onNavigate}
            >
              {category.label}
            </BrowseLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function isMarked(
  selection: BlogBrowseSelection,
  slug: string | "all"
): boolean {
  if (slug === "all") return selection.kind === "all"
  if (selection.kind === "category") return selection.slug === slug
  if (selection.kind === "post") return selection.slugs.includes(slug)
  return false
}

function isCurrentPage(
  selection: BlogBrowseSelection,
  slug: string | "all"
): boolean {
  if (slug === "all") return selection.kind === "all"
  return selection.kind === "category" && selection.slug === slug
}

function BrowseLink({
  href,
  marked,
  current,
  onNavigate,
  children,
}: {
  href: string
  marked: boolean
  current: boolean
  onNavigate?: () => void
  children: string
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={current ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        marked
          ? "font-medium text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          marked ? "bg-primary" : "bg-transparent"
        )}
      />
      {children}
    </Link>
  )
}
