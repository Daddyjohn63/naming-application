"use client"

import { UserButton } from "@clerk/nextjs"
import { Cat, HomeIcon, UsersIcon, SettingsIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
} from "@workspace/ui/components/sidebar"
import { api } from "@workspace/backend/_generated/api"
import { useQuery } from "convex/react"

const userSupportItems = [
  {
    title: "User Support",
    icon: UsersIcon,

    url: "/dashboard/user-support",
  },
  {
    title: "Settings",
    icon: SettingsIcon,
    url: "/dashboard/settings",
  },
]

const sidebarHeaderItems = [
  {
    title: "Home",
    icon: HomeIcon,
    url: "/dashboard",
  },
]
export const DashboardSidebar = () => {
  const pathname = usePathname()
  const cats = useQuery(api.cats.getCatsForSidebar)
  const isActive = (url: string) => {
    if (url === "/") {
      return pathname === "/"
    } else {
      return pathname.startsWith(url)
    }
  }

  return (
    <Sidebar className="group" collapsible="icon">
      {/* <SidebarTrigger /> */}
      <SidebarHeader>
        <SidebarContent>
          {/* User support items */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarHeaderItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon className="size-8" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </SidebarHeader>
      <SidebarContent>
        {/* User support items */}
        <SidebarGroup>
          <SidebarGroupLabel>User Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userSupportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="size-8" />
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
          <SidebarGroupLabel>Cats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {cats === undefined ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled className="opacity-60">
                    <Cat className="size-8 shrink-0" aria-hidden />
                    <span>Loading…</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : cats.length === 0 ? (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="New cat">
                    <Link href="/dashboard/cats/new-cat">
                      <Cat className="size-8 shrink-0" aria-hidden />
                      <span>Add a cat</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                cats.map((cat) => {
                  const href =
                    cat.slug !== undefined && cat.slug !== ""
                      ? `/dashboard/cats/${encodeURIComponent(cat.slug)}`
                      : "/dashboard/cats"
                  return (
                    <SidebarMenuItem key={cat._id}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === href}
                        tooltip={cat.name}
                      >
                        <Link href={href}>
                          {cat.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- Convex storage URL
                            <img
                              src={cat.photoUrl}
                              alt=""
                              className="size-8 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <Cat
                              className="size-8 shrink-0"
                              aria-hidden
                            />
                          )}
                          <span className="truncate">{cat.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
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
