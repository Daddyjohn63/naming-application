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
