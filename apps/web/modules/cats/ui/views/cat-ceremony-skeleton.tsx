/**
 * Loading skeleton for `/cats/[catId]` while `getCatByIdForOwner` is in flight.
 *
 * Mirrors the standard ceremony layout spacing so the page does not jump when
 * real content replaces this placeholder.
 */

import { Skeleton } from "@workspace/ui/components/skeleton"
import { dataComponent } from "@/lib/data-component"

export function CatCeremonySkeleton() {
  return (
    <div
      {...dataComponent("CatCeremonySkeleton")}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 lg:max-w-4xl"
    >
      {/* Breadcrumb placeholder */}
      <Skeleton className="h-4 w-48" />
      {/* Step badge placeholder */}
      <Skeleton className="h-24 w-full rounded-lg" />
      {/* Main panel placeholder */}
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-20 w-full rounded-lg" />
    </div>
  )
}
