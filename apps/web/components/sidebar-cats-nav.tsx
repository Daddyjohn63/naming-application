"use client"

import * as React from "react"

import { api } from "@workspace/backend/_generated/api"
import type { NavCatItem } from "@workspace/ui/components/nav-cats"
import { NavCats } from "@workspace/ui/components/nav-cats"
import { useQuery } from "convex/react"
import { Cat } from "lucide-react"

import { dataComponent } from "@/lib/data-component"

/**
 * Convex-backed cat list for the dashboard sidebar. Pass into `AppSidebar` as `catsSlot`
 * so `@workspace/ui` stays free of Convex.
 */
export function SidebarCatsNav() {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const catsFromApi = useQuery(api.cats.getCatsForSidebar)

  if (!mounted || catsFromApi === undefined || catsFromApi.length === 0) {
    return null
  }

  const cats: NavCatItem[] = catsFromApi.map((cat) => {
    const url = `/cats/${encodeURIComponent(cat._id)}`

    return {
      id: cat._id,
      name: cat.name,
      url,
      icon: cat.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Small thumb from Convex storage; remote URL
        <img
          src={cat.photoUrl}
          alt=""
          className="size-4 shrink-0 rounded object-cover"
        />
      ) : (
        <Cat className="size-4 shrink-0" aria-hidden />
      ),
    }
  })

  return (
    <div {...dataComponent("SidebarCatsNav")} className="contents">
      <NavCats cats={cats} />
    </div>
  )
}
