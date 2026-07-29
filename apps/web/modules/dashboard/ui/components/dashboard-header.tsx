"use client"

import { UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger, useSidebar } from "@workspace/ui/components/sidebar"

import { LogoLink } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { dataComponent } from "@/lib/data-component"

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  cats: "Cats",
  "new-cat": "New cat",
  "user-support": "User support",
  feedback: "Leave feedback",
  admin: "Admin",
  "beta-reviews": "Beta reviews",
  settings: "Settings",
}

function formatSegment(segment: string) {
  if (SEGMENT_LABELS[segment] !== undefined) {
    return SEGMENT_LABELS[segment]
  }
  try {
    return decodeURIComponent(segment)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  } catch {
    return segment
  }
}

export function DashboardHeader() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const segments = pathname.split("/").filter(Boolean)
  const crumbs = segments.map((seg, i) => ({
    href: `/${segments.slice(0, i + 1).join("/")}`,
    label: formatSegment(seg),
    isLast: i === segments.length - 1,
  }))

  return (
    <header
      {...dataComponent("DashboardHeader")}
      className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <LogoLink
          href="/"
          className="shrink-0 md:hidden"
          logoClassName="size-8"
          onClick={() => {
            if (isMobile) {
              setOpenMobile(false)
            }
          }}
        />
        <Separator orientation="vertical" className="mr-2 h-4 w-px shrink-0" />
        <Breadcrumb className="min-w-0">
          <BreadcrumbList>
            {crumbs.map((c) => (
              <React.Fragment key={c.href}>
                {!c.isLast && (
                  <>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink asChild>
                        <Link href={c.href}>{c.label}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </>
                )}
                {c.isLast && (
                  <BreadcrumbItem>
                    <BreadcrumbPage className="truncate">
                      {c.label}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex shrink-0 items-center gap-2 px-4">
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
  )
}
