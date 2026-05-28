import { z } from "zod"

import {
  FAMILY_NAME_BATCH_SIZE,
  FAMILY_NAME_STYLE_IDS,
  MAX_FAMILY_SHORTLIST_PER_BATCH,
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

export const submitFamilyNameStylesSchema = z.object({
  styleIds: z
    .array(familyNameStyleIdSchema)
    .min(1, "Choose at least one style.")
    .max(FAMILY_NAME_STYLE_IDS.length),
})

export type SubmitFamilyNameStylesFields = z.infer<
  typeof submitFamilyNameStylesSchema
>

export const addFamilyShortlistEntrySchema = z.object({
  name: z.string().trim().min(1).max(80),
})

export const setFamilyFavouriteSchema = z.object({
  name: z.string().trim().min(1).max(80),
})

export const regenerateFamilyNamesSchema = z.object({
  styleIds: z.array(familyNameStyleIdSchema).min(1).max(FAMILY_NAME_STYLE_IDS.length),
})

export {
  FAMILY_NAME_BATCH_SIZE,
  MAX_FAMILY_SHORTLIST_PER_BATCH,
  MAX_FAMILY_SHORTLIST_TOTAL,
}
