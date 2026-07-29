"use client"

import { UserButton } from "@clerk/nextjs"
import {
  Cat,
  MessageSquareText,
  PlusCircle,
  Shield,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

import { BetaBadge } from "@/components/beta-badge"
import { Logo } from "@/components/logo"
import { useCreateDraftCeremony } from "@/modules/cats/ui/hooks/use-create-draft-ceremony"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { api } from "@workspace/backend/_generated/api"
import { APP_NAME } from "@workspace/shared/constants/app"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"
import { useAction, useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"

import { dataComponent } from "@/lib/data-component"

const userSupportItems: Array<{
  title: string
  icon: LucideIcon
  url: string
}> = [
  {
    title: "User Support",
    icon: UsersIcon,
    url: "/dashboard/user-support",
  },
  {
    title: "Leave feedback",
    icon: MessageSquareText,
    url: "/dashboard/feedback",
  },
]

const dashboardSidebarMenuClassName = "gap-1.5"
const dashboardSidebarGroupLabelClassName =
  "text-sm font-semibold text-sidebar-foreground/80"

type SidebarCat = FunctionReturnType<typeof api.cats.getCatsForSidebar>[number]

function SidebarAddCatControl() {
  const { execute, pending, error, clearError } = useCreateDraftCeremony()

  useEffect(() => {
    if (error === null || error === "") {
      return
    }
    toast.error(error)
    clearError()
  }, [error, clearError])

  return (
    <div {...dataComponent("SidebarAddCatControl")} className="mt-1">
      {/* Expanded: full-width outline control */}
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        className="h-9 w-full gap-2 border-primary/30 group-data-[collapsible=icon]:hidden"
        onClick={() => {
          void execute()
        }}
      >
        <PlusCircle className="size-4" aria-hidden />
        {pending ? "Starting…" : "Add a cat"}
      </Button>
      {/* Collapsed icon mode */}
      <SidebarMenu className="hidden group-data-[collapsible=icon]:flex">
        <SidebarMenuItem>
          <SidebarMenuButton
            disabled={pending}
            tooltip={pending === true ? undefined : "Add a cat"}
            onClick={() => {
              void execute()
            }}
          >
            <PlusCircle aria-hidden />
            <span>Add a cat</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  )
}

function SidebarNavLinkRow({
  title,
  url,
  icon: Icon,
  isActive,
  onNavigate,
}: {
  title: string
  url: string
  icon: LucideIcon
  isActive: boolean
  onNavigate: () => void
}) {
  return (
    <li {...dataComponent("SidebarNavLinkRow")} className="min-w-0">
      <Link
        href={url}
        onClick={onNavigate}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-[box-shadow,border-color,background-color] duration-150 group-data-[collapsible=icon]:hidden",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          isActive
            ? "ceremony-highlight-panel border-primary/35 shadow-sm"
            : "ceremony-sidebar-panel border-primary/20 hover:border-primary/35 hover:shadow-sm",
        )}
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            isActive
              ? "bg-primary/15 text-primary"
              : "bg-primary/10 text-primary/80",
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="truncate text-sm font-medium text-foreground">
          {title}
        </span>
      </Link>

      <div className="hidden group-data-[collapsible=icon]:block">
        <SidebarMenuButton asChild isActive={isActive} tooltip={title}>
          <Link href={url} onClick={onNavigate}>
            <Icon aria-hidden />
            <span>{title}</span>
          </Link>
        </SidebarMenuButton>
      </div>
    </li>
  )
}

