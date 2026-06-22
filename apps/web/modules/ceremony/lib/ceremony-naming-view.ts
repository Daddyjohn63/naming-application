/**
 * KB-009 / KB-010 — derive default naming tunnel view from ceremony step.
 */

import type { Doc } from "@workspace/backend/_generated/dataModel"

import type { CeremonyNamingView } from "@/modules/ceremony/ui/components/ceremony-stage-switcher"

export function allThreeCeremonyNamesChosen(
  cat: Pick<
    Doc<"cats">,
    | "selectedFamilyName"
    | "selectedCatWorldName"
    | "selectedIneffableName"
  >,
): boolean {
  return (
    cat.selectedFamilyName !== undefined &&
    cat.selectedCatWorldName !== undefined &&
    cat.selectedIneffableName !== undefined
  )
}

/**
 * KB-009 / KB-010 — derive default naming tunnel tab from ceremony step.
 *
 * Intentionally does NOT switch to ineffable when only selectedCatWorldName is
 * set — that caused an empty ineffable panel before the user clicked Continue.
 */
export function defaultCeremonyNamingView(
  cat: Pick<
    Doc<"cats">,
    | "ceremonyStep"
    | "selectedFamilyName"
    | "selectedCatWorldName"
    | "selectedIneffableName"
  >,
): CeremonyNamingView {
  if (allThreeCeremonyNamesChosen(cat)) {
    return "certificate"
  }
  if (
    cat.ceremonyStep === "naming_ineffable" ||
    cat.ceremonyStep === "awaiting_ineffable_names"
  ) {
    return "ineffable"
  }
  return "cat_world"
}
