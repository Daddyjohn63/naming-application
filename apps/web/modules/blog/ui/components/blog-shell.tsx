import type { ReactNode } from "react"

import { dataComponent } from "@/lib/data-component"
import {
  BlogBrowseList,
  type BlogBrowseSelection,
} from "@/modules/blog/ui/components/blog-browse"
import { BlogBrowseDrawer } from "@/modules/blog/ui/components/blog-browse-drawer"
import { BlogSearchFrame } from "@/modules/blog/ui/components/blog-search-frame"
import type { BlogCategory } from "@workspace/shared/utils/blog-slug"

type BlogShellProps = {
  categories: readonly BlogCategory[]
  selection: BlogBrowseSelection
  children: ReactNode
  componentName: string
  /** When set, Browse includes search and the list filters on `query`. */
  search?: { query: string }
}

export function BlogShell({
  categories,
  selection,
  children,
  componentName,
  search,
}: BlogShellProps) {
  if (search) {
    return (
      <BlogSearchFrame
        categories={categories}
        selection={selection}
        query={search.query}
        componentName={componentName}
      >
        {children}
      </BlogSearchFrame>
    )
  }

  return (
    <div
      {...dataComponent(componentName)}
      className="mx-auto flex w-full max-w-6xl flex-1"
    >
      <aside className="hidden w-56 shrink-0 border-r border-border/60 px-6 py-10 lg:block">
        <BlogBrowseList categories={categories} selection={selection} />
      </aside>
      <div className="min-w-0 flex-1 px-4 py-8 md:px-10 md:py-10">
        <div className="mb-6 lg:hidden">
          <BlogBrowseDrawer categories={categories} selection={selection} />
        </div>
        {children}
      </div>
    </div>
  )
}
