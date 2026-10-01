"use client"

import { dataComponent } from "@/lib/data-component"
import {
  BlogBrowseList,
  type BlogBrowseSelection,
} from "@/modules/blog/ui/components/blog-browse"
import { BlogBrowseDrawer } from "@/modules/blog/ui/components/blog-browse-drawer"
import {
  BlogSearchField,
  BlogSearchProvider,
} from "@/modules/blog/ui/components/blog-search"
import type { BlogCategory } from "@workspace/shared/utils/blog-slug"
import type { ReactNode } from "react"

type BlogSearchFrameProps = {
  categories: readonly BlogCategory[]
  selection: BlogBrowseSelection
  query: string
  componentName: string
  children: ReactNode
}

/** Browse column, drawer, and search state in one client tree so sheet ids match. */
export function BlogSearchFrame({
  categories,
  selection,
  query,
  componentName,
  children,
}: BlogSearchFrameProps) {
  return (
    <BlogSearchProvider query={query}>
      <div
        {...dataComponent(componentName)}
        className="mx-auto flex w-full max-w-6xl flex-1"
      >
        <aside className="hidden w-56 shrink-0 border-r border-border/60 px-6 py-10 lg:block">
          <BlogBrowseList categories={categories} selection={selection}>
            <BlogSearchField />
          </BlogBrowseList>
        </aside>
        <div className="min-w-0 flex-1 px-4 py-8 md:px-10 md:py-10">
          <div className="mb-6 lg:hidden">
            <BlogBrowseDrawer
              categories={categories}
              selection={selection}
              showSearch
            />
          </div>
          {children}
        </div>
      </div>
    </BlogSearchProvider>
  )
}