function SidebarCatCard({
  cat,
  isSelected,
  onNavigate,
}: {
  cat: SidebarCat
  isSelected: boolean
  onNavigate: () => void
}) {
  const href = `/cats/${encodeURIComponent(cat._id)}`
  // "Selected" means the cat has a chosen family name (not route-active —
  // this sidebar only mounts under /dashboard, never on /cats/[id]).
  const familyName =
    typeof cat.selectedFamilyName === "string"
      ? cat.selectedFamilyName.trim()
      : ""
  const showFamilyName = familyName !== ""

  return (
    <li {...dataComponent("SidebarCatCard")} className="min-w-0">
      {/* Expanded photo card */}
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={isSelected ? "page" : undefined}
        className={cn(
          "flex flex-col overflow-hidden transition-[box-shadow,border-color] duration-150 group-data-[collapsible=icon]:hidden",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          isSelected
            ? "ceremony-highlight-panel border-primary/35 shadow-sm"
            : "ceremony-sidebar-panel border-primary/20 hover:border-primary/35 hover:shadow-sm",
        )}
      >
        <div className="flex justify-center px-3 pt-3">
          <div className="relative aspect-square w-18 overflow-hidden rounded-xl bg-muted">
            {typeof cat.photoUrl === "string" ? (
              // eslint-disable-next-line @next/next/no-img-element -- Convex storage URL
              <img
                src={cat.photoUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <Cat className="size-8 opacity-40" aria-hidden />
              </div>
            )}
          </div>
        </div>
        <div className="space-y-0.5 px-3 pt-2.5 pb-3 text-center">
          <p className="truncate text-sm font-semibold tracking-tight text-foreground">
            {cat.name}
          </p>
          {showFamilyName ? (
            <p className="truncate text-xs text-muted-foreground">{familyName}</p>
          ) : null}
        </div>
      </Link>

      {/* Collapsed icon mode: circular photo / icon */}
      <div className="hidden group-data-[collapsible=icon]:block">
        <SidebarMenuButton
          asChild
          isActive={isSelected}
          tooltip={cat.name}
          className={
            typeof cat.photoUrl === "string"
              ? "group-data-[collapsible=icon]:rounded-full! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:overflow-hidden"
              : undefined
          }
        >
          <Link href={href} onClick={onNavigate}>
            {typeof cat.photoUrl === "string" ? (
              // eslint-disable-next-line @next/next/no-img-element -- Convex storage URL
              <img
                src={cat.photoUrl}
                alt=""
                className="size-8 shrink-0 rounded-full object-cover group-data-[collapsible=icon]:size-full"
              />
            ) : (
              <Cat aria-hidden />
            )}
            <span className="truncate">{cat.name}</span>
          </Link>
        </SidebarMenuButton>
      </div>
    </li>
  )
}

function isNavItemActive(pathname: string, url: string) {
  if (url === "/dashboard") {
    return pathname === "/dashboard"
  }
  if (url === "/") {
    return pathname === "/"
  }
  return pathname.startsWith(url)
}

export const DashboardSidebar = () => {
  const pathname = usePathname()
  const cats = useQuery(api.cats.getCatsForSidebar)
  const isAdmin = useQuery(api.betaReviews.isAdmin)
  const syncMyRoleFromClerk = useAction(api.usersActions.syncMyRoleFromClerk)
  const { isMobile, setOpenMobile } = useSidebar()

  // Self-heal on admin routes: Clerk may have role:admin while Convex users.role is stale.
  useEffect(() => {
    if (!pathname.startsWith("/dashboard/admin")) {
      return
    }
    if (isAdmin !== false) {
      return
    }
    let cancelled = false
    void (async () => {
      try {
        await syncMyRoleFromClerk({})
      } catch (error) {
        if (!cancelled) {
          console.warn("Failed to sync admin role from Clerk", error)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAdmin, pathname, syncMyRoleFromClerk])

  const closeMobileSidebar = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar {...dataComponent("DashboardSidebar")} collapsible="icon">
      <SidebarHeader>
        <SidebarMenu className={dashboardSidebarMenuClassName}>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isNavItemActive(pathname, "/")}
              tooltip={APP_NAME}
              className="h-auto min-h-8 gap-2.5 py-1.5 [&_svg]:size-[52px] [&>span:last-child]:overflow-visible [&>span:last-child]:whitespace-normal [&>span:last-child]:text-clip group-data-[collapsible=icon]:size-[52px]! group-data-[collapsible=icon]:p-0!"
            >
              <Link href="/" onClick={closeMobileSidebar}>
                <Logo className="size-[52px] shrink-0" />
                <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 group-data-[collapsible=icon]:hidden">
                  <span className="text-xl leading-tight font-semibold text-pretty">
                    {APP_NAME}
                  </span>
                  <BetaBadge />
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Cats first — primary job of the dashboard */}
        <SidebarGroup className="ceremony-theme min-h-0 flex-1">
          <SidebarGroupLabel className={dashboardSidebarGroupLabelClassName}>
            Your Cats
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex min-h-0 flex-1 flex-col">
            {cats === undefined ? (
              <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground opacity-60 group-data-[collapsible=icon]:justify-center">
                <Cat className="size-4 shrink-0" aria-hidden />
                <span className="group-data-[collapsible=icon]:hidden">
                  Loading…
                </span>
              </div>
            ) : cats.length === 0 ? (
              <SidebarAddCatControl />
            ) : (
              <>
                <ul className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto group-data-[collapsible=icon]:gap-1 group-data-[collapsible=icon]:overflow-hidden">
                  {cats.map((cat) => {
                    const href = `/cats/${encodeURIComponent(cat._id)}`
                    return (
                      <SidebarCatCard
                        key={cat._id}
                        cat={cat}
                        isSelected={pathname === href}
                        onNavigate={closeMobileSidebar}
                      />
                    )
                  })}
                </ul>
                <SidebarAddCatControl />
              </>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Utility links — quieter panels below cats */}
        <SidebarGroup className="ceremony-theme shrink-0">
          <SidebarGroupLabel className={dashboardSidebarGroupLabelClassName}>
            Help
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ul className="flex flex-col gap-1.5 group-data-[collapsible=icon]:gap-1">
              {userSupportItems.map((item) => (
                <SidebarNavLinkRow
                  key={item.url}
                  title={item.title}
                  url={item.url}
                  icon={item.icon}
                  isActive={isNavItemActive(pathname, item.url)}
                  onNavigate={closeMobileSidebar}
                />
              ))}
            </ul>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin === true ? (
          <SidebarGroup className="ceremony-theme shrink-0">
            <SidebarGroupLabel className={dashboardSidebarGroupLabelClassName}>
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <ul className="flex flex-col gap-1.5 group-data-[collapsible=icon]:gap-1">
                <SidebarNavLinkRow
                  title="Beta reviews"
                  url="/dashboard/admin/beta-reviews"
                  icon={Shield}
                  isActive={isNavItemActive(
                    pathname,
                    "/dashboard/admin/beta-reviews",
                  )}
                  onNavigate={closeMobileSidebar}
                />
              </ul>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className={dashboardSidebarMenuClassName}>
          <SidebarMenuItem>
            <UserButton
              showName
              appearance={{
                elements: {
                  rootBox: "w-full! h-8!",
                  userButtonTrigger:
                    "w-full! p-2! hover:bg-sidebar-accent! hover:text-sidebar-accent-foreground! group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!",
                  userButtonBox:
                    "w-full! flex-row-reverse! justify-end! gap-2! group-data-[collapsible=icon]:justify-center! text-sidebar-foreground!",
                  userButtonOuterIdentifier:
                    "pl-0! group-data-[collapsible=icon]:hidden!",
                  avatarBox: "size-8!",
                },
              }}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
