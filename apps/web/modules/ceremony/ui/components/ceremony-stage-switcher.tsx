"use client"

/**
 * KB-009 / KB-010 — switch between cat-world and ineffable curation before certificate.
 */

import type { Doc } from "@workspace/backend/_generated/dataModel"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { dataComponent } from "@/lib/data-component"

export type CeremonyNamingView = "cat_world" | "ineffable" | "certificate"

type CeremonyStageSwitcherProps = {
  cat: Doc<"cats">
  activeView: CeremonyNamingView
  onChange: (view: CeremonyNamingView) => void
  className?: string
}

function allThreeNamesChosen(cat: Doc<"cats">): boolean {
  return (
    cat.selectedFamilyName !== undefined &&
    cat.selectedCatWorldName !== undefined &&
    cat.selectedIneffableName !== undefined
  )
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

  const showCertificate = allThreeNamesChosen(cat)

  const tabs: Array<{ id: CeremonyNamingView; label: string; disabled?: boolean }> =
    [
      { id: "cat_world", label: "Cat-world names" },
      {
        id: "ineffable",
        label: "Ineffable names",
        disabled: !showIneffable,
      },
      {
        id: "certificate",
        label: "Certificate",
        disabled: !showCertificate,
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
