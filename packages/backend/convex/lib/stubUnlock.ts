import { isStubUnlockEnabled } from "@workspace/shared/constants/stub-unlock"

/** Whether `completeStubUnlock` is allowed on this Convex deployment. */
export function isStubUnlockAllowedOnDeployment(): boolean {
  return isStubUnlockEnabled(process.env.ENABLE_STUB_UNLOCK)
}
