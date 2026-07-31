/**
 * Lifetime cat-ceremony create quota for standard users when the limit is enforced.
 * Deleting a ceremony does not restore a create.
 *
 * Backend reads `ENFORCE_CAT_CEREMONY_LIMIT`; enforce only when exactly `"true"`.
 * Dev deployments leave the flag unset; production sets it to `"true"`.
 * Prefer deriving UI from the Convex entitlement query so admin + env stay authoritative.
 */

/** Max lifetime cat ceremony creates for a standard user when the limit is enforced. */
export const MAX_STANDARD_USER_CAT_CEREMONIES = 3

/** True only when the Convex deployment env var is exactly `"true"`. */
export function isCatCeremonyLimitEnforced(
  flag: string | undefined,
): boolean {
  return flag === "true"
}

/** Dashboard / toast copy when the lifetime quota is enforced for a standard user. */
export function formatCatCeremonyQuotaMessage(args: {
  remaining: number
  limit: number
}): string {
  if (args.remaining <= 0) {
    return `You've reached the limit of ${args.limit} naming ceremonies.`
  }
  if (args.remaining === 1) {
    return `You can start 1 more naming ceremony (${args.limit} max).`
  }
  return `You can start ${args.remaining} more naming ceremonies (${args.limit} max).`
}
