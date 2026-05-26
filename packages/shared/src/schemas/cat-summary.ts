import { z } from "zod"

import {
  MAX_CAT_SUMMARY_TEXT_LENGTH,
  MIN_CAT_SUMMARY_TEXT_LENGTH,
} from "../constants/cat-summary"

/**
 * KB-004 — Zod validation for the summary review textarea (Save + Submit).
 * Shared by `CatSummaryReview` and `catSummary` mutations.
 */

/** Rules for "Save" — append a user_edit version without advancing the step. */
export const saveCatSummaryDraftSchema = z.object({
  summaryText: z
    .string()
    .trim()
    .min(
      MIN_CAT_SUMMARY_TEXT_LENGTH,
      `Your summary needs at least ${MIN_CAT_SUMMARY_TEXT_LENGTH} characters.`,
    )
    .max(MAX_CAT_SUMMARY_TEXT_LENGTH),
})

export type SaveCatSummaryDraftFields = z.output<
  typeof saveCatSummaryDraftSchema
>

/** Submit uses the same length rules as save; submit also locks the summary. */
export const submitCatSummarySchema = saveCatSummaryDraftSchema

export type SubmitCatSummaryFields = z.output<typeof submitCatSummarySchema>
