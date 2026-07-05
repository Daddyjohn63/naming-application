/**
 * Shared entry for starting the first cat-world name batch after unlock.
 */

import { internal } from "../_generated/api"
import type { Id } from "../_generated/dataModel"
import type { MutationCtx } from "../_generated/server"
import { latestGenerationForStage } from "./namingStage"

const STAGE = "cat_world" as const

/** Schedules the first cat-world batch when none exists yet. */
export async function beginCatWorldGenerationIfNeeded(
  ctx: MutationCtx,
  catId: Id<"cats">,
): Promise<void> {
  const existingBatch = await latestGenerationForStage(ctx, catId, STAGE)
  if (existingBatch !== null) {
    return
  }

  const now = Date.now()
  await ctx.db.patch(catId, {
    ceremonyStep: "awaiting_cat_world_names",
    catWorldNameGenerationError: undefined,
    updatedAt: now,
  })

  await ctx.scheduler.runAfter(0, internal.catWorldNamingActions.generateCatWorldNames, {
    catId,
    generationIndex: 0,
  })
}
