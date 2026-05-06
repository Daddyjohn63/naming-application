"use client"

/**
 * Clerk UI must stay under `apps/web` (Client Component) — not inside `packages/ui` —
 * because the shared UI package does not list `@clerk/nextjs` as a dependency.
 *
 * Root `app/layout.tsx` already wraps the tree in `<ClerkProvider>`, so we do not nest
 * another provider here (nested providers add noise and can cause subtle bugs).
 */
import * as React from "react"
import { Show, useUser } from "@clerk/nextjs"
import { UserButton } from "@clerk/nextjs"
import { ChevronsUpDownIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@workspace/ui/components/sidebar"

/** Primary label for the sidebar row (Clerk may not always have a full name set). */
function clerkDisplayName(
  user: NonNullable<ReturnType<typeof useUser>["user"]>
): string {
  const full = user.fullName?.trim()
  if (full) return full
  const fromParts = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim()
  if (fromParts) return fromParts
  const un = user.username?.trim()
  if (un) return un
  return "Account"
}

function clerkPrimaryEmail(
  user: NonNullable<ReturnType<typeof useUser>["user"]>
): string {
  return (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    ""
  )
}

/** Two-letter fallback for Clerk profile image (same idea as shadcn `NavUser`). */
function avatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase() || "?"
}

/** Clerk session + `useUser()` often resolve only on the client; keep SSR + first hydrate pass identical (skeleton above). */
function useClientMounted() {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  return mounted
}

/**
 * Programmatically opens the Clerk `<UserButton>` popover (account menu / user profile entry).
 *
 * **Why this exists**
 * - Clerk renders a real native `<button>` as the menu *trigger* somewhere inside the DOM
 *   it mounts for `<UserButton />`. We do not get a clean public ref like `triggerRef` from
 *   the component API, and the trigger’s clickable box does not reliably cover our custom
 *   layout (especially the chevron on the right).
 * - So we mount `<UserButton />` inside a wrapper `div` (`clerkTriggerWrapRef`), then when
 *   the user clicks our separate chevron `<button>`, we find Clerk’s trigger *inside that
 *   wrapper* and call `.click()` on it. That runs the same code path as clicking the real
 *   Clerk control: it opens the dropdown / user menu.
 *
 * **How it works**
 * 1. `containerEl` must be the DOM node that wraps `<UserButton />` (so the search is scoped
 *    and we don’t accidentally grab some other `button` elsewhere on the page).
 * 2. `querySelector("button")` returns the first `<button>` in tree order inside that node.
 *    In practice Clerk’s user menu uses a single interactive button as the trigger here; if
 *    Clerk’s markup ever adds another button before the trigger, this would need to become
 *    a more specific selector.
 * 3. `HTMLButtonElement.click()` is a trusted synthetic click: it toggles the menu open/closed
 *    the same way a user pointer click would.
 *
 * **Safety**
 * - If the wrapper is missing or Clerk has not mounted yet, we no-op (`null` checks).
 */
function openClerkUserMenuTrigger(containerEl: HTMLElement | null) {
  if (!containerEl) return
  const trigger = containerEl.querySelector("button") as HTMLButtonElement | null
  trigger?.click()
}

/**
 * Signed-in footer: Clerk avatar/menu + name and email in the same row as the old `NavUser`.
 * Uses `group-data-[collapsible=icon]:…` so when the sidebar collapses to icons, only the
 * `UserButton` stays visible (text is hidden), matching standard shadcn sidebar behavior.
 */
function SignedInSidebarUser() {
  const mounted = useClientMounted()
  /** Wrapper around `<UserButton />` — scoped DOM search target for {@link openClerkUserMenuTrigger}. */
  const clerkTriggerWrapRef = React.useRef<HTMLDivElement>(null)
  const { user, isLoaded } = useUser()

  if (!mounted || !isLoaded) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuSkeleton showIcon className="h-12" />
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!user) {
    return null
  }

  const name = clerkDisplayName(user)
  const email = clerkPrimaryEmail(user)
  const initials = avatarInitials(name)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {/*
          Decorative row (pointer-events-none) + invisible fullscreen Clerk trigger for avatar/name.
          The chevron is a real <button> on top (z-20) that forwards a click to Clerk's trigger,
          because Clerk's inner button often does not cover the full row / chevron hit area.
        */}
        <div className={cn("relative h-12 w-full min-w-0", "group-data-[collapsible=icon]:h-8")}>
          <div
            className={cn(
              "pointer-events-none relative z-0 flex h-full w-full min-w-0 items-center gap-2 px-2",
              "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            )}
          >
            <Avatar className="size-8 shrink-0 rounded-lg">
              <AvatarImage
                src={user.imageUrl ?? undefined}
                alt=""
                referrerPolicy="no-referrer"
              />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "grid min-w-0 flex-1 pr-9 text-left text-sm leading-tight",
                "group-data-[collapsible=icon]:hidden"
              )}
            >
              <span className="truncate font-medium" title={name}>
                {name}
              </span>
              <span
                className="truncate text-xs text-sidebar-foreground/70"
                title={email || undefined}
              >
                {email || "—"}
              </span>
            </div>
          </div>
          <div
            ref={clerkTriggerWrapRef}
            className={cn(
              "absolute inset-0 z-10 flex",
              "group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center"
            )}
          >
            <UserButton
              appearance={{
                elements: {
                  rootBox: "flex size-full min-h-0 min-w-0 items-stretch",
                  userButtonTrigger: cn(
                    "size-full max-h-none justify-start border-0 bg-transparent shadow-none",
                    "rounded-md p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    "focus:ring-2 focus:ring-sidebar-ring focus:outline-none",
                    "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
                  ),
                  avatarBox: "size-8 shrink-0 opacity-0",
                },
              }}
            />
          </div>
          {/* Explicit control so the hint is always clickable */}
          <button
            type="button"
            className={cn(
              "absolute top-1/2 right-1 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              "group-data-[collapsible=icon]:hidden"
            )}
            aria-label="Open account menu"
            title="Account menu"
            onClick={(e) => {
              // Don’t bubble to parent sidebar / Radix handlers; chevron is its own control.
              e.preventDefault()
              e.stopPropagation()
              // Delegate to Clerk’s real `<UserButton>` trigger — see `openClerkUserMenuTrigger`.
              openClerkUserMenuTrigger(clerkTriggerWrapRef.current)
            }}
          >
            <ChevronsUpDownIcon className="size-4 shrink-0" aria-hidden />
          </button>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function UserButtonClerk() {
  return (
    <Show when="signed-in">
      <SignedInSidebarUser />
    </Show>
  )
}
