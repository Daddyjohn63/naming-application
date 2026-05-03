import { z } from "zod"

import {
  MAX_POST_CAT_DESCRIPTION_LENGTH,
  MAX_POST_CONTEXT_LENGTH,
  MAX_POST_NAME_LENGTH,
  MAX_POST_SLUG_LENGTH,
  MAX_POST_TITLE_LENGTH,
} from "../constants/limits.js"

/** Shared validation for Convex `posts` string fields (forms, APIs, agents). */
export const postFieldsSchema = z.object({
  title: z.string().min(1).max(MAX_POST_TITLE_LENGTH),
  slug: z.string().min(1).max(MAX_POST_SLUG_LENGTH),
  catDescription: z.string().min(1).max(MAX_POST_CAT_DESCRIPTION_LENGTH),
  familyName: z.string().min(1).max(MAX_POST_NAME_LENGTH),
  uniqueName: z.string().min(1).max(MAX_POST_NAME_LENGTH),
  effableName: z.string().min(1).max(MAX_POST_NAME_LENGTH),
  familyContext: z.string().min(1).max(MAX_POST_CONTEXT_LENGTH),
  uniqueContext: z.string().min(1).max(MAX_POST_CONTEXT_LENGTH),
  effableContext: z.string().min(1).max(MAX_POST_CONTEXT_LENGTH),
})

export type PostFields = z.infer<typeof postFieldsSchema>
