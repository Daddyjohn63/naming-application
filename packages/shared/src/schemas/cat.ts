import { z } from "zod"

import {
  MAX_CAT_DESCRIPTION_LENGTH,
  MAX_CAT_SLUG_LENGTH,
  MAX_CAT_TITLE_LENGTH,
} from "../constants/limits"

/** Lowercase URL slug: letters, numbers, single hyphens between segments. */
const catSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Shared validation for Convex `createCat` / new-cat forms.
 * Empty or whitespace-only slug is treated as omitted (matches optional `slug` on insert).
 */
export const catCreateFieldsSchema = z.object({
  title: z.string().min(1).max(MAX_CAT_TITLE_LENGTH),
  description: z.string().min(1).max(MAX_CAT_DESCRIPTION_LENGTH),
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
