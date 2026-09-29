"use client"

import * as React from "react"

import {
  BlogBrowseList,
  type BlogBrowseSelection,
} from "@/modules/blog/ui/components/blog-browse"
import { BlogSearchField } from "@/modules/blog/ui/components/blog-search"
import type { BlogCategory } from "@workspace/shared/utils/blog-slug"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"

type BlogBrowseDrawerProps = {
  categories: readonly BlogCategory[]
  selection: BlogBrowseSelection
  showSearch?: boolean
}

export function BlogBrowseDrawer({
  categories,
  selection,
  showSearch = false,
}: BlogBrowseDrawerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          Browse
        </Button>
      </SheetTrigger>
      <SheetContent
        id="blog-browse-sheet"
        side="left"
        className="w-full bg-background sm:max-w-xs"
      >
        <SheetHeader className="border-b border-border/40 pb-4 text-left">
          <SheetTitle className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
            Browse
          </SheetTitle>
          <SheetDescription className="sr-only">
            {showSearch
              ? "Search the journal and choose a category."
              : "Choose a category."}
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 py-4">
          <BlogBrowseList
            categories={categories}
            selection={selection}
            showHeading={false}
            onNavigate={() => setOpen(false)}
          >
            {showSearch ? <BlogSearchField /> : null}
          </BlogBrowseList>
        </div>
      </SheetContent>
    </Sheet>
  )
}
