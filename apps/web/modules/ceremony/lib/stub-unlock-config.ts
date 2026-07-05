import { isStubUnlockEnabled } from "@workspace/shared/constants/stub-unlock"

/** True when the web app should offer stub unlock UI. */
export function isStubUnlockUiEnabled(): boolean {
  return isStubUnlockEnabled(process.env.NEXT_PUBLIC_ENABLE_STUB_UNLOCK)
}
