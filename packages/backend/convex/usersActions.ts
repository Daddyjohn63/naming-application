"use node"

import { createClerkClient } from "@clerk/backend"
import { v } from "convex/values"

import { internal } from "./_generated/api"
import { action } from "./_generated/server"

function roleFromClerkMetadata(
  publicMetadata: Record<string, unknown> | null | undefined,
  privateMetadata: Record<string, unknown> | null | undefined,
): "admin" | "user" {
  if (publicMetadata?.role === "admin" || privateMetadata?.role === "admin") {
    return "admin"
  }
  return "user"
}

/**
 * Pull the caller's role from Clerk (public or private metadata) into Convex.
 * Fixes production cases where the webhook never mirrored `role` after deploy.
 */
export const syncMyRoleFromClerk = action({
  args: {},
  returns: v.object({
    role: v.union(v.literal("admin"), v.literal("user")),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (identity === null) {
      throw new Error("Not authenticated")
    }

    const secretKey = process.env.CLERK_SECRET_KEY
    if (secretKey === undefined || secretKey.length === 0) {
      throw new Error(
        "CLERK_SECRET_KEY is not set on the Convex deployment — cannot sync role from Clerk",
      )
    }

    const clerk = createClerkClient({ secretKey })
    const clerkUser = await clerk.users.getUser(identity.subject)
    const role = roleFromClerkMetadata(
      clerkUser.publicMetadata as Record<string, unknown>,
      clerkUser.privateMetadata as Record<string, unknown>,
    )

    await ctx.runMutation(internal.users.patchMyRole, {
      clerkUserId: identity.subject,
      role,
    })

    return { role }
  },
})
