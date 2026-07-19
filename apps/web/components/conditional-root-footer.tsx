"use client"

import { usePathname } from "next/navigation"

import { PublicFooter } from "@/components/public-footer"

/**
 * Global marketing/public footer. Hidden under `/dashboard` and `/cats` so those
 * shells keep their own chrome.
 */
export function ConditionalRootFooter() {
  const pathname = usePathname()
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/cats")) {
    return null
  }

  return <PublicFooter />
}
