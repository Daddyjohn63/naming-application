import { z } from "zod"

/** Result from `submitCatProfile` / `saveCatProfileDraft` — expected failures return `ok: false`. */
export const catProfileActionResultSchema = z.discriminatedUnion("ok", [
  z.object({ ok: z.literal(true) }),
  z.object({
    ok: z.literal(false),
    code: z.string(),
    fieldErrors: z.record(z.string(), z.string()).optional(),
  }),
])

export type CatProfileActionResult = z.infer<typeof catProfileActionResultSchema>

export function isCatProfileActionFailure(
  result: CatProfileActionResult,
): result is Extract<CatProfileActionResult, { ok: false }> {
  return result.ok === false
}
