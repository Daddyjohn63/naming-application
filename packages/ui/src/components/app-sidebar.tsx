"use client"

import * as React from "react"

import { NavCats } from "@workspace/ui/components/nav-cats"
import { NavMain } from "@workspace/ui/components/nav-main"
import { TeamSwitcher } from "@workspace/ui/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import {
  BotIcon,
  BookOpenIcon,
  Cat,
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  TerminalSquareIcon,
  Settings2Icon,
} from "lucide-react"

// Sample data for sidebar shell (teams + nav). User profile comes from `footerSlot`.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: <GalleryVerticalEndIcon />,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: <AudioLinesIcon />,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: <TerminalIcon />,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: <TerminalSquareIcon />,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: <BotIcon />,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: <BookOpenIcon />,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: <Settings2Icon />,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  /** Placeholder cat rows when `catsSlot` is not provided (e.g. Storybook / design preview). */
  cats: [
    {
      name: "Whiskers",
      url: "#",
      icon: <Cat className="size-4 shrink-0" />,
    },
    {
      name: "Mittens",
      url: "#",
      icon: <Cat className="size-4 shrink-0" />,
    },
    {
      name: "Luna",
      url: "#",
      icon: <Cat className="size-4 shrink-0" />,
    },
  ],
}

/**
 * Props for the shell sidebar. Everything except `footerSlot` is forwarded to `Sidebar`.
 *
 * Why `footerSlot` exists:
 * - This file lives in `packages/ui`, which intentionally does NOT depend on `@clerk/nextjs`
 *   (or other app-specific SDKs).
 * - The Next.js app (`apps/web`) *does* have Clerk installed, so it passes React nodes here —
 *   that pattern is sometimes called a "slot" or "render prop": the design system owns layout;
 *   the app injects auth/UI that only the app can import.
 */
export type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  /**
   * Footer content (profile / auth). Passed from the app so `packages/ui` never imports Clerk.
   * Example: Clerk user row with `<UserButton />` + name/email from `useUser()`.
   */
  footerSlot?: React.ReactNode
  /**
   * Replaces the default sample “Cats” block under main nav — pass Convex-backed lists or other
   * custom sidebar content without pulling data dependencies into `@workspace/ui`.
   */
  catsSlot?: React.ReactNode
}

export function AppSidebar({
  footerSlot,
  catsSlot,
  ...sidebarProps
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...sidebarProps}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {catsSlot ?? <NavCats cats={data.cats} />}
      </SidebarContent>
      <SidebarFooter>{footerSlot}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
