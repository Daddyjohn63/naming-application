import { z } from "zod"

import {
  CAT_SEX_VALUES,
  DRAFT_CAT_DESCRIPTION_PLACEHOLDER,
  type CatSex,
} from "../constants/cat-profile"
import {
  MAX_CAT_DESCRIPTION_LENGTH,
  MAX_CAT_OPTIONAL_FIELD_LENGTH,
  MAX_CAT_SLUG_LENGTH,
  MAX_CAT_TITLE_LENGTH,
  MIN_CAT_DESCRIPTION_LENGTH,
} from "../constants/limits"

/** Lowercase URL slug: letters, numbers, single hyphens between segments. */
const catSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const optionalTrimmedProfileField = z
  .string()
  .trim()
  .max(MAX_CAT_OPTIONAL_FIELD_LENGTH)
  .transform((s) => (s === "" ? undefined : s))
  .optional()

const catSexSchema = z.enum(CAT_SEX_VALUES)

const optionalCatSexField = z.union([catSexSchema, z.literal("")]).optional()

export function normalizeCatSex(
  sex: CatSex | "" | undefined,
): CatSex | undefined {
  return sex === "" || sex === undefined ? undefined : sex
}

/**
 * Shared validation for Convex `createCat` / new-cat forms.
 * Empty or whitespace-only slug is treated as omitted (matches optional `slug` on insert).
 */
export const catCreateFieldsSchema = z.object({
  title: z.string().trim().min(1).max(MAX_CAT_TITLE_LENGTH),
  description: z
    .string()
    .trim()
    .min(MIN_CAT_DESCRIPTION_LENGTH)
    .max(MAX_CAT_DESCRIPTION_LENGTH),
  slug: z
    .string()
    .max(MAX_CAT_SLUG_LENGTH)
    .transform((s) => {
      const t = s.trim()
      return t === "" ? undefined : t
    })
    .refine((s) => s === undefined || catSlugPattern.test(s), {
      message:
        "Slug may only use lowercase letters, numbers, and single hyphens (e.g. my-cat-whiskers).",
    }),
})

export type CatCreateFields = z.output<typeof catCreateFieldsSchema>

/** RHF `defaultValues` / raw field values before Zod transforms (e.g. `slug` trimmed). */
export type CatCreateFieldsInput = z.input<typeof catCreateFieldsSchema>

/**
 * KB-003 profile submit — client + Convex action args (re-validated server-side).
 */
export const submitCatProfileFieldsSchema = z.object({
  title: z.string().trim().min(1).max(MAX_CAT_TITLE_LENGTH),
  description: z
    .string()
    .trim()
    .min(
      MIN_CAT_DESCRIPTION_LENGTH,
      `Tell us at least ${MIN_CAT_DESCRIPTION_LENGTH} characters about your cat.`,
    )
    .max(MAX_CAT_DESCRIPTION_LENGTH)
    .refine((value) => value !== DRAFT_CAT_DESCRIPTION_PLACEHOLDER, {
      message:
        "Replace the placeholder story with your cat's personality and story.",
    }),
  existingName: optionalTrimmedProfileField,
  sex: optionalCatSexField,
  age: optionalTrimmedProfileField,
  breed: optionalTrimmedProfileField,
})

export type SubmitCatProfileFields = z.output<typeof submitCatProfileFieldsSchema>

export type SubmitCatProfileFieldsInput = z.input<
  typeof submitCatProfileFieldsSchema
>

/**
 * KB-003 draft save — relaxed validation for "Save & exit" (no summary trigger).
 * Photo is optional on draft; description may be partial or empty.
 */
export const saveCatProfileDraftFieldsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give this ceremony a title.")
    .max(MAX_CAT_TITLE_LENGTH),
  description: z.string().trim().max(MAX_CAT_DESCRIPTION_LENGTH),
  existingName: optionalTrimmedProfileField,
  sex: optionalCatSexField,
  age: optionalTrimmedProfileField,
  breed: optionalTrimmedProfileField,
})

export type SaveCatProfileDraftFields = z.output<
  typeof saveCatProfileDraftFieldsSchema
>

export type SaveCatProfileDraftFieldsInput = z.input<
  typeof saveCatProfileDraftFieldsSchema
>
