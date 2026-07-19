"use client"

import { UserButton } from "@clerk/nextjs"
import { Cat, PlusCircle, SettingsIcon, UsersIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

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
import { toast } from "@workspace/ui/components/sonner"
import { useQuery } from "convex/react"

import { dataComponent } from "@/lib/data-component"

const userSupportItems = [
  {
    title: "User Support",
    icon: UsersIcon,

    url: "/dashboard/user-support",
  },
]

const dashboardSidebarMenuClassName = "gap-1.5"
const dashboardSidebarGroupLabelClassName =
  "text-sm font-semibold text-sidebar-foreground/80"
const catSidebarPhotoClassName =
  "size-8 shrink-0 rounded-full object-cover group-data-[collapsible=icon]:size-full"
const catSidebarPhotoButtonClassName =
  "group-data-[collapsible=icon]:rounded-full! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:overflow-hidden"

function SidebarAddCatMenuItem() {
  const { execute, pending, error, clearError } = useCreateDraftCeremony()

  useEffect(() => {
    if (error === null || error === "") {
      return
    }
    toast.error(error)
    clearError()
  }, [error, clearError])

  return (
    <SidebarMenuItem {...dataComponent("SidebarAddCatMenuItem")}>
      <SidebarMenuButton
        disabled={pending}
        tooltip={pending === true ? undefined : "Add a cat"}
        className="pl-4 [&_svg]:size-4"
        onClick={() => {
          void execute()
        }}
      >
        <PlusCircle className="text-muted-foreground" aria-hidden />
        <span className="pl-2">{pending ? "Starting…" : "Add a cat"}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
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
  const { isMobile, setOpenMobile } = useSidebar()

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
              className="[&_svg]:size-8 group-data-[collapsible=icon]:p-0!"
            >
              <Link href="/" onClick={closeMobileSidebar}>
                <Logo className="size-8 shrink-0" />
                <span className="truncate font-semibold group-data-[collapsible=icon]:hidden">
                  {APP_NAME}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* User support items */}
        <SidebarGroup>
          <SidebarGroupLabel className={dashboardSidebarGroupLabelClassName}>
            User Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className={dashboardSidebarMenuClassName}>
              {userSupportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isNavItemActive(pathname, item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url} onClick={closeMobileSidebar}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Cats owned by user */}
        <SidebarGroup>
          <SidebarGroupLabel className={dashboardSidebarGroupLabelClassName}>
            Your Cats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className={dashboardSidebarMenuClassName}>
              {cats === undefined ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled className="opacity-60">
                    <Cat aria-hidden />
                    <span>Loading…</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : cats.length === 0 ? (
                <SidebarAddCatMenuItem />
              ) : (
                <>
                  {cats.map((cat) => {
                    const href = `/cats/${encodeURIComponent(cat._id)}`
                    return (
                      <SidebarMenuItem key={cat._id}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === href}
                          tooltip={cat.name}
                          className={
                            cat.photoUrl
                              ? catSidebarPhotoButtonClassName
                              : undefined
                          }
                        >
                          <Link href={href} onClick={closeMobileSidebar}>
                            {cat.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element -- Convex storage URL
                              <img
                                src={cat.photoUrl}
                                alt=""
                                className={catSidebarPhotoClassName}
                              />
                            ) : (
                              <Cat aria-hidden />
                            )}
                            <span className="truncate group-data-[collapsible=icon]:hidden">
                              {cat.name}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                  <SidebarAddCatMenuItem />
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
