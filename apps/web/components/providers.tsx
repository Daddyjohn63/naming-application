"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { ConvexReactClient } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { useAuth } from "@clerk/nextjs"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { Toaster } from "@workspace/ui/components/sonner"

import { nextPreference } from "@/components/theme-toggle"
import { dataComponent } from "@/lib/data-component"

function usesAppShell(pathname: string | null | undefined) {
  return (
    pathname?.startsWith("/dashboard") === true ||
    pathname?.startsWith("/cats") === true
  )
}

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set")
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "")

function Providers({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const pathname = usePathname()
  const forcedTheme = usesAppShell(pathname) ? undefined : "dark"

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
        forcedTheme={forcedTheme}
        {...props}
      >
        <ThemeHotkey />
        <TooltipProvider>
          <div {...dataComponent("Providers")} className="contents">
            {children}
            <Toaster />
          </div>
        </TooltipProvider>
      </NextThemesProvider>
    </ConvexProviderWithClerk>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const pathname = usePathname()
  const { setTheme } = useTheme()

  React.useEffect(() => {
    if (!usesAppShell(pathname)) {
      return
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      const key = event.key
      if (!key || key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setTheme((prev) => nextPreference(prev))
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [pathname, setTheme])

  return null
}

export { Providers }
