import { z } from "zod"

import {
  FAMILY_NAME_BATCH_SIZE,
  FAMILY_NAME_STYLE_IDS,
  MAX_FAMILY_SHORTLIST_TOTAL,
} from "../constants/family-naming"

export const familyNameEntrySchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  rationale: z.string().trim().min(1).max(300),
})

export type FamilyNameEntry = z.infer<typeof familyNameEntrySchema>

export const familyNameBatchSchema = z.object({
  names: z
    .array(familyNameEntrySchema)
    .length(
      FAMILY_NAME_BATCH_SIZE,
      `Expected exactly ${FAMILY_NAME_BATCH_SIZE} names.`,
    ),
})

export type FamilyNameBatch = z.infer<typeof familyNameBatchSchema>

const familyNameStyleIdSchema = z.enum(FAMILY_NAME_STYLE_IDS)

const familyNameStyleIdsArraySchema = z
  .array(familyNameStyleIdSchema)
  .min(1, "Choose at least one style.")
  .max(FAMILY_NAME_STYLE_IDS.length)
  .refine((styleIds) => new Set(styleIds).size === styleIds.length, {
    message: "Duplicate styles are not allowed.",
  })

export const submitFamilyNameStylesSchema = z.object({
  styleIds: familyNameStyleIdsArraySchema,
})

export type SubmitFamilyNameStylesFields = z.infer<
  typeof submitFamilyNameStylesSchema
>

export const addFamilyShortlistEntrySchema = z.object({
  name: z.string().trim().min(1).max(80),
})

export const addCustomFamilyShortlistEntrySchema = addFamilyShortlistEntrySchema

export const setFamilyFavouriteSchema = z.object({
  name: z.string().trim().min(1).max(80),
})

export const regenerateFamilyNamesSchema = z.object({
  styleIds: familyNameStyleIdsArraySchema,
})

export {
  FAMILY_NAME_BATCH_SIZE,
  MAX_FAMILY_SHORTLIST_TOTAL,
}
