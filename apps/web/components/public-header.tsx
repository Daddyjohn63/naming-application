"use client"

import { Show, UserButton } from "@clerk/nextjs"
import { Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

import { LogoLink } from "@/components/logo"
import { PUBLIC_NAV_LINKS } from "@/components/public-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { dataComponent } from "@/lib/data-component"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"

function isNavLinkActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

type PublicNavLinkProps = {
  href: string
  label: string
  pathname: string
  className?: string
  onNavigate?: () => void
}

function PublicNavLink({
  href,
  label,
  pathname,
  className,
  onNavigate,
}: PublicNavLinkProps) {
  const active = isNavLinkActive(pathname, href)

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "text-sm font-medium transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {label}
    </Link>
  )
}

function PublicHeaderActions({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <Show when="signed-out">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/sign-in" onClick={onNavigate}>
            Log in
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/sign-up" onClick={onNavigate}>
            Sign up
          </Link>
        </Button>
      </Show>
      <Show when="signed-in">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard" onClick={onNavigate}>
            Dashboard
          </Link>
        </Button>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-8",
            },
          }}
        />
      </Show>
      <ThemeToggle />
    </>
  )
}

export function PublicHeader() {
  const pathname = usePathname() ?? "/"
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const closeMobile = React.useCallback(() => {
    setMobileOpen(false)
  }, [])

  return (
    <header
      {...dataComponent("PublicHeader")}
      className="border-border/50 bg-background/95 relative z-10 flex h-14 shrink-0 items-center border-b px-4 shadow-[0_1px_0_0_var(--border),0_4px_8px_-2px_rgba(0,0,0,0.06)] supports-backdrop-filter:bg-background/80 supports-backdrop-filter:backdrop-blur-sm dark:border-white/15 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.14),0_8px_20px_-4px_rgba(0,0,0,0.75)] md:h-16 md:px-6"
    >
      <div className="flex min-w-0 flex-1 items-center">
        <LogoLink href="/" onClick={closeMobile} />
      </div>

      <nav
        aria-label="Main"
        className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex"
      >
        {PUBLIC_NAV_LINKS.map((item) => (
          <PublicNavLink
            key={item.href}
            href={item.href}
            label={item.label}
            pathname={pathname}
          />
        ))}
      </nav>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <div className="hidden items-center gap-2 md:flex">
          <PublicHeaderActions />
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex w-full flex-col sm:max-w-xs">
            <SheetHeader className="border-border/40 border-b pb-4 text-left">
              <SheetTitle className="text-base">Menu</SheetTitle>
            </SheetHeader>
            <nav
              aria-label="Main"
              className="flex flex-col gap-1 px-4 py-2"
            >
              {PUBLIC_NAV_LINKS.map((item) => (
                <PublicNavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  pathname={pathname}
                  onNavigate={closeMobile}
                  className="rounded-md px-2 py-2.5 text-base"
                />
              ))}
            </nav>
            <div className="border-border/40 mt-auto flex flex-wrap items-center gap-2 border-t p-4">
              <PublicHeaderActions onNavigate={closeMobile} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
