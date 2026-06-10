/**
 * Pure helpers that decide which ceremony panels to show on `/cats/[catId]`.
 *
 * Panel visibility is derived from the server-owned `cat.ceremonyStep` (single source
 * of truth). Local UI state (`editingProfileFromSummary`) only affects the summary
 * review ↔ profile form swap. No React imports — easy to unit test.
 */

import { usesCeremonyNamingTunnel } from "@/modules/ceremony/lib/ceremony-layout"
import { isCatProfileEditableStep } from "@workspace/shared/constants/cat-profile"
import { resolvePhotoIssueDisplay } from "@workspace/shared/constants/cat-photo-validation"
import { isCatSummaryCeremonyStep } from "@workspace/shared/constants/cat-summary"

import type { CatCeremonyDoc } from "@/modules/cats/lib/cat-ceremony-types"

/** Boolean flags for each major panel region on the ceremony page. */
export type CatCeremonyPanelFlags = {
  /** KB-003 profile form — draft, photo issues, or edit-from-summary overlay. */
  showProfileForm: boolean
  /** Spinner while photo validation or summary generation runs in the background. */
  showSummaryPipeline: boolean
  /** Editable AI summary textarea with Save / Submit. */
  showSummaryReview: boolean
  /** KB-005 family name style multi-select. */
  showFamilyStyle: boolean
  /** KB-006 family name generation loading / error. */
  showFamilyNamePipeline: boolean
  /** KB-006 curation (single column until favourite, then tunnel). */
  showFamilyCuration: boolean
  /** KB-006A two-column tunnel once a family favourite exists. */
  showNamingTunnel: boolean
  /**
   * Fallback card when no known panel matches the current step
   * (e.g. future ceremony steps not yet implemented in this view).
   */
  showLaterStepPlaceholder: boolean
}

/** Resolved photo validation copy for the profile step alert block. */
export type CatCeremonyPhotoBlock = {
  title: string | null
  message: string | null
}

/**
 * Derives which panels should render for the current ceremony step.
 *
 * @param cat - Loaded cat document from `getCatByIdForOwner`
 * @param editingProfileFromSummary - When true at `summary_review`, show profile form instead
 */
export function deriveCatCeremonyPanelFlags(
  cat: CatCeremonyDoc,
  editingProfileFromSummary: boolean,
): CatCeremonyPanelFlags {
  // KB-003 form — draft (incl. photo issues), or summary_review when editing profile.
  const showProfileForm =
    (isCatProfileEditableStep(cat.ceremonyStep) ||
      cat.ceremonyStep === "photo_quality_review") &&
    (cat.ceremonyStep !== "summary_review" || editingProfileFromSummary)

  // Spinner while photo validation or summary generation runs in the background.
  const showSummaryPipeline =
    isCatSummaryCeremonyStep(cat.ceremonyStep) &&
    (cat.ceremonyStep === "awaiting_photo_validation" ||
      cat.ceremonyStep === "awaiting_summary")

  // Editable AI summary textarea with Save / Submit.
  const showSummaryReview =
    cat.ceremonyStep === "summary_review" && !editingProfileFromSummary

  const showFamilyStyle = cat.ceremonyStep === "family_style"
  const showFamilyNamePipeline = cat.ceremonyStep === "awaiting_family_names"
  const showFamilyCuration =
    cat.ceremonyStep === "family_curation" ||
    cat.ceremonyStep === "family_preview"
  const showNamingTunnel = usesCeremonyNamingTunnel(cat)

  const showLaterStepPlaceholder =
    !showProfileForm &&
    !showSummaryPipeline &&
    !showSummaryReview &&
    !showFamilyStyle &&
    !showFamilyNamePipeline &&
    !showFamilyCuration &&
    !showNamingTunnel

  return {
    showProfileForm,
    showSummaryPipeline,
    showSummaryReview,
    showFamilyStyle,
    showFamilyNamePipeline,
    showFamilyCuration,
    showNamingTunnel,
    showLaterStepPlaceholder,
  }
}

/**
 * Resolves photo validation alert title/message when the user is on a profile-editable step.
 */
export function deriveCatCeremonyPhotoBlock(
  cat: CatCeremonyDoc,
): CatCeremonyPhotoBlock {
  const onProfileStep =
    cat.ceremonyStep === "draft" || cat.ceremonyStep === "photo_quality_review"

  const photoIssueDisplay =
    onProfileStep && cat.photoValidation !== undefined
      ? resolvePhotoIssueDisplay({
          userMessage: cat.photoValidation.userMessage,
          isCat: cat.photoValidation.isCat,
          isSingleCat: cat.photoValidation.isSingleCat ?? true,
          qualityScore: cat.photoValidation.qualityScore,
        })
      : null

  return {
    title: photoIssueDisplay?.title ?? null,
    message: photoIssueDisplay?.message ?? null,
  }
}
