"use client"

import { Show, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@workspace/ui/components/button"

/**
 * Global marketing/public header. Hidden under `/dashboard` so the shell matches
 * shadcn Sidebar 07 (sidebar + inset header flush at the top).
 */
export function ConditionalRootHeader() {
  const pathname = usePathname()
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/cats")) {
    return null
  }

  return (
    <header className="border-border/40 bg-background/80 sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b px-4 backdrop-blur-md supports-backdrop-filter:bg-background/70 md:h-16 md:px-6">
      <Link
        href="/"
        className="hover:text-primary text-sm font-semibold tracking-tight transition-colors md:text-base"
      >
        Naming Buddy
      </Link>
      <div className="flex items-center gap-2">
        <Show when="signed-out">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sign-in">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </Show>
        <Show when="signed-in">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <UserButton />
        </Show>
        <ThemeToggle />
      </div>
    </header>
  )
}

