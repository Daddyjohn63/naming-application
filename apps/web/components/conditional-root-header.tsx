"use client"

import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs"
import { usePathname } from "next/navigation"

import { ThemeToggle } from "@/components/theme-toggle"

/**
 * Global marketing/public header. Hidden under `/dashboard` so the shell matches
 * shadcn Sidebar 07 (sidebar + inset header flush at the top).
 */
export function ConditionalRootHeader() {
  const pathname = usePathname()
  if (pathname?.startsWith("/dashboard")) {
    return null
  }

  return (
    <header className="flex h-16 items-center justify-end gap-4 p-4">
      <Show when="signed-out">
        <SignInButton />
        <SignUpButton>
          <button className="h-10 cursor-pointer rounded-full bg-purple-700 px-4 text-sm font-medium text-white sm:h-12 sm:px-5 sm:text-base">
            Sign Up
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
      <ThemeToggle />
    </header>
  )
}
