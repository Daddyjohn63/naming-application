/**
 * Stub unlock (KB-007) — no-charge dev checkout until Stripe (KB-007A) ships.
 *
 * Backend reads `ENABLE_STUB_UNLOCK`; the web app reads `NEXT_PUBLIC_ENABLE_STUB_UNLOCK`.
 * When unset, stub unlock is allowed so local dev works without extra Convex env setup.
 * Set either flag to `"false"` on production once real checkout is live.
 */
export function isStubUnlockEnabled(
  flag: string | undefined,
): boolean {
  if (flag === "true") return true
  if (flag === "false") return false
  return true
}
