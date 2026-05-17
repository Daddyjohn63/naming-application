"use client"

import { UserButton } from "@clerk/nextjs"
import Link from "next/link"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@workspace/ui/components/button"

type CeremonyShellProps = {
  children: React.ReactNode
}

/**
 * Lightweight top chrome for `/cats/*` (no dashboard sidebar) — DESIGN-GUIDES ceremony shell.
 */
export function CeremonyShell({ children }: CeremonyShellProps) {
  return (
    <div className="bg-background flex min-h-svh flex-col">
      <header className="border-border/60 bg-background/90 sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 backdrop-blur-md supports-backdrop-filter:bg-background/80 md:h-16 md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 px-2 font-semibold tracking-tight"
            asChild
          >
            <Link href="/dashboard">Naming Buddy</Link>
          </Button>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">My cats</Link>
          </Button>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8",
              },
            }}
          />
          <ThemeToggle />
        </div>
      </header>
      {children}
    </div>
  )
}
