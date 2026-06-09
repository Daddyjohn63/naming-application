"use client"

import { usePathname } from "next/navigation"

/**
 * Applies `.public-theme` on marketing/public routes (landing, pricing, auth, etc.).
 * Dashboard and ceremony tunnels keep the global `:root` / `.ceremony-theme` tokens.
 */
export function PublicRouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const usesAppShell =
    pathname?.startsWith("/dashboard") || pathname?.startsWith("/cats")

  if (usesAppShell) {
    return children
  }

  return (
    <div className="public-theme bg-background text-foreground flex min-h-svh flex-1 flex-col">
      {children}
    </div>
  )
}
