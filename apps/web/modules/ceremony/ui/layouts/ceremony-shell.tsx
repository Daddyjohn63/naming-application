"use client"

import { UserButton } from "@clerk/nextjs"
import { Cat } from "lucide-react"
import Link from "next/link"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@workspace/ui/components/button"

type CeremonyShellProps = {
  children: React.ReactNode
}

/**
 * Lightweight top chrome for `/cats/*` (no dashboard sidebar).
 * `.ceremony-theme` applies warm cream + coral tokens from @workspace/tokens/ceremony.
 */
export function CeremonyShell({ children }: CeremonyShellProps) {
  return (
    <div className="ceremony-theme bg-background text-foreground flex min-h-svh flex-col">
      <header className="border-border/70 bg-background/95 sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 backdrop-blur-md supports-backdrop-filter:bg-background/85 md:h-16 md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 px-2 font-semibold tracking-tight text-foreground hover:text-primary"
            asChild
          >
            <Link href="/dashboard">Naming Buddy</Link>
          </Button>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-primary text-primary bg-card rounded-full px-4 hover:bg-primary/10 hover:border-primary hover:text-primary"
            asChild
          >
            <Link href="/dashboard" className="inline-flex items-center gap-2">
              <Cat className="size-4 shrink-0" aria-hidden />
              My cats
            </Link>
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
