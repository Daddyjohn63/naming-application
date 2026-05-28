/**
 * KB-006A — helpers for the two-column naming tunnel (main three-name cards + unlock sidebar).
 */

import type { Doc } from "@workspace/backend/_generated/dataModel"

type CatNamingFields = Pick<
  Doc<"cats">,
  | "ceremonyStep"
  | "ceremonyPaymentId"
  | "selectedFamilyName"
  | "selectedCatWorldName"
  | "selectedIneffableName"
>

/** True when the cat has completed payment or advanced past the paywall step. */
export function isCeremonyUnlocked(cat: CatNamingFields): boolean {
  if (cat.ceremonyPaymentId !== undefined) {
    return true
  }
  return (
    cat.ceremonyStep === "naming_cat_world" ||
    cat.ceremonyStep === "naming_ineffable" ||
    cat.ceremonyStep === "ceremony_complete"
  )
}

export function hasFamilyFavourite(
  cat: Pick<Doc<"cats">, "selectedFamilyName">,
): boolean {
  return cat.selectedFamilyName !== undefined
}

/** Hybrid tunnel: three-name main column once a family favourite exists. */
export function usesCeremonyNamingTunnel(
  cat: Pick<Doc<"cats">, "ceremonyStep" | "selectedFamilyName">,
): boolean {
  if (!hasFamilyFavourite(cat)) {
    return false
  }
  switch (cat.ceremonyStep) {
    case "family_curation":
    case "family_preview":
    case "awaiting_payment":
    case "naming_cat_world":
    case "naming_ineffable":
    case "ceremony_complete":
      return true
    default:
      return false
  }
}

/** Sidebar visible during curation (pre-unlock), checkout, or first paid stage. */
export function showCeremonyUnlockSidebar(cat: CatNamingFields): boolean {
  if (!hasFamilyFavourite(cat)) {
    return false
  }
  const unlocked = isCeremonyUnlocked(cat)
  switch (cat.ceremonyStep) {
    case "family_curation":
    case "family_preview":
      return !unlocked
    case "awaiting_payment":
      return true
    case "naming_cat_world":
      return unlocked
    default:
      return false
  }
}

/** User may switch favourite among shortlist entries before payment succeeds. */
export function canChangeFamilyFavourite(cat: CatNamingFields): boolean {
  if (!hasFamilyFavourite(cat) || isCeremonyUnlocked(cat)) {
    return false
  }
  return (
    cat.ceremonyStep === "family_curation" ||
    cat.ceremonyStep === "family_preview" ||
    cat.ceremonyStep === "awaiting_payment"
  )
}
