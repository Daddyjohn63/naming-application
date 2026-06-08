"use client"

import { usePathname } from "next/navigation"

import { PublicHeader } from "@/components/public-header"

/**
 * Global marketing/public header. Hidden under `/dashboard` and `/cats` so those
 * shells keep their own chrome.
 */
export function ConditionalRootHeader() {
  const pathname = usePathname()
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/cats")) {
    return null
  }

  return <PublicHeader />
}
