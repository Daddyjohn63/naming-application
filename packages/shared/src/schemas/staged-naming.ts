/**
 * Zod schemas for KB-009 / KB-010 AI batches and curation mutation args.
 *
 * Shared by Convex (AI output validation) and can be reused on the client.
 * Family naming uses separate schemas in `family-naming.ts`.
 */
import { z } from "zod"

import { NAME_BATCH_SIZE } from "../constants/naming-curation"

export const nameEntrySchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  rationale: z.string().trim().min(1).max(300),
})

export type NameEntry = z.infer<typeof nameEntrySchema>

export const nameBatchSchema = z.object({
  names: z
    .array(nameEntrySchema)
    .length(
      NAME_BATCH_SIZE,
      `Expected exactly ${NAME_BATCH_SIZE} names.`,
    ),
})

export type NameBatch = z.infer<typeof nameBatchSchema>

export const addShortlistEntrySchema = z.object({
  name: z.string().trim().min(1).max(80),
})

export const setStageFavouriteSchema = z.object({
  name: z.string().trim().min(1).max(80),
})
