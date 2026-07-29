import type { Doc } from "../_generated/dataModel"
import type { MutationCtx, QueryCtx } from "../_generated/server"
import { getCurrentUserOrThrow } from "../users"

export function isAdminRole(user: Doc<"users">): boolean {
  return user.role === "admin"
}

/** Require mirrored Clerk public metadata `role: "admin"` on the Convex user. */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUserOrThrow(ctx)
  if (!isAdminRole(user)) {
    throw new Error("Unauthorized: admin access required")
  }
  return user
}
