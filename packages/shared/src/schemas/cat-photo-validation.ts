import { z } from "zod"

/**
 * KB-004 §2.3a — Zod shape for vision-model photo validation JSON.
 * Shared by backend AI call and any client that displays validation details.
 */

/** Structured vision-model output for KB-004 §2.3a photo validation. */
export const catPhotoValidationSchema = z.object({
  /** Model believes the primary subject is a cat. */
  isCat: z.boolean(),
  /** Model sees exactly one cat in the image (not multiple cats or litters). */
  isSingleCat: z.boolean(),
  /** 1–10 confidence the image shows a cat as the main subject. */
  catLikelihoodScore: z.number().int().min(1).max(10),
  /** 1–10 usefulness for a personality portrait (lighting, focus, visibility). */
  qualityScore: z.number().int().min(1).max(10),
  /** Owner-facing message when blocked or warned; empty on silent pass. */
  userMessage: z.string(),
  /** Internal reason for block; empty when pass/warn only. */
  blockReason: z.string(),
})

export type CatPhotoValidation = z.infer<typeof catPhotoValidationSchema>
