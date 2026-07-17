"use client"

/**
 * KB-009 / KB-010 — switch between cat-world and ineffable curation before all
 * three names are chosen. Once the ineffable favourite is set, curation tabs
 * lock; shortlist favourite changes stay on the three-name cards.
 */

import type { Doc } from "@workspace/backend/_generated/dataModel"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { dataComponent } from "@/lib/data-component"
import { allThreeCeremonyNamesChosen } from "@/modules/ceremony/lib/ceremony-naming-view"

export type CeremonyNamingView = "cat_world" | "ineffable" | "certificate"

type CeremonyStageSwitcherProps = {
  cat: Doc<"cats">
  activeView: CeremonyNamingView
  onChange: (view: CeremonyNamingView) => void
  className?: string
}

export function CeremonyStageSwitcher({
  cat,
  activeView,
  onChange,
  className,
}: CeremonyStageSwitcherProps) {
  const unlocked = cat.ceremonyPaymentId !== undefined
  if (!unlocked) {
    return null
  }

  const showIneffable =
    cat.selectedCatWorldName !== undefined ||
    cat.ceremonyStep === "naming_ineffable" ||
    cat.ceremonyStep === "awaiting_ineffable_names"

  const readyForCertificate = allThreeCeremonyNamesChosen(cat)

  const tabs: Array<{ id: CeremonyNamingView; label: string; disabled?: boolean }> =
    [
      {
        id: "cat_world",
        label: "Cat-world names",
        disabled: readyForCertificate,
      },
      {
        id: "ineffable",
        label: "Ineffable names",
        disabled: !showIneffable || readyForCertificate,
      },
      {
        id: "certificate",
        label: "Certificate",
        disabled: !readyForCertificate,
      },
    ]

  return (
    <nav
      {...dataComponent("CeremonyStageSwitcher")}
      aria-label="Naming stages"
      className={cn("flex flex-wrap gap-2", className)}
    >
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          type="button"
          size="sm"
          variant={activeView === tab.id ? "default" : "outline"}
          disabled={tab.disabled}
          className="rounded-full"
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </Button>
      ))}
    </nav>
  )
}
