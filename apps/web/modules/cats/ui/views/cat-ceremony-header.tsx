/**
 * Ceremony page header — breadcrumb back to dashboard and current step badge.
 *
 * Shared between the standard single-column layout and the naming tunnel layout
 * (tunnel main column renders this inline; standard layout wraps panels below it).
 */

import Link from "next/link"

import { CeremonyStepBadge } from "@/modules/ceremony/ui/components/ceremony-step-badge"
import type { CatCeremonyDoc } from "@/modules/cats/lib/cat-ceremony-types"
import { dataComponent } from "@/lib/data-component"

type CatCeremonyHeaderProps = {
  cat: CatCeremonyDoc
}

export function CatCeremonyHeader({ cat }: CatCeremonyHeaderProps) {
  return (
    <>
      <nav
        {...dataComponent("CatCeremonyHeader")}
        className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link
          href="/dashboard"
          className="font-medium underline-offset-4 hover:text-primary hover:underline"
        >
          Dashboard
        </Link>
        <span aria-hidden className="text-muted-foreground/70">
          /
        </span>
        <span className="line-clamp-1 font-semibold tracking-tight text-foreground">
          {cat.title}
        </span>
      </nav>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <CeremonyStepBadge step={cat.ceremonyStep} />
        </div>
      </div>
    </>
  )
}
