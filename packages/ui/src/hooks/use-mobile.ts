import * as React from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", onStoreChange)
  return () => mql.removeEventListener("change", onStoreChange)
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches
}

/** Server + first hydration paint must match; real viewport applies after hydrate. */
function getServerSnapshot() {
  return false
}

/**
 * Mobile breakpoint aligned with Tailwind `md` (768px). Uses `useSyncExternalStore` so SSR and
 * hydration see the same value and Radix/generated IDs stay in sync.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
