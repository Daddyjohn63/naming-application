/**
 * Stub unlock (KB-007) — no-charge dev checkout until Stripe (KB-007A) ships.
 *
 * Backend reads `ENABLE_STUB_UNLOCK`; the web app reads `NEXT_PUBLIC_ENABLE_STUB_UNLOCK`.
 * Fail-closed: unset / any value other than `"true"` disables stub unlock (safe for production).
 * Local/dev must set both flags to `"true"` explicitly.
 */
export function isStubUnlockEnabled(
  flag: string | undefined,
): boolean {
  return flag === "true"
}
