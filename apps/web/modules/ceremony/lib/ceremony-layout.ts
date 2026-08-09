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
    cat.ceremonyStep === "awaiting_cat_world_names" ||
    cat.ceremonyStep === "naming_ineffable" ||
    cat.ceremonyStep === "awaiting_ineffable_names" ||
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
    case "awaiting_cat_world_names":
    case "naming_ineffable":
    case "awaiting_ineffable_names":
    case "ceremony_complete":
      return true
    default:
      return false
  }
}

/**
 * Sidebar visible during curation (pre-unlock), checkout, or first paid stage.
 * Hidden once all three names are chosen — `CeremonyCertificatePrep` then owns
 * the remaining actions, including Save & exit.
 */
export function showCeremonyUnlockSidebar(cat: CatNamingFields): boolean {
  if (!hasFamilyFavourite(cat)) {
    return false
  }
  if (
    cat.selectedFamilyName !== undefined &&
    cat.selectedCatWorldName !== undefined &&
    cat.selectedIneffableName !== undefined
  ) {
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
    case "awaiting_cat_world_names":
      return unlocked
    case "naming_ineffable":
    case "awaiting_ineffable_names":
      return unlocked
    default:
      return false
  }
}

/** User may switch favourite among shortlist entries until the ceremony completes. */
export function canChangeFamilyFavourite(cat: CatNamingFields): boolean {
  if (!hasFamilyFavourite(cat) || cat.ceremonyStep === "ceremony_complete") {
    return false
  }

  if (!isCeremonyUnlocked(cat)) {
    return (
      cat.ceremonyStep === "family_curation" ||
      cat.ceremonyStep === "family_preview" ||
      cat.ceremonyStep === "awaiting_payment"
    )
  }

  return (
    cat.ceremonyStep === "naming_cat_world" ||
    cat.ceremonyStep === "awaiting_cat_world_names" ||
    cat.ceremonyStep === "naming_ineffable" ||
    cat.ceremonyStep === "awaiting_ineffable_names"
  )
}
